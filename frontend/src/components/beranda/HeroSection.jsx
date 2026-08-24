import { Link } from 'react-router-dom';

export default function HeroSection({ pengaturan }) {
  const { judul_utama, deskripsi, cta } = pengaturan;
  return (
    <section className="relative overflow-hidden bg-surface-container-lowest dark:bg-slate-950">
      <div
        className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-ai-purple/10 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 md:py-24 lg:py-32">
        <h1 className="mx-auto max-w-3xl font-headline text-3xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-4xl md:text-6xl">
          {judul_utama}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-500 dark:text-slate-400 md:mt-6 md:text-lg">
          {deskripsi}
        </p>
        {cta && (
          <Link
            to={cta.url_tujuan}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition hover:bg-primary-700 md:mt-10 md:px-8 md:py-4 md:text-base"
          >
            {cta.teks_tombol}
            {cta.ikon && (
              <span className="material-symbols-outlined">{cta.ikon}</span>
            )}
          </Link>
        )}
      </div>
    </section>
  );
}
