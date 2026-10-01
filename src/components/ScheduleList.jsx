import { useMemo } from 'react';
import { parseMatchTeams } from '../utils/teamUtils';
import { kickoffToday } from '../utils/matchTime';
import { favKey } from '../hooks/useFavorites';
import { BellIcon, StarIcon } from './icons';

/** Bugünün yayın programı: başlamış olanlar üstte, sonra saat saat gruplu. */
const ScheduleList = ({ matches = [], selectedMatch, onMatchSelect, isFav, hasReminder, onToggleReminder }) => {
  const groups = useMemo(() => {
    const now = new Date();
    const started = [];
    const byHour = new Map();
    for (const m of matches) {
      const k = kickoffToday(m.time, now);
      if (!k || k <= now) {
        started.push(m);
        continue;
      }
      const label = `${String(k.getHours()).padStart(2, '0')}:00`;
      if (!byHour.has(label)) byHour.set(label, []);
      byHour.get(label).push({ m, t: k.getTime() });
    }
    const hours = [...byHour.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([label, rows]) => ({ label, rows: rows.sort((a, b) => a.t - b.t).map((r) => r.m), upcoming: true }));
    return started.length ? [{ label: 'Şu an yayında', rows: started, upcoming: false }, ...hours] : hours;
  }, [matches]);

  if (!matches.length) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
        <p className="text-sm font-medium text-slate-300">Bugün için program yok</p>
        <p className="mt-1 text-xs text-slate-500">Yayın listesi güncellendiğinde burada görünür</p>
      </div>
    );
  }

  return (
    <div className="p-2">
      {groups.map((g) => (
        <section key={g.label} className="mb-3 last:mb-0">
          <h3 className="sticky top-0 z-10 -mx-2 mb-1.5 flex items-center gap-2 bg-[#0a1020]/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 backdrop-blur">
            {g.upcoming ? (
              <span className="tabular-nums text-emerald-300">{g.label}</span>
            ) : (
              <>
                <span className="live-dot !h-1.5 !w-1.5" aria-hidden />
                {g.label}
              </>
            )}
            <span className="font-semibold text-slate-600">· {g.rows.length}</span>
          </h3>
          <ul className="space-y-1">
            {g.rows.map((m) => {
              const [home, away] = parseMatchTeams(m.name);
              const fav = isFav?.(favKey('team', home)) || isFav?.(favKey('team', away));
              const reminded = Boolean(hasReminder?.(m.id));
              const selected = selectedMatch?.id === m.id;
              return (
                <li
                  key={m.id}
                  className={`group relative flex items-center gap-2.5 rounded-lg border px-2.5 py-2 transition ${
                    selected
                      ? 'border-emerald-400/40 bg-emerald-500/10'
                      : 'border-transparent hover:border-white/[0.08] hover:bg-white/[0.04]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onMatchSelect(m)}
                    aria-label={`${m.name} yayınını aç`}
                    className="absolute inset-0 z-0 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
                  />
                  <span className="pointer-events-none relative w-11 shrink-0 text-[11px] font-bold tabular-nums text-slate-400">
                    {m.time || '—'}
                  </span>
                  <div className="pointer-events-none relative min-w-0 flex-1">
                    <p className={`flex items-center gap-1 truncate text-[12px] font-semibold ${fav ? 'text-amber-200' : 'text-slate-100'}`}>
                      {fav ? <StarIcon filled className="h-3 w-3 shrink-0 text-amber-400" /> : null}
                      <span className="truncate">{home && away ? `${home} – ${away}` : m.name}</span>
                    </p>
                    {m.league ? <p className="truncate text-[10px] text-slate-500">{m.league}</p> : null}
                  </div>
                  {g.upcoming && onToggleReminder ? (
                    <button
                      type="button"
                      onClick={() => onToggleReminder(m)}
                      aria-pressed={reminded}
                      aria-label={reminded ? 'Hatırlatıcıyı kaldır' : 'Başlamadan önce hatırlat'}
                      title={reminded ? 'Hatırlatıcıyı kaldır' : 'Başlamadan 5 dk önce haber ver'}
                      className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
                        reminded ? 'bg-sky-500/15 text-sky-300' : 'text-slate-500 hover:bg-white/[0.06] hover:text-sky-300'
                      }`}
                    >
                      <BellIcon active={reminded} className="h-4 w-4" />
                    </button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
};

export default ScheduleList;
