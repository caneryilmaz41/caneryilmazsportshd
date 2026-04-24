// Kanal logoları: önce /chlogos, sonra marka (favicon) — eksik dosyalarda ağ yedeği

const CHLOGO_BASE = '/chlogos/';

const channelMap = {
  'bein sport 1': 'bein-sport-1.png',
  'bein sports 1': 'bein-sport-1.png',
  'beinsport 1': 'bein-sport-1.png',
  'bein sport 2': 'bein-sport-2.png',
  'bein sports 2': 'bein-sport-2.png',
  'beinsport 2': 'bein-sport-2.png',
  'bein sport 3': 'bein-sport-3.png',
  'bein sports 3': 'bein-sport-3.png',
  'beinsport 3': 'bein-sport-3.png',
  'bein sport 4': 'bein-sport-4.png',
  'bein sports 4': 'bein-sport-4.png',
  'beinsport 4': 'bein-sport-4.png',
  'bein sport 5': 'bein-sport-5.png',
  'bein sports 5': 'bein-sport-5.png',
  'beinsport 5': 'bein-sport-5.png',
  'bein sport 1 max': 'bein-sport-1-max.png',
  'bein sports 1 max': 'bein-sport-1-max.png',
  'bein sport 2 max': 'bein-sport-2-max.png',
  'bein sports 2 max': 'bein-sport-2-max.png',
  'a spor': 'a-spor.png',
  aspor: 'a-spor.png',
  'a sport': 'a-spor.png',
  's sport': 's-sport.png',
  ssport: 's-sport.png',
  's sport 1': 's-sport.png',
  's sport 2': 's-sport-2.png',
  'ssport 2': 's-sport-2.png',
  'trt spor': 'trt-spor.png',
  'trt sport': 'trt-spor.png',
  trtspor: 'trt-spor.png',
  'trt 1': 'trt-1.png',
  trt1: 'trt-1.png',
  'trt 2': 'trt-2.png',
  trt2: 'trt-2.png',
  'trt yıldız': 'trt-yildiz.png',
  'trt yildiz': 'trt-yildiz.png',
  trtyildiz: 'trt-yildiz.png',
  'tivibu spor 1': 'tivibu-spor-1.png',
  'tivibu spor1': 'tivibu-spor-1.png',
  'tivibuspor 1': 'tivibu-spor-1.png',
  'tivibu spor 2': 'tivibu-spor-2.png',
  'tivibu spor2': 'tivibu-spor-2.png',
  'tivibuspor 2': 'tivibu-spor-2.png',
  'tivibu spor 3': 'tivibu-spor-3.png',
  'tivibu spor3': 'tivibu-spor-3.png',
  'tivibuspor 3': 'tivibu-spor-3.png',
  'tivibu spor 4': 'tivibu-spor-4.png',
  'tivibu spor4': 'tivibu-spor-4.png',
  'tivibuspor 4': 'tivibu-spor-4.png',
  'spor smart': 'spor-smart.png',
  sporsmart: 'spor-smart.png',
  'spor smart 1': 'spor-smart.png',
  'spor smart 2': 'spor-smart-2.png',
  'sporsmart 2': 'spor-smart-2.png',
  'eurosport 1': 'eurosport-1.png',
  eurosport1: 'eurosport-1.png',
  'euro sport 1': 'eurosport-1.png',
  'eurosport 2': 'eurosport-2.png',
  eurosport2: 'eurosport-2.png',
  'euro sport 2': 'eurosport-2.png',
  'nba tv': 'nba-tv.png',
  nbatv: 'nba-tv.png',
  nba: 'nba-tv.png',
  tv8: 'tv8.png',
  'tv 8': 'tv8.png',
  'tv8.5': 'tv8bucuk.png',
  'tv 8.5': 'tv8bucuk.png',
  'tv8 buçuk': 'tv8bucuk.png',
  'tv8 bucuk': 'tv8bucuk.png',
  'sky sports': 'skys.jpg',
  skysports: 'skys.jpg',
  'sky sport': 'skys.jpg',
  'f1 tv': 'f1.png',
  f1tv: 'f1.png',
  f1: 'ff1.png',
  'formula 1': 'f1.png',
};

function normalizeTr(s) {
  return s
    .toLowerCase()
    .replace(/i̇/g, 'i')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .trim();
}

function findLocalFileName(channelName) {
  if (!channelName) return null;
  const normalizedName = channelName.toLowerCase().trim();
  if (channelMap[normalizedName]) return channelMap[normalizedName];
  for (const [key, value] of Object.entries(channelMap)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return value;
    }
  }
  return null;
}

