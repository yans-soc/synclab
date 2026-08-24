export default function SectionHeader({ subjudul, judul, tautan, teksTautan }) {
  return (
    <div className="mb-8 flex items-end justify-between">
      <div>
        {subjudul && (
          <p className="mb-1 text-sm font-semibold uppercase tracking-widest text-primary">
            {subjudul}
          </p>
        )}
        <h2 className="font-headline text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {judul}
        </h2>
      </div>
      {tautan && (
        <a
          href={tautan}
          className="hidden items-center gap-1 text-sm font-semibold text-primary transition hover:gap-2 md:flex"
        >
          {teksTautan || 'Lihat Semua'}
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </a>
      )}
    </div>
  );
}
