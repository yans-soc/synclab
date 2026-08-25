import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './stores/AuthContext.jsx';
import HomePage from './pages/HomePage.jsx';

const ArticleDetailPage = lazy(() => import('./pages/ArticleDetailPage.jsx'));
const ArticleListPage = lazy(() => import('./pages/ArticleListPage.jsx'));
const CategoryPage = lazy(() => import('./pages/CategoryPage.jsx'));
const StaticPage = lazy(() => import('./pages/StaticPage.jsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const CommunityPage = lazy(() => import('./pages/community/CommunityPage.jsx'));
const CommunityCategoryPage = lazy(() => import('./pages/community/CommunityCategoryPage.jsx'));
const ThreadDetailPage = lazy(() => import('./pages/community/ThreadDetailPage.jsx'));
const ThreadCreatePage = lazy(() => import('./pages/community/ThreadCreatePage.jsx'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout.jsx'));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage.jsx'));
const ArticleAdminPage = lazy(() => import('./pages/admin/ArticleAdminPage.jsx'));
const ArticleEditorPage = lazy(() => import('./pages/admin/ArticleEditorPage.jsx'));
const CategoryAdminPage = lazy(() => import('./pages/admin/CategoryAdminPage.jsx'));
const MediaAdminPage = lazy(() => import('./pages/admin/MediaAdminPage.jsx'));
const HomepageAdminPage = lazy(() => import('./pages/admin/HomepageAdminPage.jsx'));
const MenuAdminPage = lazy(() => import('./pages/admin/MenuAdminPage.jsx'));
const SettingsAdminPage = lazy(() => import('./pages/admin/SettingsAdminPage.jsx'));
const ThreadsAdminPage = lazy(() => import('./pages/admin/ThreadsAdminPage.jsx'));

function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface dark:bg-slate-950">
      <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
    </div>
  );
}

function RedirectArticle() {
  const { slug } = useParams();
  return <Navigate to={`/articles/${slug}`} replace />;
}

function RedirectCategory() {
  const { slug } = useParams();
  return <Navigate to={`/category/${slug}`} replace />;
}

function RedirectPage() {
  const { slug } = useParams();
  return <Navigate to={`/page/${slug}`} replace />;
}

function RedirectAdminArticle() {
  const { id } = useParams();
  return <Navigate to={`/admin/articles/${id}`} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/articles" element={<ArticleListPage />} />
            <Route path="/articles/:slug" element={<ArticleDetailPage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/page/:slug" element={<StaticPage />} />
            {/* Community */}
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/community/category/:slug" element={<CommunityCategoryPage />} />
            <Route path="/community/thread/:slug" element={<ThreadDetailPage />} />
            <Route path="/community/new" element={<ThreadCreatePage />} />
            {/* Legacy Indonesian routes redirect so external links keep working */}
            <Route path="/artikel" element={<Navigate to="/articles" replace />} />
            <Route path="/artikel/:slug" element={<RedirectArticle />} />
            <Route path="/kategori/:slug" element={<RedirectCategory />} />
            <Route path="/halaman/:slug" element={<RedirectPage />} />
            <Route path="/admin/masuk" element={<Navigate to="/admin/login" replace />} />
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="articles" element={<ArticleAdminPage />} />
              <Route path="articles/new" element={<ArticleEditorPage />} />
              <Route path="articles/:id" element={<ArticleEditorPage />} />
              <Route path="artikel" element={<Navigate to="/admin/articles" replace />} />
              <Route path="artikel/baru" element={<Navigate to="/admin/articles/new" replace />} />
              <Route path="artikel/:id" element={<RedirectAdminArticle />} />
              <Route path="categories" element={<CategoryAdminPage />} />
              <Route path="kategori" element={<Navigate to="/admin/categories" replace />} />
              <Route path="media" element={<MediaAdminPage />} />
              <Route path="homepage" element={<HomepageAdminPage />} />
              <Route path="beranda" element={<Navigate to="/admin/homepage" replace />} />
              <Route path="menus" element={<MenuAdminPage />} />
              <Route path="menu" element={<Navigate to="/admin/menus" replace />} />
              <Route path="threads" element={<ThreadsAdminPage />} />
              <Route path="settings" element={<SettingsAdminPage />} />
              <Route path="pengaturan" element={<Navigate to="/admin/settings" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
