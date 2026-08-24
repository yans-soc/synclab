import * as service from './service.js';
import { berhasil, gagal } from '../../utils/response.js';

function angkaHal(nilai, bawaan) {
  const n = Number.parseInt(nilai, 10);
  return Number.isFinite(n) && n > 0 ? n : bawaan;
}

export async function daftarPublik(req, res) {
  const { kategori } = req.query;
  const halaman = angkaHal(req.query.halaman, 1);
  const limit = Math.min(angkaHal(req.query.limit, 10), 50);
  const { data, meta } = await service.daftarPublik({ kategori, halaman, limit });
  return berhasil(res, 'Daftar artikel berhasil diambil', data, 200, meta);
}

export async function detailPublik(req, res) {
  const data = await service.detailPublikBySlug(req.params.slug);
  if (!data) return gagal(res, 'Artikel tidak ditemukan', 404);
  return berhasil(res, 'Detail artikel berhasil ditemukan', data);
}

export async function daftarAdmin(req, res) {
  const halaman = angkaHal(req.query.halaman, 1);
  const limit = Math.min(angkaHal(req.query.limit, 10), 100);
  const { data, meta } = await service.daftarAdmin({
    status: req.query.status,
    cari: req.query.cari,
    halaman,
    limit,
  });
  return berhasil(res, 'Daftar artikel berhasil dimuat', data, 200, meta);
}

export async function detailAdmin(req, res) {
  const data = await service.detailAdmin(req.params.id);
  if (!data) return gagal(res, 'Artikel tidak ditemukan', 404);
  return berhasil(res, 'Detail artikel berhasil dimuat', data);
}

export async function buat(req, res) {
  const data = await service.buat(req.body, req.pengguna.id);
  return berhasil(res, 'Artikel berhasil dibuat', data, 201);
}

export async function perbarui(req, res) {
  const data = await service.perbarui(req.params.id, req.body);
  if (!data) return gagal(res, 'Artikel tidak ditemukan', 404);
  return berhasil(res, 'Artikel berhasil diperbarui', data);
}

export async function hapus(req, res) {
  const data = await service.hapus(req.params.id);
  if (!data) return gagal(res, 'Artikel tidak ditemukan', 404);
  return berhasil(res, 'Artikel berhasil dihapus', { id: data.id });
}
