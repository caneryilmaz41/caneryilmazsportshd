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
  
  // Türkiye Süper Lig (Tüm Takımlar)
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
  if (matchTeam(cleanName, ['genclerbirligi', 'gençlerbirliği', 'ankara'])) return '/teamlogos/Türkiye - Süper Lig/Genclerbirligi Ankara.png';
  
  // Premier League (Tüm Takımlar)
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
  if (matchTeam(cleanName, ['bournemouth', 'afc bournemouth', 'cherries'])) return '/teamlogos/England - Premier League/AFC Bournemouth.png';
  if (matchTeam(cleanName, ['brentford', 'brentford fc', 'bees'])) return '/teamlogos/England - Premier League/Brentford FC.png';
  if (matchTeam(cleanName, ['crystal palace', 'palace', 'eagles'])) return '/teamlogos/England - Premier League/Crystal Palace.png';
  if (matchTeam(cleanName, ['everton', 'efc', 'toffees'])) return '/teamlogos/England - Premier League/Everton FC.png';
  if (matchTeam(cleanName, ['fulham', 'ffc', 'cottagers'])) return '/teamlogos/England - Premier League/Fulham FC.png';
  if (matchTeam(cleanName, ['nottingham forest', 'forest', 'nffc'])) return '/teamlogos/England - Premier League/Nottingham Forest.png';
  if (matchTeam(cleanName, ['wolverhampton', 'wolves', 'wwfc'])) return '/teamlogos/England - Premier League/Wolverhampton Wanderers.png';
  
  // La Liga (Tüm Takımlar)
  if (matchTeam(cleanName, ['real madrid', 'madrid', 'real', 'rmcf'])) return '/teamlogos/Spain - LaLiga/Real Madrid.png';
  if (matchTeam(cleanName, ['barcelona', 'barca', 'fcb', 'blaugrana'])) return '/teamlogos/Spain - LaLiga/FC Barcelona.png';
  if (matchTeam(cleanName, ['atletico madrid', 'atlético madrid', 'atletico', 'atleti'])) return '/teamlogos/Spain - LaLiga/Atlético de Madrid.png';
  if (matchTeam(cleanName, ['sevilla', 'sfc'])) return '/teamlogos/Spain - LaLiga/Sevilla FC.png';
  if (matchTeam(cleanName, ['valencia', 'vcf', 'che'])) return '/teamlogos/Spain - LaLiga/Valencia CF.png';
  if (matchTeam(cleanName, ['villarreal', 'yellow submarine'])) return '/teamlogos/Spain - LaLiga/Villarreal CF.png';
  if (matchTeam(cleanName, ['real betis', 'betis', 'verdiblancos'])) return '/teamlogos/Spain - LaLiga/Real Betis Balompié.png';
  if (matchTeam(cleanName, ['athletic bilbao', 'athletic', 'bilbao', 'lions'])) return '/teamlogos/Spain - LaLiga/Athletic Bilbao.png';
  if (matchTeam(cleanName, ['real sociedad', 'sociedad', 'real sociedad san sebastian'])) return '/teamlogos/Spain - LaLiga/Real Sociedad.png';
  if (matchTeam(cleanName, ['osasuna', 'ca osasuna', 'pamplona'])) return '/teamlogos/Spain - LaLiga/CA Osasuna.png';
  if (matchTeam(cleanName, ['celta vigo', 'celta', 'vigo'])) return '/teamlogos/Spain - LaLiga/Celta de Vigo.png';
  if (matchTeam(cleanName, ['deportivo alaves', 'alaves', 'deportivo'])) return '/teamlogos/Spain - LaLiga/Deportivo Alavés.png';
  if (matchTeam(cleanName, ['getafe', 'getafe cf'])) return '/teamlogos/Spain - LaLiga/Getafe CF.png';
  if (matchTeam(cleanName, ['girona', 'girona fc'])) return '/teamlogos/Spain - LaLiga/Girona FC.png';
  if (matchTeam(cleanName, ['mallorca', 'rcd mallorca'])) return '/teamlogos/Spain - LaLiga/RCD Mallorca.png';
  if (matchTeam(cleanName, ['rayo vallecano', 'rayo', 'vallecano'])) return '/teamlogos/Spain - LaLiga/Rayo Vallecano.png';
  if (matchTeam(cleanName, ['espanyol', 'rcd espanyol', 'barcelona espanyol'])) return '/teamlogos/Spain - LaLiga/RCD Espanyol Barcelona.png';
  
  // Bundesliga (Tüm Takımlar)
  if (matchTeam(cleanName, ['bayern munich', 'bayern', 'fcb', 'bavaria'])) return '/teamlogos/Germany - Bundesliga/Bayern Munich.png';
  if (matchTeam(cleanName, ['borussia dortmund', 'dortmund', 'bvb', 'bvb 09'])) return '/teamlogos/Germany - Bundesliga/Borussia Dortmund.png';
  if (matchTeam(cleanName, ['rb leipzig', 'leipzig', 'red bull leipzig'])) return '/teamlogos/Germany - Bundesliga/RB Leipzig.png';
  if (matchTeam(cleanName, ['bayer leverkusen', 'leverkusen', 'bayer 04'])) return '/teamlogos/Germany - Bundesliga/Bayer 04 Leverkusen.png';
  if (matchTeam(cleanName, ['eintracht frankfurt', 'frankfurt', 'sge'])) return '/teamlogos/Germany - Bundesliga/Eintracht Frankfurt.png';
  if (matchTeam(cleanName, ['vfb stuttgart', 'stuttgart', 'vfb'])) return '/teamlogos/Germany - Bundesliga/VfB Stuttgart.png';
  if (matchTeam(cleanName, ['borussia monchengladbach', 'gladbach', 'monchengladbach'])) return '/teamlogos/Germany - Bundesliga/Borussia Mönchengladbach.png';
  if (matchTeam(cleanName, ['vfl wolfsburg', 'wolfsburg', 'vfl'])) return '/teamlogos/Germany - Bundesliga/VfL Wolfsburg.png';
  if (matchTeam(cleanName, ['werder bremen', 'bremen', 'werder'])) return '/teamlogos/Germany - Bundesliga/SV Werder Bremen.png';
  if (matchTeam(cleanName, ['sc freiburg', 'freiburg', 'sc'])) return '/teamlogos/Germany - Bundesliga/SC Freiburg.png';
  if (matchTeam(cleanName, ['tsg hoffenheim', 'hoffenheim', 'tsg'])) return '/teamlogos/Germany - Bundesliga/TSG 1899 Hoffenheim.png';
  if (matchTeam(cleanName, ['fc augsburg', 'augsburg', 'fca'])) return '/teamlogos/Germany - Bundesliga/FC Augsburg.png';
  if (matchTeam(cleanName, ['union berlin', 'berlin', 'fc union'])) return '/teamlogos/Germany - Bundesliga/1.FC Union Berlin.png';
  if (matchTeam(cleanName, ['mainz', 'fsv mainz', 'mainz 05'])) return '/teamlogos/Germany - Bundesliga/1.FSV Mainz 05.png';
  if (matchTeam(cleanName, ['fc koln', 'koln', 'cologne'])) return '/teamlogos/Germany - Bundesliga/1.FC Köln.png';
  if (matchTeam(cleanName, ['heidenheim', 'fc heidenheim'])) return '/teamlogos/Germany - Bundesliga/1.FC Heidenheim 1846.png';
  if (matchTeam(cleanName, ['st pauli', 'fc st pauli', 'sankt pauli'])) return '/teamlogos/Germany - Bundesliga/FC St. Pauli.png';
  
  // Serie A (Tüm Takımlar)
  if (matchTeam(cleanName, ['juventus', 'juve', 'bianconeri'])) return '/teamlogos/Italy - Serie A/Juventus FC.png';
  if (matchTeam(cleanName, ['ac milan', 'milan', 'rossoneri', 'acm'])) return '/teamlogos/Italy - Serie A/AC Milan.png';
  if (matchTeam(cleanName, ['inter milan', 'inter', 'internazionale', 'nerazzurri'])) return '/teamlogos/Italy - Serie A/Inter Milan.png';
  if (matchTeam(cleanName, ['napoli', 'ssc napoli', 'azzurri'])) return '/teamlogos/Italy - Serie A/SSC Napoli.png';
  if (matchTeam(cleanName, ['roma', 'as roma', 'giallorossi'])) return '/teamlogos/Italy - Serie A/AS Roma.png';
  if (matchTeam(cleanName, ['lazio', 'ss lazio', 'biancocelesti'])) return '/teamlogos/Italy - Serie A/SS Lazio.png';
  if (matchTeam(cleanName, ['atalanta', 'atalanta bc', 'nerazzurri bergamo'])) return '/teamlogos/Italy - Serie A/Atalanta BC.png';
  if (matchTeam(cleanName, ['fiorentina', 'acf fiorentina', 'viola'])) return '/teamlogos/Italy - Serie A/ACF Fiorentina.png';
  if (matchTeam(cleanName, ['bologna', 'bologna fc', 'rossoblù'])) return '/teamlogos/Italy - Serie A/Bologna FC 1909.png';
  if (matchTeam(cleanName, ['torino', 'torino fc', 'granata'])) return '/teamlogos/Italy - Serie A/Torino FC.png';
  if (matchTeam(cleanName, ['udinese', 'udinese calcio', 'bianconeri friulani'])) return '/teamlogos/Italy - Serie A/Udinese Calcio.png';
  if (matchTeam(cleanName, ['genoa', 'genoa cfc', 'grifone'])) return '/teamlogos/Italy - Serie A/Genoa CFC.png';
  if (matchTeam(cleanName, ['cagliari', 'cagliari calcio', 'rossoblù sardi'])) return '/teamlogos/Italy - Serie A/Cagliari Calcio.png';
  if (matchTeam(cleanName, ['hellas verona', 'verona', 'hellas'])) return '/teamlogos/Italy - Serie A/Hellas Verona.png';
  if (matchTeam(cleanName, ['parma', 'parma calcio'])) return '/teamlogos/Italy - Serie A/Parma Calcio 1913.png';
  if (matchTeam(cleanName, ['como', 'como 1907'])) return '/teamlogos/Italy - Serie A/Como 1907.png';
  if (matchTeam(cleanName, ['lecce', 'us lecce', 'giallorossi salentini'])) return '/teamlogos/Italy - Serie A/US Lecce.png';
  
  // Ligue 1 (Tüm Takımlar)
  if (matchTeam(cleanName, ['psg', 'paris saint-germain', 'paris', 'saint germain'])) return '/teamlogos/France - Ligue 1/Paris Saint-Germain.png';
  if (matchTeam(cleanName, ['marseille', 'olympique marseille', 'om'])) return '/teamlogos/France - Ligue 1/Olympique Marseille.png';
  if (matchTeam(cleanName, ['lyon', 'olympique lyon', 'ol'])) return '/teamlogos/France - Ligue 1/Olympique Lyon.png';
  if (matchTeam(cleanName, ['monaco', 'as monaco', 'asm'])) return '/teamlogos/France - Ligue 1/AS Monaco.png';
  if (matchTeam(cleanName, ['lille', 'losc lille', 'losc'])) return '/teamlogos/France - Ligue 1/LOSC Lille.png';
  if (matchTeam(cleanName, ['nice', 'ogc nice', 'ogc'])) return '/teamlogos/France - Ligue 1/OGC Nice.png';
  if (matchTeam(cleanName, ['rennes', 'stade rennais', 'stade rennes'])) return '/teamlogos/France - Ligue 1/Stade Rennais FC.png';
  if (matchTeam(cleanName, ['lens', 'rc lens', 'racing lens'])) return '/teamlogos/France - Ligue 1/RC Lens.png';
  if (matchTeam(cleanName, ['strasbourg', 'rc strasbourg', 'racing strasbourg'])) return '/teamlogos/France - Ligue 1/RC Strasbourg Alsace.png';
  if (matchTeam(cleanName, ['brest', 'stade brestois', 'sb29'])) return '/teamlogos/France - Ligue 1/Stade Brestois 29.png';
  if (matchTeam(cleanName, ['nantes', 'fc nantes', 'canaris'])) return '/teamlogos/France - Ligue 1/FC Nantes.png';
  if (matchTeam(cleanName, ['toulouse', 'fc toulouse', 'tfc'])) return '/teamlogos/France - Ligue 1/FC Toulouse.png';
  if (matchTeam(cleanName, ['auxerre', 'aj auxerre', 'aja'])) return '/teamlogos/France - Ligue 1/AJ Auxerre.png';
  if (matchTeam(cleanName, ['angers', 'angers sco', 'sco'])) return '/teamlogos/France - Ligue 1/Angers SCO.png';
  if (matchTeam(cleanName, ['le havre', 'le havre ac', 'hac'])) return '/teamlogos/France - Ligue 1/Le Havre AC.png';
  if (matchTeam(cleanName, ['lorient', 'fc lorient', 'fcl'])) return '/teamlogos/France - Ligue 1/FC Lorient.png';
  if (matchTeam(cleanName, ['paris fc', 'pfc'])) return '/teamlogos/France - Ligue 1/Paris FC.png';
  
  // Eredivisie (Tüm Takımlar)
  if (matchTeam(cleanName, ['ajax', 'ajax amsterdam', 'afc ajax'])) return '/teamlogos/Netherlands - Eredivisie/Ajax Amsterdam.png';
  if (matchTeam(cleanName, ['psv', 'psv eindhoven', 'eindhoven'])) return '/teamlogos/Netherlands - Eredivisie/PSV Eindhoven.png';
  if (matchTeam(cleanName, ['feyenoord', 'feyenoord rotterdam', 'rotterdam'])) return '/teamlogos/Netherlands - Eredivisie/Feyenoord Rotterdam.png';
  if (matchTeam(cleanName, ['az alkmaar', 'az', 'alkmaar'])) return '/teamlogos/Netherlands - Eredivisie/AZ Alkmaar.png';
  if (matchTeam(cleanName, ['fc utrecht', 'utrecht', 'fcu'])) return '/teamlogos/Netherlands - Eredivisie/FC Utrecht.png';
  if (matchTeam(cleanName, ['twente', 'fc twente', 'twente enschede'])) return '/teamlogos/Netherlands - Eredivisie/Twente Enschede FC.png';
  if (matchTeam(cleanName, ['sc heerenveen', 'heerenveen', 'sc'])) return '/teamlogos/Netherlands - Eredivisie/SC Heerenveen.png';
  if (matchTeam(cleanName, ['go ahead eagles', 'eagles', 'go ahead'])) return '/teamlogos/Netherlands - Eredivisie/Go Ahead Eagles.png';
  if (matchTeam(cleanName, ['nec nijmegen', 'nec', 'nijmegen'])) return '/teamlogos/Netherlands - Eredivisie/NEC Nijmegen.png';
  if (matchTeam(cleanName, ['pec zwolle', 'zwolle', 'pec'])) return '/teamlogos/Netherlands - Eredivisie/PEC Zwolle.png';
  if (matchTeam(cleanName, ['fortuna sittard', 'fortuna', 'sittard'])) return '/teamlogos/Netherlands - Eredivisie/Fortuna Sittard.png';
  if (matchTeam(cleanName, ['sparta rotterdam', 'sparta', 'rotterdam sparta'])) return '/teamlogos/Netherlands - Eredivisie/Sparta Rotterdam.png';
  if (matchTeam(cleanName, ['heracles almelo', 'heracles', 'almelo'])) return '/teamlogos/Netherlands - Eredivisie/Heracles Almelo.png';
  if (matchTeam(cleanName, ['fc groningen', 'groningen', 'fcg'])) return '/teamlogos/Netherlands - Eredivisie/FC Groningen.png';
  if (matchTeam(cleanName, ['nac breda', 'nac', 'breda'])) return '/teamlogos/Netherlands - Eredivisie/NAC Breda.png';
  
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