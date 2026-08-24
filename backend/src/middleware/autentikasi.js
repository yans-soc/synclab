import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { gagal } from '../utils/response.js';

export function autentikasi(req, res, next) {
  const header = req.headers.authorization || '';
  const [skema, token] = header.split(' ');
  if (skema !== 'Bearer' || !token) {
    return gagal(res, 'Token autentikasi tidak ditemukan', 401);
  }
  try {
    req.pengguna = jwt.verify(token, config.jwtSecret);
    return next();
  } catch {
    return gagal(res, 'Token tidak valid atau sudah kedaluwarsa', 401);
  }
}

// v1: cek peran dari kolom pengguna.peran (isi token JWT).
// Migrasi masa depan: verifikasi lewat tabel peran_hak_akses (lihat database.md).
export function otorisasi(...peranDiizinkan) {
  return (req, res, next) => {
    if (!req.pengguna) {
      return gagal(res, 'Token autentikasi tidak ditemukan', 401);
    }
    if (peranDiizinkan.length > 0 && !peranDiizinkan.includes(req.pengguna.peran)) {
      return gagal(res, 'Anda tidak memiliki hak akses untuk aksi ini', 403);
    }
    return next();
  };
}
