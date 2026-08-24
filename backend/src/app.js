import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import compression from 'compression';
import fs from 'node:fs';
import { config } from './config.js';
import router from './routes/index.js';
import { penangananError, tidakDitemukan } from './middleware/errorHandler.js';

fs.mkdirSync(config.uploadDir, { recursive: true });

const app = express();

app.set('etag', 'strong');
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Observabilitas ringan: durasi tiap request via Server-Timing + log yang lambat.
const BATAS_API_LAMBAT_MS = Number(process.env.API_SLOW_MS || 500);
app.use((req, res, next) => {
  const mulai = performance.now();
  const tulisHeadAsli = res.writeHead.bind(res);
  res.writeHead = (...args) => {
    if (!res.headersSent) {
      res.setHeader('Server-Timing', `app;dur=${(performance.now() - mulai).toFixed(1)}`);
    }
    return tulisHeadAsli(...args);
  };
  res.on('finish', () => {
    const durasi = performance.now() - mulai;
    if (durasi >= BATAS_API_LAMBAT_MS) {
      console.warn(`[api] lambat ${durasi.toFixed(0)}ms ${req.method} ${req.originalUrl} -> ${res.statusCode}`);
    }
  });
  next();
});
// Nama berkas unik per unggahan (multer), jadi URL bersifat immutable.
app.use('/uploads', express.static(config.uploadDir, { maxAge: '365d', immutable: true }));

app.get('/api/kesehatan', (req, res) => {
  res.json({ sukses: true, pesan: 'Server SYNCLAB CMS berjalan', data: null });
});

app.use('/api/v1', router);

app.use(tidakDitemukan);
app.use(penangananError);

export default app;
