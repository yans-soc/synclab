import crypto from 'node:crypto';
import { query, withTransaction } from '../../database/pool.js';
import { config } from '../../config.js';

// ============================================================================
// CENTRALIZED VIEW VALIDATION SERVICE (Qualified View Validation Service)
// The only code path allowed to increment an article view_count.
// No other code may run view_count = view_count + 1.
// ============================================================================

const TOKEN_TTL_SECONDS = 3600; // visit tokens expire after 1 hour
const CLAIM_WINDOW_SECONDS = 300; // views must be claimed within 5 minutes of reading start
const COOLDOWN_HOURS = 24; // new views from the same IP are ignored for 24 hours

// Bot/crawler/seo/prefetch user-agent patterns that are always rejected
const BOT_PATTERN =
  /bot|crawler|spider|slurp|scrap|crawl|headless|phantom|selenium|puppeteer|playwright|wget|curl|httpclient|python-requests|go-http-client|facebookexternalhit|twitterbot|whatsapp|telegrambot|linkedinbot|discordbot|slackbot|google-?read|bingpreview|ahrefs|semrush|mj12bot|dotbot|petalbot|bytespider|preview|prefetch|uptime|pingdom|lighthouse|pagespeed/i;

export function looksLikeBot(userAgent = '') {
  return userAgent.length < 12 || BOT_PATTERN.test(userAgent);
}

// HMAC token proving the visit started from a legitimate server response.
// No IP/identity stored in the token; only article id + visit id + time.
function hmacSign(articleId, visitId, time) {
  const secret = config.jwtSecret;
  return crypto
    .createHmac('sha256', secret)
    .update(`${articleId}.${visitId}.${time}`)
    .digest('hex');
}

export function createVisitToken(articleId) {
  const visitId = crypto.randomUUID();
  const time = Date.now();
  const token = `${visitId}.${time}.${hmacSign(articleId, visitId, time)}`;
  return { visitId, token, time };
}

export function validateVisitToken(articleId, token) {
  if (typeof token !== 'string') return null;
  const [visitId, rawTime, ttd] = token.split('.');
  const time = Number(rawTime);
  if (!visitId || !Number.isFinite(time) || !ttd) return null;
  if (hmacSign(articleId, visitId, time) !== ttd) return null;
  if (Date.now() - time > TOKEN_TTL_SECONDS * 1000) return null;
  return { visitId, time };
}

function clientIp(req) {
  // x-forwarded-for is set by Nginx; take the first hop (the real client)
  const xf = req.headers['x-forwarded-for'];
  const ip = typeof xf === 'string' && xf.length ? xf.split(',')[0].trim() : req.socket.remoteAddress;
  return ip ? ip.replace(/^::ffff:/, '') : null;
}

