import { success, fail } from '../../utils/response.js';
import * as service from './service.js';

// Thin HTTP layer; all logic + validation errors surface through status.
function onError(res, result) {
  return fail(res, result.error, result.status || 422);
}

export async function listCategories(req, res, next) {
  try {
    const data = await service.listCategories();
    return success(res, 'Community categories loaded', data);
  } catch (err) {
    return next(err);
  }
}

export async function listThreads(req, res, next) {
  try {
    const { rows, total } = await service.listThreads({
      categorySlug: req.query.category,
      sort: req.query.sort,
      page: Number(req.query.page) || 1,
      limit: Math.min(Number(req.query.limit) || 15, 50),
      userId: req.user?.id || null,
    });
    return success(res, 'Thread list loaded', rows, 200, { total });
  } catch (err) {
    return next(err);
  }
}

export async function listTrending(req, res, next) {
  try {
    const data = await service.listTrendingThreads({
      limit: Math.min(Number(req.query.limit) || 6, 20),
      period: req.query.period,
    });
    return success(res, 'Trending discussions loaded', data);
  } catch (err) {
    return next(err);
  }
}

export async function getThread(req, res, next) {
  try {
    const data = await service.getThreadBySlug({
      slug: req.params.slug,
      userId: req.user?.id || null,
      userAgent: String(req.headers['user-agent'] || ''),
    });
    if (!data) return fail(res, 'Thread not found', 404);
    return success(res, 'Thread detail loaded', data);
  } catch (err) {
    return next(err);
  }
}

export async function listReplies(req, res, next) {
  try {
    const threadRows = await service.queryThreadId(req.params.slug);
    if (!threadRows) return fail(res, 'Thread not found', 404);
    const { rows, total } = await service.listReplies({
      threadId: threadRows,
      page: Number(req.query.page) || 1,
      limit: Math.min(Number(req.query.limit) || 20, 100),
      userId: req.user?.id || null,
    });
    return success(res, 'Replies loaded', rows, 200, { total });
  } catch (err) {
    return next(err);
  }
}

export async function createThread(req, res, next) {
  try {
    if (!(await service.checkRateLimit('thread', req.user.id))) {
      return fail(res, 'You are creating threads too quickly. Please try later.', 429);
    }
    const result = await service.createThread({
      userId: req.user.id,
      categoryId: req.body.category_id,
      title: req.body.title,
      content: req.body.content,
    });
    if (result.error) return onError(res, result);
    return success(res, 'Thread created', result.thread, 201);
  } catch (err) {
    return next(err);
  }
}

export async function createReply(req, res, next) {
  try {
    if (!(await service.checkRateLimit('reply', req.user.id))) {
      return fail(res, 'You are replying too quickly. Please try later.', 429);
    }
    const result = await service.createReply({
      userId: req.user.id,
      threadSlug: req.params.slug,
      content: req.body.content,
      parentReplyId: req.body.parent_reply_id || null,
    });
    if (result.error) return onError(res, result);
    return success(res, 'Reply posted', result.reply, 201);
  } catch (err) {
    return next(err);
  }
}

export async function toggleReaction(req, res, next) {
  try {
    if (!(await service.checkRateLimit('reaction', req.user.id))) {
      return fail(res, 'Too many reactions. Please slow down.', 429);
    }
    const result = await service.toggleReaction({
      userId: req.user.id,
      targetType: req.body.target,
      targetId: req.body.target_id,
    });
    if (result.error) return onError(res, result);
    return success(res, result.liked ? 'Liked' : 'Like removed', result);
  } catch (err) {
    return next(err);
  }
}

export async function toggleBookmark(req, res, next) {
  try {
    const result = await service.toggleBookmark({
      userId: req.user.id,
      threadId: req.body.thread_id,
    });
    if (result.error) return onError(res, result);
    return success(
      res,
      result.bookmarked ? 'Bookmarked' : 'Bookmark removed',
      result
    );
  } catch (err) {
    return next(err);
  }
}

export async function listMyBookmarks(req, res, next) {
  try {
    const data = await service.listMyBookmarks({
      userId: req.user.id,
      page: Number(req.query.page) || 1,
      limit: Math.min(Number(req.query.limit) || 15, 50),
    });
    return success(res, 'Bookmarks loaded', data);
  } catch (err) {
    return next(err);
  }
}

export async function createReport(req, res, next) {
  try {
    if (!(await service.checkRateLimit('report', req.user.id))) {
      return fail(res, 'Too many reports. Please try later.', 429);
    }
    const result = await service.createReport({
      reporterId: req.user.id,
      threadId: req.body.thread_id,
      replyId: req.body.reply_id,
      reason: req.body.reason,
    });
    return success(res, 'Report submitted. Moderators will review it.', result, 201);
  } catch (err) {
    return next(err);
  }
}

// ---------------------------------------------------------------------------
// Admin / moderation
// ---------------------------------------------------------------------------

export async function listAdminThreads(req, res, next) {
  try {
    const { rows, total } = await service.listAdminThreads({
      status: req.query.status,
      page: Number(req.query.page) || 1,
      limit: Math.min(Number(req.query.limit) || 20, 100),
    });
    return success(res, 'Threads loaded', rows, 200, { total });
  } catch (err) {
    return next(err);
  }
}

export async function moderateThread(req, res, next) {
  try {
    const result = await service.moderateThread({
      threadId: req.params.id,
      action: req.body.action,
    });
    if (result.error) return onError(res, result);
    return success(res, 'Thread updated', result.thread);
  } catch (err) {
    return next(err);
  }
}

export async function moderateReply(req, res, next) {
  try {
    const result = await service.moderateReply({
      replyId: req.params.id,
      action: req.body.action,
    });
    if (result.error) return onError(res, result);
    return success(res, 'Reply updated', result.reply);
  } catch (err) {
    return next(err);
  }
}

export async function listReports(req, res, next) {
  try {
    const { rows, total } = await service.listReports({
      status: req.query.status || 'open',
      page: Number(req.query.page) || 1,
      limit: Math.min(Number(req.query.limit) || 20, 100),
    });
    return success(res, 'Reports loaded', rows, 200, { total });
  } catch (err) {
    return next(err);
  }
}

export async function resolveReport(req, res, next) {
  try {
    const result = await service.resolveReport({
      reportId: req.params.id,
      action: req.body.action,
      moderatorId: req.user.id,
    });
    if (result.error) return onError(res, result);
    return success(res, 'Report updated', result.report);
  } catch (err) {
    return next(err);
  }
}

export async function listAdminCategories(req, res, next) {
  try {
    const data = await service.listAdminCategories();
    return success(res, 'Community categories loaded', data);
  } catch (err) {
    return next(err);
  }
}

export async function createCategory(req, res, next) {
  try {
    const data = await service.createCategory({
      name: req.body.name,
      description: req.body.description,
      icon: req.body.icon,
      position: req.body.position,
      enabled: req.body.enabled,
    });
    return success(res, 'Category created', data, 201);
  } catch (err) {
    return next(err);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const result = await service.updateCategory(req.params.id, {
      name: req.body.name,
      description: req.body.description,
      icon: req.body.icon,
      position: req.body.position,
      enabled: req.body.enabled,
    });
    if (result.error) return onError(res, result);
    return success(res, 'Category updated', result.category);
  } catch (err) {
    return next(err);
  }
}
