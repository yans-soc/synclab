import { query } from '../../database/pool.js';

export async function listByLocation(location) {
  const { rows } = await query(
    `SELECT im.id, im.parent_id, im.label, im.url, im.position, im.icon
     FROM menu_items im
     JOIN menus m ON m.id = im.menu_id
     WHERE m.location = $1
     ORDER BY im.position`,
    [location]
  );
  return rows;
}

export async function listMenus() {
  const { rows } = await query(
    `SELECT m.id, m.name, m.location,
            COALESCE((
              SELECT jsonb_agg(jsonb_build_object(
                'id', im.id, 'parent_id', im.parent_id, 'label', im.label,
                'url', im.url, 'position', im.position, 'icon', im.icon
              ) ORDER BY im.position)
              FROM menu_items im WHERE im.menu_id = m.id
            ), '[]'::jsonb) AS item
     FROM menus m ORDER BY m.location`
  );
  return rows;
}

export async function createMenu(data) {
  const { rows } = await query(
    'INSERT INTO menus (name, location) VALUES ($1, $2) RETURNING id, name, location',
    [data.name, data.location]
  );
  return rows[0];
}

export async function addItem(menuId, data) {
  const { rows } = await query(
    `INSERT INTO menu_items (menu_id, parent_id, label, url, position, icon)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, menu_id, parent_id, label, url, position, icon`,
    [menuId, data.parent_id || null, data.label, data.url, data.position, data.icon || null]
  );
  return rows[0];
}

export async function updateItem(id, data) {
  const { rows } = await query(
    `UPDATE menu_items SET
       parent_id = COALESCE($2, parent_id),
       label = COALESCE($3, label),
       url = COALESCE($4, url),
       position = COALESCE($5, position),
       icon = COALESCE($6, icon)
     WHERE id = $1
     RETURNING id, menu_id, parent_id, label, url, position, icon`,
    [id, data.parent_id ?? null, data.label ?? null, data.url ?? null, data.position ?? null, data.icon ?? null]
  );
  return rows[0] || null;
}

export async function deleteItem(id) {
  const { rows } = await query('DELETE FROM menu_items WHERE id = $1 RETURNING id', [id]);
  return rows[0] || null;
}
