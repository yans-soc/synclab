import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: Number(process.env.PORT || 12000),
  databaseUrl:
    process.env.DATABASE_URL ||
    'postgresql://synclab:synclab@localhost:5432/synclab',
  jwtSecret:
    process.env.JWT_SECRET || 'dev-secret-synclab-do-not-use-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  uploadDir: path.resolve(__dirname, '..', process.env.UPLOAD_DIR || 'uploads'),
  maxFileSize: Number(process.env.MAX_FILE_SIZE || 5 * 1024 * 1024),
};
