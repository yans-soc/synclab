import { Router } from 'express';
import * as controller from './controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { bulkSettingsSchema } from '../../validators/index.js';

export const routerPublic = Router();
routerPublic.get('/', controller.getPublic);

export const routerAdmin = Router();
routerAdmin.use(authenticate);
routerAdmin.get('/', controller.list);
routerAdmin.put('/', authorize('admin'), validate(bulkSettingsSchema), controller.saveBulk);
