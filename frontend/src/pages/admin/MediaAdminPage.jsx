import { useEffect, useRef, useState } from 'react';
import { api } from '../../services/api.js';
import { mediaUrl } from '../../utils/media.js';

export default function MediaAdminPage() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInput = useRef(null);

  async function load() {
    const r = await api.get('/admin/media');
    setMedia(r.data || []);
  }

  useEffect(() => {
    load().catch(() => {});
  }, []);

  async function upload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      await api.upload('/admin/media/upload', fd);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this media? The physical file will also be deleted.')) return;
    await api.del(`/admin/media/${id}`);
    await load();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-headline text-2xl font-extrabold text-slate-900 dark:text-white">
          Media Library
        </h1>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700">
          <span className="material-symbols-outlined text-base">upload</span>
          {loading ? 'Uploading...' : 'Upload File'}
          <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={upload} />
        </label>
      </div>
      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950">{error}</p>}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {media.map((m) => (
          <div key={m.id} className="group relative overflow-hidden rounded-2xl border border-surface-container-high bg-surface-container-lowest dark:border-slate-800 dark:bg-slate-950">
            <div className="aspect-square bg-surface-container dark:bg-slate-800">
              {m.mime_type.startsWith('image/') ? (
                <img src={mediaUrl(m.url, 'thumbnail')} alt={m.file_name} className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-slate-400">description</span>
                </div>
              )}
            </div>
            <div className="p-2">
              <p className="truncate text-xs text-slate-500">{m.file_name}</p>
            </div>
            <div className="absolute inset-x-0 top-0 flex justify-end gap-1 bg-gradient-to-b from-black/50 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
              <button
                onClick={() => navigator.clipboard.writeText(m.url)}
                className="rounded-lg bg-white/90 p-1.5 text-slate-700"
                title="Copy URL"
              >
                <span className="material-symbols-outlined text-base">link</span>
              </button>
              <button
                onClick={() => remove(m.id)}
                className="rounded-lg bg-white/90 p-1.5 text-red-600"
                title="Delete"
              >
                <span className="material-symbols-outlined text-base">delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      {media.length === 0 && (
        <p className="py-16 text-center text-slate-400">
          No media yet. Upload your first image.
        </p>
      )}
    </div>
  );
}
