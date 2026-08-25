import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getToken } from '../../services/api.js';
import AppLayout from '../../components/layout/AppLayout.jsx';

// New thread form. Requires authentication; rate limits are enforced server-side.
export default function ThreadCreatePage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: '', category_id: '', content: '' });
  const [state, setState] = useState({ busy: false, error: null });

  useEffect(() => {
    if (!getToken()) {
      navigate('/admin/login', { state: { from: '/community/new' }, replace: true });
      return;
    }
    document.title = 'New Thread - Community - SYNCLAB';
    api
      .get('/threads/categories')
      .then((r) => setCategories(r.data || []))
      .catch(() => {});
  }, [navigate]);

  function setField(name) {
    return (e) => setForm((f) => ({ ...f, [name]: e.target.value }));
  }

  function submit(e) {
    e.preventDefault();
    setState({ busy: true, error: null });
    api
      .post('/threads', form)
      .then((r) => navigate(`/community/thread/${r.data.slug}`))
      .catch((err) => setState({ busy: false, error: err.message || 'Failed to create thread' }));
  }

  const valid =
    form.title.trim().length >= 4 &&
    form.category_id &&
    form.content.trim().length >= 10;

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Community</p>
        <h1 className="font-headline text-2xl font-extrabold text-slate-900 dark:text-white">
          Start a New Discussion
        </h1>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Title
            </label>
            <input
              value={form.title}
              onChange={setField('title')}
              required
              minLength={4}
              maxLength={200}
              placeholder="What do you want to discuss?"
              className="w-full rounded-xl border border-surface-container bg-surface-container-lowest px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Category
            </label>
            <select
              value={form.category_id}
              onChange={setField('category_id')}
              required
              className="w-full rounded-xl border border-surface-container bg-surface-container-lowest px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="">Select a category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Content
            </label>
            <textarea
              value={form.content}
              onChange={setField('content')}
              required
              minLength={10}
              maxLength={20000}
              rows={10}
              placeholder="Share details, code, questions… (Markdown supported)"
              className="w-full rounded-xl border border-surface-container bg-surface-container-lowest px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
          {state.error && (
            <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-300">
              {state.error}
            </p>
          )}
          <button
            type="submit"
            disabled={!valid || state.busy}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
          >
            {state.busy ? 'Posting…' : 'Create Thread'}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
