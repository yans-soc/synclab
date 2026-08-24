import { Router } from 'express';
import routerOtentikasi from '../modules/otentikasi/routes.js';
import { routerPublik as artikelPublik, routerAdmin as artikelAdmin } from '../modules/artikel/routes.js';
import { routerPublik as kategoriPublik, routerAdmin as kategoriAdmin } from '../modules/kategori/routes.js';
import { routerPublik as berandaPublik, routerAdmin as berandaAdmin } from '../modules/beranda/routes.js';
import { routerPublik as menuPublik, routerAdmin as menuAdmin } from '../modules/menu/routes.js';
import { routerPublik as pengaturanPublik, routerAdmin as pengaturanAdmin } from '../modules/pengaturan/routes.js';
import { routerPublik as halamanPublik, routerAdmin as halamanAdmin } from '../modules/halaman/routes.js';
import mediaAdmin from '../modules/media/routes.js';

const router = Router();

// Public API
router.use('/otentikasi', routerOtentikasi);
router.use('/beranda', berandaPublik);
router.use('/artikel', artikelPublik);
router.use('/kategori', kategoriPublik);
router.use('/menu', menuPublik);
router.use('/pengaturan', pengaturanPublik);
router.use('/halaman', halamanPublik);

// Admin API
router.use('/admin/artikel', artikelAdmin);
router.use('/admin/kategori', kategoriAdmin);
router.use('/admin/beranda', berandaAdmin);
router.use('/admin/menu', menuAdmin);
router.use('/admin/pengaturan', pengaturanAdmin);
router.use('/admin/halaman', halamanAdmin);
router.use('/admin/media', mediaAdmin);

export default router;
