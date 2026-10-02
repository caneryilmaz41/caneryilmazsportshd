/**
 * Skor merkezi veri kaynağı.
 * Ana kaynak: FotMob'un herkese açık JSON uçları (ücretsiz, anahtarsız, CORS açık; ~500 lig).
 * Yedek: ESPN "soccer/all" skor tablosu (lig adları daha kısıtlı).
 * Bileşenler sadece buradaki normalize edilmiş şekli kullanır.
 */
import { toTurkishTeam } from '../utils/scoreMatch';

const FM = 'https://www.fotmob.com/api/data';
const ESPN_ALL = 'https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard';
const IMG = 'https://images.fotmob.com/image_resources/logo';

export const teamLogo = (id) => (id ? `${IMG}/teamlogo/${id}_small.png` : null);
export const flagUrl = (ccode) => (ccode ? `${IMG}/teamlogo/${String(ccode).toLowerCase()}.png` : null);
export const leagueLogo = (id) => (id ? `${IMG}/leaguelogo/dark/${id}.png` : null);

/** Puan durumu seçicisi (FotMob lig id'leri). */
export const STANDINGS_LEAGUES = [
  { id: 71, label: 'Süper Lig' },
  { id: 165, label: '1. Lig' },
  { id: 47, label: 'Premier League' },
  { id: 87, label: 'LaLiga' },
  { id: 55, label: 'Serie A' },
  { id: 54, label: 'Bundesliga' },
  { id: 53, label: 'Ligue 1' },
  { id: 42, label: 'Şampiyonlar Ligi' },
  { id: 73, label: 'Avrupa Ligi' },
];

/** Listede üstte görünecek ligler (FotMob primaryId), sırayla. */
const PRIORITY = [71, 165, 42, 73, 10216, 9806, 47, 87, 55, 54, 53, 77, 10197, 114, 50, 44, 57, 61, 64, 40];

const COUNTRY_TR = {
  TUR: 'Türkiye', INT: 'Uluslararası', ENG: 'İngiltere', ESP: 'İspanya', ITA: 'İtalya', GER: 'Almanya',
  FRA: 'Fransa', NED: 'Hollanda', POR: 'Portekiz', BEL: 'Belçika', SCO: 'İskoçya', AUT: 'Avusturya',
  SUI: 'İsviçre', GRE: 'Yunanistan', DEN: 'Danimarka', SWE: 'İsveç', NOR: 'Norveç', POL: 'Polonya',
  CZE: 'Çekya', CRO: 'Hırvatistan', SRB: 'Sırbistan', ROU: 'Romanya', UKR: 'Ukrayna', RUS: 'Rusya',
  USA: 'ABD', BRA: 'Brezilya', ARG: 'Arjantin', MEX: 'Meksika', JPN: 'Japonya', KOR: 'Güney Kore',
  KSA: 'Suudi Arabistan', QAT: 'Katar', UAE: 'BAE', AUS: 'Avustralya', CHN: 'Çin', EGY: 'Mısır',
  MAR: 'Fas', WAL: 'Galler', IRL: 'İrlanda', NIR: 'Kuzey İrlanda', FIN: 'Finlandiya', HUN: 'Macaristan',
  BUL: 'Bulgaristan', SVK: 'Slovakya', SVN: 'Slovenya', ISR: 'İsrail', CYP: 'Kıbrıs', AZE: 'Azerbaycan',
};

const LEAGUE_TR = {
  'Super Lig': 'Süper Lig', 'Champions League': 'Şampiyonlar Ligi', 'Europa League': 'Avrupa Ligi',
  'Conference League': 'Konferans Ligi', Friendlies: 'Hazırlık Maçları', 'Club Friendlies': 'Kulüp Hazırlık Maçları',
  'World Cup Qualification UEFA': 'Dünya Kupası Elemeleri', 'EURO Qualification': 'EURO Elemeleri',
};

function trLeague(name) {
  if (!name) return 'Diğer';
  if (LEAGUE_TR[name]) return LEAGUE_TR[name];
  return name
    .replace(/^UEFA Nations League/, 'UEFA Uluslar Ligi')
    .replace(/Grp\./g, 'Grup')
    .replace(/Qualification/g, 'Elemeleri');
}

