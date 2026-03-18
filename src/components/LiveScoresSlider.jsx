import { useLiveScores } from '../hooks/useLiveScores';

export default function LiveScoresSlider() {
  const { scores, loading } = useLiveScores();

  if (loading && scores.length === 0) {
    return (
      <div className="border-t border-slate-700/50 bg-slate-800/60 py-3">
        <div className="max-w-7xl mx-auto px-3 flex items-center gap-4 overflow-hidden">
          <span className="text-slate-400 text-sm whitespace-nowrap">
            CANLI skorlar yükleniyor...
          </span>
        </div>
      </div>
    );
  }

  if (scores.length === 0) {
    return (
      <div className="border-t border-slate-700/50 bg-slate-800/60 py-3">
        <div className="max-w-7xl mx-auto px-3 flex items-center gap-4 overflow-hidden">
          <span className="text-slate-400 text-sm whitespace-nowrap">
            Şu an canlı maç yok
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-slate-700/50 bg-slate-800/60 py-3">
      <div className="max-w-7xl mx-auto px-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Canlı skorlar
          </span>
        </div>
        <div
          className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {scores.map((m) => (
            <div
              key={m.id}
              className="flex-shrink-0 w-[220px] rounded-xl bg-slate-700/50 border border-slate-600/50 px-3 py-2"
            >
              <div className="text-[10px] text-slate-400 truncate mb-1">
                {m.league}
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  {m.homeCrest ? (
                    <img
                      src={m.homeCrest}
                      alt=""
                      className="w-5 h-5 object-contain flex-shrink-0"
                    />
                  ) : null}
                  <span className="text-white text-xs font-medium truncate">
                    {m.homeName}
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {m.isLive ? (
                    <span className="text-red-400 text-[10px] font-bold">CANLI</span>
                  ) : m.isFinished ? (
                    <span className="text-slate-500 text-[10px]">FT</span>
                  ) : null}
                  <span className="text-green-400 font-bold text-sm tabular-nums">
                    {m.homeScore ?? '–'} - {m.awayScore ?? '–'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 min-w-0 flex-1 justify-end">
                  <span className="text-white text-xs font-medium truncate">
                    {m.awayName}
                  </span>
                  {m.awayCrest ? (
                    <img
                      src={m.awayCrest}
                      alt=""
                      className="w-5 h-5 object-contain flex-shrink-0"
                    />
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
