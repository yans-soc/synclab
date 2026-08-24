import { ZodError } from 'zod';
import { gagal } from '../utils/response.js';

export function penangananError(err, req, res, _next) {
  if (err instanceof ZodError) {
    return gagal(
      res,
      'Payload tidak valid',
      400,
      err.issues.map((i) => ({ jalur: i.path.join('.'), pesan: i.message }))
    );
  }
  if (err?.type === 'entity.too.large') {
    return gagal(res, 'Ukuran payload terlalu besar', 413);
  }
  if (err?.name === 'MulterError') {
    return gagal(res, `Gagal mengunggah berkas: ${err.message}`, 400);
  }
  if (Number.isInteger(err?.status)) {
    return gagal(res, err.message, err.status);
  }
  console.error('[error]', err);
  return gagal(res, 'Terjadi kesalahan pada server', 500);
}

export function tidakDitemukan(req, res) {
  return gagal(res, `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`, 404);
}
