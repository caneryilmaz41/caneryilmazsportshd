// Logo cache
const logoCache = new Map();
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 saat

// Takım ismi temizleme fonksiyonu
const normalizeTeamName = (name) => {
  return name.toLowerCase()
    .replace(/[çc]/g, 'c')
    .replace(/[ğg]/g, 'g')
    .replace(/[ıi]/g, 'i')
    .replace(/[öo]/g, 'o')
    .replace(/[şs]/g, 's')
    .replace(/[üu]/g, 'u')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Takım eşleştirme fonksiyonu
const matchTeam = (teamName, patterns) => {
  const normalized = normalizeTeamName(teamName);
  return patterns.some(pattern => {
    const normalizedPattern = normalizeTeamName(pattern);
    return normalized.includes(normalizedPattern) || normalizedPattern.includes(normalized);
  });
};

// Takım logoları - assets/teamlogos klasöründen
export const getTeamLogoPath = (teamName) => {
  const cleanName = teamName.toLowerCase().trim();
  
  // Türkiye Süper Lig
  if (matchTeam(cleanName, ['galatasaray', 'gala', 'gs'])) return '/teamlogos/Türkiye - Süper Lig/Galatasaray.png';
  if (matchTeam(cleanName, ['fenerbahce', 'fenerbahçe', 'fener', 'fb'])) return '/teamlogos/Türkiye - Süper Lig/Fenerbahce.png';
  if (matchTeam(cleanName, ['besiktas', 'beşiktaş', 'bjk', 'kartal'])) return '/teamlogos/Türkiye - Süper Lig/Besiktas JK.png';
  if (matchTeam(cleanName, ['trabzonspor', 'trabzon', 'ts'])) return '/teamlogos/Türkiye - Süper Lig/Trabzonspor.png';
  if (matchTeam(cleanName, ['basaksehir', 'başakşehir', 'istanbul basaksehir'])) return '/teamlogos/Türkiye - Süper Lig/Basaksehir FK.png';
  if (matchTeam(cleanName, ['alanyaspor', 'alanya'])) return '/teamlogos/Türkiye - Süper Lig/Alanyaspor.png';
  if (matchTeam(cleanName, ['antalyaspor', 'antalya'])) return '/teamlogos/Türkiye - Süper Lig/Antalyaspor.png';
  if (matchTeam(cleanName, ['kayserispor', 'kayseri'])) return '/teamlogos/Türkiye - Süper Lig/Kayserispor.png';
  if (matchTeam(cleanName, ['konyaspor', 'konya'])) return '/teamlogos/Türkiye - Süper Lig/Konyaspor.png';
  if (matchTeam(cleanName, ['samsunspor', 'samsun'])) return '/teamlogos/Türkiye - Süper Lig/Samsunspor.png';
  if (matchTeam(cleanName, ['rizespor', 'rize', 'caykur rizespor'])) return '/teamlogos/Türkiye - Süper Lig/Caykur Rizespor.png';
  if (matchTeam(cleanName, ['kasimpasa', 'kasımpaşa'])) return '/teamlogos/Türkiye - Süper Lig/Kasimpasa.png';
  if (matchTeam(cleanName, ['goztepe', 'göztepe', 'izmir'])) return '/teamlogos/Türkiye - Süper Lig/Göztepe.png';
  if (matchTeam(cleanName, ['eyupspor', 'eyüpspor'])) return '/teamlogos/Türkiye - Süper Lig/Eyüpspor.png';
  if (matchTeam(cleanName, ['gaziantep', 'gaziantepspor'])) return '/teamlogos/Türkiye - Süper Lig/Gaziantep FK.png';
  if (matchTeam(cleanName, ['kocaelispor', 'kocaeli', 'izmit'])) return '/teamlogos/Türkiye - Süper Lig/Kocaelispor.png';
  if (matchTeam(cleanName, ['fatih karagumruk', 'fatih karagümrük', 'karagumruk'])) return '/teamlogos/Türkiye - Süper Lig/Fatih Karagümrük.png';
  if (matchTeam(cleanName, ['sivasspor', 'sivas'])) return '/teamlogos/Türkiye - Süper Lig/Sivasspor.png';
  
  // Premier League
  if (matchTeam(cleanName, ['manchester united', 'man united', 'man utd', 'united'])) return '/teamlogos/England - Premier League/Manchester United.png';
  if (matchTeam(cleanName, ['manchester city', 'man city', 'city'])) return '/teamlogos/England - Premier League/Manchester City.png';
  if (matchTeam(cleanName, ['liverpool', 'lfc'])) return '/teamlogos/England - Premier League/Liverpool FC.png';
  if (matchTeam(cleanName, ['chelsea', 'cfc'])) return '/teamlogos/England - Premier League/Chelsea FC.png';
  if (matchTeam(cleanName, ['arsenal', 'afc', 'gunners'])) return '/teamlogos/England - Premier League/Arsenal FC.png';
  if (matchTeam(cleanName, ['tottenham', 'spurs', 'thfc'])) return '/teamlogos/England - Premier League/Tottenham Hotspur.png';
  if (matchTeam(cleanName, ['newcastle', 'nufc', 'toon'])) return '/teamlogos/England - Premier League/Newcastle United.png';
  if (matchTeam(cleanName, ['aston villa', 'villa', 'avfc'])) return '/teamlogos/England - Premier League/Aston Villa.png';
  if (matchTeam(cleanName, ['west ham', 'hammers', 'whufc'])) return '/teamlogos/England - Premier League/West Ham United.png';
  if (matchTeam(cleanName, ['brighton', 'seagulls', 'bhafc'])) return '/teamlogos/England - Premier League/Brighton & Hove Albion.png';
  
  // La Liga
  if (matchTeam(cleanName, ['real madrid', 'madrid', 'real', 'rmcf'])) return '/teamlogos/Spain - LaLiga/Real Madrid.png';
  if (matchTeam(cleanName, ['barcelona', 'barca', 'fcb', 'blaugrana'])) return '/teamlogos/Spain - LaLiga/FC Barcelona.png';
  if (matchTeam(cleanName, ['atletico madrid', 'atlético madrid', 'atletico', 'atleti'])) return '/teamlogos/Spain - LaLiga/Atlético de Madrid.png';
  if (matchTeam(cleanName, ['sevilla', 'sfc'])) return '/teamlogos/Spain - LaLiga/Sevilla FC.png';
  if (matchTeam(cleanName, ['valencia', 'vcf', 'che'])) return '/teamlogos/Spain - LaLiga/Valencia CF.png';
  if (matchTeam(cleanName, ['villarreal', 'yellow submarine'])) return '/teamlogos/Spain - LaLiga/Villarreal CF.png';
  if (matchTeam(cleanName, ['real betis', 'betis', 'verdiblancos'])) return '/teamlogos/Spain - LaLiga/Real Betis Balompié.png';
  if (matchTeam(cleanName, ['athletic bilbao', 'athletic', 'bilbao', 'lions'])) return '/teamlogos/Spain - LaLiga/Athletic Bilbao.png';
  
  // Bundesliga
  if (matchTeam(cleanName, ['bayern munich', 'bayern', 'fcb', 'bavaria'])) return '/teamlogos/Germany - Bundesliga/Bayern Munich.png';
  if (matchTeam(cleanName, ['borussia dortmund', 'dortmund', 'bvb', 'bvb 09'])) return '/teamlogos/Germany - Bundesliga/Borussia Dortmund.png';
  if (matchTeam(cleanName, ['rb leipzig', 'leipzig', 'red bull leipzig'])) return '/teamlogos/Germany - Bundesliga/RB Leipzig.png';
  if (matchTeam(cleanName, ['bayer leverkusen', 'leverkusen', 'bayer 04'])) return '/teamlogos/Germany - Bundesliga/Bayer 04 Leverkusen.png';
  if (matchTeam(cleanName, ['eintracht frankfurt', 'frankfurt', 'sge'])) return '/teamlogos/Germany - Bundesliga/Eintracht Frankfurt.png';
  if (matchTeam(cleanName, ['vfb stuttgart', 'stuttgart', 'vfb'])) return '/teamlogos/Germany - Bundesliga/VfB Stuttgart.png';
  
  // Serie A
  if (matchTeam(cleanName, ['juventus', 'juve', 'bianconeri'])) return '/teamlogos/Italy - Serie A/Juventus FC.png';
  if (matchTeam(cleanName, ['ac milan', 'milan', 'rossoneri', 'acm'])) return '/teamlogos/Italy - Serie A/AC Milan.png';
  if (matchTeam(cleanName, ['inter milan', 'inter', 'internazionale', 'nerazzurri'])) return '/teamlogos/Italy - Serie A/Inter Milan.png';
  if (matchTeam(cleanName, ['napoli', 'ssc napoli', 'azzurri'])) return '/teamlogos/Italy - Serie A/SSC Napoli.png';
  if (matchTeam(cleanName, ['roma', 'as roma', 'giallorossi'])) return '/teamlogos/Italy - Serie A/AS Roma.png';
  if (matchTeam(cleanName, ['lazio', 'ss lazio', 'biancocelesti'])) return '/teamlogos/Italy - Serie A/SS Lazio.png';
  if (matchTeam(cleanName, ['atalanta', 'atalanta bc', 'nerazzurri bergamo'])) return '/teamlogos/Italy - Serie A/Atalanta BC.png';
  if (matchTeam(cleanName, ['fiorentina', 'acf fiorentina', 'viola'])) return '/teamlogos/Italy - Serie A/ACF Fiorentina.png';
  
  // Ligue 1
  if (matchTeam(cleanName, ['psg', 'paris saint-germain', 'paris', 'saint germain'])) return '/teamlogos/France - Ligue 1/Paris Saint-Germain.png';
  if (matchTeam(cleanName, ['marseille', 'olympique marseille', 'om'])) return '/teamlogos/France - Ligue 1/Olympique Marseille.png';
  if (matchTeam(cleanName, ['lyon', 'olympique lyon', 'ol'])) return '/teamlogos/France - Ligue 1/Olympique Lyon.png';
  if (matchTeam(cleanName, ['monaco', 'as monaco', 'asm'])) return '/teamlogos/France - Ligue 1/AS Monaco.png';
  if (matchTeam(cleanName, ['lille', 'losc lille', 'losc'])) return '/teamlogos/France - Ligue 1/LOSC Lille.png';
  if (matchTeam(cleanName, ['nice', 'ogc nice', 'ogc'])) return '/teamlogos/France - Ligue 1/OGC Nice.png';
  
  // Eredivisie
  if (matchTeam(cleanName, ['ajax', 'ajax amsterdam', 'afc ajax'])) return '/teamlogos/Netherlands - Eredivisie/Ajax Amsterdam.png';
  if (matchTeam(cleanName, ['psv', 'psv eindhoven', 'eindhoven'])) return '/teamlogos/Netherlands - Eredivisie/PSV Eindhoven.png';
  if (matchTeam(cleanName, ['feyenoord', 'feyenoord rotterdam', 'rotterdam'])) return '/teamlogos/Netherlands - Eredivisie/Feyenoord Rotterdam.png';
  
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