import { useState, useEffect } from "react";
import { getStreamUrl } from "./components/StreamService";
import { scrapeMatches, getFallbackData } from "./components/MatchScraper";

// Logo cache
const logoCache = new Map();
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 saat

// Basit logo servisi - takım ismine göre
const getLogoFromService = (teamName) => {
  const cleanName = teamName.toLowerCase().replace(/\s+/g, "-");
  // Logo.dev servisi - takım ismine göre logo döndürür
  return `https://logo.clearbit.com/${cleanName}.com`;
};

// Yerel logo dosyaları (public/logos/ klasöründe)
const logoUrls = {
  // Türk takımları
  galatasaray:
    "https://img.sporekrani.com/tr_w_36,h_36,c_limit/teams/GG15p6Gkt4vy5CbGDmFNuSLHMC5ojiP0GatfJCdh.png",
  fenerbahçe: "/logos/fenerbahce.png",
  fenerbahce: "/logos/fenerbahce.png",
  beşiktaş: "/logos/besiktas.png",
  besiktas: "/logos/besiktas.png",
  trabzonspor: "/logos/trabzonspor.png",
  başakşehir: "/logos/basaksehir.png",
  basaksehir: "/logos/basaksehir.png",

  // Avrupa takımları
  psv: "/logos/psv.png",
  barcelona: "/logos/barcelona.png",
  "real madrid": "/logos/real-madrid.png",
  "manchester united": "/logos/manchester-united.png",
  liverpool: "/logos/liverpool.png",
  chelsea: "/logos/chelsea.png",
  arsenal: "/logos/arsenal.png",
  "manchester city": "/logos/manchester-city.png",
  "bayern munich": "/logos/bayern-munich.png",
  bayern: "/logos/bayern-munich.png",
  juventus: "/logos/juventus.png",
  milan: "/logos/ac-milan.png",
  "ac milan": "/logos/ac-milan.png",
  inter: "/logos/inter-milan.png",
  "inter milan": "/logos/inter-milan.png",
  psg: "/logos/psg.png",
  "paris saint germain": "/logos/psg.png",
  "atletico madrid": "/logos/atletico-madrid.png",
  "borussia dortmund": "/logos/borussia-dortmund.png",
  tottenham: "/logos/tottenham.png",
};

// Takım logosu çekme (hibrit sistem)
const fetchTeamLogo = async (teamName) => {
  const cacheKey = teamName.toLowerCase().trim();

  // Cache'den kontrol et
  const cached = logoCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
    return cached.url;
  }

  const cleanName = teamName.toLowerCase().trim();
  let logoUrl = null;

  // Önce fallback listesinden ara
  if (logoUrls[cleanName]) {
    logoUrl = logoUrls[cleanName];
  } else {
    // Kısmi eşleşme ara
    for (const [key, url] of Object.entries(logoUrls)) {
      if (cleanName.includes(key) || key.includes(cleanName)) {
        logoUrl = url;
        break;
      }
    }
  }

  // Bulunamazsa null döndür (kısaltma gösterilecek)
  // if (!logoUrl) {
  //   logoUrl = getLogoFromService(teamName)
  // }

  // Cache'e kaydet
  logoCache.set(cacheKey, {
    url: logoUrl,
    timestamp: Date.now(),
  });

  return logoUrl;
};

// Takım kısaltması için fonksiyon
const getTeamInitials = (teamName) => {
  if (!teamName) return "??";

  const cleanName = teamName.toLowerCase().trim();

  // Bilinen takımlar için kısaltmalar
  if (cleanName.includes("galatasaray")) return "GS";
  if (cleanName.includes("fenerbahçe") || cleanName.includes("fenerbahce"))
    return "FB";
  if (cleanName.includes("beşiktaş") || cleanName.includes("besiktas"))
    return "BJK";
  if (cleanName.includes("trabzonspor")) return "TS";
  if (cleanName.includes("başakşehir") || cleanName.includes("basaksehir"))
    return "BŞ";
  if (cleanName.includes("sivasspor")) return "SV";
  if (cleanName.includes("konyaspor")) return "KY";
  if (cleanName.includes("alanyaspor")) return "AL";
  if (cleanName.includes("kayserispor")) return "KS";
  if (cleanName.includes("antalyaspor")) return "AT";

  if (cleanName.includes("barcelona")) return "BAR";
  if (cleanName.includes("real madrid")) return "RM";
  if (cleanName.includes("manchester united")) return "MU";
  if (cleanName.includes("liverpool")) return "LIV";
  if (cleanName.includes("chelsea")) return "CHE";
  if (cleanName.includes("arsenal")) return "ARS";
  if (cleanName.includes("manchester city")) return "MC";
  if (cleanName.includes("bayern munich") || cleanName.includes("bayern"))
    return "BAY";
  if (cleanName.includes("juventus")) return "JUV";
  if (cleanName.includes("milan")) return "MIL";
  if (cleanName.includes("inter")) return "INT";
  if (cleanName.includes("psg")) return "PSG";
  if (cleanName.includes("atletico madrid")) return "ATM";
  if (cleanName.includes("borussia dortmund")) return "BVB";
  if (cleanName.includes("tottenham")) return "TOT";

  // Genel kısaltma - ilk 2 harf veya kelime başları
  const words = teamName.trim().split(" ");
  if (words.length > 1) {
    return words
      .slice(0, 2)
      .map((w) => w.charAt(0))
      .join("")
      .toUpperCase();
  }
  return teamName.substring(0, 2).toUpperCase();
};

