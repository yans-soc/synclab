import { Link } from 'react-router-dom';

export default function SectionHeader({ subtitle, title, link, linkText }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3 md:mb-8">
      <div>
        {subtitle && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary sm:text-sm">
            {subtitle}
          </p>
        )}
        <h2 className="font-headline text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-3xl">
          {title}
        </h2>
      </div>
      {link && (
        <Link
          to={link}
          className="flex items-center gap-1 text-sm font-semibold text-primary transition hover:gap-2"
        >
                      {linkText || 'View All'}
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </Link>
      )}
    </div>
  );
}
