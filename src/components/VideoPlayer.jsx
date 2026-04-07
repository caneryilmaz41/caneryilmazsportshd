import TeamLogo from './TeamLogo';
import HLSPlayer from './HLSPlayer';
import { parseMatchTeams } from '../utils/teamUtils';
import { getChannelLogoPath } from '../utils/channelUtils';

const VideoPlayer = ({ 
  selectedMatch, 
  streamLoading, 
  logoState, 
  setLogoState, 
  toggleFullscreen 
}) => {
  if (!selectedMatch) {
    return (
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
            <img
              src="/logom.png"
              alt="Logo"
              className="h-10 lg:h-24 mx-auto opacity-90"
            />
          </div>

          <h2 className="text-lg lg:text-3xl font-light mb-3 lg:mb-6 text-white tracking-wide">
            YAYIN BAŞLIYOR
          </h2>

          <div className="w-16 lg:w-24 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent mx-auto mb-4 lg:mb-8"></div>

          <div className="inline-flex items-center gap-2 bg-black/30 border border-green-500/30 px-3 lg:px-4 py-1.5 lg:py-2 rounded-full mb-3 lg:mb-6">
            <div className="w-1.5 lg:w-2 h-1.5 lg:h-2 bg-red-500 rounded-full"></div>
            <span className="text-green-400 font-medium text-xs lg:text-sm tracking-wider">
              CANLI
            </span>
          </div>

          <p className="text-slate-300 text-xs lg:text-base font-light tracking-wide opacity-80 px-2">
            Bir maç veya kanal seçin
          </p>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-green-500/5 to-transparent pointer-events-none"></div>
      </div>
    );
  }

  const teams = parseMatchTeams(selectedMatch.name);
  // Kanal kontrolü: vs, -, x gibi ayırıcılar yoksa ve kanal ismi gibi görünüyorsa
  const hasMatchSeparator = selectedMatch.name.includes(' vs ') || selectedMatch.name.includes(' - ') || selectedMatch.name.includes(' x ');
  const looksLikeChannel = selectedMatch.name.toLowerCase().includes('tv') || 
                          selectedMatch.name.toLowerCase().includes('spor') || 
                          selectedMatch.name.toLowerCase().includes('sport') ||
                          selectedMatch.name.toLowerCase().includes('kanal');
  const isChannel = !hasMatchSeparator && (looksLikeChannel || (!teams[0] || !teams[1]));

  return (
    <div>
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Sol taraf - Kategori ve Özel Etiket */}
          <div className="flex items-center gap-2">
            {selectedMatch.category && (
              <span className="text-xs text-green-100">{selectedMatch.category}</span>
            )}
            {selectedMatch.special && (
              <span className="text-xs text-yellow-300 font-semibold">
                {selectedMatch.special}
              </span>
            )}
          </div>
          
          {/* Orta - Takımlar veya Kanal */}
          <div className="flex items-center gap-4">
            {isChannel ? (
              <div className="flex items-center gap-2">
                <img 
                  src={getChannelLogoPath(selectedMatch.name)} 
                  alt="Kanal"
                  className="w-6 h-6 object-contain"
                  onError={(e) => e.target.style.display = 'none'}
                />
                <span className="text-white text-sm font-medium">
                  {selectedMatch.name}
                </span>
              </div>
            ) : (
              <>
                {teams[0] && (
                  <div className="flex items-center gap-2">
                    {selectedMatch.homeLogo ? (
                      <img src={selectedMatch.homeLogo} alt="Home" className="w-6 h-6 object-contain" />
                    ) : (
                      <TeamLogo 
                        teamName={teams[0]} 
                        logoState={logoState} 
                        setLogoState={setLogoState} 
                      />
                    )}
                    <span className="text-white font-medium text-sm">
                      {teams[0]}
                    </span>
                  </div>
                )}
                
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <span className="text-xs text-green-100 font-medium">
                      CANLI
                    </span>
                  </div>
                  {selectedMatch.time && (
                    <span className="text-xs text-green-100">
                      {selectedMatch.time}
                    </span>
                  )}
                </div>
                
                {teams[1] && (
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-sm">
                      {teams[1]}
                    </span>
                    {selectedMatch.awayLogo ? (
                      <img src={selectedMatch.awayLogo} alt="Away" className="w-6 h-6 object-contain" />
                    ) : (
                      <TeamLogo 
                        teamName={teams[1]} 
                        logoState={logoState} 
                        setLogoState={setLogoState} 
                      />
                    )}
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Sağ taraf - Lig bilgisi */}
          {selectedMatch.league && (
            <span className="text-xs text-green-100">{selectedMatch.league}</span>
          )}
        </div>
      </div>
      
      <div
        id="video-player"
        className="aspect-video relative bg-gradient-to-br from-slate-900 via-slate-800 to-green-900 p-3 rounded-lg group"
      >
        {/* Logo: sağ alt, kontrol çubuğunun üstünde */}
        <div
          className="absolute z-30 pointer-events-none flex items-center justify-center rounded-lg shadow-xl border border-slate-600/50"
          style={{
            bottom: 'max(3.5rem, calc(env(safe-area-inset-bottom, 0px) + 3rem))',
            right: 'max(0.75rem, env(safe-area-inset-right, 0.75rem))',
            background: 'rgba(15, 23, 42, 0.5)',
            padding: 'clamp(4px, 1.2vw, 8px)',
          }}
          aria-hidden
        >
          <img
            src="/logom.png"
            alt=""
            className="object-contain object-center"
            style={{ height: 'clamp(20px, 4vw, 28px)', width: 'auto', minWidth: '20px', display: 'block' }}
          />
        </div>
        <div className="w-full h-full rounded-lg overflow-hidden border-2 border-green-500/30 relative">
          {streamLoading ? (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center">
              <div className="flex items-center gap-8">
                {!isChannel && teams[0] && (
                  <div className="animate-spin">
                    <TeamLogo 
                      teamName={teams[0]} 
                      logoState={logoState} 
                      setLogoState={setLogoState} 
                    />
                  </div>
                )}
                <div className="text-white text-lg font-medium">
                  Yükleniyor...
                </div>
                {!isChannel && teams[1] && (
                  <div className="animate-spin" style={{animationDirection: 'reverse'}}>
                    <TeamLogo 
                      teamName={teams[1]} 
                      logoState={logoState} 
                      setLogoState={setLogoState} 
                    />
                  </div>
                )}
              </div>
            </div>
          ) : selectedMatch.url ? (
            <HLSPlayer
              key={selectedMatch.id || selectedMatch.url}
              src={selectedMatch.url}
              onError={(e) => console.error('HLS error:', e)}
            />
          ) : (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center">
              <p className="text-slate-400 text-sm">Yayın bulunamadı. Lütfen başka bir kanal deneyin.</p>
            </div>
          )}
        </div>



        {/* Modern Fullscreen butonu (eski buton stili tamamen kaldırıldı) */}
        <div className="absolute top-4 right-4 z-20 pointer-events-auto">
          <button
            onClick={toggleFullscreen}
            className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-slate-950/60 border border-green-500/25 text-green-200 shadow-lg shadow-black/30 flex items-center justify-center"
            title="Tam Ekran"
            aria-label="Tam Ekran"
            type="button"
          >
            <svg
              className="w-5 h-5 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;