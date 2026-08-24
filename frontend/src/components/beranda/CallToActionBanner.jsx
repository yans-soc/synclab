import { Link } from 'react-router-dom';

export default function CallToActionBanner({ pengaturan }) {
  const { judul, deskripsi, cta } = pengaturan;
  return (
    <section className="px-4 py-10 sm:px-6 md:py-16">
      <div className="mx-auto max-w-6xl rounded-3xl bg-gradient-to-r from-primary to-ai-purple px-6 py-10 text-center text-white shadow-xl md:px-12 md:py-14">
        <h2 className="font-headline text-2xl font-extrabold md:text-4xl">{judul}</h2>
        {deskripsi && <p className="mx-auto mt-3 max-w-2xl text-sm text-white/80 md:mt-4 md:text-base">{deskripsi}</p>}
        {cta && (
          <Link
            to={cta.url_tujuan}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary transition hover:bg-slate-100 md:mt-8 md:px-7 md:py-3.5 md:text-base"
          >
            {cta.teks_tombol}
            {cta.ikon && <span className="material-symbols-outlined">{cta.ikon}</span>}
          </Link>
        )}
      </div>
    </section>
  );
}
