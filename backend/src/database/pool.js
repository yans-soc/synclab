import pg from 'pg';
import { config } from '../config.js';

const { Pool } = pg;

const SLOW_QUERY_MS = Number(process.env.DB_SLOW_QUERY_MS || 150);

export const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 10,
});

export async function query(text, params) {
  const start = performance.now();
  const result = await pool.query(text, params);
  const duration = performance.now() - start;
  if (duration >= SLOW_QUERY_MS) {
    console.warn(
      `[db] slow query ${duration.toFixed(0)}ms: ${text.replace(/\s+/g, ' ').slice(0, 120)}`
    );
  }
  return result;
}

export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
