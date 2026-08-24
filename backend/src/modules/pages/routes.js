import { Router } from 'express';
import * as controller from './controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { pageSchema, pageUpdateSchema } from '../../validators/index.js';

export const routerPublic = Router();
routerPublic.get('/:slug', controller.getPublic);

export const routerAdmin = Router();
routerAdmin.use(authenticate);
routerAdmin.get('/', controller.list);
routerAdmin.post('/', authorize('admin', 'editor', 'author'), validate(pageSchema), controller.create);
routerAdmin.put('/:id', authorize('admin', 'editor', 'author'), validate(pageUpdateSchema), controller.update);
routerAdmin.delete('/:id', authorize('admin', 'editor'), controller.remove);
