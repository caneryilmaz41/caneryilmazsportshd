import { useCallback, useEffect, useState } from 'react';

const SHOW_AFTER = 320;

function ChevronUp({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
    </svg>
  );
}

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > SHOW_AFTER);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goUp = useCallback(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }, []);

  return (
    <button
      type="button"
      onClick={goUp}
      className={[
        'fixed right-3 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-emerald-500/45 bg-slate-900/95 text-emerald-400 shadow-lg backdrop-blur-sm transition-all duration-300 motion-reduce:transition-none',
        'hover:border-emerald-400/60 hover:bg-slate-800/95 hover:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50',
        'active:scale-95 motion-reduce:active:scale-100',
        'bottom-20 sm:right-4 sm:bottom-24',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
      ].join(' ')}
      aria-label="Yukarı çık"
      title="Yukarı çık"
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  );
}
