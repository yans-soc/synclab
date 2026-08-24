import { Link } from 'react-router-dom';
import { hitungWaktuBaca, formatTanggal } from '../../utils/format.js';
import Gambar from './Gambar.jsx';
import PostViewCount from './PostViewCount.jsx';

const badgeWarna = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/10 text-secondary',
  tertiary: 'bg-tertiary/10 text-tertiary',
  'ai-purple': 'bg-ai-purple/10 text-ai-purple',
};

export function ArticleCard({ judul, slug, kutipan, diterbitkan_pada, gambar_unggulan, kategori = [], konten, jumlah_dilihat }) {
  const waktuBaca = hitungWaktuBaca(konten || `${judul} ${kutipan || ''}`);
  return (
    <Link
      to={`/articles/${slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-surface-container-high bg-surface-container-lowest transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
    >
      {gambar_unggulan ? (
        <Gambar
          src={gambar_unggulan}
          alt={judul}
          ukuran="small"
          imgClassName="transition duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex aspect-video items-center justify-center bg-surface-container dark:bg-slate-800">
          <span className="material-symbols-outlined text-4xl text-slate-300">image</span>
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {kategori.map((k) => (
            <span
              key={k.slug}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeWarna[k.warna] || badgeWarna.primary}`}
            >
              {k.nama}
            </span>
          ))}
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <span className="material-symbols-outlined text-sm">schedule</span>
            {waktuBaca} menit baca
          </span>
          {jumlah_dilihat !== undefined && (
            <PostViewCount jumlah={jumlah_dilihat} className="text-xs text-slate-400" />
          )}
        </div>
        <h3 className="font-headline text-lg font-bold leading-snug text-slate-900 transition group-hover:text-primary dark:text-white">
          {judul}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-slate-500 dark:text-slate-400">
          {kutipan}
        </p>
        <p className="mt-4 text-xs text-slate-400">{formatTanggal(diterbitkan_pada)}</p>
      </div>
    </Link>
  );
}
