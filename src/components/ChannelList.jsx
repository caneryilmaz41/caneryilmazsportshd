import { getChannelLogoPath } from '../utils/channelUtils';

const ChannelList = ({ channels, selectedMatch, onChannelSelect }) => {
  const filteredChannels = channels.filter((channel) => {
    const name = channel.name?.toLowerCase() || '';
    const hasVs = name.includes(' vs ') || name.includes(' - ') || name.includes(' x ');
    const hasTeamNames =
      name.includes('galatasaray') ||
      name.includes('fenerbahçe') ||
      name.includes('beşiktaş') ||
      name.includes('trabzonspor');
    const isChannel =
      name.includes('tv') || name.includes('spor') || name.includes('kanal') || name.includes('sport');

    return !hasVs && !hasTeamNames && (isChannel || channel.status?.includes('/'));
  });

  if (filteredChannels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800/80 text-3xl ring-1 ring-slate-600/50">
          📺
        </div>
        <p className="text-sm font-medium text-slate-300">Kanal bulunamadı</p>
        <p className="mt-1 text-xs text-slate-500">Liste güncellendiğinde burada görünür</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2 p-2">
      {filteredChannels.map((channel) => {
        const isSelected = selectedMatch?.id === channel.id;
        return (
          <li key={channel.id}>
            <button
              type="button"
              onClick={() => onChannelSelect(channel)}
              className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-200 ${
                isSelected
                  ? 'border-green-500/50 bg-green-500/[0.12] shadow-[0_0_0_1px_rgba(34,197,94,0.2)] ring-1 ring-green-500/20'
                  : 'border-slate-600/30 bg-slate-800/40 hover:border-slate-500/40 hover:bg-slate-700/35'
              }`}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900/50 ring-1 ring-slate-600/40">
                <img
                  src={getChannelLogoPath(channel.name)}
                  alt=""
                  className="h-8 w-8 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold text-slate-100">{channel.name}</div>
                {channel.status ? (
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.5)]" />
                    <span className="truncate text-[10px] font-medium text-green-400/90">{channel.status}</span>
                  </div>
                ) : null}
              </div>
              {isSelected ? (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-500/20 text-green-400">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              ) : (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-600 opacity-0 transition-opacity group-hover:opacity-100">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
};

export default ChannelList;
