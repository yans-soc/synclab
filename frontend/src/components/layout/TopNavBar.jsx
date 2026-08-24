import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { api } from '../../services/api.js';
import ThemeToggle from './ThemeToggle.jsx';

export default function TopNavBar() {
  const [item, setItem] = useState([]);
  const [siteTitle, setSiteTitle] = useState('SYNCLAB');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    api.get('/menus/header').then((r) => setItem(r.data || [])).catch(() => {});
    api
      .get('/settings')
      .then((r) => setSiteTitle(r.data?.site_title || 'SYNCLAB'))
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-surface-container-high bg-surface-container-lowest/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
          <span className="material-symbols-outlined text-2xl text-primary">sync</span>
          <span className="font-headline text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {siteTitle}
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {item.map((it) => (
            <NavLink
              key={it.id}
              to={it.url}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-600 hover:bg-surface-container hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                }`
              }
            >
              {it.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            className="rounded-lg p-2 text-slate-600 hover:bg-surface-container md:hidden dark:text-slate-300 dark:hover:bg-slate-800"
            onClick={() => setMenuOpen((b) => !b)}
            aria-label="Open menu"
          >
            <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav className="border-t border-surface-container-high px-4 py-3 md:hidden dark:border-slate-800">
          {item.map((it) => (
            <NavLink
              key={it.id}
              to={it.url}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-600 hover:bg-surface-container hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                }`
              }
            >
              {it.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
