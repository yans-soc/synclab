import { Router } from 'express';
import * as controller from './controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/upload', authorize('admin', 'editor', 'author'), controller.uploadFile, controller.upload);
router.delete('/:id', authorize('admin', 'editor'), controller.remove);

export default router;
