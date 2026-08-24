import { Router } from 'express';
import * as controller from './controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { categorySchema, categoryUpdateSchema } from '../../validators/index.js';

export const routerPublic = Router();
routerPublic.get('/', controller.list);

export const routerAdmin = Router();
routerAdmin.use(authenticate);
routerAdmin.post('/', authorize('admin', 'editor'), validate(categorySchema), controller.create);
routerAdmin.put('/:id', authorize('admin', 'editor'), validate(categoryUpdateSchema), controller.update);
routerAdmin.delete('/:id', authorize('admin'), controller.remove);
