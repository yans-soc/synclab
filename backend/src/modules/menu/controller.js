import * as service from './service.js';
import { berhasil, gagal } from '../../utils/response.js';

export async function publik(req, res) {
  const data = await service.daftarByLokasi(req.params.lokasi);
  return berhasil(res, `Menu lokasi "${req.params.lokasi}" berhasil dimuat`, data);
}

export async function daftar(req, res) {
  const data = await service.daftarMenu();
  return berhasil(res, 'Daftar menu berhasil dimuat', data);
}

export async function buat(req, res) {
  const data = await service.buatMenu(req.body);
  return berhasil(res, 'Menu berhasil dibuat', data, 201);
}

export async function tambahItem(req, res) {
  const data = await service.tambahItem(req.params.id, req.body);
  return berhasil(res, 'Item menu berhasil ditambahkan', data, 201);
}

export async function perbaruiItem(req, res) {
  const data = await service.perbaruiItem(req.params.idItem, req.body);
  if (!data) return gagal(res, 'Item menu tidak ditemukan', 404);
  return berhasil(res, 'Item menu berhasil diperbarui', data);
}

export async function hapusItem(req, res) {
  const data = await service.hapusItem(req.params.idItem);
  if (!data) return gagal(res, 'Item menu tidak ditemukan', 404);
  return berhasil(res, 'Item menu berhasil dihapus', { id: data.id });
}
