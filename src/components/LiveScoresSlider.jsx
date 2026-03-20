import { useMemo, useState, useCallback } from 'react';
import { useLiveScores } from '../hooks/useLiveScores';
import { useLeagueTable } from '../hooks/useLeagueTable';

const STANDINGS_LEAGUES = [
  { id: '4328', label: 'Premier League' },
  { id: '4335', label: 'La Liga' },
  { id: '4332', label: 'Serie A' },
  { id: '4331', label: 'Bundesliga' },
  { id: '4334', label: 'Ligue 1' },
];

/** Maçkolik / Flashscore tarzı palet */
const skin = {
  page: 'bg-[#061525] text-[#e8eef5]',
  panel: 'bg-[#0a1f35] border border-[#1a3555]',
  tabInactive: 'border border-[#2d5a8a] text-[#8eb4d9] bg-[#0c2740]',
  tabActive: 'bg-[#c41e1e] text-white border border-[#e02828] shadow-[0_0_12px_rgba(196,30,30,0.35)]',
  leagueBar: 'bg-[#123a5c] border-b border-[#1e4a72]',
  row: 'border-b border-[#142d4a] hover:bg-[#0f2844]',
  rowLive: 'bg-[#1a1520]/40',
};

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

function IconTv({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="5" width="16" height="11" rx="2" />
      <path d="M8 21h8M12 16v5" strokeLinecap="round" />
    </svg>
  );
}

function IconJersey({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M8 4h8l2 3v4l-2 1v9H8v-9l-2-1V7l2-3z" strokeLinejoin="round" />
      <path d="M9 8h6" strokeLinecap="round" />
    </svg>
  );
}

