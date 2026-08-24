import { useEffect, useState } from 'react';

// Floating "back to top" button; appears after the user scrolls far down.
export default function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const threshold = Math.max(window.innerHeight * 1.5, 600);
    const onScroll = () => setVisible(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                aria-label="Back to top"
      className={`fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-all duration-300 hover:bg-primary-700 ${
        visible
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      <span className="material-symbols-outlined">arrow_upward</span>
    </button>
  );
}
