import * as service from './service.js';
import { berhasil, gagal } from '../../utils/response.js';

export async function masuk(req, res) {
  const hasil = await service.masuk(req.body.surel, req.body.kata_sandi);
  if (!hasil) {
    return gagal(res, 'Surel atau kata sandi salah', 401);
  }
  return berhasil(res, 'Login berhasil', hasil);
}

export async function keluar(req, res) {
  // JWT stateless: klien cukup menghapus token di sisi frontend.
  return berhasil(res, 'Logout berhasil', null);
}

export async function profil(req, res) {
  return berhasil(res, 'Profil pengguna berhasil dimuat', req.pengguna);
}
