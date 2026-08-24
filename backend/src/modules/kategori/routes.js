import { Router } from 'express';
import * as controller from './controller.js';
import { autentikasi, otorisasi } from '../../middleware/autentikasi.js';
import { validasi } from '../../middleware/validasi.js';
import { skemaKategori, skemaKategoriPerbarui } from '../../validators/index.js';

export const routerPublik = Router();
routerPublik.get('/', controller.daftar);

export const routerAdmin = Router();
routerAdmin.use(autentikasi);
routerAdmin.post('/', otorisasi('admin', 'editor'), validasi(skemaKategori), controller.buat);
routerAdmin.put('/:id', otorisasi('admin', 'editor'), validasi(skemaKategoriPerbarui), controller.perbarui);
routerAdmin.delete('/:id', otorisasi('admin'), controller.hapus);
