import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './stores/AuthContext.jsx';
import BerandaPage from './pages/BerandaPage.jsx';
import ArtikelDetailPage from './pages/ArtikelDetailPage.jsx';
import ArtikelListPage from './pages/ArtikelListPage.jsx';
import KategoriPage from './pages/KategoriPage.jsx';
import HalamanPage from './pages/HalamanPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AdminLayout from './components/admin/AdminLayout.jsx';
import DashboardPage from './pages/admin/DashboardPage.jsx';
import ArtikelAdminPage from './pages/admin/ArtikelAdminPage.jsx';
import ArtikelEditorPage from './pages/admin/ArtikelEditorPage.jsx';
import KategoriAdminPage from './pages/admin/KategoriAdminPage.jsx';
import MediaAdminPage from './pages/admin/MediaAdminPage.jsx';
import BerandaAdminPage from './pages/admin/BerandaAdminPage.jsx';
import MenuAdminPage from './pages/admin/MenuAdminPage.jsx';
import PengaturanAdminPage from './pages/admin/PengaturanAdminPage.jsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
      </BrowserRouter>
    </AuthProvider>
  );
}
