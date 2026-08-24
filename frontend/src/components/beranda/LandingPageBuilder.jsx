import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import HeroSection from './HeroSection.jsx';
import CategoryExplorer from './CategoryExplorer.jsx';
import LatestArticlesGrid from './LatestArticlesGrid.jsx';
import CallToActionBanner from './CallToActionBanner.jsx';

const PETA_KOMPONEN = {
  hero_section: HeroSection,
  explore_topics: CategoryExplorer,
  latest_articles: LatestArticlesGrid,
  cta_banner: CallToActionBanner,
};

export default function LandingPageBuilder() {
  const [beranda, setBeranda] = useState(null);
  const [memuat, setMemuat] = useState(true);

  useEffect(() => {
    api
      .get('/beranda/aktif')
      .then((r) => setBeranda(r.data))
      .catch(() => setBeranda(null))
      .finally(() => setMemuat(false));
  }, []);

  if (memuat) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">
          progress_activity
        </span>
      </div>
    );
  }

  if (!beranda) {
    return (
      <div className="py-24 text-center text-slate-500">
        Belum ada beranda yang dipublikasikan.
      </div>
    );
  }

  return (
    <>
      {beranda.bagian.map((bagian) => {
        const Komponen = PETA_KOMPONEN[bagian.tipe];
        if (!Komponen) return null;
        return <Komponen key={bagian.id} pengaturan={bagian.pengaturan} />;
      })}
    </>
  );
}
