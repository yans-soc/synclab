import * as service from './service.js';
import { berhasil, gagal } from '../../utils/response.js';

export async function aktif(req, res) {
  const data = await service.berandaAktif({ lengkap: req.query.lengkap === '1' });
  if (!data) return gagal(res, 'Belum ada beranda yang aktif', 404);
  return berhasil(res, 'Beranda aktif berhasil dimuat', data);
}

export async function daftar(req, res) {
  const data = await service.daftarBeranda();
  return berhasil(res, 'Daftar beranda berhasil dimuat', data);
}

export async function detail(req, res) {
  const data = await service.detailBeranda(req.params.id);
  if (!data) return gagal(res, 'Beranda tidak ditemukan', 404);
  return berhasil(res, 'Detail beranda berhasil dimuat', data);
}

export async function buat(req, res) {
  const data = await service.buatBeranda(req.body.judul);
  return berhasil(res, 'Beranda berhasil dibuat', data, 201);
}

export async function aturAktif(req, res) {
  const data = await service.aturAktifBeranda(req.params.id, req.body.aktif);
  if (!data) return gagal(res, 'Beranda tidak ditemukan', 404);
  return berhasil(
    res,
    data.aktif ? 'Beranda berhasil dipublikasikan' : 'Beranda berhasil dinonaktifkan',
    data
  );
}

export async function buatBagian(req, res) {
  const beranda = await service.detailBeranda(req.params.id);
  if (!beranda) return gagal(res, 'Beranda tidak ditemukan', 404);
  const data = await service.buatBagian(req.params.id, req.body);
  return berhasil(res, 'Bagian beranda berhasil ditambahkan', data, 201);
}

export async function perbaruiBagian(req, res) {
  const data = await service.perbaruiBagian(req.params.idBagian, req.body);
  if (!data) return gagal(res, 'Bagian beranda tidak ditemukan', 404);
  return berhasil(res, 'Bagian beranda berhasil diperbarui', data);
}

export async function hapusBagian(req, res) {
  const data = await service.hapusBagian(req.params.idBagian);
  if (!data) return gagal(res, 'Bagian beranda tidak ditemukan', 404);
  return berhasil(res, 'Bagian beranda berhasil dihapus', { id: data.id });
}

export async function duplikatBagian(req, res) {
  const data = await service.duplikatBagian(req.params.idBagian);
  if (!data) return gagal(res, 'Bagian beranda tidak ditemukan', 404);
  return berhasil(res, 'Bagian beranda berhasil diduplikat', data, 201);
}

export async function susunUlang(req, res) {
  const data = await service.susunUlangBagian(req.params.id, req.body.urutan);
  if (!data) return gagal(res, 'Beranda tidak ditemukan', 404);
  return berhasil(res, 'Urutan bagian beranda berhasil diperbarui', data);
}
