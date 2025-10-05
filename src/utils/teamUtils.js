// Logo cache
const logoCache = new Map();
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 saat

// Takım logoları - assets/teamlogos klasöründen
export const getTeamLogoPath = (teamName) => {
  const cleanName = teamName.toLowerCase().trim();
  
  // Türkiye Süper Lig
  if (cleanName.includes('galatasaray')) return '/src/assets/teamlogos/Türkiye - Süper Lig/Galatasaray.png';
  if (cleanName.includes('fenerbahçe') || cleanName.includes('fenerbahce')) return '/src/assets/teamlogos/Türkiye - Süper Lig/Fenerbahce.png';
  if (cleanName.includes('beşiktaş') || cleanName.includes('besiktas')) return '/src/assets/teamlogos/Türkiye - Süper Lig/Besiktas JK.png';
  if (cleanName.includes('trabzonspor')) return '/src/assets/teamlogos/Türkiye - Süper Lig/Trabzonspor.png';
  if (cleanName.includes('başakşehir') || cleanName.includes('basaksehir')) return '/src/assets/teamlogos/Türkiye - Süper Lig/Basaksehir FK.png';
  if (cleanName.includes('alanyaspor')) return '/src/assets/teamlogos/Türkiye - Süper Lig/Alanyaspor.png';
  if (cleanName.includes('antalyaspor')) return '/src/assets/teamlogos/Türkiye - Süper Lig/Antalyaspor.png';
  if (cleanName.includes('kayserispor')) return '/src/assets/teamlogos/Türkiye - Süper Lig/Kayserispor.png';
  if (cleanName.includes('konyaspor')) return '/src/assets/teamlogos/Türkiye - Süper Lig/Konyaspor.png';
  if (cleanName.includes('samsunspor')) return '/src/assets/teamlogos/Türkiye - Süper Lig/Samsunspor.png';
  if (cleanName.includes('rizespor')) return '/src/assets/teamlogos/Türkiye - Süper Lig/Caykur Rizespor.png';
  if (cleanName.includes('kasımpaşa') || cleanName.includes('kasimpasa')) return '/src/assets/teamlogos/Türkiye - Süper Lig/Kasimpasa.png';
  if (cleanName.includes('göztepe') || cleanName.includes('goztepe')) return '/src/assets/teamlogos/Türkiye - Süper Lig/Göztepe.png';
  if (cleanName.includes('eyüpspor') || cleanName.includes('eyupspor')) return '/src/assets/teamlogos/Türkiye - Süper Lig/Eyüpspor.png';
  if (cleanName.includes('gaziantep')) return '/src/assets/teamlogos/Türkiye - Süper Lig/Gaziantep FK.png';
  if (cleanName.includes('kocaelispor')) return '/src/assets/teamlogos/Türkiye - Süper Lig/Kocaelispor.png';
  if (cleanName.includes('fatih karagümrük')) return '/src/assets/teamlogos/Türkiye - Süper Lig/Fatih Karagümrük.png';
  
  // Premier League
  if (cleanName.includes('manchester united')) return '/src/assets/teamlogos/England - Premier League/Manchester United.png';
  if (cleanName.includes('manchester city')) return '/src/assets/teamlogos/England - Premier League/Manchester City.png';
  if (cleanName.includes('liverpool')) return '/src/assets/teamlogos/England - Premier League/Liverpool FC.png';
  if (cleanName.includes('chelsea')) return '/src/assets/teamlogos/England - Premier League/Chelsea FC.png';
  if (cleanName.includes('arsenal')) return '/src/assets/teamlogos/England - Premier League/Arsenal FC.png';
  if (cleanName.includes('tottenham')) return '/src/assets/teamlogos/England - Premier League/Tottenham Hotspur.png';
  if (cleanName.includes('newcastle')) return '/src/assets/teamlogos/England - Premier League/Newcastle United.png';
  if (cleanName.includes('aston villa')) return '/src/assets/teamlogos/England - Premier League/Aston Villa.png';
  if (cleanName.includes('west ham')) return '/src/assets/teamlogos/England - Premier League/West Ham United.png';
  if (cleanName.includes('brighton')) return '/src/assets/teamlogos/England - Premier League/Brighton & Hove Albion.png';
  
  // La Liga
  if (cleanName.includes('real madrid')) return '/src/assets/teamlogos/Spain - LaLiga/Real Madrid.png';
  if (cleanName.includes('barcelona')) return '/src/assets/teamlogos/Spain - LaLiga/FC Barcelona.png';
  if (cleanName.includes('atletico madrid') || cleanName.includes('atlético madrid')) return '/src/assets/teamlogos/Spain - LaLiga/Atlético de Madrid.png';
  if (cleanName.includes('sevilla')) return '/src/assets/teamlogos/Spain - LaLiga/Sevilla FC.png';
  if (cleanName.includes('valencia')) return '/src/assets/teamlogos/Spain - LaLiga/Valencia CF.png';
  if (cleanName.includes('villarreal')) return '/src/assets/teamlogos/Spain - LaLiga/Villarreal CF.png';
  if (cleanName.includes('real betis')) return '/src/assets/teamlogos/Spain - LaLiga/Real Betis Balompié.png';
  if (cleanName.includes('athletic bilbao')) return '/src/assets/teamlogos/Spain - LaLiga/Athletic Bilbao.png';
  
  // Bundesliga
  if (cleanName.includes('bayern munich') || cleanName.includes('bayern')) return '/src/assets/teamlogos/Germany - Bundesliga/Bayern Munich.png';
  if (cleanName.includes('borussia dortmund') || cleanName.includes('dortmund')) return '/src/assets/teamlogos/Germany - Bundesliga/Borussia Dortmund.png';
  if (cleanName.includes('rb leipzig') || cleanName.includes('leipzig')) return '/src/assets/teamlogos/Germany - Bundesliga/RB Leipzig.png';
  if (cleanName.includes('bayer leverkusen') || cleanName.includes('leverkusen')) return '/src/assets/teamlogos/Germany - Bundesliga/Bayer 04 Leverkusen.png';
  if (cleanName.includes('eintracht frankfurt')) return '/src/assets/teamlogos/Germany - Bundesliga/Eintracht Frankfurt.png';
  if (cleanName.includes('vfb stuttgart')) return '/src/assets/teamlogos/Germany - Bundesliga/VfB Stuttgart.png';
  
  // Serie A
  if (cleanName.includes('juventus')) return '/src/assets/teamlogos/Italy - Serie A/Juventus FC.png';
  if (cleanName.includes('ac milan') || cleanName.includes('milan')) return '/src/assets/teamlogos/Italy - Serie A/AC Milan.png';
  if (cleanName.includes('inter milan') || cleanName.includes('inter')) return '/src/assets/teamlogos/Italy - Serie A/Inter Milan.png';
  if (cleanName.includes('napoli')) return '/src/assets/teamlogos/Italy - Serie A/SSC Napoli.png';
  if (cleanName.includes('roma')) return '/src/assets/teamlogos/Italy - Serie A/AS Roma.png';
  if (cleanName.includes('lazio')) return '/src/assets/teamlogos/Italy - Serie A/SS Lazio.png';
  if (cleanName.includes('atalanta')) return '/src/assets/teamlogos/Italy - Serie A/Atalanta BC.png';
  if (cleanName.includes('fiorentina')) return '/src/assets/teamlogos/Italy - Serie A/ACF Fiorentina.png';
  
  // Ligue 1
  if (cleanName.includes('psg') || cleanName.includes('paris saint-germain')) return '/src/assets/teamlogos/France - Ligue 1/Paris Saint-Germain.png';
  if (cleanName.includes('marseille')) return '/src/assets/teamlogos/France - Ligue 1/Olympique Marseille.png';
  if (cleanName.includes('lyon')) return '/src/assets/teamlogos/France - Ligue 1/Olympique Lyon.png';
  if (cleanName.includes('monaco')) return '/src/assets/teamlogos/France - Ligue 1/AS Monaco.png';
  if (cleanName.includes('lille')) return '/src/assets/teamlogos/France - Ligue 1/LOSC Lille.png';
  if (cleanName.includes('nice')) return '/src/assets/teamlogos/France - Ligue 1/OGC Nice.png';
  
  // Eredivisie
  if (cleanName.includes('ajax')) return '/src/assets/teamlogos/Netherlands - Eredivisie/Ajax Amsterdam.png';
  if (cleanName.includes('psv')) return '/src/assets/teamlogos/Netherlands - Eredivisie/PSV Eindhoven.png';
  if (cleanName.includes('feyenoord')) return '/src/assets/teamlogos/Netherlands - Eredivisie/Feyenoord Rotterdam.png';
  
  return null;
};