// Maç isminden takımları ayıran fonksiyon
const parseMatchTeams = (matchName) => {
  if (!matchName) return [null, null];

  const separators = [
    " vs ",
    " - ",
    " x ",
    " v ",
    " VS ",
    " X ",
    " V ",
    " : ",
    " | ",
  ];
  let teams = [matchName];

  for (const sep of separators) {
    if (matchName.includes(sep)) {
      teams = matchName
        .split(sep)
        .map((team) => team.trim())
        .filter((team) => team.length > 0);
      break;
    }
  }

  return teams.length > 1 ? teams.slice(0, 2) : [teams[0] || matchName, null];
};

// Takım logosu component'i (optimize edilmiş)
const TeamLogo = ({ teamName, logoState, setLogoState }) => {
  const cleanName = (teamName || "").toLowerCase().trim();
  const initials = getTeamInitials(teamName || "");
  const logoData = logoState[cleanName];

  useEffect(() => {
    if (!cleanName || logoData) return;

    const loadLogo = async () => {
      setLogoState((prev) => ({
        ...prev,
        [cleanName]: { loading: true, url: null, error: false },
      }));

      try {
        const logoUrl = await fetchTeamLogo(teamName);

        setLogoState((prev) => ({
          ...prev,
          [cleanName]: { loading: false, url: logoUrl, error: !logoUrl },
        }));
      } catch (error) {
        setLogoState((prev) => ({
          ...prev,
          [cleanName]: { loading: false, url: null, error: true },
        }));
      }
    };

    loadLogo();
  }, [cleanName, teamName, logoData, setLogoState]);

  if (!logoData || logoData.loading) {
    return (
      <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center">
        <div className="w-3 h-3 border border-green-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (logoData.url && !logoData.error) {
    return (
      <div className="w-6 h-6 rounded-full bg-white/5 p-0.5 flex items-center justify-center border border-white/10">
        <img
          src={logoData.url}
          alt={teamName || "Team"}
          className="w-full h-full object-contain rounded-full"
          crossOrigin="anonymous"
          loading="lazy"
          onError={(e) => {
            console.log(`Logo yüklenemedi: ${teamName} - ${logoData.url}`);
            setLogoState((prev) => ({
              ...prev,
              [cleanName]: { loading: false, url: null, error: true },
            }));
          }}
          onLoad={() => {
            console.log(`Logo yüklendi: ${teamName}`);
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center border border-green-400/30 shadow-sm">
      <span className="text-white text-xs font-bold tracking-tight">
        {initials}
      </span>
    </div>
  );
};

function App() {
  const [activeTab, setActiveTab] = useState("matches");
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matches, setMatches] = useState([]);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logoState, setLogoState] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Gerçek scraping'i dene
        const scrapedData = await scrapeMatches();
        if (scrapedData.matches.length > 0) {
          setMatches(scrapedData.matches);
          setChannels(scrapedData.channels);
          localStorage.setItem("lastUpdate", Date.now().toString());
        } else {
          // Scraping başarısızsa fallback kullan
          const fallbackData = getFallbackData();
          setMatches(fallbackData.matches);
          setChannels(fallbackData.channels);
        }
      } catch (error) {
        console.error("Data loading error:", error);
        const fallbackData = getFallbackData();
        setMatches(fallbackData.matches);
        setChannels(fallbackData.channels);
      }
      setLoading(false);
    };

    loadData();

    const interval = setInterval(() => {
      const lastUpdate = localStorage.getItem("lastUpdate");
      const now = Date.now();

      if (!lastUpdate || now - parseInt(lastUpdate) > 60 * 60 * 1000) {
        loadData();
      }
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleMatchSelect = async (match) => {
    const streamUrl = await getStreamUrl(match.id);
    setSelectedMatch({ ...match, url: streamUrl });
  };

  const toggleFullscreen = () => {
    const playerElement = document.getElementById("video-player");
    if (!document.fullscreenElement) {
      playerElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  console.log(handleMatchSelect.matches);
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="text-center py-3 lg:py-6 border-b border-slate-700 lg:border-0">
        <img src="/logom.png" alt="Logo" className="h-6 lg:h-12 mx-auto" />
      </div>

      <div className="max-w-7xl mx-auto px-3 lg:px-6 pt-4 lg:pt-0">
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-3 lg:gap-4">
          <div className="lg:col-span-2 space-y-3 lg:space-y-4">
            <div className="bg-slate-800 rounded-lg overflow-hidden border border-green-500/30">
              {selectedMatch ? (
                <div>
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-3 py-2 lg:px-4 lg:py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h2 className="font-bold text-white text-sm lg:text-base truncate">
                          {selectedMatch.name}
                        </h2>
                        <span className="text-xs lg:text-sm text-green-100">
                          {selectedMatch.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        <span className="text-xs text-green-100 bg-white/20 px-2 py-1 rounded-full">
                          🔴 CANLI
                        </span>
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                  <div
                    id="video-player"
                    className="aspect-video relative bg-gradient-to-br from-slate-900 via-slate-800 to-green-900 p-3 rounded-lg group"
                  >
                    <div className="w-full h-full rounded-lg overflow-hidden border-2 border-green-500/30 shadow-2xl shadow-green-500/10 relative">
                      <iframe
                        src={selectedMatch.url}
                        className="w-full h-full rounded-lg"
                        frameBorder="0"
                        allowFullScreen
                        scrolling="no"
                        sandbox="allow-scripts allow-same-origin allow-presentation"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        allow="autoplay; fullscreen"
                        style={{
                          filter: "brightness(1.05) contrast(1.1)",
                          background: "#000",
                        }}
                      />
                    </div>

                    <div className="absolute top-6 left-6 pointer-events-none z-10">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg">
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                        CANLI YAYIN
                      </div>
                    </div>

                    <div className="absolute top-6 right-6 z-10">
                      <button
                        onClick={toggleFullscreen}
                        className="bg-black/70 backdrop-blur-sm hover:bg-black/90 text-white p-2 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 pointer-events-auto"
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
              ) : (
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
              )}
            </div>
          </div>

          <div className="space-y-3 lg:space-y-4">
            <div className="relative bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-1">
              <div className="flex relative">
                <div
                  className={`absolute top-1 bottom-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg transition-all duration-300 ease-out ${
                    activeTab === "matches"
                      ? "left-1 right-1/2 mr-0.5"
                      : "left-1/2 right-1 ml-0.5"
                  }`}
                ></div>

                <button
                  onClick={() => handleTabChange("matches")}
                  className={`relative flex-1 py-3 px-3 text-sm font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${
                    activeTab === "matches"
                      ? "text-green-400"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span className="text-xs">MAÇLAR</span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                      activeTab === "matches"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-slate-600/50 text-slate-400"
                    }`}
                  >
                    {matches.length}
                  </span>
                </button>

                <button
                  onClick={() => handleTabChange("channels")}
                  className={`relative flex-1 py-3 px-3 text-sm font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${
                    activeTab === "channels"
                      ? "text-green-400"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span className="text-xs">KANALLAR</span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                      activeTab === "channels"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-slate-600/50 text-slate-400"
                    }`}
                  >
                    {channels.length}
                  </span>
                </button>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg border border-slate-600 overflow-hidden">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-slate-300 text-sm">Yükleniyor...</p>
                </div>
              ) : (
                <div
                  className="max-h-80 lg:max-h-96 overflow-y-auto"
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  {activeTab === "matches" ? (
                    <div className="divide-y divide-slate-700">
                      {matches.map((match) => {
                        const teams = parseMatchTeams(match.name);
                        return (
                          <button
                            key={match.id}
                            onClick={() => handleMatchSelect(match)}
                            className={`w-full text-left p-3 hover:bg-slate-700 transition-colors ${
                              selectedMatch?.id === match.id
                                ? "bg-blue-600/20 border-l-4 border-blue-500"
                                : ""
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="text-white text-sm font-bold">
                                  {match.name}
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5 font-light">
                                  {match.time}
                                </div>
                              </div>

                              {selectedMatch?.id === match.id && (
                                <div className="text-green-400 ml-2 flex-shrink-0">
                                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                      {matches.length === 0 && (
                        <div className="p-6 text-center text-slate-400 text-sm">
                          Henüz maç yok
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-700">
                      {channels
                        .filter((channel) => channel.status?.includes("/")) // sadece 7 içerenleri göster
                        .map((channel) => (
                          <button
                            key={channel.id}
                            onClick={() => handleMatchSelect(channel)}
                            className={`w-full text-left p-4 hover:bg-slate-700 transition-colors ${
                              selectedMatch?.id === channel.id
                                ? "bg-blue-600/20 border-l-4 border-blue-500"
                                : ""
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-white truncate">
                                  {channel.name}
                                </div>
                                <div className="text-xs text-slate-400 mt-1">
                                  {channel.status}
                                </div>
                              </div>
                              {selectedMatch?.id === channel.id && (
                                <div className="text-blue-400 ml-2">▶️</div>
                              )}
                            </div>
                          </button>
                        ))}

                      {channels.length === 0 && (
                        <div className="p-6 text-center text-slate-400 text-sm">
                          Henüz kanal yok
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-12 border-t border-slate-700/50">
        <div className="max-w-7xl mx-auto px-3 lg:px-6 py-6">
          <div className="flex items-center justify-center gap-3">
            <img src="/logom.png" alt="Logo" className="h-6 opacity-70" />
            <div className="text-slate-400 text-sm font-light">
              © 2025 caneryılmazsportshd
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
