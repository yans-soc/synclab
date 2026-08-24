import { query, withTransaction } from '../../database/pool.js';
import { makeSlug } from '../../utils/slug.js';

export async function listAdmin() {
  const { rows } = await query(
    `SELECT h.id, h.title, h.slug, h.status, h.updated_at,
            p.full_name AS author
     FROM pages h JOIN users p ON p.id = h.author_id
     ORDER BY h.updated_at DESC`
  );
  return rows;
}

export async function getPublicBySlug(slug) {
  const { rows } = await query(
    `SELECT h.id, h.title, h.slug, h.content, h.updated_at,
            jsonb_build_object(
              'seo_title', ms.seo_title,
              'seo_description', ms.seo_description,
              'seo_keywords', ms.seo_keywords
            ) AS seo
     FROM pages h
     LEFT JOIN seo_metadata ms ON ms.page_id = h.id
     WHERE h.slug = $1 AND h.status = 'published'`,
    [slug]
  );
  return rows[0] || null;
}

export async function create(data, authorId) {
  return withTransaction(async (client) => {
    const slug = makeSlug(data.slug || data.title);
    const { rows } = await client.query(
      `INSERT INTO pages (title, slug, content, status, author_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, title, slug, status`,
      [data.title, slug, data.content, data.status, authorId]
    );
    if (data.seo) {
      await client.query(
        `INSERT INTO seo_metadata (page_id, seo_title, seo_description, seo_keywords, canonical_url, og_image)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (page_id) DO UPDATE SET
           seo_title = EXCLUDED.seo_title, seo_description = EXCLUDED.seo_description,
           seo_keywords = EXCLUDED.seo_keywords, canonical_url = EXCLUDED.canonical_url,
           og_image = EXCLUDED.og_image`,
        [rows[0].id, data.seo.seo_title || null, data.seo.seo_description || null, data.seo.seo_keywords || null, data.seo.canonical_url || null, data.seo.og_image || null]
      );
    }
    return rows[0];
  });
}

export async function update(id, data) {
  return withTransaction(async (client) => {
    const slug = data.slug || data.title ? makeSlug(data.slug || data.title) : null;
    const { rows } = await client.query(
      `UPDATE pages SET
         title = COALESCE($2, title),
         slug = COALESCE($3, slug),
         content = COALESCE($4, content),
         status = COALESCE($5, status)
       WHERE id = $1
       RETURNING id, title, slug, status`,
      [id, data.title ?? null, slug, data.content ?? null, data.status ?? null]
    );
    if (!rows[0]) return null;
    if (data.seo) {
      await client.query(
        `INSERT INTO seo_metadata (page_id, seo_title, seo_description, seo_keywords, canonical_url, og_image)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (page_id) DO UPDATE SET
           seo_title = EXCLUDED.seo_title, seo_description = EXCLUDED.seo_description,
           seo_keywords = EXCLUDED.seo_keywords, canonical_url = EXCLUDED.canonical_url,
           og_image = EXCLUDED.og_image`,
        [id, data.seo.seo_title || null, data.seo.seo_description || null, data.seo.seo_keywords || null, data.seo.canonical_url || null, data.seo.og_image || null]
      );
    }
    return rows[0];
  });
}

export async function remove(id) {
  const { rows } = await query('DELETE FROM pages WHERE id = $1 RETURNING id', [id]);
  return rows[0] || null;
}
