import { Link } from 'react-router-dom';

export default function CallToActionBanner({ pengaturan }) {
  const { judul, deskripsi, cta } = pengaturan;
  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-6xl rounded-3xl bg-gradient-to-r from-primary to-ai-purple px-8 py-14 text-center text-white shadow-xl">
        <h2 className="font-headline text-3xl font-extrabold md:text-4xl">{judul}</h2>
        {deskripsi && <p className="mx-auto mt-4 max-w-2xl text-white/80">{deskripsi}</p>}
        {cta && (
          <Link
            to={cta.url_tujuan}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-semibold text-primary transition hover:bg-slate-100"
          >
            {cta.teks_tombol}
            {cta.ikon && <span className="material-symbols-outlined">{cta.ikon}</span>}
          </Link>
        )}
      </div>
    </section>
  );
}
