import { Router } from 'express';
import * as controller from './controller.js';
import { autentikasi, otorisasi } from '../../middleware/autentikasi.js';
import { validasi } from '../../middleware/validasi.js';
import { skemaHalaman, skemaHalamanPerbarui } from '../../validators/index.js';

export const routerPublik = Router();
routerPublik.get('/:slug', controller.publik);

export const routerAdmin = Router();
routerAdmin.use(autentikasi);
routerAdmin.get('/', controller.daftar);
routerAdmin.post('/', otorisasi('admin', 'editor', 'penulis'), validasi(skemaHalaman), controller.buat);
routerAdmin.put('/:id', otorisasi('admin', 'editor', 'penulis'), validasi(skemaHalamanPerbarui), controller.perbarui);
routerAdmin.delete('/:id', otorisasi('admin', 'editor'), controller.hapus);