function faviconForDomain(domain) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
}

/** @param {string} key normalized ascii-ish name */
function guessDomainsForName(key) {
  const d = new Set();
  const add = (domain) => {
    if (domain) d.add(domain);
  };

  if (/bein|be\s*-?\s*in|connect/.test(key)) add('beinsports.com');
  if (/\btrt\b|trt[\s-]|belgesel/.test(key)) add('trt.com.tr');
  if (/national\s*geographic|nat\s*geo|natgeo/.test(key)) add('natgeotv.com');
  if (/cgtn|documentary/.test(key)) add('cgtn.com');
  if (/viasat|history|explore/.test(key)) add('viasat.se');
  if (/tgrt|tarim|çiftçi|tarim/.test(key)) add('tgrt.net.tr');
  if (/tarih\s*tv/.test(key)) add('tarih.tv');
  if (/natural/.test(key)) add('naturalkanal.com.tr');
  if (/a[\s-]?spor|aspor/.test(key)) add('aspor.com.tr');
  if (/\b(s[\s-]?sport|ssport)\b|sports?\s*hd/.test(key)) add('s-sport.com.tr');
  if (/tivibu/.test(key)) add('tivibu.com.tr');
  if (/euro/.test(key)) add('eurosport.com');
  if (/spor[\s-]?smart|sporsmart/.test(key)) add('sportsdigitals.com');
  if (/\bnba/.test(key)) add('nba.com');
  if (/tv\s*8|tv8|tv8\.5|bu[cç]uk/.test(key)) add('tv8.com.tr');
  if (/f1|formula|grand\s?prix/.test(key)) add('f1.com');
  if (/sky|skys?/.test(key)) add('skysports.com');
  if (/d[\s-]?smart|dsmart/.test(key)) add('dsmart.com.tr');
  if (/exxen/.test(key)) add('exxen.com');
  if (/\btabii\b/.test(key)) add('tabii.com');
  if (/tff|federasyon/.test(key)) add('tff.org');
  if (/ntv/.test(key)) add('ntv.com.tr');
  if (/haber|ht\s*spor|haberturk|haber\s*turk/.test(key)) add('haberturk.com');
  if (/cnnturk|cnn\s*turk/.test(key)) add('cnnturk.com');
  if (/bloomberg|bloomberght/.test(key)) add('bloomberght.com');
  if (/dmax|discovery/.test(key)) add('dmax.com.tr');
  if (/\batv\b/.test(key)) add('atv.com.tr');
  if (/start|show\s*tv|fox|now\.?tv/.test(key)) add('startv.com.tr');

  if (d.size === 0 && (key.includes('spor') || key.includes('sport') || key.includes('kanal') || key.includes('tv'))) {
    add('trt.com.tr');
    add('beinsports.com');
  }
  return [...d].slice(0, 3);
}

function dedupeUris(uris) {
  const s = new Set();
  return uris.filter((u) => {
    if (s.has(u)) return false;
    s.add(u);
    return true;
  });
}

/**
 * Sırayı dener: yerel chlogos → marka favicon (Google) → default.png
 */
export function getChannelLogoSources(channelName) {
  const out = [];
  const file = findLocalFileName(channelName);
  if (file) out.push(`${CHLOGO_BASE}${file}`);

  const n = channelName ? normalizeTr(channelName).replace(/[^a-z0-9\s-]/g, ' ') : '';
  for (const dom of guessDomainsForName(n)) {
    out.push(faviconForDomain(dom));
  }

  out.push(`${CHLOGO_BASE}default.png`);
  return dedupeUris(out);
}

export const getChannelLogoPath = (channelName) => getChannelLogoSources(channelName)[0];

export const getMatchChannel = (homeTeam, awayTeam, isLive = false) => {
  const bigTeams = ['galatasaray', 'fenerbahçe', 'beşiktaş', 'trabzonspor'];
  const home = homeTeam?.toLowerCase() || '';
  const away = awayTeam?.toLowerCase() || '';

  if (bigTeams.some((team) => home.includes(team) || away.includes(team))) {
    return isLive ? 'beIN Sport 1' : 'beIN Sport 1';
  }

  const channels = ['beIN Sport 2', 'beIN Sport 3', 'S Sport', 'TRT Spor'];
  return channels[Math.floor(Math.random() * channels.length)];
};
