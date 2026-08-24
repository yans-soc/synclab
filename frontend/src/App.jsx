import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
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
function RedirectArtikel() {
  const { slug } = useParams();
  return <Navigate to={`/articles/${slug}`} replace />;
}

function RedirectKategori() {
  const { slug } = useParams();
  return <Navigate to={`/category/${slug}`} replace />;
}

function RedirectHalaman() {
  const { slug } = useParams();
  return <Navigate to={`/page/${slug}`} replace />;
}

function RedirectAdminArtikel() {
  const { id } = useParams();
  return <Navigate to={`/admin/articles/${id}`} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<Memuat />}>
          <Routes>
            <Route path="/" element={<BerandaPage />} />
            <Route path="/articles" element={<ArtikelListPage />} />
            <Route path="/articles/:slug" element={<ArtikelDetailPage />} />
            <Route path="/category/:slug" element={<KategoriPage />} />
            <Route path="/page/:slug" element={<HalamanPage />} />
            {/* Rute lama (Indonesia) dialihkan agar tautan luar tidak putus */}
            <Route path="/artikel" element={<Navigate to="/articles" replace />} />
            <Route path="/artikel/:slug" element={<RedirectArtikel />} />
            <Route path="/kategori/:slug" element={<RedirectKategori />} />
            <Route path="/halaman/:slug" element={<RedirectHalaman />} />
            <Route path="/admin/masuk" element={<Navigate to="/admin/login" replace />} />
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="articles" element={<ArtikelAdminPage />} />
              <Route path="articles/new" element={<ArtikelEditorPage />} />
              <Route path="articles/:id" element={<ArtikelEditorPage />} />
              <Route path="artikel" element={<Navigate to="/admin/articles" replace />} />
              <Route path="artikel/baru" element={<Navigate to="/admin/articles/new" replace />} />
              <Route path="artikel/:id" element={<RedirectAdminArtikel />} />
              <Route path="categories" element={<KategoriAdminPage />} />
              <Route path="kategori" element={<Navigate to="/admin/categories" replace />} />
              <Route path="media" element={<MediaAdminPage />} />
              <Route path="homepage" element={<BerandaAdminPage />} />
              <Route path="beranda" element={<Navigate to="/admin/homepage" replace />} />
              <Route path="menus" element={<MenuAdminPage />} />
              <Route path="menu" element={<Navigate to="/admin/menus" replace />} />
              <Route path="settings" element={<PengaturanAdminPage />} />
              <Route path="pengaturan" element={<Navigate to="/admin/settings" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
