import { Router } from 'express';
import * as controller from './controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { articleCreateSchema, articleUpdateSchema } from '../../validators/index.js';

export const routerPublic = Router();
routerPublic.get('/', controller.listPublic);
routerPublic.get('/trending', controller.trending);
routerPublic.get('/:slug', controller.getPublic);

export const routerAdmin = Router();
routerAdmin.use(authenticate);
routerAdmin.get('/', controller.listAdmin);
routerAdmin.get('/:id', controller.getAdminById);
routerAdmin.post('/', authorize('admin', 'editor', 'author'), validate(articleCreateSchema), controller.create);
routerAdmin.put('/:id', authorize('admin', 'editor', 'author'), validate(articleUpdateSchema), controller.update);
routerAdmin.delete('/:id', authorize('admin', 'editor'), controller.remove);
