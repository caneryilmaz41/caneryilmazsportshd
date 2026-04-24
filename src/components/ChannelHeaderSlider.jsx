import { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react';
import ChannelLogoImg from './ChannelLogoImg';

function ChevronLeft({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRight({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
    </svg>
  );
}

const ChannelHeaderSlider = ({
  channels = [],
  selectedMatch,
  onSelect,
  channelKind = 'tv',
  onChannelKind,
  showKindTabs = false,
  loading = false,
}) => {
  const scrollRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const max = scrollWidth - clientWidth;
    setCanLeft(scrollLeft > 4);
    setCanRight(max > 4 && scrollLeft < max - 4);
  }, []);

  const scrollByDir = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const dist = Math.min(el.clientWidth * 0.82, 400);
    const left = dir === 'left' ? -dist : dist;
    const reduce =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left, behavior: reduce ? 'auto' : 'smooth' });
  };

  useLayoutEffect(() => {
    updateArrows();
  }, [updateArrows, channels?.length, channelKind]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;
    const raf = requestAnimationFrame(() => updateArrows());
    el.addEventListener('scroll', updateArrows, { passive: true });
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => updateArrows()) : null;
    ro?.observe(el);
    window.addEventListener('resize', updateArrows);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('scroll', updateArrows);
      ro?.disconnect();
      window.removeEventListener('resize', updateArrows);
    };
  }, [updateArrows, channels?.length, channelKind]);

  if (loading) {
    return (
      <section className="relative w-full overflow-hidden border-y border-white/[0.06] bg-slate-950/90">
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,rgba(16,185,129,0.14),transparent_55%)]" />
        <div className="relative py-3 sm:py-4">
          <div className="mb-2 flex items-end justify-between px-4 sm:px-6 lg:px-10">
            <div className="h-3 w-40 rounded bg-slate-800/80 animate-pulse motion-reduce:animate-none" />
            <div className="h-2.5 w-16 rounded bg-slate-800/60 animate-pulse motion-reduce:animate-none" />
          </div>
          <div className="flex items-stretch gap-0 px-2 pb-2 sm:px-3 lg:px-6">
            <div className="w-8 shrink-0 rounded-l-xl border border-slate-800/80 bg-slate-800/50 sm:w-9" />
            <div className="hide-scrollbar flex min-w-0 flex-1 gap-3 overflow-x-auto border-y border-slate-800/50 bg-slate-950/20 px-1.5 py-1 sm:gap-3.5 sm:px-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 min-w-[10rem] shrink-0 rounded-2xl border border-slate-800/80 bg-slate-900/60 animate-pulse motion-reduce:animate-none sm:min-w-[11rem] sm:h-[4.5rem]"
                />
              ))}
            </div>
            <div className="w-8 shrink-0 rounded-r-xl border border-slate-800/80 bg-slate-800/50 sm:w-9" />
          </div>
        </div>
      </section>
    );
  }

  if (!channels?.length) {
    return null;
  }

  const pill = (id, label) => {
    const on = channelKind === id;
    return (
      <button
        key={id}
        type="button"
        onClick={() => onChannelKind(id)}
        className={[
          'min-w-0 flex-1 rounded-md px-3 py-1.5 text-center text-[11px] font-semibold transition-colors sm:px-4 sm:py-1.5 sm:text-xs',
          on
            ? 'bg-slate-100 text-slate-900 shadow-sm'
            : 'text-slate-400 hover:text-slate-200',
        ].join(' ')}
      >
        {label}
      </button>
    );
  };

  return (
    <section
      className="relative w-full overflow-hidden border-y border-white/[0.08] bg-slate-950 shadow-[0_12px_48px_rgba(0,0,0,0.45)]"
      aria-label="Hızlı kanal seçimi"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(100%_90%_at_50%_-10%,rgba(16,185,129,0.11),transparent_50%)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(15,23,42,0.4)_20%,rgba(15,23,42,0.4)_80%,transparent_100%)]" />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent"
        aria-hidden
      />

      <div className="relative">
        <div className="flex flex-col gap-2 border-b border-white/[0.05] px-4 py-2.5 sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:py-3 lg:px-10">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.32em] text-slate-500 sm:text-[10px]">canlı</p>
            <h2 className="text-base font-bold tracking-tight text-white sm:text-lg">
              TV <span className="bg-gradient-to-r from-emerald-200 to-emerald-500/90 bg-clip-text text-transparent">kanalları</span>
            </h2>
          </div>
          {showKindTabs && onChannelKind ? (
            <div
              className="flex w-full max-w-[22rem] rounded-xl border border-slate-600/50 bg-slate-900/80 p-0.5 sm:w-auto"
              role="tablist"
              aria-label="Belgesel veya TV"
            >
              {pill('tv', 'TV & Spor')}
              {pill('belgesel', 'Belgesel')}
            </div>
          ) : (
            <p className="text-right text-[9px] text-slate-500 sm:max-w-none sm:text-[10px]">Yan kaydır / oklar</p>
          )}
        </div>

        <div className="flex min-h-0 items-stretch gap-0 px-2 pb-2 pt-0.5 sm:px-3 lg:px-6">
          <button
            type="button"
            onClick={() => scrollByDir('left')}
            disabled={!canLeft}
            aria-label="Kanalları sola kaydır"
            className={
              'flex w-8 shrink-0 items-center justify-center self-stretch rounded-l-xl border border-slate-700/50 bg-slate-900/70 text-slate-200 transition sm:w-9 ' +
              (canLeft
                ? 'hover:border-emerald-500/35 hover:bg-slate-800/80 active:bg-slate-800/90'
                : 'pointer-events-none cursor-not-allowed opacity-30')
            }
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div
            ref={scrollRef}
            className="hide-scrollbar flex min-w-0 flex-1 snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain border-y border-slate-800/50 bg-slate-950/30 px-1.5 py-2.5 sm:gap-3.5 sm:px-2 sm:py-3"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {channels.map((channel) => {
              const isSelected = selectedMatch?.id === channel.id;
              return (
                <button
                  key={channel.id}
                  type="button"
                  onClick={() => onSelect(channel)}
                  className={[
                    'group flex min-w-[9.75rem] max-w-[12rem] shrink-0 snap-start items-center gap-3 rounded-2xl border px-3 py-2.5 text-left sm:min-w-[11rem] sm:max-w-[14rem] sm:px-4 sm:py-3',
                    'transition-all duration-200 motion-reduce:transition-none',
                    isSelected
                      ? 'border-emerald-400/50 bg-gradient-to-r from-emerald-500/20 to-emerald-600/5 shadow-[0_0_0_1px_rgba(16,185,129,0.2),0_8px_28px_rgba(16,185,129,0.12)]'
                      : 'border-slate-700/50 bg-slate-900/50 hover:border-slate-500/55 hover:bg-slate-800/60 hover:shadow-lg hover:shadow-black/20',
                    'active:scale-[0.99] motion-reduce:active:scale-100',
                  ].join(' ')}
                >
                  <div
                    className={[
                      'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12',
                      isSelected
                        ? 'bg-slate-950/50 ring-1 ring-emerald-400/40'
                        : 'bg-slate-950/40 ring-1 ring-slate-600/50 group-hover:ring-slate-500/50',
                    ].join(' ')}
                  >
                    <ChannelLogoImg
                      channelName={channel.name}
                      className="h-9 w-9 object-contain sm:h-10 sm:w-10"
                    />
                  </div>
                  <span
                    className={[
                      'line-clamp-2 min-w-0 flex-1 text-left text-[11px] font-semibold leading-tight sm:text-xs',
                      isSelected ? 'text-emerald-50' : 'text-slate-100',
                    ].join(' ')}
                  >
                    {channel.name}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => scrollByDir('right')}
            disabled={!canRight}
            aria-label="Kanalları sağa kaydır"
            className={
              'flex w-8 shrink-0 items-center justify-center self-stretch rounded-r-xl border border-slate-700/50 bg-slate-900/70 text-slate-200 transition sm:w-9 ' +
              (canRight
                ? 'hover:border-emerald-500/35 hover:bg-slate-800/80 active:bg-slate-800/90'
                : 'pointer-events-none cursor-not-allowed opacity-30')
            }
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ChannelHeaderSlider;
