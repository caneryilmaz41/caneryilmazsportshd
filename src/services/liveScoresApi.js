const ESPN_SPORTS_SOCCER_BASE =
  'https://site.api.espn.com/apis/site/v2/sports/soccer';

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

function toDateOnly(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
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

function formatLocalDateTime(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return '';

  const day = d.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    weekday: 'short',
  });
  const time = d.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${day} ${time}`;
}

function toMatchStatus(typeState, typeCompleted, typeDetail) {
  const state = safeString(typeState).toLowerCase();
  const detail = safeString(typeDetail);

  const isLive =
    state === 'in' ||
    state === 'inprogress' ||
    state === 'in_progress' ||
    state === 'live';
  const isFinished = typeCompleted === true || state === 'post';

  if (isLive) {
    return { isLive: true, isFinished: false, statusText: detail || 'CANLI' };
  }
  if (isFinished) {
    return { isLive: false, isFinished: true, statusText: 'FT' };
  }

  return {
    isLive: false,
    isFinished: false,
    statusText: formatLocalDateTime(detail) || detail || 'Yakında',
  };
}

function normalizeCompetition({ competition, league }) {
  const type = competition?.status?.type || {};
  const status = toMatchStatus(type?.state, type?.completed, type?.detail);

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
  const date = safeString(competition?.date);
  const kickoffText = formatLocalDateTime(date);

  return {
    id: safeString(competition?.uid) || safeString(competition?.id) || `${homeName}-${awayName}-${league.slug}`,
    league: league.label,
    homeName,
    awayName,
    homeScore,
    awayScore,
    isLive: status.isLive,
    isFinished: status.isFinished,
    statusText: status.statusText,
    kickoffText,
    matchDate: date || null,
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

export async function fetchLiveScores(options = {}) {
  const { selectedDate } = options;
  const now = new Date();
  const datesToTry = [-1, 0, 1, 2].map((offsetDays) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offsetDays);
    return toDateOnly(d);
  });

  if (selectedDate) {
    const custom = new Date(selectedDate);
    if (!Number.isNaN(custom.getTime())) {
      datesToTry.push(toDateOnly(custom));
    }
  }

  const uniqueDates = [];
  const seenDates = new Set();
  for (const d of datesToTry) {
    const key = toESPNDateString(d);
    if (seenDates.has(key)) continue;
    seenDates.add(key);
    uniqueDates.push(d);
  }

  const allMatches = [];
  for (const date of uniqueDates) {
    const all = await Promise.all(
      IMPORTANT_LEAGUES.map((league) => fetchLiveScoresForLeague(league, date))
    );
    const combined = all.flat();
    allMatches.push(...combined);
  }

  if (allMatches.length === 0) return [];

  const deduped = [];
  const seen = new Set();
  for (const m of allMatches) {
    if (seen.has(m.id)) continue;
    seen.add(m.id);
    deduped.push(m);
  }

  deduped.sort((a, b) => {
    if (a.isLive !== b.isLive) return a.isLive ? -1 : 1;
    if (a.isFinished !== b.isFinished) return a.isFinished ? 1 : -1;

    const ta = a.matchDate ? new Date(a.matchDate).getTime() : Number.MAX_SAFE_INTEGER;
    const tb = b.matchDate ? new Date(b.matchDate).getTime() : Number.MAX_SAFE_INTEGER;
    return ta - tb;
  });

  return deduped.slice(0, 120);
}
