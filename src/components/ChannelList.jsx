import ChannelLogoImg from './ChannelLogoImg';
import { StarIcon } from './icons';
import { favKey } from '../hooks/useFavorites';

function ChannelRowButton({ channel, isSelected, onChannelSelect, isFav, onToggleFav }) {
  const key = favKey('channel', channel.id);
  const fav = Boolean(isFav?.(key));
  return (
    <div
      className={`group relative flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-200 ${
        isSelected
          ? 'border-emerald-400/40 bg-gradient-to-r from-emerald-500/[0.16] to-emerald-500/[0.04] shadow-[0_8px_24px_-12px_rgba(16,185,129,0.45)]'
          : 'border-white/[0.06] bg-white/[0.025] hover:border-white/[0.12] hover:bg-white/[0.05]'
      }`}
    >
      <button
        type="button"
        onClick={() => onChannelSelect(channel)}
        aria-label={`${channel.name} yayınını aç`}
        className="absolute inset-0 z-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 active:bg-white/[0.03]"
      />
      <div className="pointer-events-none relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950/60 ring-1 ring-white/[0.08]">
        <ChannelLogoImg channelName={channel.name} className="h-8 w-8 object-contain" />
      </div>
      <div className="pointer-events-none relative min-w-0 flex-1">
        <div className={`truncate text-[13px] font-semibold ${fav ? 'text-amber-200' : 'text-slate-100'}`}>{channel.name}</div>
        {channel.status ? (
          <div className="mt-1 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.5)]" />
            <span className="truncate text-[10px] font-medium text-green-400/90">{channel.status}</span>
          </div>
        ) : null}
      </div>
      {onToggleFav ? (
        <button
          type="button"
          onClick={() => onToggleFav(key)}
          aria-pressed={fav}
          aria-label={fav ? `${channel.name} favorilerden çıkar` : `${channel.name} favorilere ekle`}
          title={fav ? 'Favorilerden çıkar' : 'Favorilere ekle'}
          className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
            fav
              ? 'text-amber-400 hover:bg-amber-500/10'
              : 'text-slate-600 hover:bg-white/[0.06] hover:text-amber-300 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 focus-visible:opacity-100'
          }`}
        >
          <StarIcon filled={fav} className="h-4 w-4" />
        </button>
      ) : null}
      <span
        className={`pointer-events-none relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          isSelected ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-600 opacity-0 transition-opacity group-hover:opacity-100'
        }`}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </div>
  );
}

const ChannelList = ({ channels = [], selectedMatch, onChannelSelect, isFav, onToggleFav }) => {
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
            isFav={isFav}
            onToggleFav={onToggleFav}
          />
        </li>
      ))}
    </ul>
  );
};

export default ChannelList;
