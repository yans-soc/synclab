import app from './app.js';
import { config } from './config.js';
import { pool } from './database/pool.js';

async function mulai() {
  try {
    await pool.query('SELECT 1');
    console.log('[db] Koneksi PostgreSQL berhasil');
  } catch (err) {
    console.error('[db] Gagal terhubung ke PostgreSQL:', err.message);
    process.exit(1);
  }
  app.listen(config.port, () => {
    console.log(`[api] SYNCLAB CMS API berjalan di http://localhost:${config.port}`);
  });
}

mulai();
