import ChannelLogoImg from './ChannelLogoImg';

function ChannelRowButton({ channel, isSelected, onChannelSelect }) {
  return (
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
        <ChannelLogoImg channelName={channel.name} className="h-8 w-8 object-contain" />
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
  );
}

const ChannelList = ({ channels = [], selectedMatch, onChannelSelect }) => {
  if (channels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800/80 text-3xl ring-1 ring-slate-600/50">
          📺
        </div>
        <p className="text-sm font-medium text-slate-300">Bu kategoride kanal yok</p>
        <p className="mt-1 text-xs text-slate-500">Üstteki sekmeyi değiştir</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2 p-2">
      {channels.map((channel) => (
        <li key={channel.id}>
          <ChannelRowButton
            channel={channel}
            isSelected={selectedMatch?.id === channel.id}
            onChannelSelect={onChannelSelect}
          />
        </li>
      ))}
    </ul>
  );
};

export default ChannelList;
