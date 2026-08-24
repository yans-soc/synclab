import { NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../stores/AuthContext.jsx';
import ThemeToggle from '../layout/ThemeToggle.jsx';

const NAV = [
  { ke: '/admin', ikon: 'dashboard', label: 'Dashboard', akhir: true },
  { ke: '/admin/articles', ikon: 'article', label: 'Articles' },
  { ke: '/admin/categories', ikon: 'category', label: 'Categories' },
  { ke: '/admin/media', ikon: 'perm_media', label: 'Media' },
  { ke: '/admin/homepage', ikon: 'home_app_logo', label: 'Homepage' },
  { ke: '/admin/menus', ikon: 'menu', label: 'Menus' },
  { ke: '/admin/settings', ikon: 'settings', label: 'Settings' },
];

export default function AdminLayout() {
  const { pengguna, keluar } = useAuth();
  const navigate = useNavigate();

  if (!pengguna) return <Navigate to="/admin/login" replace />;

  async function prosesKeluar() {
    await keluar();
    navigate('/admin/login');
  }

  return (
    <div className="flex min-h-screen bg-surface-container dark:bg-slate-900">
      <aside className="fixed inset-y-0 left-0 flex w-60 flex-col border-r border-surface-container-high bg-surface-container-lowest dark:border-slate-800 dark:bg-slate-950">
        <div className="flex h-16 items-center gap-2 border-b border-surface-container-high px-5 dark:border-slate-800">
          <span className="material-symbols-outlined text-2xl text-primary">sync</span>
          <span className="font-headline text-lg font-extrabold text-slate-900 dark:text-white">
            SYNCLAB <span className="text-xs font-medium text-slate-400">CMS</span>
          </span>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV.map((n) => (
            <NavLink
              key={n.ke}
              to={n.ke}
              end={n.akhir}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-600 hover:bg-surface-container dark:text-slate-300 dark:hover:bg-slate-800'
                }`
              }
            >
              <span className="material-symbols-outlined text-xl">{n.ikon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-surface-container-high p-3 dark:border-slate-800">
          <a
            href="/"
            className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-surface-container dark:hover:bg-slate-800"
          >
            <span className="material-symbols-outlined text-xl">public</span>
            Lihat Situs
          </a>
        </div>
      </aside>
      <div className="ml-60 flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-surface-container-high bg-surface-container-lowest px-6 dark:border-slate-800 dark:bg-slate-950">
          <div />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {pengguna.nama_lengkap}
              </p>
              <p className="text-xs capitalize text-slate-400">{pengguna.peran}</p>
            </div>
            <button
              onClick={prosesKeluar}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
              title="Keluar"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
