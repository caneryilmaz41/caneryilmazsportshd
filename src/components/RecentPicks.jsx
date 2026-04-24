import { useMemo } from 'react';

function truncate(s, n = 28) {
  if (!s) return '';
  return s.length <= n ? s : `${s.slice(0, n - 1)}…`;
}

const RecentPicks = ({ kind, recent, list, onPick }) => {
  const rows = useMemo(() => {
    const ids = new Set((list || []).map((x) => x.id));
    return (recent || [])
      .filter((r) => r.kind === kind && ids.has(r.id))
      .slice(0, 5)
      .map((r) => {
        const full = list.find((x) => x.id === r.id);
        return full ? { key: r.id, item: full, label: r.name } : null;
      })
      .filter(Boolean);
  }, [kind, recent, list]);

  if (rows.length === 0) return null;

  return (
    <div className="shrink-0 border-b border-slate-700/35 bg-slate-900/20 px-2 py-2">
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Son açılanlar</p>
      <div className="hide-scrollbar flex gap-1.5 overflow-x-auto pb-0.5" role="list">
        {rows.map(({ key, item, label }) => (
          <button
            key={key}
            type="button"
            role="listitem"
            onClick={() => onPick(item)}
            className="max-w-[11rem] shrink-0 rounded-lg border border-slate-600/40 bg-slate-800/50 px-2.5 py-1 text-left text-[11px] font-medium text-slate-200 transition-colors hover:border-emerald-500/35 hover:bg-slate-700/40"
            title={label}
          >
            {truncate(label, 32)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RecentPicks;
