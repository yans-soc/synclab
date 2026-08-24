import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import compression from 'compression';
import fs from 'node:fs';
import { config } from './config.js';
import router from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

fs.mkdirSync(config.uploadDir, { recursive: true });

const app = express();

app.set('etag', 'strong');
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Lightweight observability: per-request duration via Server-Timing + slow request logs.
const SLOW_API_MS = Number(process.env.API_SLOW_MS || 500);
app.use((req, res, next) => {
  const start = performance.now();
  const originalWriteHead = res.writeHead.bind(res);
  res.writeHead = (...args) => {
    if (!res.headersSent) {
      res.setHeader('Server-Timing', `app;dur=${(performance.now() - start).toFixed(1)}`);
    }
    return originalWriteHead(...args);
  };
  res.on('finish', () => {
    const duration = performance.now() - start;
    if (duration >= SLOW_API_MS) {
      console.warn(`[api] slow ${duration.toFixed(0)}ms ${req.method} ${req.originalUrl} -> ${res.statusCode}`);
    }
  });
  next();
});
// File names are unique per upload (multer), so URLs are immutable.
app.use('/uploads', express.static(config.uploadDir, { maxAge: '365d', immutable: true }));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'SYNCLAB CMS server is running', data: null });
});

app.use('/api/v1', router);

app.use(notFound);
app.use(errorHandler);

export default app;
