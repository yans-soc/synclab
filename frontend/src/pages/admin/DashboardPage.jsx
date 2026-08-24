import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';

export default function DashboardPage() {
  const [stat, setStat] = useState({ artikel: 0, kategori: 0, media: 0, views: 0 });

  useEffect(() => {
    Promise.allSettled([
      api.get('/admin/artikel?limit=50'),
      api.get('/kategori'),
      api.get('/admin/media'),
    ]).then(([a, k, m]) => {
      // Total views dijumlahkan dari counter otoritatif tiap artikel (sumber sama)
      const daftarArtikel = a.status === 'fulfilled' ? a.value.data ?? [] : [];
      setStat({
        artikel: a.status === 'fulfilled' ? a.value.meta?.total_item ?? 0 : 0,
        kategori: k.status === 'fulfilled' ? k.value.data?.length ?? 0 : 0,
        media: m.status === 'fulfilled' ? m.value.data?.length ?? 0 : 0,
        views: daftarArtikel.reduce((t, x) => t + (x.jumlah_dilihat ?? 0), 0),
      });
    });
  }, []);

  const kartu = [
    { label: 'Total Artikel', nilai: stat.artikel, ikon: 'article', warna: 'text-primary bg-primary/10' },
    { label: 'Kategori', nilai: stat.kategori, ikon: 'category', warna: 'text-secondary bg-secondary/10' },
    { label: 'Media', nilai: stat.media, ikon: 'perm_media', warna: 'text-ai-purple bg-ai-purple/10' },
    { label: 'Total Views', nilai: stat.views, ikon: 'visibility', warna: 'text-primary bg-primary/10' },
  ];

  return (
    <div>
      <h1 className="mb-6 font-headline text-2xl font-extrabold text-slate-900 dark:text-white">
        Dashboard
      </h1>
      <div className="grid gap-4 sm:grid-cols-4">
        {kartu.map((k) => (
          <div
            key={k.label}
            className="rounded-2xl border border-surface-container-high bg-surface-container-lowest p-5 dark:border-slate-800 dark:bg-slate-950"
          >
            <span className={`inline-flex rounded-xl p-2.5 ${k.warna}`}>
              <span className="material-symbols-outlined">{k.ikon}</span>
            </span>
            <p className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">{k.nilai}</p>
            <p className="text-sm text-slate-500">{k.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-2xl border border-surface-container-high bg-surface-container-lowest p-6 dark:border-slate-800 dark:bg-slate-950">
        <h2 className="font-semibold text-slate-900 dark:text-white">Aksi Cepat</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/admin/articles/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Artikel Baru
          </Link>
          <Link
            to="/admin/homepage"
            className="inline-flex items-center gap-2 rounded-lg border border-surface-container-high px-4 py-2 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
          >
            <span className="material-symbols-outlined text-base">home_app_logo</span>
            Atur Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
