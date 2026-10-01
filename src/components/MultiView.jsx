import { useEffect, useRef, useState } from 'react';
import { getStreamUrl } from './StreamService';
import { isTrgoolSiteUrl } from '../utils/trgoolEmbedUrl';
import { CloseIcon, RefreshIcon, SpeakerIcon } from './icons';

const PLAYER_UI_VERSION = 'corner-big-ctrl-hide-2026-08-16';

function Slot({ match, audible, onAudio, onRemove, selected, onSelectSlot }) {
  const [state, setState] = useState({ loading: true, url: null });
  const [reloadKey, setReloadKey] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    let alive = true;
    setState({ loading: true, url: null });
    getStreamUrl(match)
      .then((r) => {
        if (!alive) return;
        const url = r?.type === 'hls' && r?.url && !isTrgoolSiteUrl(r.url) ? r.url : null;
        setState({ loading: false, url });
      })
      .catch(() => alive && setState({ loading: false, url: null }));
    return () => {
      alive = false;
    };
  }, [match.id, reloadKey]);

  // Ses tek kutuda açık olsun: seçilen açılır, diğerleri kısılır.
  useEffect(() => {
    try {
      frameRef.current?.contentWindow?.postMessage({ type: 'player:cmd', cmd: audible ? 'unmute' : 'silence' }, '*');
    } catch {
      /* ignore */
    }
  }, [audible]);

  const src = state.url
    ? `/player.html?ui=${encodeURIComponent(PLAYER_UI_VERSION)}&muted=1&src=${encodeURIComponent(state.url)}&rail=%5B%5D&selected=${encodeURIComponent(match.id)}`
    : '';

  return (
    <div
      className={`group relative overflow-hidden rounded-xl bg-black ring-2 transition ${
        selected ? 'ring-emerald-400/70' : audible ? 'ring-sky-400/50' : 'ring-white/[0.06]'
      }`}
    >
      <div className="absolute inset-x-0 top-0 z-10 flex items-center gap-1.5 bg-gradient-to-b from-black/80 to-transparent px-2 py-1.5">
        <button
          type="button"
          onClick={onSelectSlot}
          className="min-w-0 flex-1 truncate text-left text-[11px] font-semibold text-white/90"
          title="Listeden seçilen maç bu kutuya gelsin"
        >
          {match.name}
        </button>
        <button
          type="button"
          onClick={onAudio}
          className={`rounded-md p-1 transition ${audible ? 'bg-sky-500/25 text-sky-200' : 'text-white/70 hover:bg-white/15 hover:text-white'}`}
          aria-label={audible ? 'Bu yayının sesi açık' : 'Sesi bu yayına al'}
          title={audible ? 'Ses bu yayında' : 'Sesi bu yayına al'}
        >
          <SpeakerIcon on={audible} />
        </button>
        <button
          type="button"
          onClick={() => setReloadKey((k) => k + 1)}
          className="rounded-md p-1 text-white/70 hover:bg-white/15 hover:text-white"
          aria-label="Yenile"
        >
          <RefreshIcon />
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-md p-1 text-white/70 hover:bg-white/15 hover:text-white"
          aria-label="Kaldır"
        >
          <CloseIcon />
        </button>
      </div>
      <div className="aspect-video">
        {state.loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400 motion-reduce:animate-none" />
          </div>
        ) : src ? (
          <iframe
            ref={frameRef}
            key={`${match.id}-${reloadKey}`}
            title={match.name}
            src={src}
            className="h-full w-full border-0"
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            onLoad={() => {
              frameRef.current?.contentWindow?.postMessage({ type: 'player:cmd', cmd: audible ? 'unmute' : 'silence' }, '*');
            }}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-3 text-center">
            <p className="text-xs text-slate-300">Yayın adresi alınamadı</p>
            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              className="rounded-full border border-white/15 px-3 py-1 text-[11px] font-semibold text-slate-200 hover:bg-white/10"
            >
              Tekrar dene
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Aynı anda 2 veya 4 yayın. Listeden seçilen maç/kanal boş kutuya, kutular doluysa
 * seçili (yeşil çerçeveli) kutuya yerleşir.
 */
const MultiView = ({ slots, layout, onLayout, onRemove, onExit, audioId, onAudio, targetIndex, onTarget }) => {
  const cells = Array.from({ length: layout }, (_, i) => slots[i] || null);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] bg-slate-950/50 px-3 py-2.5 sm:px-4">
        <div>
          <p className="text-sm font-bold text-white">Çoklu izleme</p>
          <p className="text-[11px] text-slate-400">Soldaki listeden maç veya kanal seç, boş kutuya eklensin.</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex rounded-full border border-white/[0.1] bg-white/[0.04] p-0.5" role="group" aria-label="Ekran sayısı">
            {[2, 4].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onLayout(n)}
                aria-pressed={layout === n}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                  layout === n ? 'bg-emerald-500 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                {n} ekran
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1 text-[11px] font-semibold text-slate-200 transition hover:border-emerald-500/40 hover:text-emerald-200"
          >
            Tekli görünüm
          </button>
        </div>
      </div>

      <div className={`grid gap-2 p-2 ${layout === 2 ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2' : 'grid-cols-2'}`}>
        {cells.map((m, i) =>
          m ? (
            <Slot
              key={m.id}
              match={m}
              audible={audioId === m.id}
              onAudio={() => onAudio(m.id)}
              onRemove={() => onRemove(m.id)}
              selected={targetIndex === i}
              onSelectSlot={() => onTarget(i)}
            />
          ) : (
            <button
              key={`empty-${i}`}
              type="button"
              onClick={() => onTarget(i)}
              className={`flex aspect-video items-center justify-center rounded-xl border-2 border-dashed text-center text-xs transition ${
                targetIndex === i
                  ? 'border-emerald-400/60 bg-emerald-500/[0.06] text-emerald-200'
                  : 'border-white/[0.1] text-slate-500 hover:border-white/[0.2] hover:text-slate-300'
              }`}
            >
              <span>
                <span className="block text-2xl leading-none">+</span>
                Listeden seç
              </span>
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default MultiView;
