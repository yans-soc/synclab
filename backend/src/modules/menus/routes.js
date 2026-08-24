import { Router } from 'express';
import * as controller from './controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { menuSchema, menuItemSchema } from '../../validators/index.js';

const editor = authorize('admin', 'editor');

export const routerPublic = Router();
routerPublic.get('/:location', controller.getPublic);

export const routerAdmin = Router();
routerAdmin.use(authenticate);
routerAdmin.get('/', controller.list);
routerAdmin.post('/', editor, validate(menuSchema), controller.create);
routerAdmin.post('/:id/item', editor, validate(menuItemSchema), controller.addItem);
routerAdmin.put('/:id/item/:itemId', editor, validate(menuItemSchema.partial()), controller.updateItem);
routerAdmin.delete('/:id/item/:itemId', editor, controller.deleteItem);
