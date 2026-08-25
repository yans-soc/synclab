import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { marked } from 'marked';
import { api, getToken } from '../../services/api.js';
import AppLayout from '../../components/layout/AppLayout.jsx';
import PostViewCount from '../../components/home/PostViewCount.jsx';
import { useViewTracker } from '../../hooks/useViewTracker.js';
import { formatDate } from '../../utils/format.js';

// Thread detail: content renders immediately; view tracking, reactions,
// bookmarks and the reply form initialize asynchronously and never block reading.
export default function ThreadDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [thread, setThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyTotal, setReplyTotal] = useState(0);
  const [replyPage, setReplyPage] = useState(1);
  const [status, setStatus] = useState('loading');
  const [replyDraft, setReplyDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [reportMode, setReportMode] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [notice, setNotice] = useState(null);

  const viewCount = useViewTracker(thread, 'thread');
  const authed = !!getToken();

  useEffect(() => {
    setStatus('loading');
    api
      .get(`/threads/${slug}`)
      .then((r) => {
        setThread(r.data);
        setStatus('ok');
        document.title = `${r.data.title} - Community - SYNCLAB`;
      })
      .catch(() => setStatus('error'));
    api
      .get(`/threads/${slug}/replies?page=1&limit=20`)
      .then((r) => {
        setReplies(r.data || []);
        setReplyTotal(r.meta?.total || 0);
      })
      .catch(() => {});
  }, [slug]);

  function loadReplies(page) {
    api
      .get(`/threads/${slug}/replies?page=${page}&limit=20`)
      .then((r) => {
        setReplies(r.data || []);
        setReplyTotal(r.meta?.total || 0);
        setReplyPage(page);
      })
      .catch(() => {});
  }

  async function requireAuth(fn) {
    if (!authed) {
      navigate('/admin/login', { state: { from: `/community/thread/${slug}` } });
      return;
    }
    fn();
  }

  function toggleLikeThread() {
    if (!thread) return;
    setBusy(true);
    api
      .post('/threads/reactions', { target: 'thread', target_id: thread.id })
      .then((r) =>
        setThread((t) => ({
          ...t,
          liked_by_me: r.data.liked,
          reaction_count: r.data.reaction_count,
        }))
      )
      .catch(() => {})
      .finally(() => setBusy(false));
  }

  function toggleLikeReply(replyId) {
    api
      .post('/threads/reactions', { target: 'reply', target_id: replyId })
      .then((r) =>
        setReplies((rs) =>
          rs.map((rp) =>
            rp.id === replyId
              ? { ...rp, liked_by_me: r.data.liked, reaction_count: r.data.reaction_count }
              : rp
          )
        )
      )
      .catch(() => {});
  }

  function toggleBookmark() {
    if (!thread) return;
    api
      .post('/threads/bookmarks', { thread_id: thread.id })
      .then((r) =>
        setThread((t) => ({
          ...t,
          bookmarked_by_me: r.data.bookmarked,
          bookmark_count: r.data.bookmark_count,
        }))
      )
      .catch(() => {});
  }

  function submitReply(e) {
    e.preventDefault();
    if (!replyDraft.trim()) return;
    setBusy(true);
    api
      .post(`/threads/${slug}/replies`, { content: replyDraft })
      .then(() => {
        setReplyDraft('');
        setNotice('Reply posted.');
        loadReplies(replyPage);
        setThread((t) => ({ ...t, reply_count: Number(t.reply_count) + 1 }));
      })
      .catch((err) => setNotice(err.message || 'Failed to post reply'))
      .finally(() => setBusy(false));
  }

  function submitReport() {
    if (!reportReason.trim() || !thread) return;
    api
      .post('/threads/reports', { thread_id: thread.id, reason: reportReason })
      .then(() => {
        setReportMode(false);
        setReportReason('');
        setNotice('Report submitted. Moderators will review.');
      })
      .catch((err) => setNotice(err.message || 'Failed to report'));
  }

  if (status === 'loading') {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] justify-center pt-24">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">
            progress_activity
          </span>
        </div>
      </AppLayout>
    );
  }
  if (status === 'error' || !thread) {
    return (
      <AppLayout>
        <div className="py-24 text-center text-slate-500">
          Thread not found.{' '}
          <Link to="/community" className="text-primary hover:underline">
            Back to community
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {thread.category && (
          <Link
            to={`/community/category/${thread.category.slug}`}
            className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/20"
          >
            {thread.category.name}
          </Link>
        )}
        <h1 className="font-headline text-3xl font-extrabold leading-tight text-slate-900 dark:text-white">
          {thread.is_pinned && (
            <span
              className="material-symbols-outlined mr-2 align-middle text-amber-500"
              title="Pinned"
            >
              keep
            </span>
          )}
          {thread.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-base">person</span>
            {thread.author?.full_name || 'Member'}
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-base">calendar_month</span>
            {formatDate(thread.created_at)}
          </span>
          <PostViewCount count={viewCount} />
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-base">chat_bubble</span>
            {thread.reply_count} replies
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => requireAuth(toggleLikeThread)}
            disabled={busy}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
              thread.liked_by_me
                ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300'
                : 'bg-surface-container text-slate-600 hover:bg-surface-container-high dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <span
              className="material-symbols-outlined text-base"
              style={
                thread.liked_by_me ? { fontVariationSettings: "'FILL' 1" } : undefined
              }
            >
              favorite
            </span>
            {thread.reaction_count > 0 ? thread.reaction_count : 'Like'}
          </button>
          <button
            onClick={() => requireAuth(toggleBookmark)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
              thread.bookmarked_by_me
                ? 'bg-primary/15 text-primary'
                : 'bg-surface-container text-slate-600 hover:bg-surface-container-high dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <span
              className="material-symbols-outlined text-base"
              style={
                thread.bookmarked_by_me
                  ? { fontVariationSettings: "'FILL' 1" }
                  : undefined
              }
            >
              bookmark
            </span>
            {thread.bookmarked_by_me ? 'Bookmarked' : 'Bookmark'}
          </button>
          <button
            onClick={() => requireAuth(() => setReportMode((v) => !v))}
            className="flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-surface-container-high dark:bg-slate-800 dark:text-slate-300"
          >
            <span className="material-symbols-outlined text-base">flag</span>
            Report
          </button>
        </div>

        {reportMode && (
          <div className="mt-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950/30">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
              Report this thread to moderators
            </p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              maxLength={500}
              rows={2}
              placeholder="Describe the issue (required)"
              className="mt-2 w-full rounded-lg border border-amber-300 bg-white p-2 text-sm dark:border-amber-700 dark:bg-slate-900"
            />
            <button
              onClick={submitReport}
              className="mt-2 rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-amber-700"
            >
              Submit Report
            </button>
          </div>
        )}

        {notice && (
          <div className="mt-4 rounded-xl bg-primary/10 px-4 py-2 text-sm text-primary">
            {notice}
          </div>
        )}

        <div
          className="prose mt-8 max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: marked.parse(thread.content || '') }}
        />

        <section className="mt-12">
          <h2 className="font-headline text-xl font-extrabold text-slate-900 dark:text-white">
            Replies ({replyTotal})
          </h2>
          <div className="mt-4 space-y-4">
            {replies.map((r) => (
              <div
                key={r.id}
                className={`rounded-2xl border border-surface-container-high bg-surface-container-lowest p-4 dark:border-slate-800 dark:bg-slate-900 ${
                  r.parent_reply_id ? 'ml-8' : ''
                }`}
              >
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
                    <span className="material-symbols-outlined text-sm">person</span>
                    {r.author?.full_name || 'Member'}
                  </span>
                  <span>{formatDate(r.created_at)}</span>
                  <button
                    onClick={() => requireAuth(() => toggleLikeReply(r.id))}
                    className={`ml-auto flex items-center gap-1 font-semibold ${
                      r.liked_by_me
                        ? 'text-red-500'
                        : 'text-slate-500 hover:text-red-500'
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-base"
                      style={
                        r.liked_by_me
                          ? { fontVariationSettings: "'FILL' 1" }
                          : undefined
                      }
                    >
                      favorite
                    </span>
                    {r.reaction_count > 0 && r.reaction_count}
                  </button>
                </div>
                <div
                  className="prose mt-2 max-w-none text-sm dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: marked.parse(r.content || '') }}
                />
              </div>
            ))}
            {replies.length === 0 && (
              <p className="text-sm text-slate-500">No replies yet.</p>
            )}
          </div>

          {replyTotal > 20 && (
            <div className="mt-4 flex items-center gap-3 text-sm">
              <button
                disabled={replyPage <= 1}
                onClick={() => loadReplies(replyPage - 1)}
                className="rounded-lg border border-surface-container px-3 py-1 disabled:opacity-40 dark:border-slate-700"
              >
                Previous
              </button>
              <span className="text-slate-500">Page {replyPage}</span>
              <button
                disabled={replyPage * 20 >= replyTotal}
                onClick={() => loadReplies(replyPage + 1)}
                className="rounded-lg border border-surface-container px-3 py-1 disabled:opacity-40 dark:border-slate-700"
              >
                Next
              </button>
            </div>
          )}

          {authed ? (
            <form onSubmit={submitReply} className="mt-6">
              <textarea
                value={replyDraft}
                onChange={(e) => setReplyDraft(e.target.value)}
                rows={4}
                maxLength={10000}
                placeholder="Write a reply... (min 2 chars, Markdown supported)"
                className="w-full rounded-2xl border border-surface-container bg-surface-container-lowest p-4 text-sm dark:border-slate-700 dark:bg-slate-900"
                required
                minLength={2}
              />
              <button
                type="submit"
                disabled={busy || replyDraft.trim().length < 2}
                className="mt-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
              >
                Post Reply
              </button>
            </form>
          ) : (
            <p className="mt-6 text-sm text-slate-500">
              <Link to="/admin/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>{' '}
              to reply, react, bookmark, or report.
            </p>
          )}
        </section>
      </article>
    </AppLayout>
  );
}
