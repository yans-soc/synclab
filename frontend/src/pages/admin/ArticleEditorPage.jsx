import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api.js';
import SeoPanel from '../../components/seo-panel/SeoPanel.jsx';
import SlugEditor from '../../components/slug-editor/SlugEditor.jsx';
import MediaManagerModal from '../../components/media-picker/MediaManagerModal.jsx';
import ArticleStatsPanel from '../../components/stats/ArticleStatsPanel.jsx';

const EMPTY = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  status: 'draft',
  featured_image_id: null,
  category_ids: [],
  seo: {},
};

export default function ArticleEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [categories, setCategories] = useState([]);
  const [imageUrl, setImageUrl] = useState('');
  const [mediaModal, setMediaModal] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data || [])).catch(() => {});
    if (id) {
      api
        .get(`/admin/articles/${id}`)
        .then((r) => {
          const a = r.data;
          setForm({
            title: a.title,
            slug: a.slug,
            excerpt: a.excerpt || '',
            content: a.content || '',
            status: a.status,
            featured_image_id: a.featured_image_id,
            category_ids: a.category_ids || [],
            seo: a.seo || {},
          });
          setImageUrl(a.featured_image || '');
        })
        .catch((err) => setError(err.message));
    }
  }, [id]);

  function toggleCategory(categoryId) {
    setForm((f) => ({
      ...f,
      category_ids: f.category_ids.includes(categoryId)
        ? f.category_ids.filter((k) => k !== categoryId)
        : [...f.category_ids, categoryId],
    }));
  }

  async function save(newStatus) {
    setError('');
    setSaving(true);
    const payload = { ...form, status: newStatus || form.status };
    if (!payload.seo || Object.values(payload.seo).every((v) => !v)) {
      delete payload.seo;
    }
    try {
      if (id) {
        await api.put(`/admin/articles/${id}`, payload);
      } else {
        await api.post('/admin/articles', payload);
      }
      navigate('/admin/articles');
    } catch (err) {
      setError(
        err.data
          ? `${err.message}: ${err.data.map((d) => d.path || d.message).join(', ')}`
          : err.message
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-headline text-2xl font-extrabold text-slate-900 dark:text-white">
          {id ? 'Edit Article' : 'New Article'}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => save('draft')}
            disabled={saving}
            className="rounded-lg border border-surface-container-high px-4 py-2 text-sm font-semibold text-slate-600 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300"
          >
            Save Draft
          </button>
          <button
            onClick={() => save('published')}
            disabled={saving}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Publish'}
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950">
          {error}
        </p>
      )}

      {id && <div className="mb-6"><ArticleStatsPanel articleId={id} /></div>}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="rounded-2xl border border-surface-container-high bg-surface-container-lowest p-5 dark:border-slate-800 dark:bg-slate-950">
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Article title..."
              className="w-full bg-transparent font-headline text-2xl font-extrabold text-slate-900 outline-none placeholder:text-slate-300 dark:text-white"
            />
            <div className="mt-3">
              <SlugEditor
                value={form.slug}
                fromTitle={form.title}
                onChange={(slug) => setForm((f) => ({ ...f, slug }))}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-surface-container-high bg-surface-container-lowest p-5 dark:border-slate-800 dark:bg-slate-950">
            <label className="mb-1 block text-xs font-medium text-slate-500">Excerpt</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              rows={2}
              className="w-full rounded-lg border border-surface-container-high bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700"
            />
          </div>

          <div className="rounded-2xl border border-surface-container-high bg-surface-container-lowest p-5 dark:border-slate-800 dark:bg-slate-950">
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Content (Markdown)
            </label>
            <textarea
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              rows={16}
              className="w-full rounded-lg border border-surface-container-high bg-transparent px-3 py-2 font-mono text-sm outline-none focus:border-primary dark:border-slate-700"
              placeholder="## Section Title&#10;&#10;Write article content here..."
            />
          </div>

          <div className="rounded-2xl border border-surface-container-high bg-surface-container-lowest p-5 dark:border-slate-800 dark:bg-slate-950">
            <SeoPanel
              value={form.seo}
              onChange={(seo) => setForm((f) => ({ ...f, seo }))}
            />
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-surface-container-high bg-surface-container-lowest p-5 dark:border-slate-800 dark:bg-slate-950">
            <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">Status</h3>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="w-full rounded-lg border border-surface-container-high bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="rounded-2xl border border-surface-container-high bg-surface-container-lowest p-5 dark:border-slate-800 dark:bg-slate-950">
            <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">Featured Image</h3>
            {imageUrl ? (
              <div className="mb-3 overflow-hidden rounded-lg">
                <img src={imageUrl} alt="Featured image" className="w-full object-cover" />
              </div>
            ) : (
              <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-surface-container dark:bg-slate-800">
                <span className="material-symbols-outlined text-3xl text-slate-400">image</span>
              </div>
            )}
            <button
              onClick={() => setMediaModal(true)}
              className="w-full rounded-lg border border-surface-container-high py-2 text-sm font-semibold text-slate-600 hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-300"
            >
              Choose from Media Library
            </button>
          </div>

          <div className="rounded-2xl border border-surface-container-high bg-surface-container-lowest p-5 dark:border-slate-800 dark:bg-slate-950">
            <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">Categories</h3>
            <div className="space-y-2">
              {categories.map((k) => (
                <label key={k.id} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={form.category_ids.includes(k.id)}
                    onChange={() => toggleCategory(k.id)}
                    className="h-4 w-4 accent-primary"
                  />
                  {k.name}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <MediaManagerModal
        open={mediaModal}
        onClose={() => setMediaModal(false)}
        onSelect={(m) => {
          setForm((f) => ({ ...f, featured_image_id: m.id }));
          setImageUrl(m.url);
        }}
      />
    </div>
  );
}
