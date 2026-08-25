import crypto from 'node:crypto';
import { query, withTransaction } from '../../database/pool.js';
import { config } from '../../config.js';

// ============================================================================
// CENTRAL QUALIFIED VIEW SYSTEM (generalized over posts + threads).
// The only code path allowed to increment any view counter. Raw IPs are
// hashed by the database via hash_ip(); tokens are HMAC-signed server-side.
// ============================================================================

const TOKEN_TTL_SECONDS = Number(process.env.VIEW_TOKEN_TTL_SECONDS || 3600);
const CLAIM_WINDOW_SECONDS = Number(process.env.VIEW_CLAIM_WINDOW_SECONDS || 300);
const COOLDOWN_HOURS = Number(process.env.VIEW_COOLDOWN_HOURS || 24);
const MIN_ACTIVE_SECONDS = Number(process.env.VIEW_MIN_ACTIVE_SECONDS || 10);

// Bot/crawler/seo/prefetch user-agent patterns are always rejected.
const BOT_PATTERN =
  /bot|crawler|spider|slurp|scrap|crawl|headless|phantom|selenium|puppeteer|playwright|wget|curl|httpclient|python-requests|go-http-client|facebookexternalhit|twitterbot|whatsapp|telegrambot|linkedinbot|discordbot|slackbot|google-?read|bingpreview|ahrefs|semrush|mj12bot|dotbot|petalbot|bytespider|preview|prefetch|uptime|pingdom|lighthouse|pagespeed/i;

export function looksLikeBot(userAgent = '') {
  return userAgent.length < 12 || BOT_PATTERN.test(userAgent);
}

function clientIp(req) {
  // x-forwarded-for is set by Nginx; take the first hop (the real client).
  const xf = req.headers['x-forwarded-for'];
  const ip = typeof xf === 'string' ? xf.split(',')[0].trim() : req.socket.remoteAddress;
  return ip ? ip.replace(/^::ffff:/, '') : null;
}

// HMAC token ties the resource to the visit origin. No IP/identity in the token.
function hmacSign(resourceType, resourceId, visitId, time) {
  const secret = config.jwtSecret;
  return crypto
    .createHmac('sha256', secret)
    .update(`${resourceType}:${resourceId}:${visitId}:${time}`)
    .digest('hex');
}

export function createVisitToken(resourceType, resourceId) {
  const visitId = crypto.randomUUID();
  const time = Date.now();
  const token = `${visitId}.${time}.${hmacSign(resourceType, resourceId, visitId, time)}`;
  return { visitId, token, time };
}

export function validateVisitToken(resourceType, resourceId, token) {
  if (typeof token !== 'string') return null;
  const [visitId, rawTime, ttd] = token.split('.');
  const time = Number(rawTime);
  if (!visitId || !Number.isFinite(time) || !ttd) return null;
  if (hmacSign(resourceType, resourceId, visitId, time) !== ttd) return null;
  if (Date.now() - time > TOKEN_TTL_SECONDS * 1000) return null;
  return { visitId, time };
}

// Persistence: how each resource resolves from a slug and increments its counter.
const RESOURCE_CONFIG = {
  post: {
    table: 'articles',
    viewCounterColumn: 'view_count',
    lookupSql:
      "id, view_count FROM articles WHERE slug = $1 AND status = 'published'",
  },
  thread: {
    table: 'threads',
    viewCounterColumn: 'view_count',
    lookupSql:
      "id, view_count FROM threads WHERE slug = $1 AND status <> 'deleted'",
  },
};

export function resourceConfig(resourceType) {
  return RESOURCE_CONFIG[resourceType] || null;
}

