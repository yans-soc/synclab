import { query } from '../../database/pool.js';

export async function getAll() {
  const { rows } = await query(
    'SELECT key, value, description, data_type FROM global_settings ORDER BY key'
  );
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function listFull() {
  const { rows } = await query(
    'SELECT id, key, value, description, data_type, updated_at FROM global_settings ORDER BY key'
  );
  return rows;
}

export async function saveBulk(settings) {
  const result = [];
  for (const item of settings) {
    const { rows } = await query(
      `INSERT INTO global_settings (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
       RETURNING key, value`,
      [item.key, item.value]
    );
    result.push(rows[0]);
  }
  return result;
}