export const countryName = (ccode) => COUNTRY_TR[ccode] || ccode || '';

function fmDate(iso) {
  return iso.replace(/-/g, '');
}

function fmState(st) {
  if (!st) return 'pre';
  if (st.cancelled) return st.reason?.short === 'PP' || /postpon/i.test(st.reason?.long || '') ? 'postponed' : 'cancelled';
  if (st.finished) return 'post';
  if (st.started || st.ongoing) {
    if (/HT|Half/i.test(st.liveTime?.short || st.reason?.short || '')) return 'ht';
    return 'live';
  }
  return 'pre';
}

function liveMinute(st) {
  const short = st?.liveTime?.short;
  if (short) return String(short).replace('’', "'");
  return '';
}

function normalizeFotmobMatch(m, league) {
  const st = m.status || {};
  const state = fmState(st);
  const kickoff = st.utcTime ? Date.parse(st.utcTime) : m.timeTS || null;
  const [hs, as] = (st.scoreStr || '').split('-').map((x) => Number.parseInt(x, 10));
  const started = state === 'live' || state === 'ht' || state === 'post';
  return {
    id: `fm:${m.id}`,
    sourceId: m.id,
    source: 'fotmob',
    leagueKey: `fm:${league.id}`,
    kickoff,
    homeId: m.home?.id,
    awayId: m.away?.id,
    homeName: toTurkishTeam(m.home?.name || m.home?.longName || '—'),
    awayName: toTurkishTeam(m.away?.name || m.away?.longName || '—'),
    homeNameRaw: m.home?.longName || m.home?.name || '',
    awayNameRaw: m.away?.longName || m.away?.name || '',
    homeScore: started ? (Number.isFinite(hs) ? hs : m.home?.score ?? 0) : null,
    awayScore: started ? (Number.isFinite(as) ? as : m.away?.score ?? 0) : null,
    homeCrest: teamLogo(m.home?.id),
    awayCrest: teamLogo(m.away?.id),
    state,
    isLive: state === 'live' || state === 'ht',
    isFinished: state === 'post',
    minute: state === 'ht' ? 'İY' : liveMinute(st),
    statusShort: st.reason?.short || '',
  };
}

