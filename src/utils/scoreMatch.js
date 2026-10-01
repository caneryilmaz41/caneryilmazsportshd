/** Kaynaktaki Türkçe takım adlarını ESPN'in İngilizce adlarıyla eşleştirmek için. */
const ALIASES = {
  almanya: 'germany', sirbistan: 'serbia', yunanistan: 'greece', hollanda: 'netherlands',
  danimarka: 'denmark', portekiz: 'portugal', ingiltere: 'england', fransa: 'france',
  ispanya: 'spain', italya: 'italy', turkiye: 'turkiye', belcika: 'belgium',
  hirvatistan: 'croatia', isvicre: 'switzerland', avusturya: 'austria', polonya: 'poland',
  cekya: 'czechia', 'cek cumhuriyeti': 'czechia', iskocya: 'scotland', galler: 'wales',
  macaristan: 'hungary', romanya: 'romania', ukrayna: 'ukraine', isvec: 'sweden',
  norvec: 'norway', arnavutluk: 'albania', kosova: 'kosovo', 'bosna hersek': 'bosnia',
  slovakya: 'slovakia', slovenya: 'slovenia', finlandiya: 'finland', irlanda: 'ireland',
  'kuzey irlanda': 'northern ireland', izlanda: 'iceland', gurcistan: 'georgia',
  karadag: 'montenegro', bulgaristan: 'bulgaria', litvanya: 'lithuania', letonya: 'latvia',
  estonya: 'estonia', ermenistan: 'armenia', azerbaycan: 'azerbaijan', kazakistan: 'kazakhstan',
  luksemburg: 'luxembourg', kibris: 'cyprus', cebelitarik: 'gibraltar', 'faroe adalari': 'faroe',
  lihtenstayn: 'liechtenstein', 'kuzey makedonya': 'north macedonia', israil: 'israel',
  'bayern munih': 'bayern munich', 'manchester city': 'man city', 'manchester united': 'man united',
  inter: 'internazionale', kopenhag: 'copenhagen', 'sporting lizbon': 'sporting',
  'kizilyildiz': 'crvena zvezda', 'kizil yildiz': 'crvena zvezda',
};

const DROP = new Set(['fc', 'sk', 'cf', 'ac', 'as', 'sc', 'afc', 'jk', 'fk', 'cd', 'the', 'a.s.']);

export function normalizeTeam(name) {
  const base = String(name || '')
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .split(/\s+/)
    .filter((t) => t && !DROP.has(t))
    .join(' ');
  return ALIASES[base] || base;
}

function similar(a, b) {
  if (!a || !b) return false;
  if (a === b) return true;
  const [short, long] = a.length < b.length ? [a, b] : [b, a];
  if (short.length >= 4 && long.includes(short)) return true;
  const ta = a.split(' ')[0];
  const tb = b.split(' ')[0];
  return ta.length >= 5 && ta === tb;
}

/** Seçili maça ait canlı skor kaydını bul (ev/deplasman sırası ters olsa da). */
export function findScoreFor(teams, scores) {
  const [h, a] = (teams || []).map(normalizeTeam);
  if (!h || !a || !Array.isArray(scores)) return null;
  for (const s of scores) {
    const sh = normalizeTeam(s.homeName);
    const sa = normalizeTeam(s.awayName);
    if (similar(h, sh) && similar(a, sa)) return { ...s, swapped: false };
    if (similar(h, sa) && similar(a, sh)) return { ...s, swapped: true };
  }
  return null;
}
