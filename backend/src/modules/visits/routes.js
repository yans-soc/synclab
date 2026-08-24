import { Router } from 'express';
import { recordValidView, articleStats } from './service.js';
import { authenticate } from '../../middleware/auth.js';
import { success, fail } from '../../utils/response.js';

const router = Router();

// View claims & statistics must not be cached at any layer.
router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// Validated view claim from the detail page (called by the frontend after
// a visitor has actively read for >= 10 seconds). Always 200; the recorded field marks
// whether the view passed all validations and the counter was incremented.
router.post('/:slug', async (req, res, next) => {
  try {
    const result = await recordValidView({
      req,
      articleSlug: req.params.slug,
      token: req.body?.token,
    });
    if (result.reason === 'not_found') return fail(res, 'Article not found', 404);
    return success(res, result.recorded ? 'View recorded' : 'View not counted', {
      recorded: result.recorded,
      view_count: result.view_count,
    });
  } catch (err) {
    return next(err);
  }
});

// Per-article stats for the CMS dashboard (same data source as the public site)
router.get('/admin/:articleId/stats', authenticate, async (req, res, next) => {
  try {
    const data = await articleStats(req.params.articleId);
    if (!data) return fail(res, 'Article not found', 404);
    return success(res, 'Article statistics retrieved', data);
  } catch (err) {
    return next(err);
  }
});

export default router;
