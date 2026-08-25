import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';

const THREAD_ACTIONS = [
  ['pin', 'Pin'],
  ['unpin', 'Unpin'],
  ['lock', 'Lock'],
  ['unlock', 'Unlock'],
  ['hide', 'Hide'],
  ['restore', 'Restore'],
  ['approve', 'Approve'],
  ['delete', 'Delete'],
];

const STATUSES = ['', 'published', 'pending', 'hidden', 'locked', 'deleted'];

// Community moderation: thread/category management plus report handling.
export default function ThreadsAdminPage() {
  const [tab, setTab] = useState('threads');
  const [threads, setThreads] = useState([]);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [reports, setReports] = useState([]);
  const [reportTotal, setReportTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState('');
  const [message, setMessage] = useState('');

  function loadThreads() {
    const qs = `?page=${page}&limit=20${status ? `&status=${status}` : ''}`;
    api
      .get(`/admin/threads${qs}`)
      .then((r) => {
        setThreads(r.data || []);
        setTotal(r.meta?.total || 0);
      })
      .catch(() => {});
  }

  function loadReports() {
    api
      .get('/admin/threads/reports?status=open')
      .then((r) => {
        setReports(r.data || []);
        setReportTotal(r.meta?.total || 0);
      })
      .catch(() => {});
  }

  function loadCategories() {
    api
      .get('/admin/threads/categories')
      .then((r) => setCategories(r.data || []))
      .catch(() => {});
  }

  useEffect(() => {
    if (tab === 'threads') loadThreads();
    if (tab === 'reports') loadReports();
    if (tab === 'categories') loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, page, status]);

  function act(kind, id, action) {
    api
      .post(`/admin/threads/${id}/${kind === 'reply' ? 'replies/' + id : ''}`, { action })
      .catch(() => {})
      .finally(() => {
        setMessage(`Action "${action}" applied.`);
        if (tab === 'threads') loadThreads();
        else if (tab === 'reports') loadReports();
      });
  }

  function moderate(id, action) {
    api
      .post(`/admin/threads/${id}/moderate`, { action })
      .then(() => setMessage(`Thread ${action}d.`))
      .catch((e) => setMessage(e.message))
      .finally(loadThreads);
  }

  function resolveReport(id, action) {
    api
      .post(`/admin/threads/reports/${id}`, { action })
      .then(() => setMessage(`Report ${action}d.`))
      .catch((e) => setMessage(e.message))
      .finally(loadReports);
  }

  function toggleCategory(id, enabled) {
    api
      .put(`/admin/threads/categories/${id}`, { enabled })
      .catch(() => {})
      .finally(loadCategories);
  }

  function createCategory(e) {
    e.preventDefault();
    if (!newCat.trim()) return;
    api
      .post('/admin/threads/categories', { name: newCat.trim() })
      .then(() => setNewCat(''))
      .catch((err) => setMessage(err.message))
      .finally(loadCategories);
  }

  return (
    <div>
      <h1 className="font-headline text-2xl font-extrabold text-slate-900 dark:text-white">
        Community Moderation
      </h1>
      {message && (
        <p className="mt-2 rounded-lg bg-primary/10 px-3 py-1.5 text-sm text-primary">{message}</p>
      )}
      <div className="mt-4 flex gap-2">
        {['threads', 'reports', 'categories'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${
              tab === t
                ? 'bg-primary text-white'
                : 'bg-surface-container-high/50 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {t === 'reports' ? `Reports (${reportTotal})` : t}
          </button>
        ))}
      </div>

      {tab === 'threads' && (
        <div className="mt-4">
          <div className="mb-3 flex items-center gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-surface-container-high bg-surface px-3 py-1.5 text-sm dark:border-slate-700"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {s || 'All statuses'}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            {threads.map((t) => (
              <div
                key={t.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-surface-container-high bg-surface-container-lowest p-3 dark:border-slate-800"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900 dark:text-white">
                    Link:{' '}
                    <Link
                      to={`/community/thread/${t.slug}`}
                      target="_blank"
                      className="text-primary hover:underline"
                    >
                      {t.title}
                    </Link>
                  </p>
                  <p className="text-xs text-slate-500">
                    {t.category_name} · {t.author_name} · {t.status}
                    {t.is_pinned ? ' · pinned' : ''} · {t.reply_count} replies · {t.view_count} views
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {THREAD_ACTIONS.map(([a, label]) => (
                    <button
                      key={a}
                      onClick={() => moderate(t.id, a)}
                      className="rounded-lg bg-surface-container-high/60 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-primary/10 hover:text-primary dark:bg-slate-800 dark:text-slate-300"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {threads.length === 0 && <p className="text-sm text-slate-500">No threads.</p>}
          </div>
          {total > 20 && (
            <div className="mt-3 flex justify-center gap-2 text-sm">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-surface-container-high px-3 py-1 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="py-1 text-slate-500">Page {page}</span>
              <button
                disabled={page * 20 >= total}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-surface-container-high px-3 py-1 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {tab === 'reports' && (
        <div className="mt-4 space-y-2">
          {reports.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-amber-300 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30"
            >
              <p className="font-semibold text-slate-900 dark:text-white">
                Report on {r.thread_id ? 'thread' : 'reply'}:{' '}
                {r.thread_title || 'deleted content'}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{r.reason}</p>
              <p className="text-xs text-slate-500">
                by {r.reporter_name || 'anonymous'} · {new Date(r.created_at).toLocaleString()}
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => resolveReport(r.id, 'resolve')}
                  className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white"
                >
                  Resolve
                </button>
                <button
                  onClick={() => resolveReport(r.id, 'dismiss')}
                  className="rounded-lg bg-surface-container-high px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                >
                  Dismiss
                </button>
                {r.thread_slug && (
                  <Link
                    to={`/community/thread/${r.thread_slug}`}
                    target="_blank"
                    className="rounded-lg bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                  >
                    View Thread
                  </Link>
                )}
              </div>
            </div>
          ))}
          {reports.length === 0 && (
            <p className="text-sm text-slate-500">No open reports. Good!</p>
          )}
        </div>
      )}

      {tab === 'categories' && (
        <div className="mt-4 max-w-xl">
          <form onSubmit={createCategory} className="mb-4 flex gap-2">
            <input
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              placeholder="New category name…"
              className="flex-1 rounded-lg border border-surface-container-high bg-surface px-3 py-2 text-sm dark:border-slate-700"
            />
            <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
              Add
            </button>
          </form>
          <div className="space-y-2">
            {categories.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-xl border border-surface-container-high bg-surface-container-lowest p-3 dark:border-slate-800"
              >
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {c.name} <span className="text-xs text-slate-400">/{c.slug}</span>
                  </p>
                  <p className="text-xs text-slate-500">{c.thread_count} threads</p>
                </div>
                <button
                  onClick={() => toggleCategory(c.id, !c.enabled)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    c.enabled
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                      : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300'
                  }`}
                >
                  {c.enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
