import { Router } from 'express';
import authRouter from '../modules/auth/routes.js';
import { routerPublic as articlesPublic, routerAdmin as articlesAdmin } from '../modules/articles/routes.js';
import { routerPublic as categoriesPublic, routerAdmin as categoriesAdmin } from '../modules/categories/routes.js';
import { routerPublic as homepagePublic, routerAdmin as homepageAdmin } from '../modules/homepage/routes.js';
import { routerPublic as menuPublic, routerAdmin as menuAdmin } from '../modules/menus/routes.js';
import { routerPublic as settingsPublic, routerAdmin as settingsAdmin } from '../modules/settings/routes.js';
import { routerPublic as pagesPublic, routerAdmin as pagesAdmin } from '../modules/pages/routes.js';
import mediaAdmin from '../modules/media/routes.js';
import visitRoutes from '../modules/visits/routes.js';
import {
  routerPublic as threadsPublic,
  routerAdmin as threadsAdmin,
} from '../modules/threads/routes.js';
import { publicCache, invalidateCache, adminNoCache } from '../middleware/cache.js';

const router = Router();

// Public API (cached in-memory, invalidated automatically on admin mutations)
router.use('/homepage', publicCache, homepagePublic);
router.use('/articles', publicCache, articlesPublic);
router.use('/categories', publicCache, categoriesPublic);
router.use('/menus', publicCache, menuPublic);
router.use('/settings', publicCache, settingsPublic);
router.use('/pages', publicCache, pagesPublic);
router.use('/threads', publicCache, invalidateCache, threadsPublic);

// Validated view claims (never cached; these are measured mutations)
router.use('/visits', visitRoutes);

// Admin API (every mutation clears the public cache; never publicly cacheable)
router.use('/auth', adminNoCache, authRouter);
router.use('/admin', adminNoCache, invalidateCache);
router.use('/admin/articles', articlesAdmin);
router.use('/admin/categories', categoriesAdmin);
router.use('/admin/homepage', homepageAdmin);
router.use('/admin/menus', menuAdmin);
router.use('/admin/settings', settingsAdmin);
router.use('/admin/pages', pagesAdmin);
router.use('/admin/media', mediaAdmin);
router.use('/admin/threads', threadsAdmin);

export default router;
