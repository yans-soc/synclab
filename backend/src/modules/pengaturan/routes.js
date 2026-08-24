import { Router } from 'express';
import * as controller from './controller.js';
import { autentikasi, otorisasi } from '../../middleware/autentikasi.js';
import { validasi } from '../../middleware/validasi.js';
import { skemaPengaturanMassal } from '../../validators/index.js';

export const routerPublik = Router();
routerPublik.get('/', controller.publik);

export const routerAdmin = Router();
routerAdmin.use(autentikasi);
routerAdmin.get('/', controller.daftar);
routerAdmin.put('/', otorisasi('admin'), validasi(skemaPengaturanMassal), controller.simpanMassal);