function IconStar({ filled, className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6">
      <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6L12 2z" />
    </svg>
  );
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

function IconPin({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
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

/** Maçkolik tarzı: sol saat, ortada üst-alt takım + logo, ortada dikey skor */
function MatchRowMackolik({ m }) {
  const timeOrLive = m.isLive
    ? (() => {
        const t = m.statusText || '';
        const digits = t.match(/\d+/);
        return digits ? digits[0] : '•';
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
      className={`flex items-stretch gap-1 px-1.5 py-1 text-[11px] leading-tight ${skin.row} ${m.isLive ? skin.rowLive : ''}`}
    >
      <div className="flex w-7 shrink-0 flex-col items-center justify-center gap-0.5 border-r border-[#142d4a]/80 pr-1">
        <button type="button" className="text-[#4a6d8f] hover:text-[#8eb4d9]" aria-label="Favori">
          <IconStar filled={false} className="h-3 w-3" />
        </button>
        <span
          className={`text-center font-bold tabular-nums ${
            m.isLive ? 'text-[#ff3b3b]' : 'text-[#7a9bb8]'
          }`}
        >
          {timeOrLive}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 py-0.5">
        <div className="flex items-center gap-1.5">
          {m.homeCrest ? (
            <img src={m.homeCrest} alt="" className="h-4 w-4 shrink-0 object-contain" />
          ) : (
            <span className="h-4 w-4 shrink-0 rounded-sm bg-[#1a3555]" />
          )}
          <span className="truncate font-semibold text-[#e8eef5]">{m.homeName}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {m.awayCrest ? (
            <img src={m.awayCrest} alt="" className="h-4 w-4 shrink-0 object-contain" />
          ) : (
            <span className="h-4 w-4 shrink-0 rounded-sm bg-[#1a3555]" />
          )}
          <span className="truncate font-semibold text-[#e8eef5]">{m.awayName}</span>
        </div>
      </div>

      <div className="flex w-8 shrink-0 flex-col items-center justify-center gap-0 font-bold tabular-nums">
        {showScores ? (
          <>
            <span className={m.isLive ? 'text-[#ff3b3b]' : 'text-[#b8c9d9]'}>{hs ?? '–'}</span>
            <span className={m.isLive ? 'text-[#ff3b3b]' : 'text-[#b8c9d9]'}>{as ?? '–'}</span>
          </>
        ) : (
          <>
            <span className="text-[#4a6d8f]">-</span>
            <span className="text-[#4a6d8f]">-</span>
          </>
        )}
      </div>

      <div className="flex w-12 shrink-0 items-center justify-end gap-1 pr-0.5 text-[#4a6d8f]">
        <IconTv className="h-3.5 w-3.5" />
        <IconJersey className="h-3.5 w-3.5" />
      </div>
    </div>
  );
}

function LeagueSection({
  league,
  rows,
  open,
  onToggle,
  onStandings,
  hasStandings,
}) {
  const meta = LEAGUE_META[league] || { country: '', flag: '⚽' };

  return (
    <div className={`mb-1.5 overflow-hidden rounded-md ${skin.panel}`}>
      <div className={`flex items-center gap-1.5 px-2 py-1.5 ${skin.leagueBar}`}>
        <button type="button" className="text-[#6b8fb0] hover:text-[#a8c8e6]" aria-label="Favori lig">
          <IconStar filled={false} className="h-3.5 w-3.5" />
        </button>
        <span className="text-sm leading-none" title={meta.country}>
          {meta.flag}
        </span>
        <span className="min-w-0 flex-1 truncate text-[11px] font-bold uppercase tracking-wide text-[#d4e6f7]">
          {meta.country ? `${meta.country}: ` : ''}
          {league}
        </span>
        <IconPin className="h-3 w-3 shrink-0 text-[#3d7ab8]" />
        {hasStandings ? (
          <button
            type="button"
            onClick={() => onStandings(league)}
            className="shrink-0 text-[10px] font-semibold text-[#5eb3ff] hover:underline"
          >
            Puan Durumu
          </button>
        ) : (
          <span className="shrink-0 text-[10px] text-[#5a7a9a]">—</span>
        )}
        <button type="button" onClick={onToggle} className="shrink-0 text-[#8eb4d9] hover:text-white" aria-expanded={open}>
          <IconChevron open={open} className="h-4 w-4" />
        </button>
      </div>
      {open ? (
        <div className="bg-[#081c30]">{rows.map((m) => (
          <MatchRowMackolik key={m.id} m={m} />
        ))}</div>
      ) : null}
    </div>
  );
}

function StandingsHeader() {
  return (
    <div className="flex items-center gap-2 border-b border-[#1a3555] bg-[#061525] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#6b8fb0]">
      <div className="w-10 shrink-0 text-left">Rk</div>
      <div className="min-w-0 flex-1 text-left">Takım</div>
      <div className="w-12 text-center">O</div>
      <div className="w-12 text-center">G</div>
      <div className="w-12 text-center">B</div>
      <div className="w-12 text-center">M</div>
      <div className="w-12 text-center">AG</div>
      <div className="w-12 text-center">Pts</div>
    </div>
  );
}

function StandingsRow({ row, index }) {
  const rank = row?.intRank ?? index + 1;
  const teamName = row?.strTeam ?? '—';
  const badge = row?.strBadge ?? '';
  const top = rank === 1 ? 'bg-[#c41e1e]/10' : '';

  return (
    <div className={`flex items-center gap-2 border-b border-[#142d4a] px-3 py-1.5 text-[11px] ${top}`}>
      <div className="w-10 shrink-0 tabular-nums text-[#8eb4d9]">{rank}</div>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {badge ? (
          <img src={badge} alt="" className="h-4 w-4 shrink-0 rounded-sm object-contain ring-1 ring-[#1a3555]" />
        ) : (
          <span className="h-4 w-4 shrink-0 rounded-sm bg-[#1a3555]" />
        )}
        <span className="truncate font-medium text-[#e8eef5]">{teamName}</span>
      </div>
      <div className="w-12 text-center tabular-nums text-[#8eb4d9]">{row?.intPlayed ?? '–'}</div>
      <div className="w-12 text-center tabular-nums text-[#8eb4d9]">{row?.intWin ?? '–'}</div>
      <div className="w-12 text-center tabular-nums text-[#8eb4d9]">{row?.intDraw ?? '–'}</div>
      <div className="w-12 text-center tabular-nums text-[#8eb4d9]">{row?.intLoss ?? '–'}</div>
      <div className="w-12 text-center tabular-nums text-[#8eb4d9]">{row?.intGoalDifference ?? '–'}</div>
      <div className="w-12 text-center tabular-nums font-bold text-white">{row?.intPoints ?? '–'}</div>
    </div>
  );
}

export default function LiveScoresSlider() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedDate, setSelectedDate] = useState(toInputDate(new Date()));
  const [standingsLeagueId, setStandingsLeagueId] = useState(STANDINGS_LEAGUES[0].id);
  const [leagueOpen, setLeagueOpen] = useState({});

  const { table: standings, loading: standingsLoading, season: standingsSeason } = useLeagueTable(standingsLeagueId, {
    enabled: activeTab === 'standings',
  });
  const { scores, loading } = useLiveScores(selectedDate, {
    enabled: activeTab !== 'standings' && activeTab !== 'odds',
  });

  const todayKey = toInputDate(new Date());
  const tomorrowKey = addDaysToIso(todayKey, 1);

  const filteredScores = useMemo(() => {
    if (activeTab === 'standings' || activeTab === 'odds') return [];

    if (activeTab === 'live') {
      return scores.filter((m) => m.isLive);
    }
    if (activeTab === 'finished') {
      return scores.filter((m) => matchDateKey(m.matchDate) === selectedDate && m.isFinished);
    }
    if (activeTab === 'programs') {
      return scores.filter(
        (m) => matchDateKey(m.matchDate) === selectedDate && !m.isLive && !m.isFinished
      );
    }
    if (activeTab === 'today') {
      return scores.filter((m) => matchDateKey(m.matchDate) === todayKey);
    }
    if (activeTab === 'tomorrow') {
      return scores.filter((m) => matchDateKey(m.matchDate) === tomorrowKey);
    }
    if (activeTab === 'selected') {
      return scores.filter((m) => matchDateKey(m.matchDate) === selectedDate);
    }
    // TÜMÜ: seçili günün tüm maçları
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
    const el = document.getElementById('mackolik-date-input');
    el?.showPicker?.();
    el?.click?.();
  };

  const matchTabs = [
    { id: 'all', label: 'TÜMÜ' },
    { id: 'live', label: 'CANLI' },
    { id: 'odds', label: 'ORANLAR' },
    { id: 'finished', label: 'BİTMİŞ' },
    { id: 'programs', label: 'PROGRAMLAR' },
    { id: 'standings', label: 'PUAN' },
  ];

  if (activeTab !== 'standings' && activeTab !== 'odds' && loading && scores.length === 0) {
    return (
      <div className={`border-t border-[#1a3555] py-3 ${skin.page}`}>
        <div className="mx-auto max-w-7xl px-3">
          <div className={`flex items-center gap-3 rounded-md px-4 py-3 ${skin.panel}`}>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c41e1e]/60" />
              <span className="relative h-2 w-2 rounded-full bg-[#c41e1e]" />
            </span>
            <span className="text-sm font-medium text-[#8eb4d9]">Maçlar yükleniyor…</span>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab !== 'standings' && activeTab !== 'odds' && scores.length === 0) {
    return (
      <div className={`border-t border-[#1a3555] py-3 ${skin.page}`}>
        <div className="mx-auto max-w-7xl px-3">
          <p className={`rounded-md px-4 py-3 text-sm text-[#6b8fb0] ${skin.panel}`}>Şu an listelenecek maç yok.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`border-t border-[#1a3555] py-3 ${skin.page}`}>
      <div className="mx-auto max-w-7xl px-3">
        {/* Üst bar: sekmeler + tarih */}
        <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            {matchTabs.map((tab) => {
              const isOdds = tab.id === 'odds';
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  disabled={isOdds}
                  onClick={() => !isOdds && setActiveTab(tab.id)}
                  title={isOdds ? 'Yakında' : undefined}
                  className={`rounded px-2.5 py-1 text-[10px] font-bold tracking-wide transition ${
                    isOdds
                      ? 'cursor-not-allowed border border-[#1a3555] bg-[#081c30] text-[#3d5a78]'
                      : active
                        ? skin.tabActive
                        : skin.tabInactive + ' hover:bg-[#123a5c]/80'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setSelectedDate((d) => addDaysToIso(d, -1));
                setActiveTab('all');
              }}
              className="rounded border border-[#2d5a8a] bg-[#0c2740] px-2 py-1 text-[#8eb4d9] hover:bg-[#123a5c]"
              aria-label="Önceki gün"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={openCalendar}
              className={`flex items-center gap-2 rounded border border-[#2d5a8a] bg-[#0c2740] px-3 py-1 hover:bg-[#123a5c]`}
            >
              <span className="text-center">
                <span className="block text-[12px] font-bold leading-tight text-white">
                  {dateLabel.primary}{' '}
                  <span className="text-[10px] font-semibold text-[#8eb4d9]">{dateLabel.weekday}</span>
                </span>
              </span>
              <IconCalendar className="h-4 w-4 shrink-0 text-[#6b8fb0]" />
            </button>
            <input
              id="mackolik-date-input"
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
              className="rounded border border-[#2d5a8a] bg-[#0c2740] px-2 py-1 text-[#8eb4d9] hover:bg-[#123a5c]"
              aria-label="Sonraki gün"
            >
              ›
            </button>
          </div>
        </div>

        {activeTab === 'odds' ? (
          <div className={`rounded-md border border-[#1a3555] px-4 py-8 text-center ${skin.panel}`}>
            <p className="text-sm font-semibold text-[#8eb4d9]">ORANLAR</p>
            <p className="mt-1 text-xs text-[#5a7a9a]">Bahis oranları entegrasyonu yakında eklenecek.</p>
          </div>
        ) : null}

        {activeTab === 'standings' ? (
          <div
            className={`max-h-[min(60vh,520px)] overflow-y-auto overflow-x-hidden rounded-md ${skin.panel} p-2`}
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-[#d4e6f7]">
                {STANDINGS_LEAGUES.find((l) => l.id === standingsLeagueId)?.label || 'Lig'} · {standingsSeason || '—'}
              </span>
              <select
                value={standingsLeagueId}
                onChange={(e) => setStandingsLeagueId(e.target.value)}
                className="rounded border border-[#2d5a8a] bg-[#0c2740] px-2 py-1 text-[11px] text-[#e8eef5] outline-none focus:border-[#c41e1e]"
              >
                {STANDINGS_LEAGUES.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
            {standingsLoading ? (
              <p className="py-6 text-center text-[11px] text-[#6b8fb0]">Puan tablosu yükleniyor…</p>
            ) : standings.length === 0 ? (
              <p className="py-6 text-center text-[11px] text-[#6b8fb0]">Tablo bulunamadı.</p>
            ) : (
              <div className="overflow-hidden rounded border border-[#1a3555] bg-[#081c30]">
                <StandingsHeader />
                {standings.slice(0, 20).map((row, i) => (
                  <StandingsRow key={row?.idStanding || row?.idTeam || i} row={row} index={i} />
                ))}
              </div>
            )}
          </div>
        ) : null}

        {activeTab !== 'standings' && activeTab !== 'odds' ? (
          filteredScores.length === 0 ? (
            <div className={`rounded-md px-4 py-8 text-center ${skin.panel}`}>
              <p className="text-sm text-[#8eb4d9]">Bu görünümde maç yok</p>
              <p className="mt-1 text-xs text-[#5a7a9a]">Tarihi değiştir veya CANLI sekmesine geç.</p>
            </div>
          ) : (
            <div
              className={`max-h-[min(58vh,520px)] overflow-y-auto overflow-x-hidden rounded-md ${skin.panel} p-1.5`}
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
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
          )
        ) : null}
      </div>
    </div>
  );
}
