const LEAGUE_TABLE_BASE = 'https://www.thesportsdb.com/api/v1/json/3/lookuptable.php';
const ESPN_SOCCER_BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer';

/** TheSportsDB lig id → ESPN lig slug (eksik puan tablosu için takım listesi tamamlanır) */
const ENRICH_STANDINGS_WITH_ESPN_TEAMS = {
  4339: 'tur.1', // Süper Lig
};

function safeString(v) {
  if (typeof v === 'string') return v;
  if (v === null || v === undefined) return '';
  return String(v);
}

function normName(s) {
  const tr = safeString(s).toLowerCase();
  const ascii = tr
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/â/g, 'a')
    .replace(/î/g, 'i')
    .replace(/û/g, 'u');
  return ascii.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/gi, '');
}

function namesLikelyMatch(tsdbName, espnDisplayName) {
  const a = normName(tsdbName);
  const b = normName(espnDisplayName);
  if (!a || !b) return false;
  if (a === b) return true;
  const [short, long] = a.length <= b.length ? [a, b] : [b, a];
  if (short.length >= 4 && long.includes(short)) return true;
  if (short.length >= 5 && long.startsWith(short)) return true;
  return false;
}

async function fetchEspnLeagueTeams(slug) {
  try {
    const url = `${ESPN_SOCCER_BASE}/${encodeURIComponent(slug)}/teams?limit=100`;
    const res = await fetch(url);
    if (!res.ok) return [];

    const json = await res.json();
    const sports = Array.isArray(json?.sports) ? json.sports : [];
    const leagues = sports[0]?.leagues;
    const league = Array.isArray(leagues) ? leagues[0] : null;
    const teams = Array.isArray(league?.teams) ? league.teams : [];

    return teams
      .map((entry) => {
        const t = entry?.team || {};
        const logo = Array.isArray(t.logos) ? t.logos[0]?.href : null;
        return {
          displayName: safeString(t.displayName || t.name || t.shortDisplayName),
          logo: logo ? safeString(logo) : '',
        };
      })
      .filter((x) => x.displayName);
  } catch (e) {
    return [];
  }
}

/**
 * TheSportsDB bazen az satır döndürür (ör. Süper Lig'de 5 takım).
 * ESPN takım listesiyle eşleştirip tüm takımları gösteririz; eşleşmeyenlerde istatistik "–" olur.
 */
function mergeStandingsWithEspnTeams(tsdbRows, espnTeams) {
  if (!espnTeams.length) return tsdbRows;

  const sortedTs = [...tsdbRows].sort(
    (a, b) => Number(a?.intRank) - Number(b?.intRank)
  );

  const matchedEspn = new Set();
  const merged = [];

  for (const row of sortedTs) {
    const idx = espnTeams.findIndex(
      (e, i) => !matchedEspn.has(i) && namesLikelyMatch(row?.strTeam, e.displayName)
    );
    if (idx >= 0) matchedEspn.add(idx);
    const espn = idx >= 0 ? espnTeams[idx] : null;
    merged.push({
      ...row,
      strTeam: espn?.displayName || row?.strTeam,
      strBadge: espn?.logo || row?.strBadge,
    });
  }

  const usedNorm = new Set(merged.map((r) => normName(r?.strTeam)));

  for (let i = 0; i < espnTeams.length; i += 1) {
    if (matchedEspn.has(i)) continue;
    const e = espnTeams[i];
    const en = normName(e.displayName);
    if (en && usedNorm.has(en)) continue;
    if (en) usedNorm.add(en);
    merged.push({
      idStanding: `espn-filler-${i}-${en || 'team'}`,
      strTeam: e.displayName,
      strBadge: e.logo || '',
      intPlayed: '–',
      intWin: '–',
      intDraw: '–',
      intLoss: '–',
      intGoalDifference: '–',
      intPoints: '–',
      intRank: '999',
    });
  }

  merged.sort((a, b) => {
    const pa = parseInt(a?.intPoints, 10);
    const pb = parseInt(b?.intPoints, 10);
    const aOk = Number.isFinite(pa);
    const bOk = Number.isFinite(pb);
    if (aOk && bOk && pa !== pb) return pb - pa;
    if (aOk && !bOk) return -1;
    if (!aOk && bOk) return 1;
    return safeString(a?.strTeam).localeCompare(safeString(b?.strTeam), 'tr', {
      sensitivity: 'base',
    });
  });

  merged.forEach((r, i) => {
    r.intRank = String(i + 1);
  });

  return merged;
}

export function getCurrentSoccerSeason(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const startYear = month >= 7 ? year : year - 1;
  const endYear = startYear + 1;
  return `${startYear}-${endYear}`;
}

export async function fetchLeagueTable({ leagueId, season }) {
  if (!leagueId || !season) return { table: [], season: safeString(season) };

  try {
    const url = `${LEAGUE_TABLE_BASE}?l=${encodeURIComponent(leagueId)}&s=${encodeURIComponent(season)}`;
    const res = await fetch(url);
    if (!res.ok) return { table: [], season: safeString(season) };

    const json = await res.json();
    let table = Array.isArray(json?.table) ? json.table : [];

    const espnSlug = ENRICH_STANDINGS_WITH_ESPN_TEAMS[leagueId];
    if (espnSlug) {
      const espnTeams = await fetchEspnLeagueTeams(espnSlug);
      if (espnTeams.length) {
        if (table.length === 0) {
          table = mergeStandingsWithEspnTeams([], espnTeams);
        } else if (table.length < espnTeams.length) {
          table = mergeStandingsWithEspnTeams(table, espnTeams);
        }
      }
    }

    return { table, season: safeString(season) };
  } catch (e) {
    return { table: [], season: safeString(season) };
  }
}
