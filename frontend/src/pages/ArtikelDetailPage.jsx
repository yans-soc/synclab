import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { marked } from 'marked';
import { api } from '../services/api.js';
import AppLayout from '../components/layout/AppLayout.jsx';
import PostViewCount from '../components/beranda/PostViewCount.jsx';
import Gambar from '../components/beranda/Gambar.jsx';
import { hitungWaktuBaca, formatTanggal } from '../utils/format.js';
import { usePelacakView } from '../hooks/usePelacakView.js';

export default function ArtikelDetailPage() {
  const { slug } = useParams();
  const [artikel, setArtikel] = useState(null);
  const [status, setStatus] = useState('memuat');
  const jumlahDilihat = usePelacakView(artikel);

  useEffect(() => {
    setStatus('memuat');
    api
      .get(`/artikel/${slug}`)
      .then((r) => {
        setArtikel(r.data);
        setStatus('ok');
      })
      .catch(() => setStatus('gagal'));
  }, [slug]);

  useEffect(() => {
    if (artikel) {
      document.title = artikel.seo?.judul_seo || `${artikel.judul} - SYNCLAB`;
    }
  }, [artikel]);

  if (status === 'memuat') {
    return (
      <AppLayout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
        </div>
      </AppLayout>
    );
  }

  if (status === 'gagal') {
    return (
      <AppLayout>
        <div className="py-24 text-center">
          <p className="text-lg text-slate-500">Artikel tidak ditemukan.</p>
          <Link to="/" className="mt-4 inline-block font-semibold text-primary">
            Kembali ke Beranda
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 md:py-12">
        <div className="mb-4 flex flex-wrap gap-2">
          {artikel.kategori.map((k) => (
            <Link
              key={k.slug}
              to={`/category/${k.slug}`}
              className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
            >
              {k.nama}
            </Link>
          ))}
        </div>
        <h1 className="font-headline text-2xl font-extrabold leading-tight text-slate-900 dark:text-white sm:text-3xl md:text-4xl">
          {artikel.judul}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-400">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-base">person</span>
            {artikel.penulis.nama_lengkap}
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-base">calendar_month</span>
            {formatTanggal(artikel.diterbitkan_pada)}
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-base">schedule</span>
            {hitungWaktuBaca(artikel.konten)} menit baca
          </span>
          <PostViewCount jumlah={jumlahDilihat} ikonClass="text-base" />
        </div>
        {artikel.gambar_unggulan && (
          <Gambar
            src={artikel.gambar_unggulan}
            alt={artikel.judul}
            ukuran="medium"
            eager
            className="mt-8 rounded-2xl"
          />
        )}
        <div
          className="prose-konten mt-8"
          dangerouslySetInnerHTML={{ __html: marked.parse(artikel.konten || '') }}
        />
      </article>
    </AppLayout>
  );
}
