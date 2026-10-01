import TeamLogo from './TeamLogo';
import { parseMatchTeams } from '../utils/teamUtils';
import { favKey } from '../hooks/useFavorites';
import { isUpcoming } from '../utils/matchTime';
import { StarIcon, BellIcon } from './icons';

const MatchList = ({
  matches,
  totalMatchesCount,
  sourceMatchTotal = 0,
  searchQuery = "",
  onClearSearch,
  selectedMatch,
  onMatchSelect,
  logoState,
  setLogoState,
  isFav,
  onToggleFav,
  hasReminder,
  onToggleReminder,
}) => {
  const fullCount = totalMatchesCount ?? matches.length;
  const hasSearch = Boolean((searchQuery || "").trim());
  const isSearchEmpty = matches.length === 0 && fullCount > 0 && hasSearch;
  const noPlayableHlsInSource =
    !hasSearch &&
    matches.length === 0 &&
    fullCount === 0 &&
    sourceMatchTotal > 0;

  if (matches.length === 0) {
    if (isSearchEmpty) {
      return (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
          <p className="text-sm font-medium text-slate-300">Aramaya uyan maç yok</p>
          <p className="mt-1 text-xs text-slate-500">Takım veya lig adını değiştirip tekrar dene</p>
          {onClearSearch ? (
            <button
              type="button"
              onClick={onClearSearch}
              className="mt-3 rounded-lg border border-slate-600/50 bg-slate-800/60 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700/50"
            >
              Aramayı temizle
            </button>
          ) : null}
        </div>
      );
    }
    if (noPlayableHlsInSource) {
      return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800/80 text-3xl ring-1 ring-slate-600/50">
            ⚽
          </div>
          <p className="text-sm font-medium text-slate-300">Şu an uygun canlı maç bulunamadı</p>
          <p className="mt-1 text-xs text-slate-500">Birazdan tekrar kontrol ederek yeni yayınları görebilirsin</p>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800/80 text-3xl ring-1 ring-slate-600/50">
          ⚽
        </div>
        <p className="text-sm font-medium text-slate-300">Henüz maç yok</p>
        <p className="mt-1 text-xs text-slate-500">Yayın listesi güncellendiğinde burada görünür</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2 p-2">
      {matches.map((match) => (
        <li key={match.id}>
          <MatchCard
            match={match}
            isSelected={selectedMatch?.id === match.id}
            onMatchSelect={onMatchSelect}
            logoState={logoState}
            setLogoState={setLogoState}
            isFav={isFav}
            onToggleFav={onToggleFav}
            hasReminder={hasReminder}
            onToggleReminder={onToggleReminder}
          />
        </li>
      ))}
    </ul>
  );
};

function TeamRow({ name, logo, logoState, setLogoState, isFav, onToggleFav }) {
  const key = favKey('team', name);
  const fav = Boolean(name && isFav?.(key));
  return (
    <div className="flex items-center gap-2">
      {logo ? (
        <img src={logo} alt="" className="h-6 w-6 shrink-0 object-contain" />
      ) : name ? (
        <TeamLogo teamName={name} logoState={logoState} setLogoState={setLogoState} size="sm" />
      ) : (
        <span className="h-6 w-6 shrink-0 rounded-md bg-slate-700/50" />
      )}
      <span className={`truncate text-[13px] font-semibold ${fav ? 'text-amber-200' : 'text-slate-100'}`}>{name || '—'}</span>
      {name && onToggleFav ? (
        <button
          type="button"
          onClick={() => onToggleFav(key)}
          aria-pressed={fav}
          aria-label={fav ? `${name} favorilerden çıkar` : `${name} favorilere ekle`}
          title={fav ? 'Favorilerden çıkar' : 'Favorilere ekle'}
          className={`pointer-events-auto relative z-10 -m-1 shrink-0 rounded-md p-1 transition ${
            fav
              ? 'text-amber-400 hover:text-amber-300'
              : 'text-slate-600 hover:text-amber-300 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 focus-visible:opacity-100'
          }`}
        >
          <StarIcon filled={fav} />
        </button>
      ) : null}
    </div>
  );
}

function MatchCard({
  match,
  isSelected,
  onMatchSelect,
  logoState,
  setLogoState,
  isFav,
  onToggleFav,
  hasReminder,
  onToggleReminder,
}) {
  const teams = parseMatchTeams(match.name);
  const upcoming = isUpcoming(match.time);
  const reminded = Boolean(hasReminder?.(match.id));

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border transition-all duration-200 ${
        isSelected
          ? 'border-emerald-400/40 bg-gradient-to-r from-emerald-500/[0.16] to-emerald-500/[0.04] shadow-[0_8px_24px_-12px_rgba(16,185,129,0.45)]'
          : 'border-white/[0.06] bg-white/[0.025] hover:border-white/[0.12] hover:bg-white/[0.05]'
      }`}
    >
      {/* Kartın tamamı tıklanabilir; yıldız/zil butonları bunun üstünde durur. */}
      <button
        type="button"
        onClick={() => onMatchSelect(match)}
        aria-label={`${match.name} yayınını aç`}
        className="absolute inset-0 z-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 active:bg-white/[0.03]"
      />
      {isSelected ? (
        <span className="pointer-events-none absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-emerald-400" aria-hidden />
      ) : null}
      <div className="pointer-events-none relative px-3 py-2.5">
        <div className="mb-2 flex items-center gap-1.5">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {match.time ? (
              <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-emerald-300 ring-1 ring-emerald-500/20">
                {match.time}
              </span>
            ) : null}
            {match.league ? (
              <span className="truncate text-[10px] font-medium uppercase tracking-wide text-slate-500">
                {match.league}
              </span>
            ) : null}
            {match.special ? (
              <span className="rounded-md border border-amber-500/25 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-amber-400">
                ★ {match.special}
              </span>
            ) : null}
          </div>
          {upcoming && onToggleReminder ? (
            <button
              type="button"
              onClick={() => onToggleReminder(match)}
              aria-pressed={reminded}
              title={reminded ? 'Hatırlatıcıyı kaldır' : 'Başlamadan 5 dk önce haber ver'}
              className={`pointer-events-auto relative z-10 -my-1 inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold transition ${
                reminded
                  ? 'bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/30'
                  : 'text-slate-500 hover:bg-white/[0.06] hover:text-sky-300'
              }`}
            >
              <BellIcon active={reminded} />
              <span className="hidden min-[400px]:inline">{reminded ? 'Hatırlatılacak' : 'Hatırlat'}</span>
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <TeamRow name={teams[0]} logo={match.homeLogo} logoState={logoState} setLogoState={setLogoState} isFav={isFav} onToggleFav={onToggleFav} />
            <TeamRow name={teams[1]} logo={match.awayLogo} logoState={logoState} setLogoState={setLogoState} isFav={isFav} onToggleFav={onToggleFav} />
          </div>

          <div className="flex shrink-0 flex-col items-center gap-1 pl-1">
            <span className="rounded-md bg-white/[0.05] px-2 py-0.5 text-[9px] font-bold text-slate-500">VS</span>
            {isSelected ? (
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
            ) : (
              <span className="h-2 w-2 rounded-full bg-slate-600/50 opacity-0 transition-opacity group-hover:opacity-100" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MatchList;
