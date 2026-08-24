import * as service from './service.js';
import { buatSlug } from '../../utils/slug.js';
import { berhasil, gagal } from '../../utils/response.js';

export async function daftar(req, res) {
  const data = await service.daftar();
  return berhasil(res, 'Daftar kategori berhasil dimuat', data);
}

export async function buat(req, res) {
  const data = await service.buat({
    ...req.body,
    slug: buatSlug(req.body.slug || req.body.nama),
  });
  return berhasil(res, 'Kategori berhasil dibuat', data, 201);
}

export async function perbarui(req, res) {
  const data = await service.perbarui(req.params.id, {
    ...req.body,
    slug: req.body.slug ? buatSlug(req.body.slug) : req.body.slug,
  });
  if (!data) return gagal(res, 'Kategori tidak ditemukan', 404);
  return berhasil(res, 'Kategori berhasil diperbarui', data);
}

export async function hapus(req, res) {
  const data = await service.hapus(req.params.id);
  if (!data) return gagal(res, 'Kategori tidak ditemukan', 404);
  return berhasil(res, 'Kategori berhasil dihapus', { id: data.id });
}
