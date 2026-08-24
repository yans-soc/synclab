import { Router } from 'express';
import * as controller from './controller.js';
import { autentikasi, otorisasi } from '../../middleware/autentikasi.js';

const router = Router();

router.use(autentikasi);
router.get('/', controller.daftar);
router.get('/:id', controller.detail);
router.post('/unggah', otorisasi('admin', 'editor', 'penulis'), controller.unggahBerkas, controller.unggah);
router.delete('/:id', otorisasi('admin', 'editor'), controller.hapus);

export default router;
