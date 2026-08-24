import { query } from '../../database/pool.js';

export async function list() {
  const { rows } = await query(
    `SELECT k.id, k.name, k.slug, k.description, k.color, k.icon,
            (SELECT COUNT(*) FROM article_categories ak JOIN articles a ON a.id = ak.article_id WHERE ak.category_id = k.id AND a.status = 'published')::int AS article_count
     FROM categories k ORDER BY k.name`
  );
  return rows;
}

export async function create(data) {
  const { rows } = await query(
    `INSERT INTO categories (name, slug, description, color, icon)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, slug, description, color, icon`,
    [data.name, data.slug, data.description || null, data.color, data.icon]
  );
  return rows[0];
}

export async function update(id, data) {
  const { rows } = await query(
    `UPDATE categories SET
       name = COALESCE($2, name),
       slug = COALESCE($3, slug),
       description = COALESCE($4, description),
       color = COALESCE($5, color),
       icon = COALESCE($6, icon)
     WHERE id = $1
     RETURNING id, name, slug, description, color, icon`,
    [id, data.name ?? null, data.slug ?? null, data.description ?? null, data.color ?? null, data.icon ?? null]
  );
  return rows[0] || null;
}

export async function remove(id) {
  const { rows } = await query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);
  return rows[0] || null;
}
