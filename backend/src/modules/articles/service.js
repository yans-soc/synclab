import { query, withTransaction } from '../../database/pool.js';
import { makeSlug } from '../../utils/slug.js';
import { createVisitToken, looksLikeBot } from '../visits/service.js';

const SELECT_PUBLIC = `
  SELECT a.id, a.title, a.slug, a.excerpt, a.published_at, a.view_count,
         m.url AS featured_image,
         p.full_name AS author_name, p.profile_photo AS author_photo,
         COALESCE((
           SELECT jsonb_agg(jsonb_build_object('name', kat.name, 'slug', kat.slug, 'color', kat.color))
           FROM article_categories ak
           JOIN categories kat ON kat.id = ak.category_id
           WHERE ak.article_id = a.id
         ), '[]'::jsonb) AS categories
  FROM articles a
  LEFT JOIN media m ON m.id = a.featured_image_id
  JOIN users p ON p.id = a.author_id
`;

function toPublicArticle(row) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    published_at: row.published_at,
    featured_image: row.featured_image,
    view_count: row.view_count,
    author: {
      full_name: row.author_name,
      profile_photo: row.author_photo,
    },
    categories: row.categories,
  };
}

export async function listPublic({ category, page = 1, limit = 10, sort }) {
  const offset = (page - 1) * limit;
  const params = [];
  let whereClause = "WHERE a.status = 'published'";
  if (category) {
    params.push(category);
    whereClause += ` AND EXISTS (
      SELECT 1 FROM article_categories ak
      JOIN categories k ON k.id = ak.category_id
      WHERE ak.article_id = a.id AND k.slug = $${params.length}
    )`;
  }
  const { rows: totalRows } = await query(
    `SELECT COUNT(*)::int AS total FROM articles a ${whereClause}`,
    params
  );
  const total = totalRows[0].total;
  params.push(limit, offset);
  // popular = highest authoritative view counter; default = latest published articles
  const order =
    sort === 'popular'
      ? 'ORDER BY a.view_count DESC, a.published_at DESC, a.id'
      : 'ORDER BY a.published_at DESC, a.id';
  const { rows } = await query(
    `${SELECT_PUBLIC} ${whereClause}
     ${order}
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return {
    data: rows.map(toPublicArticle),
    meta: {
      page,
      limit,
      total_itemss: total,
      total_pages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

// Trending = most valid views in the last 7 days; articles without visits
// are sorted deterministically (latest published, then id) so the display stays stable.
export async function listTrending(limit = 6) {
  const { rows } = await query(
    `${SELECT_PUBLIC.replace('a.id,', 'a.id, kv.visits_7_days,')}
     LEFT JOIN (
       SELECT article_id, COUNT(*)::int AS visits_7_days
       FROM article_visits
       WHERE valid = TRUE AND visited_at >= now() - INTERVAL '7 days'
       GROUP BY article_id
     ) kv ON kv.article_id = a.id
     WHERE a.status = 'published'
     ORDER BY COALESCE(kv.visits_7_days, 0) DESC, a.published_at DESC, a.id
     LIMIT $1`,
    [limit]
  );
  return rows.map((r) => ({
    ...toPublicArticle(r),
    period_views: r.visits_7_days ?? 0,
  }));
}

// Public detail does NOT increment views — views only grow via validated claims
// (POST /api/v1/visits/:slug). A visit token is included so
// the frontend can claim once the reader has been active for >= 10 seconds.
export async function getPublicBySlug(slug, { userAgent = '' } = {}) {
  const { rows } = await query(
    `${SELECT_PUBLIC.replace('a.id,', 'a.id, a.content,')}
     WHERE a.slug = $1 AND a.status = 'published'`,
    [slug]
  );
  if (!rows[0]) return null;
  const seo = await query(
    `SELECT seo_title, seo_description, seo_keywords, canonical_url, og_image
     FROM seo_metadata WHERE article_id = $1`,
    [rows[0].id]
  );
  // Tokens are only issued to human user-agents; bots/crawlers cannot claim.
  // Resource-bound to 'post' so a thread token can never be replayed here.
  const token = looksLikeBot(userAgent)
    ? null
    : createVisitToken('post', rows[0].id).token;
  return {
    ...toPublicArticle(rows[0]),
    content: rows[0].content,
    seo: seo.rows[0] || null,
    visit_token: token,
  };
}

export async function listAdmin({ status, search, page = 1, limit = 10 }) {
  const offset = (page - 1) * limit;
  const params = [];
  const whereClause = [];
  if (status) {
    params.push(status);
    whereClause.push(`a.status = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    whereClause.push(`a.title ILIKE $${params.length}`);
  }
  const where = whereClause.length ? `WHERE ${whereClause.join(' AND ')}` : '';
  const { rows: totalRows } = await query(
    `SELECT COUNT(*)::int AS total FROM articles a ${where}`,
    params
  );
  const total = totalRows[0].total;
  params.push(limit, offset);
  const { rows } = await query(
    `${SELECT_PUBLIC.replace('a.id,', 'a.id, a.status, a.created_at, a.updated_at,')}
     ${where}
     ORDER BY a.updated_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return {
    data: rows.map((r) => ({
      ...toPublicArticle(r),
      status: r.status,
      created_at: r.created_at,
      updated_at: r.updated_at,
    })),
    meta: {
      page,
      limit,
      total_itemss: total,
      total_pages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function getAdminById(id) {
  const { rows } = await query(
    `${SELECT_PUBLIC.replace('a.id,', 'a.id, a.content, a.status, a.featured_image_id,')}
     WHERE a.id = $1`,
    [id]
  );
  if (!rows[0]) return null;
  const seo = await query(
    `SELECT seo_title, seo_description, seo_keywords, canonical_url, og_image
     FROM seo_metadata WHERE article_id = $1`,
    [id]
  );
  const categoryIds = await query(
    'SELECT category_id FROM article_categories WHERE article_id = $1',
    [id]
  );
  return {
    ...toPublicArticle(rows[0]),
    content: rows[0].content,
    status: rows[0].status,
    featured_image_id: rows[0].featured_image_id,
    category_ids: categoryIds.rows.map((r) => r.category_id),
    seo: seo.rows[0] || null,
  };
}

async function ensureUniqueSlug(client, slug, excludeId = null) {
  const { rows } = await client.query(
    `SELECT 1 FROM articles WHERE slug = $1 ${excludeId ? 'AND id <> $2' : ''} LIMIT 1`,
    excludeId ? [slug, excludeId] : [slug]
  );
  if (rows.length === 0) return slug;
  let i = 2;
  while (true) {
    const candidate = `${slug}-${i}`;
    const existing = await client.query(
      `SELECT 1 FROM articles WHERE slug = $1 ${excludeId ? 'AND id <> $2' : ''} LIMIT 1`,
      excludeId ? [candidate, excludeId] : [candidate]
    );
    if (existing.rows.length === 0) return candidate;
    i += 1;
  }
}

async function saveSeo(client, articleId, seo) {
  if (!seo) return;
  await client.query(
    `INSERT INTO seo_metadata (article_id, seo_title, seo_description, seo_keywords, canonical_url, og_image)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (article_id) DO UPDATE SET
       seo_title = EXCLUDED.seo_title,
       seo_description = EXCLUDED.seo_description,
       seo_keywords = EXCLUDED.seo_keywords,
       canonical_url = EXCLUDED.canonical_url,
       og_image = EXCLUDED.og_image`,
    [articleId, seo.seo_title || null, seo.seo_description || null, seo.seo_keywords || null, seo.canonical_url || null, seo.og_image || null]
  );
}

export async function create(data, authorId) {
  return withTransaction(async (client) => {
    const slug = await ensureUniqueSlug(client, makeSlug(data.slug || data.title));
    const publishedAt = data.status === 'published' ? new Date() : null;
    const { rows } = await client.query(
      `INSERT INTO articles (title, slug, excerpt, content, status, author_id, featured_image_id, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, title, slug, status`,
      [data.title, slug, data.excerpt || null, data.content, data.status, authorId, data.featured_image_id || null, publishedAt]
    );
    const article = rows[0];
    for (const categoryId of data.category_ids) {
      await client.query(
        'INSERT INTO article_categories (article_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [article.id, categoryId]
      );
    }
    await saveSeo(client, article.id, data.seo);
    return article;
  });
}

export async function update(id, data) {
  return withTransaction(async (client) => {
    const existing = await client.query('SELECT id, status FROM articles WHERE id = $1', [id]);
    if (!existing.rows[0]) return null;
    const previous = existing.rows[0];

    const slug = data.slug || data.title
      ? await ensureUniqueSlug(client, makeSlug(data.slug || data.title), id)
      : undefined;
    const newlyPublished = data.status === 'published' && previous.status !== 'published'
      ? new Date()
      : undefined;

    const { rows } = await client.query(
      `UPDATE articles SET
         title = COALESCE($2, title),
         slug = COALESCE($3, slug),
         excerpt = COALESCE($4, excerpt),
         content = COALESCE($5, content),
         status = COALESCE($6, status),
         featured_image_id = COALESCE($7, featured_image_id),
         published_at = COALESCE($8, published_at)
       WHERE id = $1
       RETURNING id, title, slug, status`,
      [id, data.title ?? null, slug ?? null, data.excerpt ?? null, data.content ?? null, data.status ?? null, data.featured_image_id ?? null, newlyPublished ?? null]
    );
    if (data.category_ids) {
      await client.query('DELETE FROM article_categories WHERE article_id = $1', [id]);
      for (const categoryId of data.category_ids) {
        await client.query(
          'INSERT INTO article_categories (article_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [id, categoryId]
        );
      }
    }
    await saveSeo(client, id, data.seo);
    return rows[0];
  });
}

export async function remove(id) {
  const { rows } = await query('DELETE FROM articles WHERE id = $1 RETURNING id', [id]);
  return rows[0] || null;
}
