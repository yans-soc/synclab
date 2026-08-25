import { Router } from 'express';
import { recordValidView, resourceStats } from './service.js';
import { authenticate } from '../../middleware/auth.js';
import { success, fail } from '../../utils/response.js';

const router = Router();

// View claims & statistics are response-per-request measures; never cached.
router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// Qualified view claim from a detail page. The resource type is bound into
// the HMAC token and the record row, so a token issued for a post never
// validates for a thread. Posts use /visits/<slug>; threads /visits/thread/<slug>.
function claimHandler(resourceType) {
  return async (req, res, next) => {
    try {
      const result = await recordValidView({
        req,
        resourceType,
        resourceSlug: req.params.slug,
        token: req.body?.token,
      });
      if (result.reason === 'not_found') {
        return fail(res, 'Content not found', 404);
      }
      return success(res, result.recorded ? 'View recorded' : 'View not counted', {
        recorded: result.recorded, reason: result.reason ?? null,
        view_count: result.view_count,
      });
    } catch (err) {
      return next(err);
    }
  };
}
router.post('/:slug', claimHandler('post'));
router.post('/thread/:slug', claimHandler('thread'));

// Resource stats for the CMS dashboard (same data source as the public site).
router.get('/admin/:resourceId/stats', authenticate, async (req, res, next) => {
  try {
    const data = await resourceStats('post', req.params.resourceId);
    if (!data) return fail(res, 'Article not found', 404);
    return success(res, 'Article statistics retrieved', data);
  } catch (err) {
    return next(err);
  }
});

export default router;
