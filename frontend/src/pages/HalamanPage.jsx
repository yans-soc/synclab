import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { marked } from 'marked';
import { api } from '../services/api.js';
import AppLayout from '../components/layout/AppLayout.jsx';

export default function HalamanPage() {
  const { slug } = useParams();
  const [halaman, setHalaman] = useState(null);
  const [status, setStatus] = useState('memuat');

  useEffect(() => {
    setStatus('memuat');
    api
      .get(`/halaman/${slug}`)
      .then((r) => {
        setHalaman(r.data);
        setStatus('ok');
      })
      .catch(() => setStatus('gagal'));
  }, [slug]);

  useEffect(() => {
    if (halaman) {
      document.title = halaman.seo?.judul_seo || `${halaman.judul} - SYNCLAB`;
    }
  }, [halaman]);

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 md:py-12">
        {status === 'memuat' && (
          <div className="flex min-h-[40vh] items-center justify-center">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          </div>
        )}
        {status === 'gagal' && (
          <div className="py-24 text-center">
            <p className="text-lg text-slate-500">Halaman tidak ditemukan.</p>
            <Link to="/" className="mt-4 inline-block font-semibold text-primary">
              Kembali ke Beranda
            </Link>
          </div>
        )}
        {status === 'ok' && (
          <>
            <h1 className="font-headline text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl md:text-4xl">
              {halaman.judul}
            </h1>
            <div
              className="prose-konten mt-8"
              dangerouslySetInnerHTML={{ __html: marked.parse(halaman.konten || '') }}
            />
          </>
        )}
      </div>
    </AppLayout>
  );
}
