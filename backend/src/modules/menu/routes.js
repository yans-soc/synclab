import { Router } from 'express';
import * as controller from './controller.js';
import { autentikasi, otorisasi } from '../../middleware/autentikasi.js';
import { validasi } from '../../middleware/validasi.js';
import { skemaMenu, skemaItemMenu } from '../../validators/index.js';

const editor = otorisasi('admin', 'editor');

export const routerPublik = Router();
routerPublik.get('/:lokasi', controller.publik);

export const routerAdmin = Router();
routerAdmin.use(autentikasi);
routerAdmin.get('/', controller.daftar);
routerAdmin.post('/', editor, validasi(skemaMenu), controller.buat);
routerAdmin.post('/:id/item', editor, validasi(skemaItemMenu), controller.tambahItem);
routerAdmin.put('/:id/item/:idItem', editor, validasi(skemaItemMenu.partial()), controller.perbaruiItem);
routerAdmin.delete('/:id/item/:idItem', editor, controller.hapusItem);
