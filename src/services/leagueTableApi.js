const LEAGUE_TABLE_BASE = 'https://www.thesportsdb.com/api/v1/json/3/lookuptable.php';

function safeString(v) {
  if (typeof v === 'string') return v;
  if (v === null || v === undefined) return '';
  return String(v);
}

export function getCurrentSoccerSeason(date = new Date()) {
  // Soccer seasons: typically Aug -> May
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-11
  const startYear = month >= 7 ? year : year - 1;
  const endYear = startYear + 1;
  return `${startYear}-${endYear}`;
}

export async function fetchLeagueTable({ leagueId, season }) {
  if (!leagueId || !season) return { table: [], season: safeString(season) };

  try {
    const url = `${LEAGUE_TABLE_BASE}?l=${encodeURIComponent(
      leagueId
    )}&s=${encodeURIComponent(season)}`;
    const res = await fetch(url);
    if (!res.ok) return { table: [], season: safeString(season) };

    const json = await res.json();
    const table = Array.isArray(json?.table) ? json.table : [];
    return { table, season: safeString(season) };
  } catch (e) {
    return { table: [], season: safeString(season) };
  }
}

