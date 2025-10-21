import TeamLogo from './TeamLogo';
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

          <div className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-sm border border-green-500/30 px-3 lg:px-4 py-1.5 lg:py-2 rounded-full mb-3 lg:mb-6">
            <div className="w-1.5 lg:w-2 h-1.5 lg:h-2 bg-red-500 rounded-full animate-pulse"></div>
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
        <div className="flex items-center justify-center">
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
                <div className="flex items-center gap-2 ml-4">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-100 font-medium">
                    CANLI
                  </span>
                </div>
              </div>
            ) : null}
            {!isChannel && teams[0] && (
              <div className="flex items-center gap-2">
                <TeamLogo 
                  teamName={teams[0]} 
                  logoState={logoState} 
                  setLogoState={setLogoState} 
                />
                <span className="text-white font-medium text-sm">
                  {teams[0]}
                </span>
              </div>
            )}
            
            {!isChannel && (
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-100 font-medium">
                    CANLI
                  </span>
                </div>
                <span className="text-xs text-green-100">
                  {selectedMatch.time}
                </span>
              </div>
            )}
            
            {!isChannel && teams[1] && (
              <div className="flex items-center gap-2">
                <span className="text-white font-medium text-sm">
                  {teams[1]}
                </span>
                <TeamLogo 
                  teamName={teams[1]} 
                  logoState={logoState} 
                  setLogoState={setLogoState} 
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div
        id="video-player"
        className="aspect-video relative bg-gradient-to-br from-slate-900 via-slate-800 to-green-900 p-3 rounded-lg group"
      >
        <div className="w-full h-full rounded-lg overflow-hidden border-2 border-green-500/30 shadow-2xl shadow-green-500/10 relative">
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
          ) : (
            <div className="relative w-full h-full">
              <iframe
                src={selectedMatch.url}
                className="w-full h-full rounded-lg"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; fullscreen; encrypted-media"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-top-navigation"
                referrerPolicy="unsafe-url"
                style={{
                  background: "#000",
                  border: "none"
                }}
                onLoad={() => {
                  // Senin cache'indeki ayarları simüle et
                  const iframe = document.querySelector('iframe');
                  if (iframe) {
                    // Cookie ve session simülasyonu
                    document.cookie = "trgoals_session=active; path=/; domain=.trgoals1431.xyz";
                    document.cookie = "user_agent=cached; path=/";
                    
                    // Local storage simülasyonu
                    localStorage.setItem('trgoals_visited', 'true');
                    localStorage.setItem('stream_cache', Date.now().toString());
                    
                    // Referer header simülasyonu
                    const meta = document.createElement('meta');
                    meta.name = 'referrer';
                    meta.content = 'unsafe-url';
                    document.head.appendChild(meta);
                  }
                }}
              />
            </div>
          )}
        </div>

        <div className="absolute top-6 right-6 lg:top-auto lg:bottom-6 z-10">
          <button
            onClick={toggleFullscreen}
            className="bg-black/70 backdrop-blur-sm hover:bg-black/90 text-white p-2 rounded-lg transition-all duration-200 opacity-70 lg:opacity-0 lg:group-hover:opacity-100 pointer-events-auto"
            title="Tam Ekran"
          >
            <svg
              className="w-5 h-5"
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