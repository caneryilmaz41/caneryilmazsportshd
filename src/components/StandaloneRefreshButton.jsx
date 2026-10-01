import { useEffect, useState } from 'react';

const StandaloneRefreshButton = () => {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    setIsStandalone(Boolean(standalone));
  }, []);

  if (!isStandalone) return null;

  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="fixed bottom-32 right-3 z-40 sm:bottom-36 sm:right-4 rounded-full border border-emerald-400/40 bg-slate-900/90 px-4 py-2 text-xs font-semibold text-emerald-300 shadow-lg backdrop-blur transition hover:bg-slate-800/95"
      aria-label="Sayfayı yenile"
    >
      Yenile
    </button>
  );
};

export default StandaloneRefreshButton;
