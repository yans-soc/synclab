import TopNavBar from './TopNavBar.jsx';
import Footer from './Footer.jsx';
import TombolKeAtas from './TombolKeAtas.jsx';

export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopNavBar />
      <main className="flex-1">{children}</main>
      <Footer />
      <TombolKeAtas />
    </div>
  );
}
