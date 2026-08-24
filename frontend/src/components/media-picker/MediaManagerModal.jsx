import { useEffect, useRef, useState } from 'react';
import { api } from '../../services/api.js';
import { urlMedia } from '../../utils/media.js';

export default function MediaManagerModal({ terbuka, tutup, pilih }) {
  const [media, setMedia] = useState([]);
  const [memuat, setMemuat] = useState(false);
  const [error, setError] = useState('');
  const inputBerkas = useRef(null);

  async function muat() {
    try {
      const r = await api.get('/admin/media');
      setMedia(r.data || []);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    if (terbuka) {
      setError('');
      muat();
    }
  }, [terbuka]);

  async function unggah(e) {
    const berkas = e.target.files?.[0];
    if (!berkas) return;
    setMemuat(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('berkas', berkas);
      await api.unggah('/admin/media/unggah', fd);
      await muat();
    } catch (err) {
      setError(err.message);
    } finally {
      setMemuat(false);
      if (inputBerkas.current) inputBerkas.current.value = '';
    }
  }

  if (!terbuka) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[80vh] w-full max-w-3xl flex-col rounded-2xl bg-surface-container-lowest shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-surface-container-high px-5 py-4 dark:border-slate-800">
          <h2 className="font-headline text-lg font-bold text-slate-900 dark:text-white">
            Pustaka Media
          </h2>
          <div className="flex items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-700">
              <span className="material-symbols-outlined text-base">upload</span>
              {memuat ? 'Mengunggah...' : 'Unggah'}
              <input ref={inputBerkas} type="file" accept="image/*" className="hidden" onChange={unggah} />
            </label>
            <button
              onClick={tutup}
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
                pilih(m);
                tutup();
              }}
              className="group overflow-hidden rounded-xl border border-surface-container-high text-left transition hover:border-primary dark:border-slate-700"
            >
              <div className="aspect-square bg-surface-container dark:bg-slate-800">
                {m.tipe_mime.startsWith('image/') ? (
                  <img src={urlMedia(m.url, 'thumbnail')} alt={m.nama_berkas} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-slate-400">description</span>
                  </div>
                )}
              </div>
              <p className="truncate px-2 py-1.5 text-xs text-slate-500 group-hover:text-primary">
                {m.nama_berkas}
              </p>
            </button>
          ))}
          {media.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm text-slate-400">
              Belum ada media. Unggah gambar pertama Anda.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
