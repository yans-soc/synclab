import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import fs from 'node:fs';
import { config } from './config.js';
import router from './routes/index.js';
import { penangananError, tidakDitemukan } from './middleware/errorHandler.js';

fs.mkdirSync(config.uploadDir, { recursive: true });

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(config.uploadDir));

app.get('/api/kesehatan', (req, res) => {
  res.json({ sukses: true, pesan: 'Server SYNCLAB CMS berjalan', data: null });
});

app.use('/api/v1', router);

app.use(tidakDitemukan);
app.use(penangananError);

export default app;
