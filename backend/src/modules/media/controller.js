import multer from 'multer';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { config } from '../../config.js';
import * as service from './service.js';
import { berhasil, gagal } from '../../utils/response.js';

const MIME_DIIZINKAN = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

const penyimpanan = multer.diskStorage({
  destination: config.uploadDir,
  filename: (req, berkas, cb) => {
    const ekstensi = path.extname(berkas.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ekstensi}`);
  },
});

export const unggahBerkas = multer({
  storage: penyimpanan,
  limits: { fileSize: config.maksUkuranBerkas },
  fileFilter: (req, berkas, cb) => {
    if (!MIME_DIIZINKAN.includes(berkas.mimetype)) {
      const err = new Error('Tipe berkas tidak didukung. Gunakan gambar (jpeg/png/webp/gif/svg).');
      err.status = 400;
      return cb(err);
    }
    cb(null, true);
  },
}).single('berkas');

export async function daftar(req, res) {
  const data = await service.daftar();
  return berhasil(res, 'Daftar media berhasil dimuat', data);
}

export async function detail(req, res) {
  const data = await service.detail(req.params.id);
  if (!data) return gagal(res, 'Media tidak ditemukan', 404);
  return berhasil(res, 'Detail media berhasil dimuat', data);
}

export async function unggah(req, res) {
  if (!req.file) return gagal(res, 'Berkas wajib disertakan pada field "berkas"', 400);
  const data = await service.simpan(req.file, req.pengguna.id);
  return berhasil(res, 'Media berhasil diunggah', data, 201);
}

export async function hapus(req, res) {
  const data = await service.hapus(req.params.id);
  if (!data) return gagal(res, 'Media tidak ditemukan', 404);
  return berhasil(res, 'Media berhasil dihapus', { id: data.id });
}
