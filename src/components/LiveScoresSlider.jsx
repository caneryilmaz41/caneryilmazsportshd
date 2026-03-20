import { useMemo, useState, useCallback, useId } from 'react';
import { useLiveScores } from '../hooks/useLiveScores';
import { useLeagueTable } from '../hooks/useLeagueTable';

const STANDINGS_LEAGUES = [
  { id: '4339', label: 'Süper Lig' },
  { id: '4328', label: 'Premier League' },
  { id: '4335', label: 'La Liga' },
  { id: '4332', label: 'Serie A' },
  { id: '4331', label: 'Bundesliga' },
  { id: '4334', label: 'Ligue 1' },
];

const LEAGUE_META = {
  'Premier League': { country: 'İNGİLTERE', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  LaLiga: { country: 'İSPANYA', flag: '🇪🇸' },
  'La Liga': { country: 'İSPANYA', flag: '🇪🇸' },
  'Serie A': { country: 'İTALYA', flag: '🇮🇹' },
  Bundesliga: { country: 'ALMANYA', flag: '🇩🇪' },
  'Ligue 1': { country: 'FRANSA', flag: '🇫🇷' },
  UCL: { country: 'AVRUPA', flag: '⭐' },
};

const LEAGUE_TO_STANDINGS_ID = {
  'Süper Lig': '4339',
  'Premier League': '4328',
  LaLiga: '4335',
  'La Liga': '4335',
  'Serie A': '4332',
  Bundesliga: '4331',
  'Ligue 1': '4334',
  UCL: null,
};

function toInputDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDaysToIso(iso, delta) {
  const [y, mo, da] = iso.split('-').map(Number);
  const dt = new Date(y, mo - 1, da);
  dt.setDate(dt.getDate() + delta);
  return toInputDate(dt);
}

function matchDateKey(matchDate) {
  if (!matchDate) return '';
  const d = new Date(matchDate);
  if (Number.isNaN(d.getTime())) return '';
  return toInputDate(d);
}

function formatDisplayDate(iso) {
  const [y, mo, da] = iso.split('-').map(Number);
  const dt = new Date(y, mo - 1, da);
  const dd = String(da).padStart(2, '0');
  const mm = String(mo).padStart(2, '0');
  const wd = dt.toLocaleDateString('tr-TR', { weekday: 'short' }).replace('.', '').toUpperCase();
  return { primary: `${dd}/${mm}`, weekday: wd };
}

function groupByLeague(matches) {
  const map = new Map();
  for (const m of matches) {
    const key = m.league || 'Diğer';
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(m);
  }
  return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0], 'tr'));
}

function IconChevron({ open, className }) {
  return (
    <svg
      className={`${className} transition-transform ${open ? 'rotate-180' : ''}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCalendar({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  );
}

function MatchRow({ m }) {
  const timeOrLive = m.isLive
    ? (() => {
        const t = m.statusText || '';
        const digits = t.match(/\d+/);
        return digits ? `${digits[0]}'` : '•';
      })()
    : m.isFinished
      ? 'MS'
      : m.matchDate
        ? new Date(m.matchDate).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        : '–';

  const showScores = m.isLive || m.isFinished;
  const hs = m.homeScore ?? null;
  const as = m.awayScore ?? null;

  return (
    <div
      className={`flex items-stretch gap-0.5 border-b border-slate-600/35 px-1 py-1 text-[10px] leading-tight hover:bg-slate-700/25 min-[400px]:gap-1 min-[400px]:px-1.5 min-[400px]:text-[11px] ${
        m.isLive ? 'bg-red-950/15' : ''
      }`}
    >
      <div className="flex w-8 shrink-0 flex-col items-center justify-center border-r border-slate-600/30 pr-1">
        <span
          className={`text-center text-[10px] font-bold tabular-nums ${
            m.isLive ? 'text-red-400' : 'text-slate-500'
          }`}
        >
          {timeOrLive}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 py-0.5">
        <div className="flex items-center gap-1.5">
          {m.homeCrest ? (
            <img src={m.homeCrest} alt="" className="h-3.5 w-3.5 shrink-0 object-contain" />
          ) : (
            <span className="h-3.5 w-3.5 shrink-0 rounded-sm bg-slate-600/50" />
          )}
          <span className="truncate font-medium text-slate-100">{m.homeName}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {m.awayCrest ? (
            <img src={m.awayCrest} alt="" className="h-3.5 w-3.5 shrink-0 object-contain" />
          ) : (
            <span className="h-3.5 w-3.5 shrink-0 rounded-sm bg-slate-600/50" />
          )}
          <span className="truncate font-medium text-slate-100">{m.awayName}</span>
        </div>
      </div>

      <div className="flex w-7 shrink-0 flex-col items-center justify-center gap-0 text-[11px] font-bold tabular-nums">
        {showScores ? (
          <>
            <span className={m.isLive ? 'text-red-400' : 'text-slate-300'}>{hs ?? '–'}</span>
            <span className={m.isLive ? 'text-red-400' : 'text-slate-300'}>{as ?? '–'}</span>
          </>
        ) : (
          <>
            <span className="text-slate-600">–</span>
            <span className="text-slate-600">–</span>
          </>
        )}
      </div>
    </div>
  );
}