// Records a valid view atomically: visit row + counter increment
// in ONE PostgreSQL transaction. Return value: the latest authoritative counter.
export async function recordValidView({ req, articleSlug, token }) {
  const agent = String(req.headers['user-agent'] || '');
  const ip = clientIp(req);
  const activeSeconds = Math.max(0, Number(req.body?.duration_seconds) || 0);

  // 1. Reject bots/crawlers/prefetches
  if (looksLikeBot(agent)) {
    return { recorded: false, reason: 'bot' };
  }

  // 2. Real engagement required: at least 10 active seconds on the detail page
  if (activeSeconds < 10) {
    return { recorded: false, reason: 'duration_too_short' };
  }

  // 3. Find the published article
  const { rows: articleRows } = await query(
    `SELECT id, view_count FROM articles WHERE slug = $1 AND status = 'published'`,
    [articleSlug]
  );
  const article = articleRows[0];
  if (!article) return { recorded: false, reason: 'not_found' };

  // 4. Validate the visit token (rejects forged requests/refreshes without a valid origin)
  const tokenInfo = validateVisitToken(article.id, token);
  if (!tokenInfo) return { recorded: false, reason: 'invalid_token' };
  if (Date.now() - tokenInfo.time > CLAIM_WINDOW_SECONDS * 1000) {
    return { recorded: false, reason: 'token_expired' };
  }

  // 5. Duplicate protection: the same token may only be recorded once
  const { rows: tokenDup } = await query(
    `SELECT 1 FROM article_visits
     WHERE visit_id = $1 AND valid = TRUE LIMIT 1`,
    [tokenInfo.visitId]
  );
  if (tokenDup.length) {
    const { rows } = await query('SELECT view_count FROM articles WHERE id = $1', [article.id]);
    return { recorded: false, reason: 'duplicate', view_count: rows[0]?.view_count ?? 0 };
  }

  // 6. Cooldown: the same IP is not counted again for the same article within 24 hours
  if (ip) {
    const { rows: recentRows } = await query(
      `SELECT 1 FROM article_visits
       WHERE ip_address = $1 AND article_id = $2 AND valid = TRUE
         AND visited_at >= now() - ($3 || ' hours')::interval
       LIMIT 1`,
      [ip, article.id, COOLDOWN_HOURS]
    );
    if (recentRows.length) {
      const { rows } = await query('SELECT view_count FROM articles WHERE id = $1', [article.id]);
      return { recorded: false, reason: 'cooldown', view_count: rows[0]?.view_count ?? 0 };
    }
  }

  // 7. Atomic transaction: record the valid view row + increment the authoritative counter
  return withTransaction(async (client) => {
    const { rows } = await client.query(
      `UPDATE articles SET view_count = view_count + 1
       WHERE id = $1 RETURNING view_count`,
      [article.id]
    );
    await client.query(
      `INSERT INTO article_visits
         (article_id, ip_address, user_agent, visit_id, visit_token, valid)
       VALUES ($1, $2, $3, $4, $5, TRUE)`,
      [article.id, ip, agent.slice(0, 500), tokenInfo.visitId, token.slice(0, 120)]
    );
    return { recorded: true, view_count: rows[0].view_count };
  });
}

// Per-article admin stats, all from the same data source.
export async function articleStats(articleId) {
  const { rows } = await query(
    `SELECT
       a.view_count AS total_view,
       (SELECT COUNT(*)::int FROM article_visits k
         WHERE k.article_id = a.id AND k.valid = TRUE) AS total_valid_views,
       (SELECT COUNT(DISTINCT k.ip_address)::int FROM article_visits k
         WHERE k.article_id = a.id AND k.valid = TRUE AND k.ip_address IS NOT NULL) AS unique_visitors,
       (SELECT COUNT(*)::int FROM article_visits k
         WHERE k.article_id = a.id AND k.valid = TRUE
           AND k.visited_at >= date_trunc('day', now())) AS views_today,
       (SELECT COUNT(*)::int FROM article_visits k
         WHERE k.article_id = a.id AND k.valid = TRUE
           AND k.visited_at >= now() - INTERVAL '7 days') AS views_7_days,
       (SELECT COUNT(*)::int FROM article_visits k
         WHERE k.article_id = a.id AND k.valid = TRUE
           AND k.visited_at >= now() - INTERVAL '30 days') AS views_30_days,
       (SELECT COUNT(*)::int + 1 FROM articles b
         WHERE b.status = 'published'
           AND (b.view_count > a.view_count
             OR (b.view_count = a.view_count AND b.id < a.id))) AS popular_rank
     FROM articles a
     WHERE a.id = $1`,
    [articleId]
  );
  if (!rows[0]) return null;

  const daily = await query(
    `SELECT to_char(date_trunc('day', visited_at), 'YYYY-MM-DD') AS date,
            COUNT(*)::int AS view
     FROM article_visits
     WHERE article_id = $1 AND valid = TRUE
       AND visited_at >= now() - INTERVAL '30 days'
     GROUP BY 1 ORDER BY 1`,
    [articleId]
  );
  return { ...rows[0], daily: daily.rows };
}
