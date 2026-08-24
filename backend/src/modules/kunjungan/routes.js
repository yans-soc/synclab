import { Router } from 'express';
import { catatViewSah, statistikArtikel } from './service.js';
import { autentikasi } from '../../middleware/autentikasi.js';
import { berhasil, gagal } from '../../utils/response.js';

const router = Router();

// Klaim view & statistik tidak boleh di-cache di lapisan mana pun.
router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// Klaim view tervalidasi dari halaman detail (dipanggil frontend setelah
// pengunjung aktif membaca >= 10 detik). Selalu 200; field dicatat menandakan
// apakah view lolos seluruh validasi dan counter bertambah.
router.post('/:slug', async (req, res, next) => {
  try {
    const hasil = await catatViewSah({
      req,
      slugArtikel: req.params.slug,
      token: req.body?.token,
    });
    if (hasil.alasan === 'tidak_ditemukan') return gagal(res, 'Artikel tidak ditemukan', 404);
    return berhasil(res, hasil.dicatat ? 'View tercatat' : 'View tidak dihitung', {
      dicatat: hasil.dicatat,
      jumlah_dilihat: hasil.jumlah_dilihat,
    });
  } catch (err) {
    return next(err);
  }
});

// Statistik per artikel untuk dashboard CMS (sumber data sama dengan publik)
router.get('/admin/:idArtikel/statistik', autentikasi, async (req, res, next) => {
  try {
    const data = await statistikArtikel(req.params.idArtikel);
    if (!data) return gagal(res, 'Artikel tidak ditemukan', 404);
    return berhasil(res, 'Statistik artikel berhasil diambil', data);
  } catch (err) {
    return next(err);
  }
});

export default router;
