import { query, withTransaction } from '../../database/pool.js';
import { makeSlug } from '../../utils/slug.js';
import { createVisitToken, looksLikeBot } from '../visits/service.js';

// ============================================================================
// COMMUNITY — threads, categories, replies, reactions, bookmarks, reports.
// All counters (reply/reaction/bookmark/view) are server-authoritative and
// only changed atomically inside this module.
// ============================================================================

const DEFAULT_STATUS = ['published'];

function toPublicThread(t) {
  return {
    id: t.id,
    title: t.title,
    slug: t.slug,
    excerpt: t.content?.slice(0, 220) || '',
    view_count: Number(t.view_count),
    reply_count: Number(t.reply_count),
    reaction_count: Number(t.reaction_count),
    bookmark_count: Number(t.bookmark_count),
    is_pinned: t.is_pinned,
    status: t.status,
    last_reply_at: t.last_reply_at,
    created_at: t.created_at,
    author: t.author_name ? { full_name: t.author_name } : null,
    category: t.category_id
      ? { id: t.category_id, name: t.category_name, slug: t.category_slug }
      : null,
    liked_by_me: !!t.liked_by_me,
    bookmarked_by_me: !!t.bookmarked_by_me,
  };
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function listCategories() {
  const { rows } = await query(
    `SELECT id, name, slug, description, icon, thread_count, position
     FROM community_categories WHERE enabled = TRUE ORDER BY position, name`
  );
  return rows;
}

export async function listAdminCategories() {
  const { rows } = await query(
    `SELECT id, name, slug, description, icon, thread_count, position, enabled, created_at
     FROM community_categories ORDER BY position, name`
  );
  return rows;
}

export async function createCategory({ name, description, icon, position, enabled }) {
  const slug = makeSlug(name);
  const { rows } = await query(
    `INSERT INTO community_categories (name, slug, description, icon, position, enabled)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name, slug, enabled`,
    [name, slug, description || null, icon || null, position ?? 0, enabled ?? true]
  );
  return rows[0];
}

export async function updateCategory(id, { name, description, icon, position, enabled }) {
  const updates = [];
  const params = [id];
  if (name !== undefined) {
    params.push(name, makeSlug(name));
    updates.push(
      `name = $${params.length - 1}`,
      `slug = $${params.length}`
    );
  }
  if (description !== undefined) {
    params.push(description);
    updates.push(`description = $${params.length}`);
  }
  if (icon !== undefined) {
    params.push(icon);
    updates.push(`icon = $${params.length}`);
  }
  if (position !== undefined) {
    params.push(position);
    updates.push(`position = $${params.length}`);
  }
  if (enabled !== undefined) {
    params.push(enabled);
    updates.push(`enabled = $${params.length}`);
  }
  if (!updates.length) return { error: 'Nothing to update', status: 422 };
  updates.push('updated_at = now()');
  const { rows } = await query(
    `UPDATE community_categories SET ${updates.join(', ')} WHERE id = $1
     RETURNING id, name, slug, enabled`,
    params
  );
  if (!rows[0]) return { error: 'Category not found', status: 404 };
  return { category: rows[0] };
}

// ---------------------------------------------------------------------------
// Thread listing
// ---------------------------------------------------------------------------

export async function listThreads({
  categorySlug,
  sort = 'latest',
  page = 1,
  limit = 15,
  userId = null,
} = {}) {
  const offset = (page - 1) * limit;
  const params = [];
  const where = ["t.status = ANY($1::text[])"];

  // $1: statuses
  params.push(DEFAULT_STATUS);

  if (categorySlug) {
    params.push(categorySlug);
    where.push(`c.slug = $${params.length}`);
  }

  const orderBy =
    sort === 'trending'
      ? 't.is_pinned DESC, t.view_count DESC, t.last_reply_at DESC NULLS LAST'
      : sort === 'popular'
        ? 't.is_pinned DESC, t.view_count DESC'
        : 't.is_pinned DESC, t.last_reply_at DESC NULLS LAST, t.created_at DESC';

  // Optional user-scoped flags — only when a caller is authenticated.
  let userJoin = '';
  let userCols = 'FALSE AS liked_by_me, FALSE AS bookmarked_by_me';
  if (userId) {
    params.push(userId);
    const i = params.length;
    userCols = `EXISTS(SELECT 1 FROM thread_reactions r
      WHERE r.target_type = 'thread' AND r.target_id = t.id AND r.user_id = $${i}) AS liked_by_me,
      EXISTS(SELECT 1 FROM thread_bookmarks b
      WHERE b.thread_id = t.id AND b.user_id = $${i}) AS bookmarked_by_me`;
  }

  const { rows } = await query(
    `SELECT t.id, t.title, t.slug, t.content, t.view_count, t.reply_count,
            t.reaction_count, t.bookmark_count, t.is_pinned, t.status,
            t.last_reply_at, t.created_at,
            u.full_name AS author_name,
            c.id AS category_id, c.name AS category_name, c.slug AS category_slug,
            ${userCols}
     FROM threads t
     JOIN users u ON u.id = t.user_id
     JOIN community_categories c ON c.id = t.category_id
     WHERE ${where.join(' AND ')}
     ORDER BY ${orderBy}
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  const { rows: countRows } = await query(
    `SELECT COUNT(*)::int AS total FROM threads t
     JOIN community_categories c ON c.id = t.category_id
     WHERE ${where.join(' AND ')}`,
    params.slice(0, userId ? params.length - 1 : params.length)
  );
  return { rows: rows.map(toPublicThread), total: countRows[0].total };
}

// Trending considers recent qualified views + replies + reactions (7-day window).
export async function listTrendingThreads({ limit = 6, period = '7d' } = {}) {
  const window = period === '1d' ? '1 day' : period === '30d' ? '30 days' : '7 days';
  const { rows } = await query(
    `SELECT t.id, t.title, t.slug, t.content, t.view_count, t.reply_count,
            t.reaction_count, t.bookmark_count, t.is_pinned, t.status,
            t.last_reply_at, t.created_at,
            u.full_name AS author_name,
            c.id AS category_id, c.name AS category_name, c.slug AS category_slug,
            COALESCE(v.recent_views, 0) AS recent_views
     FROM threads t
     JOIN users u ON u.id = t.user_id
     JOIN community_categories c ON c.id = t.category_id
     LEFT JOIN LATERAL (
       SELECT COUNT(*) AS recent_views FROM view_records vr
       WHERE vr.resource_type = 'thread' AND vr.resource_id = t.id
         AND vr.valid = TRUE AND vr.visited_at >= now() - $1::interval
     ) v ON TRUE
     WHERE t.status = 'published'
     ORDER BY (COALESCE(v.recent_views, 0) * 3 + t.reply_count * 5 + t.reaction_count * 2) DESC,
              t.last_reply_at DESC NULLS LAST
     LIMIT $2`,
    [window, limit]
  );
  return rows.map(toPublicThread);
}

// ---------------------------------------------------------------------------
// Thread detail (issues a qualified view token — never increments views here)
// ---------------------------------------------------------------------------

export async function getThreadBySlug({ slug, userId = null, userAgent = '' }) {
  const { rows } = await query(
    `SELECT t.*, u.full_name AS author_name,
            c.id AS cat_id, c.name AS category_name, c.slug AS category_slug
     FROM threads t
     JOIN users u ON u.id = t.user_id
     JOIN community_categories c ON c.id = t.category_id
     WHERE t.slug = $1 AND t.status <> 'deleted'`,
    [slug]
  );
  const t = rows[0];
  if (!t) return null;
  // Non-admins only see published content; moderators see everything.
  if (t.status !== 'published' && !userId) return null;

  let liked = false;
  let bookmarked = false;
  if (userId) {
    const { rows: lk } = await query(
      `SELECT 1 FROM thread_reactions WHERE target_type = 'thread' AND target_id = $1 AND user_id = $2`,
      [t.id, userId]
    );
    liked = lk.length > 0;
    const { rows: bm } = await query(
      `SELECT 1 FROM thread_bookmarks WHERE thread_id = $1 AND user_id = $2`,
      [t.id, userId]
    );
    bookmarked = bm.length > 0;
  }

  const token = looksLikeBot(userAgent) ? null : createVisitToken('thread', t.id).token;
  return {
    ...toPublicThread({ ...t, category_id: t.cat_id, liked_by_me: liked, bookmarked_by_me: bookmarked }),
    content: t.content,
    author: { id: t.user_id, full_name: t.author_name },
    visit_token: token,
  };
}

// ---------------------------------------------------------------------------
// Replies (paginated, nested limited to one level)
// ---------------------------------------------------------------------------

// Resolve a thread slug to its id (any non-deleted status).
export async function queryThreadId(slug) {
  const { rows } = await query(
    `SELECT id FROM threads WHERE slug = $1 AND status <> 'deleted'`,
    [slug]
  );
  return rows[0]?.id || null;
}

export async function listReplies({ threadId, page = 1, limit = 20, userId = null }) {
  const offset = (page - 1) * limit;
  let userCols = 'FALSE AS liked_by_me';
  const params = [threadId];
  if (userId) {
    params.push(userId);
    userCols = `EXISTS(SELECT 1 FROM thread_reactions r
      WHERE r.target_type = 'reply' AND r.target_id = rp.id AND r.user_id = $2) AS liked_by_me`;
  }
  const { rows } = await query(
    `SELECT rp.id, rp.parent_reply_id, rp.content, rp.status, rp.reaction_count,
            rp.created_at, rp.updated_at,
            u.full_name AS author_name, u.id AS author_id,
            ${userCols}
     FROM thread_replies rp
     JOIN users u ON u.id = rp.user_id
     WHERE rp.thread_id = $1 AND rp.status = 'published'
     ORDER BY rp.created_at ASC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  const { rows: countRows } = await query(
    `SELECT COUNT(*)::int AS total FROM thread_replies
     WHERE thread_id = $1 AND status = 'published'`,
    [threadId]
  );
  return {
    rows: rows.map((r) => ({
      id: r.id,
      parent_reply_id: r.parent_reply_id,
      content: r.content,
      reaction_count: Number(r.reaction_count),
      created_at: r.created_at,
      author: { id: r.author_id, full_name: r.author_name },
      liked_by_me: !!r.liked_by_me,
    })),
    total: countRows[0].total,
  };
}

// Anti-spam: fixed window per user via DB timestamps (no external store needed).
async function rateLimitCount(userId, table, windowSeconds) {
  const col = table === 'thread_reports' ? 'reporter_id' : 'user_id';
  const { rows } = await query(
    `SELECT COUNT(*)::int AS c FROM ${table}
     WHERE ${col} = $1 AND created_at >= now() - ($2 || ' seconds')::interval`,
    [userId, windowSeconds]
  );
  return rows[0].c;
}

const LIMITS = {
  thread: { table: 'threads', max: Number(process.env.COMMUNITY_THREAD_LIMIT || 5), window: 3600 },
  reply: { table: 'thread_replies', max: Number(process.env.COMMUNITY_REPLY_LIMIT || 30), window: 600 },
  reaction: { table: 'thread_reactions', max: Number(process.env.COMMUNITY_REACTION_LIMIT || 60), window: 600 },
  report: { table: 'thread_reports', max: Number(process.env.COMMUNITY_REPORT_LIMIT || 10), window: 3600 },
};

export async function checkRateLimit(kind, userId) {
  const rule = LIMITS[kind];
  if (!rule) return true;
  return (await rateLimitCount(userId, rule.table, rule.window)) < rule.max;
}

// ---------------------------------------------------------------------------
// Creation / mutation
// ---------------------------------------------------------------------------

export async function createThread({ userId, categoryId, title, content }) {
  return withTransaction(async (client) => {
    const { rows: cat } = await client.query(
      'SELECT id FROM community_categories WHERE id = $1 AND enabled = TRUE',
      [categoryId]
    );
    if (!cat[0]) return { error: 'Category not found or disabled', status: 404 };

    const slug = `${makeSlug(title)}-${Date.now().toString(36)}`;
    const { rows } = await client.query(
      `INSERT INTO threads (user_id, category_id, title, slug, content)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, title, slug, status, created_at`,
      [userId, categoryId, title, slug, content]
    );
    await client.query(
      `UPDATE community_categories
       SET thread_count = thread_count + 1, updated_at = now()
       WHERE id = $1`,
      [categoryId]
    );
    return { thread: rows[0] };
  });
}

export async function createReply({ userId, threadSlug, content, parentReplyId }) {
  return withTransaction(async (client) => {
    const { rows: th } = await client.query(
      `SELECT id, status FROM threads WHERE slug = $1`,
      [threadSlug]
    );
    const thread = th[0];
    if (!thread || thread.status === 'deleted' || thread.status === 'hidden') {
      return { error: 'Thread not found', status: 404 };
    }
    if (thread.status === 'locked') {
      return { error: 'Thread is locked', status: 423 };
    }
    if (parentReplyId) {
      // Nested replies are limited to one level: parent must be a root reply.
      const { rows: pr } = await client.query(
        `SELECT id, parent_reply_id FROM thread_replies
         WHERE id = $1 AND thread_id = $2 AND status = 'published'`,
        [parentReplyId, thread.id]
      );
      if (!pr[0]) return { error: 'Parent reply not found', status: 404 };
      if (pr[0].parent_reply_id) {
        return { error: 'Nested replies are limited to one level', status: 422 };
      }
    }
    const { rows } = await client.query(
      `INSERT INTO thread_replies (thread_id, user_id, parent_reply_id, content)
       VALUES ($1, $2, $3, $4)
       RETURNING id, content, status, created_at`,
      [thread.id, userId, parentReplyId || null, content]
    );
    await client.query(
      `UPDATE threads
       SET reply_count = reply_count + 1, last_reply_at = now(), updated_at = now()
       WHERE id = $1`,
      [thread.id]
    );
    return { reply: rows[0], thread_id: thread.id };
  });
}

// Toggle like on a thread or reply. Returns the new state + authoritative count.
export async function toggleReaction({ userId, targetType, targetId }) {
  return withTransaction(async (client) => {
    const targetTable = targetType === 'reply' ? 'thread_replies' : 'threads';
    const { rows: tg } = await client.query(
      `SELECT id, status FROM ${targetTable} WHERE id = $1`,
      [targetId]
    );
    const target = tg[0];
    if (!target || target.status === 'deleted') return { error: 'Target not found', status: 404 };

    const { rows: existing } = await client.query(
      `SELECT id FROM thread_reactions
       WHERE target_type = $1 AND target_id = $2 AND user_id = $3`,
      [targetType, targetId, userId]
    );
    let liked;
    if (existing.length) {
      await client.query('DELETE FROM thread_reactions WHERE id = $1', [existing[0].id]);
      liked = false;
    } else {
      await client.query(
        `INSERT INTO thread_reactions (target_type, target_id, user_id)
         VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
        [targetType, targetId, userId]
      );
      liked = true;
    }
    const { rows: upd } = await client.query(
      `UPDATE ${targetTable}
       SET reaction_count = (SELECT COUNT(*) FROM thread_reactions
                             WHERE target_type = $1 AND target_id = $2),
           updated_at = now()
       WHERE id = $2 RETURNING reaction_count`,
      [targetType, targetId]
    );
    return { liked, reaction_count: Number(upd[0].reaction_count) };
  });
}

export async function toggleBookmark({ userId, threadId }) {
  return withTransaction(async (client) => {
    const { rows: existing } = await client.query(
      'SELECT id FROM thread_bookmarks WHERE thread_id = $1 AND user_id = $2',
      [threadId, userId]
    );
    let bookmarked;
    if (existing.length) {
      await client.query('DELETE FROM thread_bookmarks WHERE id = $1', [existing[0].id]);
      bookmarked = false;
    } else {
      await client.query(
        'INSERT INTO thread_bookmarks (thread_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [threadId, userId]
      );
      bookmarked = true;
    }
    const { rows: upd } = await client.query(
      `UPDATE threads
       SET bookmark_count = (SELECT COUNT(*) FROM thread_bookmarks WHERE thread_id = $1)
       WHERE id = $1 RETURNING bookmark_count`,
      [threadId]
    );
    return { bookmarked, bookmark_count: Number(upd[0].bookmark_count) };
  });
}

export async function listMyBookmarks({ userId, page = 1, limit = 15 }) {
  const offset = (page - 1) * limit;
  const { rows } = await query(
    `SELECT t.id, t.title, t.slug, t.view_count, t.reply_count, t.reaction_count,
            t.bookmark_count, t.is_pinned, t.status, t.last_reply_at, t.created_at,
            t.content, u.full_name AS author_name,
            c.id AS category_id, c.name AS category_name, c.slug AS category_slug
     FROM thread_bookmarks b
     JOIN threads t ON t.id = b.thread_id
     JOIN users u ON u.id = t.user_id
     JOIN community_categories c ON c.id = t.category_id
     WHERE b.user_id = $1 AND t.status <> 'deleted'
     ORDER BY b.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return rows.map(toPublicThread);
}

export async function createReport({ reporterId, threadId, replyId, reason }) {
  await query(
    `INSERT INTO thread_reports (reporter_id, thread_id, reply_id, reason)
     VALUES ($1, $2, $3, $4)`,
    [reporterId, threadId || null, replyId || null, reason]
  );
  return { reported: true };
}

// ---------------------------------------------------------------------------
// Moderation (admin/moderator)
// ---------------------------------------------------------------------------

export async function listAdminThreads({ status, page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  const params = [];
  let where = '1=1';
  if (status) {
    params.push(status);
    where = `t.status = $1`;
  }
  const { rows } = await query(
    `SELECT t.id, t.title, t.slug, t.status, t.is_pinned, t.view_count,
            t.reply_count, t.reaction_count, t.last_reply_at, t.created_at,
            u.full_name AS author_name, c.name AS category_name
     FROM threads t
     JOIN users u ON u.id = t.user_id
     JOIN community_categories c ON c.id = t.category_id
     WHERE ${where}
     ORDER BY t.created_at DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  const { rows: c } = await query(
    `SELECT COUNT(*)::int AS total FROM threads t WHERE ${where}`,
    params
  );
  return { rows, total: c[0].total };
}

const MODERATION_ACTIONS = {
  hide: 'hidden',
  restore: 'published',
  approve: 'published',
  delete: 'deleted',
  lock: 'locked',
  unlock: 'published',
};

export async function moderateThread({ threadId, action }) {
  return withTransaction(async (client) => {
    const updates = [];
    const params = [threadId];
    if (MODERATION_ACTIONS[action]) {
      params.push(MODERATION_ACTIONS[action]);
      updates.push(`status = $${params.length}`);
    }
    if (action === 'pin') updates.push('is_pinned = TRUE');
    if (action === 'unpin') updates.push('is_pinned = FALSE');
    if (!updates.length) return { error: 'Unknown action', status: 422 };
    updates.push('updated_at = now()');
    const { rows } = await client.query(
      `UPDATE threads SET ${updates.join(', ')} WHERE id = $1 RETURNING id, status, is_pinned`,
      params
    );
    if (!rows[0]) return { error: 'Thread not found', status: 404 };
    return { thread: rows[0] };
  });
}

export async function moderateReply({ replyId, action }) {
  const map = { hide: 'hidden', restore: 'published', delete: 'deleted' };
  if (!map[action]) return { error: 'Unknown action', status: 422 };
  return withTransaction(async (client) => {
    const { rows } = await client.query(
      `UPDATE thread_replies SET status = $2, updated_at = now()
       WHERE id = $1 RETURNING id, thread_id, status`,
      [replyId, map[action]]
    );
    if (!rows[0]) return { error: 'Reply not found', status: 404 };
    await client.query(
      `UPDATE threads
       SET reply_count = (SELECT COUNT(*) FROM thread_replies
                          WHERE thread_id = $1 AND status = 'published')
       WHERE id = $1`,
      [rows[0].thread_id]
    );
    return { reply: rows[0] };
  });
}

export async function listReports({ status = 'open', page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  const { rows } = await query(
    `SELECT r.id, r.reason, r.status, r.created_at, r.thread_id, r.reply_id,
            ru.full_name AS reporter_name,
            t.title AS thread_title, t.slug AS thread_slug
     FROM thread_reports r
     LEFT JOIN users ru ON ru.id = r.reporter_id
     LEFT JOIN threads t ON t.id = r.thread_id
     WHERE r.status = $1
     ORDER BY r.created_at DESC
     LIMIT $2 OFFSET $3`,
    [status, limit, offset]
  );
  const { rows: c } = await query(
    'SELECT COUNT(*)::int AS total FROM thread_reports WHERE status = $1',
    [status]
  );
  return { rows, total: c[0].total };
}

export async function resolveReport({ reportId, action, moderatorId }) {
  const status = action === 'resolve' ? 'resolved' : 'dismissed';
  const { rows } = await query(
    `UPDATE thread_reports
     SET status = $2, resolved_by = $3, resolved_at = now()
     WHERE id = $1 AND status = 'open'
     RETURNING id, status`,
    [reportId, status, moderatorId]
  );
  if (!rows[0]) return { error: 'Report not found or already handled', status: 404 };
  return { report: rows[0] };
}
