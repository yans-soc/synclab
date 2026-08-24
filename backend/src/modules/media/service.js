import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { query } from '../../database/pool.js';
import { config } from '../../config.js';

// Responsive (webp) variants generated on image upload.
// URLs look like <name>-w<width>.webp so the frontend can pick the nearest size
// without extra queries, and a CDN can cache each variant permanently.
const VARIANTSTS = { thumbnail: 400, small: 800, medium: 1280, large: 1920 };

async function buildVariants(file) {
  if (!file.mimetype.startsWith('image/') || file.mimetype === 'image/svg+xml') {
    return { width: null, height: null, variants: {} };
  }
  const originalPath = path.join(config.uploadDir, file.filename);
  const base = file.filename.replace(/\.[^.]+$/, '');
  const image = sharp(originalPath, { failOn: 'none' }).rotate();
  const meta = await image.metadata();
  const variants = {};
  await Promise.all(
    Object.entries(VARIANTSTS).map(async ([name, width]) => {
      if (meta.width && meta.width <= width) return;
      const variantFileName = `${base}-w${width}.webp`;
      await sharp(originalPath, { failOn: 'none' })
        .rotate()
        .resize({ width: width, withoutEnlargement: true })
        .webp({ quality: 78 })
        .toFile(path.join(config.uploadDir, variantFileName));
      variants[name] = `/uploads/${variantFileName}`;
    })
  );
  return { width: meta.width ?? null, height: meta.height ?? null, variants };
}

export async function list() {
  const { rows } = await query(
    `SELECT m.id, m.file_name, m.url, m.mime_type, m.file_size, m.created_at,
            p.full_name AS uploader_name
     FROM media m
     LEFT JOIN users p ON p.id = m.uploader_id
     ORDER BY m.created_at DESC`
  );
  return rows;
}

export async function getById(id) {
  const { rows } = await query(
    `SELECT m.id, m.file_name, m.url, m.mime_type, m.file_size, m.created_at,
            p.full_name AS uploader_name
     FROM media m
     LEFT JOIN users p ON p.id = m.uploader_id
     WHERE m.id = $1`,
    [id]
  );
  return rows[0] || null;
}

export async function save(file, uploaderId) {
  const url = `/uploads/${file.filename}`;
  const { width, height, variants } = await buildVariants(file).catch(() => ({
    width: null,
    height: null,
    variants: {},
  }));
  const { rows } = await query(
    `INSERT INTO media (file_name, url, mime_type, file_size, uploader_id, width, height, variants)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, file_name, url, mime_type, file_size, width, height, variants, created_at`,
    [file.originalname, url, file.mimetype, file.size, uploaderId, width, height, JSON.stringify(variants)]
  );
  return rows[0];
}

export async function remove(id) {
  const media = await getById(id);
  if (!media) return null;
  await query('DELETE FROM media WHERE id = $1', [id]);
  if (media.url.startsWith('/uploads/')) {
    const base = path.basename(media.url).replace(/\.[^.]+$/, '');
    const relatedFiles = await fs.readdir(config.uploadDir).catch(() => []);
    await Promise.all(
      relatedFiles
        .filter((b) => b === path.basename(media.url) || b.startsWith(`${base}-w`))
        .map((b) => fs.unlink(path.join(config.uploadDir, b)).catch(() => {}))
    );
  }
  return media;
}
