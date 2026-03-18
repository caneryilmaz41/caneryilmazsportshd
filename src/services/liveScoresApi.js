const ESPN_SPORTS_SOCCER_BASE =
  'https://site.api.espn.com/apis/site/v2/sports/soccer';

// Canlı maç yakalamak için sadece status.state === "in" olanları dönüyoruz.
const IMPORTANT_LEAGUES = [
  { slug: 'eng.1', label: 'Premier League' },
  { slug: 'esp.1', label: 'LaLiga' },
  { slug: 'ita.1', label: 'Serie A' },
  { slug: 'ger.1', label: 'Bundesliga' },
  { slug: 'fra.1', label: 'Ligue 1' },
  { slug: 'uefa.champions', label: 'UCL' },
];

function toESPNDateString(date) {
  // ESPN "dates" formatı: YYYYMMDD
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

function safeString(v) {
  if (typeof v === 'string') return v;
  if (v === null || v === undefined) return '';
  return String(v);
}

function parseScore(v) {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function normalizeCompetition({ competition, league }) {
  const statusState = competition?.status?.type?.state;
  const isLive =
    statusState === 'in' ||
    statusState === 'inprogress' ||
    statusState === 'in_progress' ||
    statusState === 'live';
  if (!isLive) return null;

  const competitors = Array.isArray(competition?.competitors)
    ? competition.competitors
    : [];
  const home = competitors.find((c) => c?.homeAway === 'home');
  const away = competitors.find((c) => c?.homeAway === 'away');

  const homeName =
    safeString(home?.team?.shortDisplayName) ||
    safeString(home?.team?.displayName) ||
    safeString(home?.team?.name) ||
    '—';
  const awayName =
    safeString(away?.team?.shortDisplayName) ||
    safeString(away?.team?.displayName) ||
    safeString(away?.team?.name) ||
    '—';

  const homeScore = parseScore(home?.score);
  const awayScore = parseScore(away?.score);

  return {
    id: safeString(competition?.uid) || safeString(competition?.id) || `${homeName}-${awayName}-${league.slug}`,
    league: league.label,
    homeName,
    awayName,
    homeScore,
    awayScore,
    isLive: true,
    isFinished: false,
    homeCrest: safeString(home?.team?.logo) || null,
    awayCrest: safeString(away?.team?.logo) || null,
  };
}

async function fetchLiveScoresForLeague(league, date) {
  try {
    const base = `${ESPN_SPORTS_SOCCER_BASE}/${encodeURIComponent(
      league.slug
    )}/scoreboard`;
    const url = date ? `${base}?dates=${toESPNDateString(date)}` : base;

    const res = await fetch(url);
    if (!res.ok) return [];

    const json = await res.json();
    const events = Array.isArray(json?.events) ? json.events : [];

    const liveItems = [];
    for (const event of events) {
      const competitions = Array.isArray(event?.competitions)
        ? event.competitions
        : [];
      for (const competition of competitions) {
        const normalized = normalizeCompetition({ competition, league });
        if (normalized) liveItems.push(normalized);
      }
    }

    return liveItems;
  } catch (e) {
    return [];
  }
}

export async function fetchLiveScores() {
  const now = new Date();
  // 1) Önce dates parametresi olmadan deniyoruz (ESPN "şu an" gününü seçiyor).
  const noDateAll = await Promise.all(
    IMPORTANT_LEAGUES.map((league) => fetchLiveScoresForLeague(league))
  );
  const noDateCombined = noDateAll.flat();
  if (noDateCombined.length > 0) return noDateCombined.slice(0, 24);

  // 2) Canlı yoksa/boşsa, bugün ve (gerekirse) dünden tarıyoruz.
  const datesToTry = [0, -1].map((offsetDays) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offsetDays);
    return d;
  });

  for (const date of datesToTry) {
    const all = await Promise.all(
      IMPORTANT_LEAGUES.map((league) => fetchLiveScoresForLeague(league, date))
    );
    const combined = all.flat();
    if (combined.length > 0) return combined.slice(0, 24);
  }

  return [];
}