// Takım logosu çekme
export const fetchTeamLogo = async (teamName) => {
  const cacheKey = teamName.toLowerCase().trim();

  // Cache'den kontrol et
  const cached = logoCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
    return cached.url;
  }

  // Local assets'ten logo path'i al
  const logoUrl = getTeamLogoPath(teamName);

  // Cache'e kaydet
  logoCache.set(cacheKey, {
    url: logoUrl,
    timestamp: Date.now(),
  });

  return logoUrl;
};

// Takım kısaltması için fonksiyon
export const getTeamInitials = (teamName) => {
  if (!teamName) return "??";

  const cleanName = teamName.toLowerCase().trim();

  // Bilinen takımlar için kısaltmalar
  if (cleanName.includes("galatasaray")) return "GS";
  if (cleanName.includes("fenerbahçe") || cleanName.includes("fenerbahce")) return "FB";
  if (cleanName.includes("beşiktaş") || cleanName.includes("besiktas")) return "BJK";
  if (cleanName.includes("trabzonspor")) return "TS";
  if (cleanName.includes("başakşehir") || cleanName.includes("basaksehir")) return "BŞ";
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
  if (cleanName.includes("bayern munich") || cleanName.includes("bayern")) return "BAY";
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
export const parseMatchTeams = (matchName) => {
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