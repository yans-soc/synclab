import { Router } from 'express';
import routerOtentikasi from '../modules/otentikasi/routes.js';
import { routerPublik as artikelPublik, routerAdmin as artikelAdmin } from '../modules/artikel/routes.js';
import { routerPublik as kategoriPublik, routerAdmin as kategoriAdmin } from '../modules/kategori/routes.js';
import { routerPublik as berandaPublik, routerAdmin as berandaAdmin } from '../modules/beranda/routes.js';
import { routerPublik as menuPublik, routerAdmin as menuAdmin } from '../modules/menu/routes.js';
import { routerPublik as pengaturanPublik, routerAdmin as pengaturanAdmin } from '../modules/pengaturan/routes.js';
import { routerPublik as halamanPublik, routerAdmin as halamanAdmin } from '../modules/halaman/routes.js';
import mediaAdmin from '../modules/media/routes.js';
import kunjunganRoutes from '../modules/kunjungan/routes.js';
import { cachePublik, invalidasiCache } from '../middleware/cache.js';

const router = Router();

// Public API (di-cache in-memory, invalidasi otomatis saat mutasi admin)
router.use('/beranda', cachePublik, berandaPublik);
router.use('/artikel', cachePublik, artikelPublik);
router.use('/kategori', cachePublik, kategoriPublik);
router.use('/menu', cachePublik, menuPublik);
router.use('/pengaturan', cachePublik, pengaturanPublik);
router.use('/halaman', cachePublik, halamanPublik);

// Klaim view tervalidasi (tidak di-cache; ini mutasi terukur)
router.use('/kunjungan', kunjunganRoutes);

// Admin API (setiap mutasi membersihkan cache publik)
router.use('/otentikasi', routerOtentikasi);
router.use('/admin', invalidasiCache);
router.use('/admin/artikel', artikelAdmin);
router.use('/admin/kategori', kategoriAdmin);
router.use('/admin/beranda', berandaAdmin);
router.use('/admin/menu', menuAdmin);
router.use('/admin/pengaturan', pengaturanAdmin);
router.use('/admin/halaman', halamanAdmin);
router.use('/admin/media', mediaAdmin);

export default router;
