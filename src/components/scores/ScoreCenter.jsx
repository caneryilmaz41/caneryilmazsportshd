import { useMemo, useState, useId } from 'react';
import { useScoresDay } from '../../hooks/useScoresDay';
import { toIsoDate } from '../../services/scoresApi';
import { normalizeTeam, sameFixture } from '../../utils/scoreMatch';
import { parseMatchTeams } from '../../utils/teamUtils';
import { StarIcon } from '../icons';
import { statusCell, winner, dayLabel, shiftIso } from './scoreFormat';
import MatchDetailSheet from './MatchDetailSheet';
import Standings from './Standings';

const FILTERS = [
  { id: 'all', label: 'Tümü' },
  { id: 'live', label: 'Canlı' },
  { id: 'fav', label: 'Favorilerim' },
  { id: 'upcoming', label: 'Başlamayan' },
  { id: 'finished', label: 'Biten' },
  { id: 'standings', label: 'Puan' },
];

function Crest({ src }) {
  if (!src) return <span className="h-4 w-4 shrink-0 rounded-full bg-white/[0.08]" />;
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      className="h-4 w-4 shrink-0 object-contain"
      onError={(e) => {
        e.currentTarget.style.visibility = 'hidden';
      }}
    />
  );
}

function MatchRow({ m, fav, canWatch, onOpen, onWatch }) {
  const st = statusCell(m);
  const w = winner(m);
  const live = m.isLive;
  return (
    <div
      className={`group relative flex items-stretch border-b border-white/[0.04] last:border-b-0 ${
        live ? 'bg-red-500/[0.06]' : 'hover:bg-white/[0.03]'
      }`}
    >
      {live ? <span className="absolute inset-y-0 left-0 w-[2px] bg-red-500" aria-hidden /> : null}
      <button
        type="button"
        onClick={() => onOpen(m)}
        className="flex min-w-0 flex-1 items-stretch gap-2 py-1.5 pl-2 pr-1 text-left focus:outline-none focus-visible:bg-white/[0.06]"
        aria-label={`${m.homeName} - ${m.awayName} maç detayı`}
      >
        <span
          className={`flex w-9 shrink-0 items-center justify-center text-[11px] font-bold tabular-nums ${
            st.tone === 'live' ? 'text-red-400' : st.tone === 'done' ? 'text-slate-500' : st.tone === 'muted' ? 'text-amber-400/80' : 'text-slate-300'
          }`}
        >
          {st.tone === 'live' ? (
            <span className="flex items-center gap-1">
              <span className="live-dot !h-1.5 !w-1.5" aria-hidden />
              {st.text}
            </span>
          ) : (
            st.text
          )}
        </span>
        <span className="flex min-w-0 flex-1 flex-col justify-center gap-1">
          {[
            ['home', m.homeName, m.homeCrest],
            ['away', m.awayName, m.awayCrest],
          ].map(([side, name, crest]) => (
            <span key={side} className="flex min-w-0 items-center gap-1.5">
              <Crest src={crest} />
              <span
                className={`truncate text-[12px] leading-tight ${
                  w === side ? 'font-bold text-white' : w && w !== 'draw' ? 'text-slate-400' : 'font-medium text-slate-100'
                }`}
              >
                {name}
              </span>
              {fav?.[side] ? <StarIcon filled className="h-2.5 w-2.5 shrink-0 text-amber-400" /> : null}
            </span>
          ))}
        </span>
        <span
          className={`flex w-6 shrink-0 flex-col items-center justify-center gap-1 text-[12px] font-extrabold tabular-nums leading-tight ${
            live ? 'text-red-300' : 'text-slate-200'
          }`}
        >
          <span>{m.homeScore ?? ''}</span>
          <span>{m.awayScore ?? ''}</span>
        </span>
      </button>
      <span className="flex w-7 shrink-0 items-center justify-center">
        {canWatch ? (
          <button
            type="button"
            onClick={() => onWatch(m)}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30 transition hover:bg-emerald-500/30"
            title="Canlı yayını aç"
            aria-label={`${m.homeName} - ${m.awayName} canlı yayını aç`}
          >
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        ) : null}
      </span>
    </div>
  );
}

/**
 * Maçkolik tarzı skor merkezi: gün şeridi, filtreler, lig lig maçlar, maç detayı ve puan durumu.
 * @param {{ favs: Set<string>, streamMatches?: Array, onWatch?: (streamMatch) => void }} props
 */
