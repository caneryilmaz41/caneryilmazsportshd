import { useEffect, useState } from 'react';
import { fetchStandings, STANDINGS_LEAGUES } from '../../services/scoresApi';

/** Puan durumu: lig seçici + O/G/B/M/AV/P tablosu, Avrupa/düşme renkleri. */
export default function Standings() {
  const [leagueId, setLeagueId] = useState(STANDINGS_LEAGUES[0].id);
  const [state, setState] = useState({ loading: true, data: null, error: false });

  useEffect(() => {
    let alive = true;
    setState({ loading: true, data: null, error: false });
    fetchStandings(leagueId)
      .then((data) => alive && setState({ loading: false, data, error: false }))
      .catch(() => alive && setState({ loading: false, data: null, error: true }));
    return () => {
      alive = false;
    };
  }, [leagueId]);

  const { loading, data, error } = state;

  return (
    <div className="p-2">
      <div className="hide-scrollbar -mx-2 mb-2 flex gap-1 overflow-x-auto px-2">
        {STANDINGS_LEAGUES.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => setLeagueId(l.id)}
            aria-pressed={leagueId === l.id}
            className={`shrink-0 whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
              leagueId === l.id ? 'bg-emerald-500 text-white' : 'bg-white/[0.04] text-slate-400 hover:text-slate-200'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-1.5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-6 animate-pulse rounded bg-white/[0.04] motion-reduce:animate-none" />
          ))}
        </div>
      ) : error || !data?.tables?.length ? (
        <p className="py-6 text-center text-xs text-slate-500">Puan durumu şu an alınamadı.</p>
      ) : (
        <>
          {data.season ? <p className="mb-1.5 text-[10px] text-slate-500">{data.season} sezonu</p> : null}
          {data.tables.map((t) => (
            <div key={t.name || 'main'} className="mb-3 overflow-hidden rounded-xl border border-white/[0.06]">
              {t.name ? <p className="bg-white/[0.04] px-2 py-1 text-[10px] font-bold text-slate-300">{t.name}</p> : null}
              <table className="w-full table-fixed text-[11px]">
                <thead>
                  <tr className="bg-white/[0.03] text-[9px] uppercase tracking-wide text-slate-500">
                    <th className="w-6 py-1 text-center font-semibold">#</th>
                    <th className="py-1 text-left font-semibold">Takım</th>
                    <th className="w-6 py-1 text-center font-semibold">O</th>
                    <th className="hidden w-6 py-1 text-center font-semibold min-[420px]:table-cell">G</th>
                    <th className="hidden w-6 py-1 text-center font-semibold min-[420px]:table-cell">B</th>
                    <th className="hidden w-6 py-1 text-center font-semibold min-[420px]:table-cell">M</th>
                    <th className="w-8 py-1 text-center font-semibold">AV</th>
                    <th className="w-7 py-1 text-center font-semibold">P</th>
                  </tr>
                </thead>
                <tbody>
                  {t.rows.map((r) => (
                    <tr key={r.id} className="border-t border-white/[0.04]">
                      <td className="relative py-1 text-center tabular-nums text-slate-400">
                        {r.color ? <span className="absolute inset-y-1 left-0 w-[3px] rounded-r" style={{ background: r.color }} aria-hidden /> : null}
                        {r.rank}
                      </td>
                      <td className="py-1">
                        <span className="flex min-w-0 items-center gap-1.5">
                          <img src={r.logo} alt="" loading="lazy" className="h-4 w-4 shrink-0 object-contain" />
                          <span className="truncate text-slate-100">{r.name}</span>
                        </span>
                      </td>
                      <td className="py-1 text-center tabular-nums text-slate-400">{r.played}</td>
                      <td className="hidden py-1 text-center tabular-nums text-slate-400 min-[420px]:table-cell">{r.wins}</td>
                      <td className="hidden py-1 text-center tabular-nums text-slate-400 min-[420px]:table-cell">{r.draws}</td>
                      <td className="hidden py-1 text-center tabular-nums text-slate-400 min-[420px]:table-cell">{r.losses}</td>
                      <td className="py-1 text-center tabular-nums text-slate-400">{r.diff > 0 ? `+${r.diff}` : r.diff}</td>
                      <td className="py-1 text-center font-bold tabular-nums text-white">{r.pts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          {data.legend.length ? (
            <ul className="space-y-1 px-1">
              {data.legend.map((l) => (
                <li key={l.title} className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: l.color }} />
                  {l.title}
                </li>
              ))}
            </ul>
          ) : null}
        </>
      )}
    </div>
  );
}
