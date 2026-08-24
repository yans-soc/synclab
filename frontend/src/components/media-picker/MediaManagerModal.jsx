import { useEffect, useRef, useState } from 'react';
import { api } from '../../services/api.js';
import { mediaUrl } from '../../utils/media.js';

export default function MediaManagerModal({ open, onClose, onSelect }) {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInput = useRef(null);

  async function load() {
    try {
      const r = await api.get('/admin/media');
      setMedia(r.data || []);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    if (open) {
      setError('');
      load();
    }
  }, [open]);

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[80vh] w-full max-w-3xl flex-col rounded-2xl bg-surface-container-lowest shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-surface-container-high px-5 py-4 dark:border-slate-800">
          <h2 className="font-headline text-lg font-bold text-slate-900 dark:text-white">
            Media Library
          </h2>
          <div className="flex items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-700">
              <span className="material-symbols-outlined text-base">upload</span>
              {loading ? 'Uploading...' : 'Upload'}
              <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={upload} />
            </label>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-surface-container dark:hover:bg-slate-800"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>
        {error && <p className="mx-5 mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950">{error}</p>}
        <div className="grid flex-1 grid-cols-3 gap-3 overflow-y-auto p-5 md:grid-cols-4">
          {media.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                onSelect(m);
                onClose();
              }}
              className="group overflow-hidden rounded-xl border border-surface-container-high text-left transition hover:border-primary dark:border-slate-700"
            >
              <div className="aspect-square bg-surface-container dark:bg-slate-800">
                {m.mime_type.startsWith('image/') ? (
                  <img src={mediaUrl(m.url, 'thumbnail')} alt={m.file_name} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-slate-400">description</span>
                  </div>
                )}
              </div>
              <p className="truncate px-2 py-1.5 text-xs text-slate-500 group-hover:text-primary">
                {m.file_name}
              </p>
            </button>
          ))}
          {media.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm text-slate-400">
              No media yet. Upload your first image.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