export default function ScoreCenter({ favs, streamMatches = [], onWatch }) {
  const todayIso = toIsoDate(new Date());
  const [date, setDate] = useState(todayIso);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState({});
  const [openMatch, setOpenMatch] = useState(null);
  const dateInputId = useId();

  const { leagues, loading, error, source, updatedAt, refresh } = useScoresDay(date, { enabled: filter !== 'standings' });

  const favTeams = useMemo(() => {
    const set = new Set();
    for (const k of favs || []) if (k.startsWith('team:')) set.add(normalizeTeam(k.slice(5)));
    return set;
  }, [favs]);

  const streams = useMemo(
    () => streamMatches.map((s) => ({ s, teams: parseMatchTeams(s.name) })).filter((x) => x.teams[0] && x.teams[1]),
    [streamMatches]
  );
  const streamFor = (m) => {
    if (m.isFinished || !streams.length) return null;
    return streams.find((x) => sameFixture([m.homeName, m.awayName], x.teams))?.s || null;
  };

  const favOf = (m) => ({
    home: favTeams.has(normalizeTeam(m.homeName)),
    away: favTeams.has(normalizeTeam(m.awayName)),
  });

  const counts = useMemo(() => {
    let live = 0;
    let fav = 0;
    let all = 0;
    for (const l of leagues) {
      for (const m of l.matches) {
        all += 1;
        if (m.isLive) live += 1;
        if (favTeams.has(normalizeTeam(m.homeName)) || favTeams.has(normalizeTeam(m.awayName))) fav += 1;
      }
    }
    return { all, live, fav };
  }, [leagues, favTeams]);

  const visible = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr-TR');
    const keep = (m, l) => {
      if (filter === 'live' && !m.isLive) return false;
      if (filter === 'finished' && !m.isFinished) return false;
      if (filter === 'upcoming' && m.state !== 'pre') return false;
      if (filter === 'fav' && !(favTeams.has(normalizeTeam(m.homeName)) || favTeams.has(normalizeTeam(m.awayName)))) return false;
      if (q) {
        const hay = `${m.homeName} ${m.awayName} ${m.homeNameRaw} ${m.awayNameRaw} ${l.name} ${l.country}`.toLocaleLowerCase('tr-TR');
        if (!hay.includes(q)) return false;
      }
      return true;
    };
    return leagues
      .map((l) => ({ ...l, matches: l.matches.filter((m) => keep(m, l)) }))
      .filter((l) => l.matches.length);
  }, [leagues, filter, query, favTeams]);

  // Çok sayıda lig varken ilk açılışta sadece ilk 12 lig açık; kullanıcı istediğini açar.
  const isOpen = (l, i) => (collapsed[l.key] === undefined ? i < 12 || filter !== 'all' || Boolean(query) : !collapsed[l.key]);

  // Detay açıkken skor/dakika her yenilemede listeden güncellenir.
  const liveOpen = openMatch
    ? { ...openMatch, ...(leagues.flatMap((l) => l.matches).find((x) => x.id === openMatch.id) || {}) }
    : null;

  const days = [-2, -1, 0, 1, 2, 3, 4].map((d) => shiftIso(todayIso, d));
  const openCalendar = () => {
    const el = document.getElementById(dateInputId);
    try {
      el?.showPicker?.();
    } catch {
      el?.click?.();
    }
  };

  return (
    <div className="app-panel flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden">
      {/* Başlık */}
      <div className="app-panel-header flex shrink-0 items-center justify-between gap-2 px-3 py-2.5">
        <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-300">
          Skor merkezi
          {counts.live ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold tracking-normal text-red-300 ring-1 ring-red-500/30">
              <span className="live-dot !h-1.5 !w-1.5" aria-hidden />
              {counts.live} canlı
            </span>
          ) : null}
        </span>
        <button
          type="button"
          onClick={refresh}
          className="rounded-full px-2 py-0.5 text-[10px] tabular-nums text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-300"
          title="Şimdi yenile"
        >
          {updatedAt ? `↻ ${new Date(updatedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}` : '↻'}
        </button>
      </div>

      {/* Gün şeridi */}
      {filter !== 'standings' ? (
        <div className="flex shrink-0 items-stretch gap-1 border-b border-white/[0.06] px-2 py-2">
          <div className="hide-scrollbar flex min-w-0 flex-1 gap-1 overflow-x-auto">
            {days.map((iso) => {
              const lbl = dayLabel(iso, todayIso);
              const on = iso === date;
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => setDate(iso)}
                  aria-pressed={on}
                  className={`flex min-w-[2.9rem] shrink-0 flex-col items-center rounded-lg px-1.5 py-1 transition ${
                    on ? 'bg-emerald-500 text-white shadow shadow-emerald-900/40' : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-200'
                  }`}
                >
                  <span className="text-[10px] font-bold leading-tight">{lbl.top}</span>
                  <span className={`text-[10px] tabular-nums leading-tight ${on ? 'text-emerald-50' : 'text-slate-500'}`}>{lbl.bottom}</span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={openCalendar}
            className="flex w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"
            aria-label="Takvimden tarih seç"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
            </svg>
          </button>
          <input
            id={dateInputId}
            type="date"
            value={date}
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => e.target.value && setDate(e.target.value)}
          />
        </div>
      ) : null}

      {/* Filtreler + arama */}
      <div className="shrink-0 space-y-2 border-b border-white/[0.06] px-2 py-2">
        <div className="hide-scrollbar flex gap-1 overflow-x-auto">
          {FILTERS.map((f) => {
            const on = filter === f.id;
            const n = f.id === 'all' ? counts.all : f.id === 'live' ? counts.live : f.id === 'fav' ? counts.fav : null;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                aria-pressed={on}
                className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                  on
                    ? f.id === 'live'
                      ? 'bg-red-500 text-white'
                      : 'bg-white text-slate-900'
                    : 'bg-white/[0.04] text-slate-400 ring-1 ring-white/[0.06] hover:text-slate-200'
                }`}
              >
                {f.id === 'fav' ? <StarIcon filled={on} className="h-3 w-3" /> : null}
                {f.label}
                {n ? <span className={`tabular-nums ${on ? 'opacity-70' : 'text-slate-500'}`}>{n}</span> : null}
              </button>
            );
          })}
        </div>
        {filter !== 'standings' ? (
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Takım, lig veya ülke ara…"
            autoComplete="off"
            className="w-full rounded-lg border border-white/[0.08] bg-slate-950/60 px-2.5 py-1.5 text-base text-slate-100 placeholder:text-slate-500 focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 xl:text-xs"
          />
        ) : null}
      </div>

      {/* İçerik */}
      <div className="stream-panel-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
        {filter === 'standings' ? (
          <Standings />
        ) : loading && !leagues.length ? (
          <div className="space-y-2 p-2" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-white/[0.04] motion-reduce:animate-none" />
            ))}
          </div>
        ) : error && !leagues.length ? (
          <div className="p-4 text-center">
            <p className="text-xs text-slate-400">{error}</p>
            <button type="button" onClick={refresh} className="mt-2 rounded-full bg-white/[0.06] px-3 py-1 text-[11px] font-semibold text-slate-200 hover:bg-white/[0.1]">
              Tekrar dene
            </button>
          </div>
        ) : !visible.length ? (
          <div className="px-4 py-8 text-center">
            <p className="text-xs font-medium text-slate-300">
              {filter === 'live'
                ? 'Şu an oynanan maç yok'
                : filter === 'fav'
                  ? 'Favori takımlarının bu gün maçı yok'
                  : query
                    ? 'Aramaya uyan maç yok'
                    : 'Bu gün için maç bulunamadı'}
            </p>
            {filter === 'fav' ? (
              <p className="mt-1 text-[11px] text-slate-500">Maç listesindeki takımların yanındaki ⭐ ile favori ekleyebilirsin.</p>
            ) : null}
          </div>
        ) : (
          <div className="pb-2">
            {visible.map((l, i) => {
              const open = isOpen(l, i);
              return (
                <section key={l.key} className="border-b border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => setCollapsed((c) => ({ ...c, [l.key]: open }))}
                    aria-expanded={open}
                    className="sticky top-0 z-10 flex w-full items-center gap-2 bg-[#0b1222]/95 px-2.5 py-1.5 text-left backdrop-blur hover:bg-[#0f182c]"
                  >
                    {l.flag ? (
                      <img src={l.flag} alt="" loading="lazy" className="h-3.5 w-3.5 shrink-0 rounded-full object-cover" />
                    ) : (
                      <span className="text-xs leading-none">⚽</span>
                    )}
                    <span className="min-w-0 flex-1 truncate text-[11px] font-bold text-slate-200">
                      {l.country ? <span className="font-semibold text-slate-500">{l.country} · </span> : null}
                      {l.name}
                    </span>
                    {l.matches.some((m) => m.isLive) ? <span className="live-dot !h-1.5 !w-1.5 shrink-0" aria-label="Canlı maç var" /> : null}
                    <span className="shrink-0 text-[10px] tabular-nums text-slate-500">{l.matches.length}</span>
                    <svg className={`h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {open ? (
                    <div>
                      {l.matches.map((m) => {
                        const stream = streamFor(m);
                        return (
                          <MatchRow
                            key={m.id}
                            m={m}
                            fav={favOf(m)}
                            canWatch={Boolean(stream && onWatch)}
                            onOpen={(x) => setOpenMatch({ ...x, leagueName: l.name, country: l.country, flag: l.flag })}
                            onWatch={() => onWatch(stream)}
                          />
                        );
                      })}
                    </div>
                  ) : null}
                </section>
              );
            })}
            <p className="px-3 pt-3 text-center text-[10px] text-slate-600">
              Veri: {source === 'espn' ? 'ESPN' : 'FotMob'} · otomatik güncellenir
            </p>
          </div>
        )}
      </div>

      {liveOpen ? (
        <MatchDetailSheet
          match={liveOpen}
          stream={streamFor(liveOpen)}
          onWatch={onWatch}
          onClose={() => setOpenMatch(null)}
        />
      ) : null}
    </div>
  );
}
