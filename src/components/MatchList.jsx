import TeamLogo from './TeamLogo';
import { parseMatchTeams } from '../utils/teamUtils';

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
          <p className="text-sm font-medium text-slate-300">Oynatıcıda açılan yayın yok</p>
          <p className="mt-1 text-xs text-slate-500">
            Sadece uygulama içi oynatıcıda (HLS) açılanlar listelenir; tarayıcıda açılan / iframe yolu kalan maçlar
            burada gösterilmez.
          </p>
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
      {matches.map((match) => {
        const teams = parseMatchTeams(match.name);
        const isSelected = selectedMatch?.id === match.id;
        return (
          <li key={match.id}>
            <button
              type="button"
              onClick={() => onMatchSelect(match)}
              className={`group w-full rounded-xl border text-left transition-all duration-200 ${
                isSelected
                  ? 'border-green-500/50 bg-green-500/[0.12] shadow-[0_0_0_1px_rgba(34,197,94,0.2)] ring-1 ring-green-500/20'
                  : 'border-slate-600/30 bg-slate-800/40 hover:border-slate-500/40 hover:bg-slate-700/35'
              }`}
            >
              <div className="px-3 py-2.5">
                <div className="mb-2 flex flex-wrap items-center gap-1.5">
                  {match.time ? (
                    <span className="rounded-md bg-slate-900/60 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-green-400">
                      {match.time}
                    </span>
                  ) : null}
                  {match.league ? (
                    <span className="truncate text-[10px] font-medium uppercase tracking-wide text-slate-500">
                      {match.league}
                    </span>
                  ) : null}
                  {match.category ? (
                    <span className="rounded-md bg-slate-700/50 px-1.5 py-0.5 text-[9px] text-slate-400">{match.category}</span>
                  ) : null}
                  {match.special ? (
                    <span className="rounded-md border border-amber-500/25 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-amber-400">
                      ★ {match.special}
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      {match.homeLogo ? (
                        <img src={match.homeLogo} alt="" className="h-6 w-6 shrink-0 object-contain" />
                      ) : teams[0] ? (
                        <TeamLogo teamName={teams[0]} logoState={logoState} setLogoState={setLogoState} size="sm" />
                      ) : (
                        <span className="h-6 w-6 shrink-0 rounded-md bg-slate-700/50" />
                      )}
                      <span className="truncate text-[13px] font-semibold text-slate-100">{teams[0] || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {match.awayLogo ? (
                        <img src={match.awayLogo} alt="" className="h-6 w-6 shrink-0 object-contain" />
                      ) : teams[1] ? (
                        <TeamLogo teamName={teams[1]} logoState={logoState} setLogoState={setLogoState} size="sm" />
                      ) : (
                        <span className="h-6 w-6 shrink-0 rounded-md bg-slate-700/50" />
                      )}
                      <span className="truncate text-[13px] font-semibold text-slate-100">{teams[1] || '—'}</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-center gap-1 pl-1">
                    <span className="rounded-md bg-slate-900/50 px-2 py-0.5 text-[9px] font-bold text-slate-500">VS</span>
                    {isSelected ? (
                      <span className="flex h-2 w-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.7)]" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-slate-600/50 opacity-0 transition-opacity group-hover:opacity-100" />
                    )}
                  </div>
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
};

export default MatchList;
