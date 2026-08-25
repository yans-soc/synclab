import TopNavBar from './TopNavBar.jsx';
import Footer from './Footer.jsx';
import BackToTopButton from './BackToTopButton.jsx';
import CookieConsent from './CookieConsent.jsx';

export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopNavBar />
      <main className="flex-1">{children}</main>
      <Footer />
      <BackToTopButton />
      <CookieConsent />
    </div>
  );
}