async function fetchJson(url, { timeout = 15000 } = {}) {
  const res = await fetch(url, { signal: AbortSignal.timeout(timeout) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

const FALLBACK_API_ORIGIN = 'https://caneryilmazsportshd.vercel.app';
function proxyBases() {
  const env = (import.meta.env.VITE_PUBLIC_API_ORIGIN || '').trim().replace(/\/$/, '');
  // '' = aynı site (/api/fotmob); sonra yapılandırılmış veya canlı site (yerel geliştirmede /api yok).
  return [...new Set(['', env, FALLBACK_API_ORIGIN])].filter((x, i) => i === 0 || x);
}

/**
 * FotMob isteği: önce doğrudan (CORS izin verirse en hızlısı), olmazsa /api/fotmob aracısı.
 * preferProxy: CORS başlığı hiç gelmeyen uçlar için doğrudan denemeyi atla.
 */
async function fetchFotmob(path, params, { preferProxy = false, timeout } = {}) {
  const qs = new URLSearchParams(params).toString();
  const attempts = [];
  if (!preferProxy) attempts.push(`${FM}/${path}?${qs}`);
  for (const base of proxyBases()) attempts.push(`${base}/api/fotmob?path=${path}&${qs}`);
  let lastErr;
  for (const url of attempts) {
    try {
      return await fetchJson(url, { timeout });
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('fotmob erişilemedi');
}

async function fetchFotmobDay(iso) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Istanbul';
  const data = await fetchFotmob('matches', { date: fmDate(iso), timezone, ccode3: 'TUR' });
  if (!Array.isArray(data?.leagues)) throw new Error('fotmob: beklenmeyen yanıt');
  return data.leagues.map((l) => ({
    key: `fm:${l.id}`,
    id: l.id,
    primaryId: l.primaryId || l.parentLeagueId || l.id,
    name: trLeague(l.name),
    ccode: l.ccode,
    country: countryName(l.ccode),
    flag: flagUrl(l.ccode),
    logo: leagueLogo(l.primaryId || l.id),
    matches: (l.matches || []).map((m) => normalizeFotmobMatch(m, l)),
  }));
}

/* ---------- ESPN yedek ---------- */

function espnState(type) {
  const s = String(type?.state || '').toLowerCase();
  if (s === 'post' || type?.completed) return 'post';
  if (s === 'in') return /half/i.test(type?.description || '') ? 'ht' : 'live';
  if (/postpon/i.test(type?.description || '')) return 'postponed';
  return 'pre';
}

async function fetchEspnDay(iso) {
  const data = await fetchJson(`${ESPN_ALL}?dates=${fmDate(iso)}&limit=500`);
  const groups = new Map();
  for (const ev of data?.events || []) {
    const comp = ev.competitions?.[0];
    if (!comp) continue;
    const leagueName = (comp.altGameNote || '').split(',')[0].trim() || 'Diğer';
    const leagueId = /l:(\d+)/.exec(ev.uid || '')?.[1] || leagueName;
    const home = comp.competitors?.find((c) => c.homeAway === 'home');
    const away = comp.competitors?.find((c) => c.homeAway === 'away');
    const state = espnState(comp.status?.type || ev.status?.type);
    const started = state === 'live' || state === 'ht' || state === 'post';
    if (!groups.has(leagueId)) {
      groups.set(leagueId, {
        key: `espn:${leagueId}`, id: leagueId, primaryId: null, name: trLeague(leagueName), ccode: '', country: '', flag: null, logo: null, matches: [],
      });
    }
    groups.get(leagueId).matches.push({
      id: `espn:${ev.id}`,
      sourceId: ev.id,
      source: 'espn',
      leagueKey: `espn:${leagueId}`,
      kickoff: ev.date ? Date.parse(ev.date) : null,
      homeName: toTurkishTeam(home?.team?.shortDisplayName || home?.team?.displayName || '—'),
      awayName: toTurkishTeam(away?.team?.shortDisplayName || away?.team?.displayName || '—'),
      homeNameRaw: home?.team?.displayName || '',
      awayNameRaw: away?.team?.displayName || '',
      homeScore: started ? Number(home?.score ?? 0) : null,
      awayScore: started ? Number(away?.score ?? 0) : null,
      homeCrest: home?.team?.logo || null,
      awayCrest: away?.team?.logo || null,
      state,
      isLive: state === 'live' || state === 'ht',
      isFinished: state === 'post',
      minute: state === 'ht' ? 'İY' : (comp.status?.displayClock || '').replace(/^0'?$/, ''),
      statusShort: comp.status?.type?.shortDetail || '',
    });
  }
  return [...groups.values()];
}

function sortLeagues(leagues) {
  const rank = (l) => {
    const i = PRIORITY.indexOf(l.primaryId);
    if (i >= 0) return i;
    if (l.ccode === 'TUR') return PRIORITY.length;
    return PRIORITY.length + 1;
  };
  return leagues
    .filter((l) => l.matches.length)
    .map((l) => ({ ...l, matches: [...l.matches].sort((a, b) => (a.kickoff || 0) - (b.kickoff || 0)) }))
    .sort((a, b) => rank(a) - rank(b) || a.country.localeCompare(b.country, 'tr') || a.name.localeCompare(b.name, 'tr'));
}

const dayCache = new Map(); // iso -> { at, value }

/**
 * Bir günün tüm maçları, lig lig. Canlı maç varken 30 sn, yoksa 2 dk önbellek.
 * @returns {Promise<{ leagues: Array, source: 'fotmob'|'espn' }>}
 */
export async function fetchScoresDay(iso, { force = false } = {}) {
  const hit = dayCache.get(iso);
  const hasLive = hit?.value.leagues.some((l) => l.matches.some((m) => m.isLive));
  const ttl = hasLive ? 25 * 1000 : 110 * 1000;
  if (!force && hit && Date.now() - hit.at < ttl) return hit.value;

  let value;
  try {
    value = { leagues: sortLeagues(await fetchFotmobDay(iso)), source: 'fotmob' };
  } catch {
    value = { leagues: sortLeagues(await fetchEspnDay(iso)), source: 'espn' };
  }
  dayCache.set(iso, { at: Date.now(), value });
  return value;
}

/** Oynatıcı başlığındaki canlı skor için: bugünün (ve dünün, gece yarısı sonrası) düz maç listesi. */
export async function fetchTodayFlat() {
  const today = new Date();
  const y = new Date(today);
  y.setDate(y.getDate() - 1);
  const days = await Promise.all([toIsoDate(y), toIsoDate(today)].map((d) => fetchScoresDay(d).catch(() => ({ leagues: [] }))));
  return days.flatMap((d) => d.leagues.flatMap((l) => l.matches));
}

export function toIsoDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/* ---------- Maç detayı (FotMob) ---------- */

const STAT_TR = {
  'Ball possession': 'Topla oynama', 'Expected goals (xG)': 'Beklenen gol (xG)', 'Total shots': 'Toplam şut',
  'Shots on target': 'İsabetli şut', 'Shots off target': 'İsabetsiz şut', 'Blocked shots': 'Engellenen şut',
  'Big chances': 'Net pozisyon', 'Big chances missed': 'Kaçan net pozisyon', 'Accurate passes': 'İsabetli pas',
  Passes: 'Pas', 'Yellow cards': 'Sarı kart', 'Red cards': 'Kırmızı kart', Corners: 'Korner',
  'Fouls committed': 'Faul', Offsides: 'Ofsayt', 'Touches in opposition box': 'Rakip ceza sahasında topla buluşma',
  'Keeper saves': 'Kurtarış', Tackles: 'Top kapma', Interceptions: 'Araya girme', Clearances: 'Uzaklaştırma',
  'Duels won': 'Kazanılan ikili mücadele', 'Aerial duels won': 'Kazanılan hava topu', 'Successful dribbles': 'Başarılı çalım',
  'Hit woodwork': 'Direkten dönen', 'Accurate crosses': 'İsabetli orta', 'Accurate long balls': 'İsabetli uzun pas',
  'Shots inside box': 'Ceza sahası içi şut', 'Shots outside box': 'Ceza sahası dışı şut',
};
const STAT_ORDER = [
  'Ball possession', 'Expected goals (xG)', 'Total shots', 'Shots on target', 'Big chances', 'Corners',
  'Accurate passes', 'Fouls committed', 'Yellow cards', 'Red cards', 'Offsides', 'Keeper saves',
  'Tackles', 'Interceptions', 'Duels won', 'Successful dribbles', 'Hit woodwork',
];

function parseStats(content) {
  const groups = content?.stats?.Periods?.All?.stats || [];
  const byTitle = new Map();
  for (const g of groups) {
    for (const s of g.stats || []) {
      if (!Array.isArray(s.stats) || s.stats.length !== 2 || s.type === 'title') continue;
      if (!byTitle.has(s.title)) byTitle.set(s.title, s);
    }
  }
  return STAT_ORDER.filter((t) => byTitle.has(t)).map((t) => {
    const s = byTitle.get(t);
    const raw = (v) => {
      const n = Number.parseFloat(String(v).replace('%', ''));
      return Number.isFinite(n) ? n : 0;
    };
    return {
      key: s.key || t,
      title: STAT_TR[t] || t,
      home: s.stats[0],
      away: s.stats[1],
      homeVal: raw(String(s.stats[0]).split(' ')[0]),
      awayVal: raw(String(s.stats[1]).split(' ')[0]),
      percent: t === 'Ball possession',
    };
  });
}

function parseEvents(content) {
  const list = content?.matchFacts?.events?.events || [];
  return list
    .filter((e) => ['Goal', 'Card', 'Substitution', 'Half'].includes(e.type))
    .map((e) => ({
      type: e.type,
      minute: e.time != null ? `${e.time}${e.overloadTime ? `+${e.overloadTime}` : ''}'` : '',
      isHome: Boolean(e.isHome),
      player: e.nameStr || e.player?.name || '',
      assist: e.assistStr ? e.assistStr.replace(/^assist by /i, '') : '',
      card: e.card || '',
      ownGoal: Boolean(e.ownGoal),
      penalty: /penalty/i.test(e.goalDescription || e.suffix || ''),
      subIn: e.swap?.[0]?.name || '',
      subOut: e.swap?.[1]?.name || '',
      score: Array.isArray(e.newScore)
        ? `${e.newScore[0]} - ${e.newScore[1]}`
        : e.type === 'Half' && e.homeScore != null
          ? `${e.homeScore} - ${e.awayScore}`
          : '',
      label: e.halfStrShort === 'HT' ? 'İlk yarı' : e.halfStrShort === 'FT' ? 'Maç sonu' : e.halfStrShort || '',
    }));
}

function parseTeamLineup(t) {
  if (!t) return null;
  const player = (p) => ({
    id: p.id,
    name: p.name,
    number: p.shirtNumber || '',
    rating: p.performance?.rating ?? null,
    subIn: p.performance?.substitutionEvents?.find((s) => s.type === 'subIn')?.time ?? null,
    subOut: p.performance?.substitutionEvents?.find((s) => s.type === 'subOut')?.time ?? null,
  });
  return {
    name: toTurkishTeam(t.name || ''),
    formation: t.formation || '',
    coach: t.coach?.name || '',
    starters: (t.starters || []).map(player),
    subs: (t.subs || []).map(player),
  };
}

const detailCache = new Map();

export async function fetchMatchDetails(match, { force = false } = {}) {
  if (match?.source !== 'fotmob') return null;
  const hit = detailCache.get(match.sourceId);
  if (!force && hit && Date.now() - hit.at < (match.isLive ? 25000 : 300000)) return hit.value;
  const j = await fetchFotmob('matchDetails', { matchId: String(match.sourceId) }, { preferProxy: true });
  const content = j?.content || {};
  const info = content.matchFacts?.infoBox || {};
  const st = j?.header?.status || {};
  const value = {
    events: parseEvents(content),
    stats: parseStats(content),
    lineup: content.lineup
      ? { home: parseTeamLineup(content.lineup.homeTeam), away: parseTeamLineup(content.lineup.awayTeam) }
      : null,
    info: {
      stadium: [info.Stadium?.name, info.Stadium?.city].filter(Boolean).join(', '),
      referee: info.Referee?.text || '',
      round: info.Tournament?.roundName || '',
      league: trLeague(info.Tournament?.leagueName || ''),
      attendance: info.Attendance || null,
    },
    redCards: { home: st.numberOfHomeRedCards || 0, away: st.numberOfAwayRedCards || 0 },
  };
  detailCache.set(match.sourceId, { at: Date.now(), value });
  return value;
}

/* ---------- Puan durumu (FotMob) ---------- */

const tableCache = new Map();

export async function fetchStandings(leagueId) {
  const hit = tableCache.get(leagueId);
  if (hit && Date.now() - hit.at < 10 * 60 * 1000) return hit.value;
  const j = await fetchFotmob('leagues', { id: String(leagueId) }, { timeout: 20000 });
  const data = j?.table?.[0]?.data;
  const tables = data?.table?.all ? [{ name: '', rows: data.table.all }] : (data?.tables || []).map((t) => ({ name: trLeague(t.leagueName || ''), rows: t.table?.all || [] }));
  const legend = (data?.legend || []).map((l) => ({ title: l.title, color: l.color, indices: l.indices || [] }));
  const value = {
    season: j?.details?.selectedSeason || '',
    legend,
    tables: tables.map((t) => ({
      name: t.name,
      rows: t.rows.map((r) => ({
        id: r.id,
        rank: r.idx,
        name: toTurkishTeam(r.shortName || r.name),
        logo: teamLogo(r.id),
        played: r.played,
        wins: r.wins,
        draws: r.draws,
        losses: r.losses,
        goals: r.scoresStr,
        diff: r.goalConDiff,
        pts: r.pts,
        color: r.qualColor || null,
      })),
    })),
  };
  tableCache.set(leagueId, { at: Date.now(), value });
  return value;
}
