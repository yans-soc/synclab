import * as service from './service.js';
import { berhasil } from '../../utils/response.js';

export async function publik(req, res) {
  const data = await service.semua();
  return berhasil(res, 'Pengaturan global berhasil dimuat', data);
}

export async function daftar(req, res) {
  const data = await service.daftarLengkap();
  return berhasil(res, 'Daftar pengaturan berhasil dimuat', data);
}

export async function simpanMassal(req, res) {
  const data = await service.simpanMassal(req.body.pengaturan);
  return berhasil(res, 'Pengaturan berhasil disimpan', data);
}
