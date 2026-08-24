import pg from 'pg';
import { config } from '../config.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 10,
});

export async function kueri(teks, params) {
  return pool.query(teks, params);
}

export async function denganTransaksi(fn) {
  const klien = await pool.connect();
  try {
    await klien.query('BEGIN');
    const hasil = await fn(klien);
    await klien.query('COMMIT');
    return hasil;
  } catch (err) {
    await klien.query('ROLLBACK');
    throw err;
  } finally {
    klien.release();
  }
}
