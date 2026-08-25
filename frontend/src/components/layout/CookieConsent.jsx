import { useState } from 'react';

const CONSENT_KEY = 'synclab_cookie_consent';

// Cookie consent banner, fixed at the bottom-left. Shown only once per
// visitor: accepting stores the consent in localStorage and it never appears again.
export default function CookieConsent() {
  const [visible, setVisible] = useState(
    () => !localStorage.getItem(CONSENT_KEY)
  );

  if (!visible) return null;

  function accept() {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setVisible(false);
  }

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 z-50 w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-surface-container-high bg-surface-container-lowest p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined mt-0.5 text-2xl text-primary">cookie</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            We use cookies
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            This site uses cookies to improve your browsing experience and analyze traffic. By continuing, you agree to their use.
          </p>
          <button
            onClick={accept}
            className="mt-3 rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-700"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
