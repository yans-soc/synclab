import { Router } from 'express';
import { z } from 'zod';
import * as controller from './controller.js';
import { autentikasi, otorisasi } from '../../middleware/autentikasi.js';
import { validasi } from '../../middleware/validasi.js';
import { skemaBagianBeranda, skemaBagianPerbarui, skemaSusunUlangBagian } from '../../validators/index.js';

const editor = otorisasi('admin', 'editor');

export const routerPublik = Router();
routerPublik.get('/aktif', controller.aktif);

export const routerAdmin = Router();
routerAdmin.use(autentikasi);
routerAdmin.get('/', controller.daftar);
routerAdmin.get('/:id', controller.detail);
routerAdmin.post('/', editor, validasi(z.object({ judul: z.string().min(1).max(150) })), controller.buat);
routerAdmin.post('/:id/aktif', editor, validasi(z.object({ aktif: z.boolean() })), controller.aturAktif);
routerAdmin.post('/:id/bagian', editor, validasi(skemaBagianBeranda), controller.buatBagian);
routerAdmin.put('/:id/bagian/susun-ulang', editor, validasi(skemaSusunUlangBagian), controller.susunUlang);
routerAdmin.put('/:id/bagian/:idBagian', editor, validasi(skemaBagianPerbarui), controller.perbaruiBagian);
routerAdmin.post('/:id/bagian/:idBagian/duplikat', editor, controller.duplikatBagian);
routerAdmin.delete('/:id/bagian/:idBagian', editor, controller.hapusBagian);
