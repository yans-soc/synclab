import { Router } from 'express';
import jwt from 'jsonwebtoken';
import * as controller from './controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { config } from '../../config.js';
import {
  threadSchema,
  replySchema,
  reportSchema,
  communityCategorySchema,
  moderationSchema,
  reportResolutionSchema,
} from '../../validators/index.js';

export const routerPublic = Router();
export const routerAdmin = Router();

// Attach req.user when a valid Bearer token is present; never rejects.
function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [schema, token] = header.split(' ');
  if (schema === 'Bearer' && token) {
    try {
      req.user = jwt.verify(token, config.jwtSecret);
    } catch {
      /* anonymous request */
    }
  }
  return next();
}

// PUBLIC — reading is anonymous; writing requires login.
routerPublic.get('/categories', controller.listCategories);
routerPublic.get('/trending', controller.listTrending);
routerPublic.get('/', optionalAuth, controller.listThreads);
routerPublic.get('/:slug', optionalAuth, controller.getThread);
routerPublic.get('/:slug/replies', optionalAuth, controller.listReplies);

routerPublic.post('/', authenticate, validate(threadSchema), controller.createThread);
routerPublic.post('/:slug/replies', authenticate, validate(replySchema), controller.createReply);
routerPublic.post('/reactions', authenticate, controller.toggleReaction);
routerPublic.post('/bookmarks', authenticate, controller.toggleBookmark);
routerPublic.get('/bookmarks/me', authenticate, controller.listMyBookmarks);
routerPublic.post('/reports', authenticate, validate(reportSchema), controller.createReport);

// ADMIN — moderation & category management.
routerAdmin.get('/', authenticate, authorize('admin', 'moderator'), controller.listAdminThreads);
routerAdmin.post('/:id/moderate', authenticate, authorize('admin', 'moderator'), validate(moderationSchema), controller.moderateThread);
routerAdmin.post('/replies/:id/moderate', authenticate, authorize('admin', 'moderator'), validate(moderationSchema), controller.moderateReply);
routerAdmin.get('/categories', authenticate, authorize('admin', 'moderator'), (req, res, next) => controller.listAdminCategories(req, res, next));
routerAdmin.post('/categories', authenticate, authorize('admin'), validate(communityCategorySchema), (req, res, next) => controller.createCategory(req, res, next));
routerAdmin.put('/categories/:id', authenticate, authorize('admin'), (req, res, next) => controller.updateCategory(req, res, next));
routerAdmin.get('/reports', authenticate, authorize('admin', 'moderator'), controller.listReports);
routerAdmin.post('/reports/:id', authenticate, authorize('admin', 'moderator'), validate(reportResolutionSchema), controller.resolveReport);
