import { useMemo, useEffect, useState } from 'react';
import { useFinanceTicker } from '../hooks/useFinanceTicker';

const LOGO = '/logom.png';

/**
 * @param {{ text: string, duplicate?: boolean }} props
 */
function TickerBlock({ text, duplicate = false }) {
  return (
    <div
      className="inline-flex shrink-0 items-center gap-2.5 px-2 pr-8 sm:gap-3.5 sm:pr-10"
      aria-hidden={duplicate ? true : undefined}
    >
      <img
        src={LOGO}
        alt=""
        className="h-4 w-auto shrink-0 object-contain opacity-90 sm:h-[1.15rem] md:h-5"
        width={64}
        height={20}
        loading="lazy"
        decoding="async"
      />
      <span className="whitespace-nowrap text-[11px] font-medium leading-5 text-slate-300 sm:text-xs">
        {text}
      </span>
    </div>
  );
}

/**
 * Alt şerit: logo + site açıklaması (kayan).
 * @param {{ extraLines?: string[] }} props
 */
export default function NewsTicker({ extraLines }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const { segments } = useFinanceTicker();

  const line = useMemo(() => {
    const extra = (Array.isArray(extraLines) ? extraLines : []).filter(Boolean);
    const base = (segments || []).join(' · ');
    return extra.length ? `${base} · ${extra.join(' · ')}` : base;
  }, [segments, extraLines]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const h = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  if (reducedMotion) {
    return (
      <div
        className="pointer-events-none fixed bottom-0 left-0 right-0 z-30 border-t border-slate-800 bg-slate-950 px-2 py-1.5 pb-[max(0.25rem,env(safe-area-inset-bottom,0px))] sm:text-xs"
        role="status"
        aria-live="polite"
      >
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-1.5 sm:flex-row sm:gap-3">
          <img src={LOGO} alt="" className="h-5 w-auto shrink-0 object-contain opacity-90" width={64} height={20} />
          <p className="text-center text-[11px] leading-snug text-slate-300 sm:text-left">{line}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="pointer-events-none fixed bottom-0 left-0 right-0 z-30 min-h-8 border-t border-slate-800 bg-slate-950 py-1.5 shadow-[0_-1px_0_0_rgba(16,185,129,0.2)] sm:min-h-9 sm:py-2"
      role="status"
      aria-live="off"
    >
      <div className="overflow-hidden">
        <div className="news-ticker-animate flex w-max">
          <TickerBlock text={line} />
          <TickerBlock text={line} duplicate />
        </div>
      </div>
    </div>
  );
}
