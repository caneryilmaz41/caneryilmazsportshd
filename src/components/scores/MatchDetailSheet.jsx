import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { fetchMatchDetails } from '../../services/scoresApi';
import { CloseIcon } from '../icons';
import { statusCell, kickoffTime } from './scoreFormat';

const TABS = [
  { id: 'summary', label: 'Özet' },
  { id: 'stats', label: 'İstatistik' },
  { id: 'lineup', label: 'Kadrolar' },
];

function EventIcon({ e }) {
  if (e.type === 'Goal') return <span aria-label={e.ownGoal ? 'Kendi kalesine gol' : 'Gol'}>{e.ownGoal ? '🥅' : '⚽'}</span>;
  if (e.type === 'Card') {
    const red = /red/i.test(e.card);
    const second = /yellowred/i.test(e.card);
    return (
      <span
        aria-label={second ? 'İkinci sarıdan kırmızı' : red ? 'Kırmızı kart' : 'Sarı kart'}
        className={`inline-block h-3.5 w-2.5 rounded-[2px] ${second ? 'bg-gradient-to-br from-yellow-300 from-50% to-red-500 to-50%' : red ? 'bg-red-500' : 'bg-yellow-300'}`}
      />
    );
  }
  if (e.type === 'Substitution') return <span aria-label="Oyuncu değişikliği" className="text-[11px] text-sky-300">⇄</span>;
  return null;
}

function EventText({ e }) {
  if (e.type === 'Substitution') {
    return (
      <span className="min-w-0">
        <span className="block truncate text-emerald-300">↑ {e.subIn}</span>
        <span className="block truncate text-red-300/80">↓ {e.subOut}</span>
      </span>
    );
  }
  return (
    <span className="min-w-0">
      <span className="block truncate font-semibold text-slate-100">
        {e.player}
        {e.penalty ? <span className="font-normal text-slate-400"> (P)</span> : null}
        {e.ownGoal ? <span className="font-normal text-slate-400"> (K.K.)</span> : null}
      </span>
      {e.assist ? <span className="block truncate text-slate-500">Asist: {e.assist}</span> : null}
    </span>
  );
}

function Timeline({ events }) {
  if (!events.length) return <p className="py-6 text-center text-xs text-slate-500">Henüz maç olayı yok.</p>;
  return (
    <ol className="space-y-1">
      {events.map((e, i) =>
        e.type === 'Half' ? (
          <li key={i} className="my-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <span className="h-px flex-1 bg-white/[0.08]" />
            {e.label} {e.score ? `· ${e.score}` : ''}
            <span className="h-px flex-1 bg-white/[0.08]" />
          </li>
        ) : (
          <li key={i} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-[12px]">
            <div className={`flex min-w-0 items-center justify-end gap-2 text-right ${e.isHome ? '' : 'invisible'}`}>
              {e.isHome ? (
                <>
                  <EventText e={e} />
                  <EventIcon e={e} />
                </>
              ) : null}
            </div>
            <span className="w-10 rounded-md bg-white/[0.05] py-0.5 text-center text-[11px] font-bold tabular-nums text-slate-300">
              {e.minute}
            </span>
            <div className={`flex min-w-0 items-center gap-2 ${e.isHome ? 'invisible' : ''}`}>
              {!e.isHome ? (
                <>
                  <EventIcon e={e} />
                  <EventText e={e} />
                </>
              ) : null}
            </div>
          </li>
        )
      )}
    </ol>
  );
}