function LeagueSection({ league, rows, open, onToggle, onStandings, hasStandings }) {
  const meta = LEAGUE_META[league] || { country: '', flag: '⚽' };

  return (
    <div className="mb-1.5 overflow-hidden rounded-lg border border-slate-600/40 bg-slate-800/40">
      <div className="flex items-center gap-1.5 border-b border-slate-600/50 bg-slate-700/35 px-2 py-1.5">
        <span className="text-sm leading-none">{meta.flag}</span>
        <span className="min-w-0 flex-1 truncate text-[10px] font-bold uppercase tracking-wide text-slate-200">
          {meta.country ? `${meta.country} · ` : ''}
          {league}
        </span>
        {hasStandings ? (
          <button
            type="button"
            onClick={() => onStandings(league)}
            className="shrink-0 text-[9px] font-semibold text-green-400 hover:underline"
          >
            Puan
          </button>
        ) : null}
        <button
          type="button"
          onClick={onToggle}
          className="shrink-0 text-slate-400 hover:text-white"
          aria-expanded={open}
        >
          <IconChevron open={open} className="h-4 w-4" />
        </button>
      </div>
      {open ? (
        <div className="bg-slate-900/30">
          {rows.map((m) => (
            <MatchRow key={m.id} m={m} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function StandingsHeader() {
  return (
    <div className="flex items-center gap-0.5 border-b border-slate-600/50 bg-slate-900/50 px-1.5 py-1 text-[8px] font-semibold uppercase tracking-wide text-slate-500 min-[400px]:gap-1 min-[400px]:px-2 min-[400px]:text-[9px]">
      <div className="w-5 shrink-0 min-[400px]:w-7">#</div>
      <div className="min-w-0 flex-1">Takım</div>
      <div className="w-5 text-center min-[400px]:w-6">O</div>
      <div className="w-5 text-center min-[400px]:w-7">Av</div>
      <div className="w-5 text-center min-[400px]:w-7">P</div>
    </div>
  );
}

function StandingsRow({ row, index }) {
  const rank = row?.intRank ?? index + 1;
  const partial = row?.intPoints === '–' || row?.intPoints === '' || row?.intPoints == null;
  return (
    <div
      className={`flex items-center gap-0.5 border-b border-slate-600/30 px-1.5 py-1 text-[9px] min-[400px]:gap-1 min-[400px]:px-2 min-[400px]:text-[10px] ${
        partial ? 'opacity-75' : ''
      }`}
    >
      <div className="w-5 shrink-0 tabular-nums text-slate-500 min-[400px]:w-7">{rank}</div>
      <div className="flex min-w-0 flex-1 items-center gap-1">
        {row?.strBadge ? (
          <img src={row.strBadge} alt="" className="h-3 w-3 shrink-0 rounded-sm object-contain min-[400px]:h-3.5 min-[400px]:w-3.5" />
        ) : null}
        <span className="truncate text-slate-100">{row?.strTeam ?? '—'}</span>
      </div>
      <div className="w-5 text-center tabular-nums text-slate-400 min-[400px]:w-6">{row?.intPlayed ?? '–'}</div>
      <div className="w-5 text-center tabular-nums text-slate-400 min-[400px]:w-7">{row?.intGoalDifference ?? '–'}</div>
      <div
        className={`w-5 text-center tabular-nums font-bold min-[400px]:w-7 ${
          partial ? 'text-slate-500' : 'text-green-400'
        }`}
      >
        {row?.intPoints ?? '–'}
      </div>
    </div>
  );
}

/**
 * @param {{ variant?: 'footer' | 'sidebar' }} props
 */
export default function LiveScoresSlider({ variant = 'footer' }) {
  const isSidebar = variant === 'sidebar';
  const dateInputId = useId();

  const [activeTab, setActiveTab] = useState('all');
  const [selectedDate, setSelectedDate] = useState(toInputDate(new Date()));
  const [standingsLeagueId, setStandingsLeagueId] = useState(STANDINGS_LEAGUES[0].id);
  const [leagueOpen, setLeagueOpen] = useState({});

  const { table: standings, loading: standingsLoading, season: standingsSeason } = useLeagueTable(standingsLeagueId, {
    enabled: activeTab === 'standings',
  });
  const { scores, loading } = useLiveScores(selectedDate, {
    enabled: activeTab !== 'standings',
  });

  const todayKey = toInputDate(new Date());
  const tomorrowKey = addDaysToIso(todayKey, 1);

  const filteredScores = useMemo(() => {
    if (activeTab === 'standings') return [];

    if (activeTab === 'live') return scores.filter((m) => m.isLive);
    if (activeTab === 'finished') {
      return scores.filter((m) => matchDateKey(m.matchDate) === selectedDate && m.isFinished);
    }
    if (activeTab === 'programs') {
      return scores.filter(
        (m) => matchDateKey(m.matchDate) === selectedDate && !m.isLive && !m.isFinished
      );
    }
    if (activeTab === 'today') return scores.filter((m) => matchDateKey(m.matchDate) === todayKey);
    if (activeTab === 'tomorrow') return scores.filter((m) => matchDateKey(m.matchDate) === tomorrowKey);
    if (activeTab === 'selected') return scores.filter((m) => matchDateKey(m.matchDate) === selectedDate);
    return scores.filter((m) => matchDateKey(m.matchDate) === selectedDate);
  }, [activeTab, scores, selectedDate, todayKey, tomorrowKey]);

  const byLeague = useMemo(() => groupByLeague(filteredScores), [filteredScores]);

  const toggleLeague = useCallback((name) => {
    setLeagueOpen((prev) => {
      const isOpen = prev[name] !== false;
      return { ...prev, [name]: !isOpen };
    });
  }, []);

  const goToStandings = useCallback((leagueName) => {
    const id = LEAGUE_TO_STANDINGS_ID[leagueName];
    if (id) {
      setStandingsLeagueId(id);
      setActiveTab('standings');
    }
  }, []);

  const dateLabel = formatDisplayDate(selectedDate);
  const openCalendar = () => {
    const el = document.getElementById(dateInputId);
    el?.showPicker?.();
    el?.click?.();
  };

  const matchTabs = [
    { id: 'all', label: 'Tümü' },
    { id: 'live', label: 'Canlı' },
    { id: 'finished', label: 'Biten' },
    { id: 'programs', label: 'Program' },
    { id: 'standings', label: 'Puan' },
  ];

  const shell = isSidebar
    ? 'flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-600/50 bg-slate-800/90 shadow-lg'
    : 'border-t border-slate-700/60 bg-slate-900/95 py-3';

  const inner = isSidebar ? 'flex min-h-0 w-full min-w-0 flex-1 flex-col px-2 pb-2 pt-2 sm:px-3' : 'mx-auto max-w-7xl px-3';

  const scrollMax = isSidebar
    ? 'max-h-[min(42dvh,360px)] min-h-[200px] sm:max-h-[min(48dvh,420px)] lg:max-h-[min(70dvh,560px)] xl:max-h-[calc(100vh-7.5rem)]'
    : 'max-h-[min(58vh,520px)] sm:max-h-[min(65vh,600px)]';

  const showScoresLoading = activeTab !== 'standings' && loading && scores.length === 0;
  const showScoresEmpty = activeTab !== 'standings' && !loading && scores.length === 0;

  return (
    <div className={shell}>
      <div className={inner}>
        <div className="mb-2 shrink-0 border-b border-slate-600/40 pb-2">
          <div className="mb-2 flex flex-col gap-2 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-300">Skorlar</h3>
            <div className="flex flex-wrap items-center gap-0.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedDate((d) => addDaysToIso(d, -1));
                  setActiveTab('all');
                }}
                className="rounded-md border border-slate-600/60 bg-slate-700/50 px-1.5 py-0.5 text-slate-300 hover:bg-slate-600/50"
                aria-label="Önceki gün"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={openCalendar}
                className="flex items-center gap-1 rounded-md border border-slate-600/60 bg-slate-700/40 px-2 py-0.5 hover:bg-slate-700/60"
              >
                <span className="text-[11px] font-semibold text-white">
                  {dateLabel.primary}{' '}
                  <span className="text-[10px] font-normal text-slate-400">{dateLabel.weekday}</span>
                </span>
                <IconCalendar className="h-3.5 w-3.5 text-slate-400" />
              </button>
              <input
                id={dateInputId}
                type="date"
                value={selectedDate}
                className="sr-only"
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setActiveTab('all');
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setSelectedDate((d) => addDaysToIso(d, 1));
                  setActiveTab('all');
                }}
                className="rounded-md border border-slate-600/60 bg-slate-700/50 px-1.5 py-0.5 text-slate-300 hover:bg-slate-600/50"
                aria-label="Sonraki gün"
              >
                ›
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 sm:gap-1.5">
            {matchTabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-md px-2 py-0.5 text-[10px] font-semibold transition ${
                    active
                      ? 'bg-green-600 text-white shadow-sm'
                      : 'bg-slate-700/40 text-slate-400 hover:bg-slate-700/70 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div
          className={`stream-panel-scroll min-h-0 w-full min-w-0 flex-1 overflow-y-auto overflow-x-hidden ${scrollMax}`}
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {showScoresLoading ? (
            <div className="flex items-center gap-2 rounded-lg border border-slate-600/50 bg-slate-800/60 px-3 py-4">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              <span className="text-xs text-slate-400">Skorlar yükleniyor…</span>
            </div>
          ) : showScoresEmpty ? (
            <p className="rounded-lg border border-slate-600/40 bg-slate-800/50 px-3 py-3 text-center text-xs text-slate-500">
              Maç verisi yok. Tarih değiştir veya daha sonra tekrar dene.
            </p>
          ) : activeTab === 'standings' ? (
            <div className="min-w-0 space-y-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="min-w-0 truncate text-[10px] font-semibold text-slate-300">
                  {STANDINGS_LEAGUES.find((l) => l.id === standingsLeagueId)?.label || 'Lig'} · {standingsSeason || '—'}
                </span>
                <select
                  value={standingsLeagueId}
                  onChange={(e) => setStandingsLeagueId(e.target.value)}
                  className="w-full rounded-md border border-slate-600/60 bg-slate-900/60 px-2 py-1 text-[10px] text-slate-200 outline-none focus:border-green-500/50 sm:w-auto sm:min-w-[140px] sm:max-w-[200px]"
                >
                  {STANDINGS_LEAGUES.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
              {standingsLoading ? (
                <p className="py-4 text-center text-[10px] text-slate-500">Puan tablosu yükleniyor…</p>
              ) : standings.length === 0 ? (
                <p className="py-4 text-center text-[10px] text-slate-500">Tablo bulunamadı.</p>
              ) : (
                <div className="min-w-0 overflow-x-auto rounded-lg border border-slate-600/40">
                  <div className="min-w-[260px]">
                    <StandingsHeader />
                    {standings.map((row, i) => (
                      <StandingsRow key={row?.idStanding || row?.idTeam || row?.strTeam || i} row={row} index={i} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : filteredScores.length === 0 ? (
            <div className="rounded-lg border border-slate-600/40 px-3 py-6 text-center">
              <p className="text-xs text-slate-400">Bu görünümde maç yok</p>
            </div>
          ) : (
            <div className="pr-0.5">
              {byLeague.map(([league, rows]) => (
                <LeagueSection
                  key={league}
                  league={league}
                  rows={rows}
                  open={leagueOpen[league] !== false}
                  onToggle={() => toggleLeague(league)}
                  onStandings={goToStandings}
                  hasStandings={Boolean(LEAGUE_TO_STANDINGS_ID[league])}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
