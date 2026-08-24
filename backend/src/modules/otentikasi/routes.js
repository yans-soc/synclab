import { Router } from 'express';
import * as controller from './controller.js';
import { autentikasi } from '../../middleware/autentikasi.js';
import { validasi } from '../../middleware/validasi.js';
import { skemaMasuk } from '../../validators/index.js';

const router = Router();

router.post('/masuk', validasi(skemaMasuk), controller.masuk);
router.post('/keluar', autentikasi, controller.keluar);
router.get('/profil', autentikasi, controller.profil);

export default router;
