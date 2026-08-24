import { Router } from 'express';
import { z } from 'zod';
import * as controller from './controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { sectionSchema, sectionUpdateSchema, reorderSchema } from '../../validators/index.js';

const editor = authorize('admin', 'editor');

export const routerPublic = Router();
routerPublic.get('/active', controller.active);

export const routerAdmin = Router();
routerAdmin.use(authenticate);
routerAdmin.get('/', controller.list);
routerAdmin.get('/:id', controller.getById);
routerAdmin.post('/', editor, validate(z.object({ title: z.string().min(1).max(150) })), controller.create);
routerAdmin.post('/:id/active', editor, validate(z.object({ active: z.boolean() })), controller.setActive);
routerAdmin.post('/:id/sections', editor, validate(sectionSchema), controller.createSection);
routerAdmin.put('/:id/sections/reorder', editor, validate(reorderSchema), controller.reorder);
routerAdmin.put('/:id/sections/:sectionId', editor, validate(sectionUpdateSchema), controller.updateSection);
routerAdmin.post('/:id/sections/:sectionId/duplicate', editor, controller.duplicateSection);
routerAdmin.delete('/:id/sections/:sectionId', editor, controller.deleteSection);
