import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './stores/AuthContext.jsx';
import BerandaPage from './pages/BerandaPage.jsx';

const ArtikelDetailPage = lazy(() => import('./pages/ArtikelDetailPage.jsx'));
const ArtikelListPage = lazy(() => import('./pages/ArtikelListPage.jsx'));
const KategoriPage = lazy(() => import('./pages/KategoriPage.jsx'));
const HalamanPage = lazy(() => import('./pages/HalamanPage.jsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout.jsx'));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage.jsx'));
const ArtikelAdminPage = lazy(() => import('./pages/admin/ArtikelAdminPage.jsx'));
const ArtikelEditorPage = lazy(() => import('./pages/admin/ArtikelEditorPage.jsx'));
const KategoriAdminPage = lazy(() => import('./pages/admin/KategoriAdminPage.jsx'));
const MediaAdminPage = lazy(() => import('./pages/admin/MediaAdminPage.jsx'));
const BerandaAdminPage = lazy(() => import('./pages/admin/BerandaAdminPage.jsx'));
const MenuAdminPage = lazy(() => import('./pages/admin/MenuAdminPage.jsx'));
const PengaturanAdminPage = lazy(() => import('./pages/admin/PengaturanAdminPage.jsx'));

function Memuat() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface dark:bg-slate-950">
      <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<Memuat />}>
          <Routes>
            <Route path="/" element={<BerandaPage />} />
            <Route path="/artikel" element={<ArtikelListPage />} />
            <Route path="/artikel/:slug" element={<ArtikelDetailPage />} />
            <Route path="/kategori/:slug" element={<KategoriPage />} />
            <Route path="/halaman/:slug" element={<HalamanPage />} />
            <Route path="/admin/masuk" element={<LoginPage />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="artikel" element={<ArtikelAdminPage />} />
              <Route path="artikel/baru" element={<ArtikelEditorPage />} />
              <Route path="artikel/:id" element={<ArtikelEditorPage />} />
              <Route path="kategori" element={<KategoriAdminPage />} />
              <Route path="media" element={<MediaAdminPage />} />
              <Route path="beranda" element={<BerandaAdminPage />} />
              <Route path="menu" element={<MenuAdminPage />} />
              <Route path="pengaturan" element={<PengaturanAdminPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