// Validates all gates then records the view atomically (row + counter increment
// in ONE transaction). Always returns a result object; never throws for
// expected validation failures.
export async function recordValidView({ req, resourceType, resourceSlug, token }) {
  const cfg = RESOURCE_CONFIG[resourceType];
  if (!cfg) return { recorded: false, reason: 'invalid_resource' };

  const agent = String(req.headers['user-agent'] || '');
  const ip = clientIp(req);
  const activeSeconds = Math.max(0, Number(req.body?.duration_seconds) || 0);
  if (looksLikeBot(agent)) return { recorded: false, reason: 'bot' };
  if (activeSeconds < MIN_ACTIVE_SECONDS) {
    return { recorded: false, reason: 'duration_too_short' };
  }

  const { rows } = await query(`SELECT ${cfg.lookupSql}`, [resourceSlug]);
  const resource = rows[0];
  if (!resource) return { recorded: false, reason: 'not_found' };

  const tokenInfo = validateVisitToken(resourceType, resource.id, token);
  if (!tokenInfo) return { recorded: false, reason: 'invalid_token' };
  if (Date.now() - tokenInfo.time > CLAIM_WINDOW_SECONDS * 1000) {
    return { recorded: false, reason: 'token_expired' };
  }

  const { rows: tokenDup } = await query(
    'SELECT 1 FROM view_records WHERE visit_id = $1 AND valid = TRUE LIMIT 1',
    [tokenInfo.visitId]
  );
  if (tokenDup.length) return { recorded: false, reason: 'duplicate' };

  if (ip) {
    const { rows: recent } = await query(
      `SELECT 1 FROM view_records
       WHERE ip_address = hash_ip($1)
         AND resource_id = $2 AND valid = TRUE
         AND visited_at >= now() - ($3 || ' hours')::interval
       LIMIT 1`,
      [ip, resource.id, COOLDOWN_HOURS]
    );
    if (recent.length) {
      return { recorded: false, reason: 'cooldown', view_count: Number(resource.view_count) };
    }
  }

  return withTransaction(async (client) => {
    const { rows: resourceRow } = await client.query(
      `UPDATE ${cfg.table}
       SET ${cfg.viewCounterColumn} = ${cfg.viewCounterColumn} + 1
       WHERE id = $1 RETURNING ${cfg.viewCounterColumn}`,
      [resource.id]
    );
    await client.query(
      `INSERT INTO view_records
         (resource_type, resource_id, ip_address, user_agent, visit_id, visit_token, valid, detail_page)
       VALUES ($1, $2, hash_ip($3), $4, $5, $6, TRUE, TRUE)`,
      [resourceType, resource.id, ip, agent.slice(0, 500), tokenInfo.visitId, token.slice(0, 120)]
    );
    return { recorded: true, view_count: Number(resourceRow[0][cfg.viewCounterColumn]) };
  });
}

// Stats from the same data source (view_records + authoritative counter).
export async function resourceStats(resourceType, resourceId) {
  const cfg = RESOURCE_CONFIG[resourceType];
  if (!cfg) return null;

  const { rows } = await query(
    `SELECT
       r.${cfg.viewCounterColumn} AS total_view,
       (SELECT COUNT(*)::int FROM view_records v
        WHERE v.resource_id = r.id AND v.valid = TRUE) AS total_valid_views,
       (SELECT COUNT(DISTINCT v.ip_address)::int FROM view_records v
        WHERE v.resource_id = r.id AND v.valid = TRUE AND v.ip_address IS NOT NULL) AS unique_visitors,
       (SELECT COUNT(*)::int FROM view_records v
        WHERE v.resource_id = r.id AND v.valid = TRUE
          AND v.visited_at >= date_trunc('day', now())) AS views_today,
       (SELECT COUNT(*)::int FROM view_records v
        WHERE v.resource_id = r.id AND v.valid = TRUE
          AND v.visited_at >= now() - INTERVAL '7 days') AS views_7_days,
       (SELECT COUNT(*)::int FROM view_records v
        WHERE v.resource_id = r.id AND v.valid = TRUE
          AND v.visited_at >= now() - INTERVAL '30 days') AS views_30_days
     FROM ${cfg.table} r
     WHERE r.id = $1`,
    [resourceId]
  );
  if (!rows[0]) return null;

  const daily = await query(
    `SELECT to_char(date_trunc('day', visited_at), 'YYYY-MM-DD') AS date,
            COUNT(*)::int AS view
     FROM view_records
     WHERE resource_id = $1 AND valid = TRUE
       AND visited_at >= now() - INTERVAL '30 days'
     GROUP BY 1 ORDER BY 1`,
    [resourceId]
  );
  return { ...rows[0], daily: daily.rows };
}
