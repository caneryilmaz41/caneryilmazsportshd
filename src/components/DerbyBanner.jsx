import { parseMatchTeams, getTeamLogoPath } from '../utils/teamUtils';

// Sadece derbi günü gösterilen, görselli özel banner. Tarih geçince kendiliğinden kaybolur.
const DerbyBanner = ({ match, onWatch }) => {
  if (!match) return null;

  const [home, away] = parseMatchTeams(match.name);
  const homeName = home || 'Galatasaray';
  const awayName = away || 'Fenerbahçe';
  const homeLogo = getTeamLogoPath(homeName);
  const awayLogo = getTeamLogoPath(awayName);

  const hideImg = (e) => {
    e.currentTarget.style.display = 'none';
  };

  return (
    <div className="-mx-3 mb-4 sm:mx-0 lg:mb-5">
      <button
        type="button"
        onClick={onWatch}
        className="group relative block w-full overflow-hidden rounded-3xl border border-amber-400/25 text-left shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)] transition hover:border-amber-300/50"
      >
        {/* Zemin: GS kırmızısı — orta koyu geçiş — FB lacivert/sarısı */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#7a0a16] via-[#140f24] to-[#0b1f45]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(42rem_18rem_at_6%_12%,rgba(239,68,68,0.35),transparent_60%),radial-gradient(42rem_18rem_at_94%_88%,rgba(250,204,21,0.22),transparent_60%)]" />
        {/* Stadyum ışığı dokusu */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(115deg, rgba(255,255,255,0.9) 0px, rgba(255,255,255,0.9) 1px, transparent 1px, transparent 34px)',
          }}
        />
        {/* Kayan parıltı */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-white/15 to-transparent derby-sweep" />

        <div className="relative flex flex-col gap-3 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-amber-400/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-200 ring-1 ring-amber-400/35">
              ★ Süper Lig Derbisi
            </span>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-red-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-red-200 ring-1 ring-red-400/40">
              <span className="live-dot !h-1.5 !w-1.5" aria-hidden />
              {match.time || 'Bugün'}
            </span>
          </div>

          <div className="flex items-center justify-center gap-3 sm:gap-6">
            <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5 sm:flex-row sm:justify-end sm:gap-3">
              <img
                src={homeLogo}
                alt={homeName}
                onError={hideImg}
                className="derby-float h-12 w-12 shrink-0 object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.5)] sm:h-16 sm:w-16"
              />
              <span className="max-w-[9rem] truncate text-center text-xs font-bold text-white sm:max-w-none sm:text-right sm:text-lg">
                {homeName}
              </span>
            </div>

            <div className="relative shrink-0">
              <div className="derby-pulse-ring absolute inset-0 rounded-full bg-amber-400/40 blur-md" aria-hidden />
              <div className="relative flex h-11 w-11 items-center justify-center rounded-full border-2 border-amber-300/70 bg-slate-950/80 text-xs font-extrabold text-amber-200 shadow-lg sm:h-14 sm:w-14 sm:text-base">
                VS
              </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5 sm:flex-row sm:justify-start sm:gap-3">
              <span className="max-w-[9rem] truncate text-center text-xs font-bold text-white sm:max-w-none sm:text-left sm:text-lg">
                {awayName}
              </span>
              <img
                src={awayLogo}
                alt={awayName}
                onError={hideImg}
                className="derby-float h-12 w-12 shrink-0 object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.5)] sm:h-16 sm:w-16"
                style={{ animationDelay: '0.4s' }}
              />
            </div>
          </div>

          <div className="flex items-center justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition group-hover:bg-amber-300 group-hover:shadow-amber-400/30 sm:text-sm">
              Canlı izle <span aria-hidden>→</span>
            </span>
          </div>
        </div>
      </button>
    </div>
  );
};

export default DerbyBanner;
