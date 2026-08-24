import app from './app.js';
import { config } from './config.js';
import { pool } from './database/pool.js';

async function start() {
  try {
    await pool.query('SELECT 1');
    console.log('[db] PostgreSQL connection established');
  } catch (err) {
    console.error('[db] Failed to connect to PostgreSQL:', err.message);
    process.exit(1);
  }
  app.listen(config.port, () => {
    console.log(`[api] SYNCLAB CMS API running at http://localhost:${config.port}`);
  });
}

start();
