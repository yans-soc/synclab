import { Router } from 'express';
import * as controller from './controller.js';
import { autentikasi, otorisasi } from '../../middleware/autentikasi.js';
import { validasi } from '../../middleware/validasi.js';
import { skemaArtikelBuat, skemaArtikelPerbarui } from '../../validators/index.js';

export const routerPublik = Router();
routerPublik.get('/', controller.daftarPublik);
routerPublik.get('/:slug', controller.detailPublik);

export const routerAdmin = Router();
routerAdmin.use(autentikasi);
routerAdmin.get('/', controller.daftarAdmin);
routerAdmin.get('/:id', controller.detailAdmin);
routerAdmin.post('/', otorisasi('admin', 'editor', 'penulis'), validasi(skemaArtikelBuat), controller.buat);
routerAdmin.put('/:id', otorisasi('admin', 'editor', 'penulis'), validasi(skemaArtikelPerbarui), controller.perbarui);
routerAdmin.delete('/:id', otorisasi('admin', 'editor'), controller.hapus);
