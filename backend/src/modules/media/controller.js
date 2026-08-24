import multer from 'multer';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { config } from '../../config.js';
import * as service from './service.js';
import { success, fail } from '../../utils/response.js';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

const diskStorage = multer.diskStorage({
  destination: config.uploadDir,
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${extension}`);
  },
});

export const uploadFile = multer({
  storage: diskStorage,
  limits: { fileSize: config.maxFileSize },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      const err = new Error('Unsupported file type. Use an image (jpeg/png/webp/gif/svg).');
      err.status = 400;
      return cb(err);
    }
    cb(null, true);
  },
}).single('file');

export async function list(req, res) {
  const data = await service.list();
  return success(res, 'Media list loaded', data);
}

export async function getById(req, res) {
  const data = await service.getById(req.params.id);
  if (!data) return fail(res, 'Media not found', 404);
  return success(res, 'Media detail loaded', data);
}

export async function upload(req, res) {
  if (!req.file) return fail(res, 'A file is required in the field "file"', 400);
  const data = await service.save(req.file, req.user.id);
  return success(res, 'Media uploaded', data, 201);
}

export async function remove(req, res) {
  const data = await service.remove(req.params.id);
  if (!data) return fail(res, 'Media not found', 404);
  return success(res, 'Media deleted', { id: data.id });
}
