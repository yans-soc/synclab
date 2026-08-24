import pg from 'pg';
import { config } from '../config.js';

const { Pool } = pg;

const BATAS_KUERI_LAMBAT_MS = Number(process.env.DB_SLOW_QUERY_MS || 150);

export const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 10,
});

export async function kueri(teks, params) {
  const mulai = performance.now();
  const hasil = await pool.query(teks, params);
  const durasi = performance.now() - mulai;
  if (durasi >= BATAS_KUERI_LAMBAT_MS) {
    console.warn(
      `[db] kueri lambat ${durasi.toFixed(0)}ms: ${teks.replace(/\s+/g, ' ').slice(0, 120)}`
    );
  }
  return hasil;
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
