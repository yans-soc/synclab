import * as service from './service.js';
import { berhasil, gagal } from '../../utils/response.js';

export async function publik(req, res) {
  const data = await service.detailPublikBySlug(req.params.slug);
  if (!data) return gagal(res, 'Halaman tidak ditemukan', 404);
  return berhasil(res, 'Halaman berhasil dimuat', data);
}

export async function daftar(req, res) {
  const data = await service.daftarAdmin();
  return berhasil(res, 'Daftar halaman berhasil dimuat', data);
}

export async function buat(req, res) {
  const data = await service.buat(req.body, req.pengguna.id);
  return berhasil(res, 'Halaman berhasil dibuat', data, 201);
}

export async function perbarui(req, res) {
  const data = await service.perbarui(req.params.id, req.body);
  if (!data) return gagal(res, 'Halaman tidak ditemukan', 404);
  return berhasil(res, 'Halaman berhasil diperbarui', data);
}

export async function hapus(req, res) {
  const data = await service.hapus(req.params.id);
  if (!data) return gagal(res, 'Halaman tidak ditemukan', 404);
  return berhasil(res, 'Halaman berhasil dihapus', { id: data.id });
}
