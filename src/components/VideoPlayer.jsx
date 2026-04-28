import { useEffect, useMemo, useState } from 'react';
import TeamLogo from './TeamLogo';
import { parseMatchTeams } from '../utils/teamUtils';
import { SPLASH_BG } from './AppSplashScreen';
import ChannelLogoImg from './ChannelLogoImg';

const PLAYER_UI_VERSION = 'android-ui-fix-2026-04-15';

const VideoPlayer = ({ 
  selectedMatch, 
  streamLoading, 
  logoState, 
  setLogoState,
  playerMatches = [],
  onRailMatchSelect
}) => {
  const [reloadKey, setReloadKey] = useState(0);
  const railPayload = useMemo(
    () =>
      (playerMatches || []).map((m) => ({
        id: m.id,
        name: m.name,
        league: m.league || '',
        time: m.time || '',
        homeLogo: m.homeLogo || '',
        awayLogo: m.awayLogo || '',
      })),
    [playerMatches]
  );

  useEffect(() => {
    const onMessage = (event) => {
      const data = event?.data;
      if (!data || data.type !== 'player:select-match') return;
      if (!data.id || typeof onRailMatchSelect !== 'function') return;
      const picked = (playerMatches || []).find((m) => m.id === data.id);
      if (picked) onRailMatchSelect(picked);
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [onRailMatchSelect, playerMatches]);

  useEffect(() => {
    setReloadKey(0);
  }, [selectedMatch?.id, selectedMatch?.url, selectedMatch?.streamType]);

  if (!selectedMatch) {
    return (
      <div>
        <div
          className="relative aspect-video flex flex-col justify-center text-center overflow-hidden rounded-lg"
          style={{
            backgroundImage:
              'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.9)), url("https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="relative z-10 p-4 lg:p-12">
            <div className="mb-4 lg:mb-8">
              <img src="/logom.png" alt="Logo" className="h-10 lg:h-24 mx-auto opacity-90" />
            </div>
            <h2 className="text-lg lg:text-3xl font-light mb-3 lg:mb-6 text-white tracking-wide">
              YAYIN BAŞLIYOR
            </h2>
            <div className="w-16 lg:w-24 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent mx-auto mb-4 lg:mb-8"></div>
            <div className="inline-flex items-center gap-2 bg-black/30 border border-green-500/30 px-3 lg:px-4 py-1.5 lg:py-2 rounded-full mb-3 lg:mb-6">
              <div className="w-1.5 lg:w-2 h-1.5 lg:h-2 bg-red-500 rounded-full"></div>
              <span className="text-green-400 font-medium text-xs lg:text-sm tracking-wider">CANLI</span>
            </div>
            <p className="text-slate-300 text-xs lg:text-base font-light tracking-wide opacity-80 px-2">
              Bir maç veya kanal seçin
            </p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-green-500/5 to-transparent pointer-events-none"></div>
        </div>
      </div>
    );
  }

  const teams = parseMatchTeams(selectedMatch.name);
  const hasMatchSeparator = selectedMatch.name.includes(' vs ') || selectedMatch.name.includes(' - ') || selectedMatch.name.includes(' x ');
  const looksLikeChannel = selectedMatch.name.toLowerCase().includes('tv') || 
                          selectedMatch.name.toLowerCase().includes('spor') || 
                          selectedMatch.name.toLowerCase().includes('sport') ||
                          selectedMatch.name.toLowerCase().includes('kanal');
  const isChannel = !hasMatchSeparator && (looksLikeChannel || (!teams[0] || !teams[1]));

  // HLS ise kendi player.html'imizi kullan, değilse trgool iframe
  const playerSrc = selectedMatch.streamType === 'hls'
    ? `/player.html?ui=${encodeURIComponent(PLAYER_UI_VERSION)}&src=${encodeURIComponent(selectedMatch.url || '')}&rail=${encodeURIComponent(JSON.stringify(railPayload))}&selected=${encodeURIComponent(selectedMatch.id || '')}`
    : (selectedMatch.url || selectedMatch.iframeUrl || '');
  const isInvalidPlayerSrc =
    !playerSrc ||
    playerSrc === '/' ||
    playerSrc === window.location.pathname ||
    playerSrc === window.location.href;
  return (
    <div>
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="space-y-2 sm:space-y-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              {selectedMatch.category && (
                <span className="truncate text-[10px] sm:text-xs text-green-100">{selectedMatch.category}</span>
              )}
              {selectedMatch.special && (
                <span className="truncate rounded bg-black/15 px-1.5 py-0.5 text-[10px] sm:text-xs text-yellow-200 font-semibold">
                  {selectedMatch.special}
                </span>
              )}
            </div>
            {selectedMatch.league && (
              <span className="max-w-[45%] truncate text-right text-[10px] sm:max-w-[33%] sm:text-xs text-green-100">
                {selectedMatch.league}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {isChannel ? (
              <div className="flex min-w-0 items-center gap-2">
                <div className="h-6 w-6 shrink-0">
                  <ChannelLogoImg channelName={selectedMatch.name} className="h-6 w-6 object-contain" />
                </div>
                <span className="truncate text-white text-base sm:text-sm font-semibold">{selectedMatch.name}</span>
              </div>
            ) : (
              <>
                {teams[0] && (
                  <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                    {selectedMatch.homeLogo ? (
                      <img src={selectedMatch.homeLogo} alt="Home" className="w-6 h-6 object-contain" />
                    ) : streamLoading ? (
                      <div className="h-6 w-6 shrink-0 rounded-md bg-slate-600/30" />
                    ) : (
                      <TeamLogo teamName={teams[0]} logoState={logoState} setLogoState={setLogoState} />
                    )}
                    <span className="max-w-[110px] truncate text-white font-semibold text-[14px] sm:text-sm">{teams[0]}</span>
                  </div>
                )}

                <div className="flex shrink-0 flex-col items-center justify-center rounded-md bg-black/10 px-2 py-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-red-300 rounded-full"></div>
                    <span className="text-[10px] sm:text-xs text-green-100 font-semibold">CANLI</span>
                  </div>
                  {selectedMatch.time && (
                    <span className="text-[10px] sm:text-xs text-green-100">{selectedMatch.time}</span>
                  )}
                </div>

                {teams[1] && (
                  <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                    <span className="max-w-[110px] truncate text-white font-semibold text-[14px] sm:text-sm">{teams[1]}</span>
                    {selectedMatch.awayLogo ? (
                      <img src={selectedMatch.awayLogo} alt="Away" className="w-6 h-6 object-contain" />
                    ) : streamLoading ? (
                      <div className="h-6 w-6 shrink-0 rounded-md bg-slate-600/30" />
                    ) : (
                      <TeamLogo teamName={teams[1]} logoState={logoState} setLogoState={setLogoState} />
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      <div
        id="video-player"
        className="relative aspect-video bg-gradient-to-br from-slate-900 via-slate-800 to-green-900 p-2 sm:p-3 rounded-lg group"
      >
        <button
          type="button"
          onClick={() => setReloadKey((prev) => prev + 1)}
          className="absolute right-3 top-3 z-20 rounded-md border border-slate-300/35 bg-slate-900/80 px-2 py-1 text-[10px] font-semibold text-slate-100 hover:bg-slate-800"
        >
          Yayını Yenile
        </button>
        <div
          className="w-full h-full rounded-lg relative overflow-hidden border-2 border-green-500/30"
        >
          {streamLoading ? (
            <div
              className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden"
              style={{
                backgroundImage: SPLASH_BG,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute inset-0 bg-slate-950/50 pointer-events-none" />
              <div className="relative z-10 w-full max-w-sm px-5 text-center">
                <div className="rounded-2xl border border-white/12 bg-slate-900/55 px-6 py-6 shadow-2xl backdrop-blur-sm">
                  <img
                    src="/logom.png"
                    alt=""
                    className="mx-auto h-9 w-auto object-contain opacity-[0.97] sm:h-11"
                    decoding="async"
                  />
                  {isChannel ? (
                    <div className="mt-4 flex flex-col items-center gap-1.5">
                      <div className="flex items-center justify-center gap-2.5">
                        <div className="h-8 w-8 shrink-0">
                          <ChannelLogoImg channelName={selectedMatch.name} className="h-8 w-8 object-contain" />
                        </div>
                        <span className="line-clamp-2 text-left text-sm font-semibold text-slate-100">
                          {selectedMatch.name}
                        </span>
                      </div>
                    </div>
                  ) : teams[0] || teams[1] ? (
                    <p className="mt-4 line-clamp-2 text-sm font-semibold text-slate-100">
                      {[teams[0], teams[1]].filter(Boolean).join(' — ')}
                    </p>
                  ) : null}
                  <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-400/90">Yayın açılıyor</p>
                  <div className="mt-3 h-0.5 w-36 max-w-full overflow-hidden rounded-full bg-slate-800/90">
                    <div className="relative h-full w-full">
                      <div className="stream-open-shine" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : isInvalidPlayerSrc ? (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center text-center px-4">
              <div>
                <p className="text-sm text-slate-200 font-medium">Yayın adresi alınamadı</p>
                <p className="text-xs text-slate-400 mt-1">Lütfen başka bir maç veya kanal seçin</p>
              </div>
            </div>
          ) : (
            <iframe
              key={`${selectedMatch.id || selectedMatch.url}-${reloadKey}`}
              title="Canlı yayın"
              src={playerSrc}
              className="w-full h-full border-0 bg-black"
              allowFullScreen
              webkitallowfullscreen="true"
              mozallowfullscreen="true"
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            />
          )}
        </div>


      </div>
    </div>
  );
};

export default VideoPlayer;
