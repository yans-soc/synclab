import { query, withTransaction } from '../../database/pool.js';
import { listPublic, listTrending } from '../articles/service.js';
import { list as listCategory } from '../categories/service.js';

export async function getActiveHomepage({ full = false } = {}) {
  const { rows } = await query(
    `SELECT b.id AS homepage_id, b.title AS homepage_title,
            COALESCE((
              SELECT jsonb_agg(jsonb_build_object(
                'id', bb.id,
                'section_title', bb.section_title,
                'type', bb.type,
                'position', bb.position,
                'settings', bb.settings
              ) ORDER BY bb.position)
              FROM homepage_sections bb
              WHERE bb.homepage_id = b.id AND bb.active = TRUE
            ), '[]'::jsonb) AS sections
     FROM homepages b
     WHERE b.active = TRUE
     ORDER BY b.version DESC
     LIMIT 1`
  );
  const homepage = rows[0] || null;
  if (!homepage || !full) return homepage;

  // Composite mode: all section data in ONE response so the homepage does not
  // create a 4-request waterfall (structure + categories + latest + trending).
  const findSection = (type) => homepage.sections.find((b) => b.type === type);
  const needed = new Set(homepage.sections.map((b) => b.type));
  const latestCount = findSection('latest_articles')?.settings?.display_count || 6;
  const trendingCount = findSection('trending_articles')?.settings?.display_count || 6;
  const [categories, latest, trending] = await Promise.all([
    needed.has('explore_topics') ? listCategory() : Promise.resolve(null),
    needed.has('latest_articles')
      ? listPublic({ limit: latestCount }).then((r) => r.data)
      : Promise.resolve(null),
    needed.has('trending_articles') ? listTrending(trendingCount) : Promise.resolve(null),
  ]);
  homepage.data = { categories, latest_articles: latest, trending };
  return homepage;
}

export async function listHomepages() {
  const { rows } = await query(
    `SELECT b.id, b.title, b.version, b.active, b.created_at, b.updated_at,
            (SELECT COUNT(*) FROM homepage_sections bb WHERE bb.homepage_id = b.id)::int AS section_count
     FROM homepages b ORDER BY b.version DESC`
  );
  return rows;
}

export async function getHomepageById(id) {
  const { rows } = await query(
    `SELECT b.id, b.title, b.version, b.active,
            COALESCE((
              SELECT jsonb_agg(jsonb_build_object(
                'id', bb.id, 'section_title', bb.section_title, 'type', bb.type,
                'position', bb.position, 'settings', bb.settings, 'active', bb.active
              ) ORDER BY bb.position)
              FROM homepage_sections bb WHERE bb.homepage_id = b.id
            ), '[]'::jsonb) AS sections
     FROM homepages b WHERE b.id = $1`,
    [id]
  );
  return rows[0] || null;
}

export async function createHomepage(title) {
  const { rows } = await query(
    `INSERT INTO homepages (title, version)
     VALUES ($1, COALESCE((SELECT MAX(version) + 1 FROM homepages), 1))
     RETURNING id, title, version, active`,
    [title]
  );
  return rows[0];
}

export async function setHomepageActive(id, active) {
  return withTransaction(async (client) => {
    const existing = await client.query('SELECT id FROM homepages WHERE id = $1', [id]);
    if (!existing.rows[0]) return null;
    if (active) {
      await client.query('UPDATE homepages SET active = FALSE WHERE active = TRUE AND id <> $1', [id]);
    }
    const { rows } = await client.query(
      'UPDATE homepages SET active = $2 WHERE id = $1 RETURNING id, title, version, active',
      [id, active]
    );
    return rows[0];
  });
}

export async function createSection(homepageId, data) {
  const { rows } = await query(
    `INSERT INTO homepage_sections (homepage_id, section_title, type, position, settings, active)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, homepage_id, section_title, type, position, settings, active`,
    [homepageId, data.section_title, data.type, data.position, JSON.stringify(data.settings), data.active]
  );
  return rows[0];
}

export async function updateSection(id, data) {
  const { rows } = await query(
    `UPDATE homepage_sections SET
       section_title = COALESCE($2, section_title),
       type = COALESCE($3, type),
       position = COALESCE($4, position),
       settings = COALESCE($5, settings),
       active = COALESCE($6, active)
     WHERE id = $1
     RETURNING id, homepage_id, section_title, type, position, settings, active`,
    [id, data.section_title ?? null, data.type ?? null, data.position ?? null,
     data.settings ? JSON.stringify(data.settings) : null, data.active ?? null]
  );
  return rows[0] || null;
}

export async function deleteSection(id) {
  const { rows } = await query('DELETE FROM homepage_sections WHERE id = $1 RETURNING id', [id]);
  return rows[0] || null;
}

export async function duplicateSection(id) {
  const { rows } = await query(
    `INSERT INTO homepage_sections (homepage_id, section_title, type, position, settings, active)
     SELECT homepage_id, section_title || ' (Copy)', type,
            COALESCE((SELECT MAX(position) + 1 FROM homepage_sections bb2 WHERE bb2.homepage_id = bb.homepage_id), 0),
            settings, FALSE
     FROM homepage_sections bb WHERE id = $1
     RETURNING id, homepage_id, section_title, type, position, settings, active`,
    [id]
  );
  return rows[0] || null;
}

export async function reorderSections(homepageId, order) {
  return withTransaction(async (client) => {
    for (const item of order) {
      await client.query(
        'UPDATE homepage_sections SET position = $2 WHERE id = $1 AND homepage_id = $3',
        [item.id, item.position, homepageId]
      );
    }
    return getHomepageById(homepageId);
  });
}
