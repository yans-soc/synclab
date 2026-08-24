import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import SectionHeader from './SectionHeader.jsx';

const colorMap = {
  primary: 'bg-primary/10 text-primary border-primary/20',
  secondary: 'bg-secondary/10 text-secondary border-secondary/20',
  tertiary: 'bg-tertiary/10 text-tertiary border-tertiary/20',
  'ai-purple': 'bg-ai-purple/10 text-ai-purple border-ai-purple/20',
};

export function CategoryCard({ nama, slug, deskripsi, warna, ikon }) {
  const kelasWarna = colorMap[warna] || colorMap.primary;
  return (
    <Link
      to={`/category/${slug}`}
      className={`group rounded-2xl border p-6 transition hover:-translate-y-1 hover:shadow-lg ${kelasWarna} dark:bg-opacity-5`}
    >
      <span className="material-symbols-outlined text-3xl">{ikon || 'folder'}</span>
      <h3 className="mt-4 font-headline text-lg font-bold text-slate-900 dark:text-white">
        {nama}
      </h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{deskripsi}</p>
    </Link>
  );
}

export default function CategoryExplorer({ pengaturan, dataAwal = null }) {
  const [kategori, setKategori] = useState(dataAwal || []);

  useEffect(() => {
    if (dataAwal) return; // data sudah datang dari endpoint komposit beranda
    api.get('/kategori').then((r) => setKategori(r.data || [])).catch(() => {});
  }, [dataAwal]);

  return (
    <section className="bg-surface-container-low py-10 dark:bg-slate-900 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader
          subjudul={pengaturan.subjudul}
          judul={pengaturan.judul_seksi}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {kategori.map((k) => (
            <CategoryCard key={k.id} {...k} />
          ))}
        </div>
      </div>
    </section>
  );
}