function StatBars({ stats }) {
  if (!stats.length) return <p className="py-6 text-center text-xs text-slate-500">İstatistik maç başlayınca gelir.</p>;
  return (
    <ul className="space-y-3">
      {stats.map((s) => {
        const total = s.homeVal + s.awayVal || 1;
        const hp = (s.homeVal / total) * 100;
        const homeLead = s.homeVal > s.awayVal;
        const awayLead = s.awayVal > s.homeVal;
        return (
          <li key={s.key}>
            <div className="mb-1 flex items-center justify-between text-[12px]">
              <span className={`tabular-nums ${homeLead ? 'font-bold text-white' : 'text-slate-400'}`}>
                {s.home}
                {s.percent ? '%' : ''}
              </span>
              <span className="text-[11px] text-slate-400">{s.title}</span>
              <span className={`tabular-nums ${awayLead ? 'font-bold text-white' : 'text-slate-400'}`}>
                {s.away}
                {s.percent ? '%' : ''}
              </span>
            </div>
            <div className="flex h-1.5 gap-1">
              <div className="flex flex-1 justify-end overflow-hidden rounded-full bg-white/[0.06]">
                <div className={`h-full rounded-full ${homeLead ? 'bg-emerald-400' : 'bg-slate-500'}`} style={{ width: `${hp}%` }} />
              </div>
              <div className="flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                <div className={`h-full rounded-full ${awayLead ? 'bg-sky-400' : 'bg-slate-500'}`} style={{ width: `${100 - hp}%` }} />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function PlayerLine({ p }) {
  const r = p.rating != null ? Number(p.rating) : null;
  return (
    <li className="flex items-center gap-2 py-1 text-[12px]">
      <span className="w-5 shrink-0 text-right text-[11px] font-bold tabular-nums text-slate-500">{p.number}</span>
      <span className="min-w-0 flex-1 truncate text-slate-100">{p.name}</span>
      {p.subIn != null ? <span className="shrink-0 text-[10px] text-emerald-300">↑{p.subIn}'</span> : null}
      {p.subOut != null ? <span className="shrink-0 text-[10px] text-red-300/80">↓{p.subOut}'</span> : null}
      {r != null && Number.isFinite(r) ? (
        <span
          className={`w-7 shrink-0 rounded px-1 text-center text-[10px] font-bold tabular-nums text-white ${
            r >= 7.5 ? 'bg-emerald-600' : r >= 6.5 ? 'bg-emerald-800' : r >= 6 ? 'bg-amber-700' : 'bg-red-800'
          }`}
        >
          {r.toFixed(1)}
        </span>
      ) : null}
    </li>
  );
}

function TeamLineup({ team }) {
  if (!team) return null;
  return (
    <div className="min-w-0">
      <p className="mb-1 flex items-baseline justify-between gap-2">
        <span className="truncate text-xs font-bold text-white">{team.name}</span>
        {team.formation ? <span className="shrink-0 text-[11px] font-semibold text-emerald-300">{team.formation}</span> : null}
      </p>
      <ul className="divide-y divide-white/[0.04]">
        {team.starters.map((p) => (
          <PlayerLine key={p.id || p.name} p={p} />
        ))}
      </ul>
      {team.subs.length ? (
        <>
          <p className="mb-1 mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Yedekler</p>
          <ul className="divide-y divide-white/[0.04] opacity-80">
            {team.subs.map((p) => (
              <PlayerLine key={p.id || p.name} p={p} />
            ))}
          </ul>
        </>
      ) : null}
      {team.coach ? <p className="mt-3 text-[11px] text-slate-500">Teknik direktör: <span className="text-slate-300">{team.coach}</span></p> : null}
    </div>
  );
}

export default function MatchDetailSheet({ match, stream, onWatch, onClose }) {
  const [tab, setTab] = useState('summary');
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  const id = match.id;
  const live = match.isLive;
  useEffect(() => {
    let alive = true;
    const load = async (force) => {
      try {
        const d = await fetchMatchDetails(match, { force });
        if (alive) setDetail(d);
      } catch {
        /* liste bilgisi yine gösterilir */
      } finally {
        if (alive) setLoading(false);
      }
    };
    setLoading(true);
    setDetail(null);
    load(false);
    const t = live ? setInterval(() => !document.hidden && load(true), 30000) : null;
    return () => {
      alive = false;
      if (t) clearInterval(t);
    };
    // Maç değişince veya canlılık durumu değişince yeniden kur.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, live]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const st = statusCell(match);
  const started = match.homeScore != null;
  const date = match.kickoff
    ? new Date(match.kickoff).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', weekday: 'long' })
    : '';

  // Panel kendi katmanında (sticky) olduğu için pencere body'ye taşınır; yoksa oynatıcının altında kalır.
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={`${match.homeName} - ${match.awayName}`}>
      <button type="button" className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-label="Kapat" onClick={onClose} />
      <div className="relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-white/[0.1] bg-[#0b1222] shadow-2xl sm:max-h-[86vh] sm:max-w-xl sm:rounded-3xl">
        {/* Skor başlığı */}
        <div className="relative shrink-0 bg-gradient-to-b from-emerald-500/[0.12] to-transparent px-4 pb-4 pt-3">
          <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-white/20 sm:hidden" aria-hidden />
          <div className="flex items-center gap-2 pr-8 text-[11px] text-slate-400">
            {match.flag ? <img src={match.flag} alt="" className="h-3.5 w-3.5 rounded-full object-cover" /> : null}
            <span className="truncate">
              {match.country ? `${match.country} · ` : ''}
              {match.leagueName}
              {detail?.info.round ? ` · ${detail.info.round}. hafta` : ''}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
            aria-label="Kapat"
          >
            <CloseIcon className="h-4 w-4" />
          </button>

          <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            {[
              ['home', match.homeName, match.homeCrest, detail?.redCards.home],
              ['away', match.awayName, match.awayCrest, detail?.redCards.away],
            ].map(([side, name, crest, reds], idx) => (
              <div key={side} className={`flex min-w-0 flex-col items-center gap-1.5 text-center ${idx === 1 ? 'order-3' : ''}`}>
                {crest ? <img src={crest} alt="" className="h-12 w-12 object-contain" /> : <span className="h-12 w-12 rounded-full bg-white/[0.08]" />}
                <span className="line-clamp-2 text-sm font-bold text-white">{name}</span>
                {reds ? <span className="inline-block h-3 w-2 rounded-[2px] bg-red-500" title={`${reds} kırmızı kart`} /> : null}
              </div>
            ))}
            <div className="order-2 flex flex-col items-center">
              {started ? (
                <span className={`text-3xl font-extrabold tabular-nums ${match.isLive ? 'text-red-300' : 'text-white'}`}>
                  {match.homeScore} - {match.awayScore}
                </span>
              ) : (
                <span className="text-2xl font-extrabold tabular-nums text-white">{kickoffTime(match.kickoff)}</span>
              )}
              <span
                className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  match.isLive ? 'bg-red-500/15 text-red-300' : 'bg-white/[0.06] text-slate-400'
                }`}
              >
                {match.isLive ? <span className="live-dot !h-1.5 !w-1.5" aria-hidden /> : null}
                {match.isLive ? st.text : match.isFinished ? 'Maç sonu' : st.tone === 'muted' ? st.text : date}
              </span>
            </div>
          </div>

          {stream && onWatch ? (
            <button
              type="button"
              onClick={() => {
                onWatch(stream);
                onClose();
              }}
              className="mx-auto mt-3 flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-900/40 hover:bg-emerald-400"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
              Canlı yayını izle
            </button>
          ) : null}
        </div>

        {/* Sekmeler */}
        <div className="flex shrink-0 gap-1 border-b border-white/[0.08] px-3" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`relative px-3 py-2.5 text-xs font-semibold transition ${tab === t.id ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {t.label}
              {tab === t.id ? <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-emerald-400" /> : null}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          {match.source !== 'fotmob' ? (
            <p className="py-6 text-center text-xs text-slate-500">Bu maç için detaylı veri yok.</p>
          ) : loading && !detail ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-6 animate-pulse rounded bg-white/[0.05] motion-reduce:animate-none" />
              ))}
            </div>
          ) : !detail ? (
            <p className="py-6 text-center text-xs text-slate-500">Maç detayı şu an alınamadı.</p>
          ) : tab === 'summary' ? (
            <>
              <Timeline events={detail.events} />
              {detail.info.stadium || detail.info.referee ? (
                <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 rounded-xl bg-white/[0.03] p-3 text-[11px]">
                  {detail.info.stadium ? (
                    <>
                      <dt className="text-slate-500">Stadyum</dt>
                      <dd className="text-slate-200">{detail.info.stadium}</dd>
                    </>
                  ) : null}
                  {detail.info.referee ? (
                    <>
                      <dt className="text-slate-500">Hakem</dt>
                      <dd className="text-slate-200">{detail.info.referee}</dd>
                    </>
                  ) : null}
                  {detail.info.attendance ? (
                    <>
                      <dt className="text-slate-500">Seyirci</dt>
                      <dd className="text-slate-200">{Number(detail.info.attendance).toLocaleString('tr-TR')}</dd>
                    </>
                  ) : null}
                </dl>
              ) : null}
            </>
          ) : tab === 'stats' ? (
            <StatBars stats={detail.stats} />
          ) : detail.lineup?.home?.starters?.length ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <TeamLineup team={detail.lineup.home} />
              <TeamLineup team={detail.lineup.away} />
            </div>
          ) : (
            <p className="py-6 text-center text-xs text-slate-500">Kadrolar genelde maçtan ~1 saat önce açıklanır.</p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
