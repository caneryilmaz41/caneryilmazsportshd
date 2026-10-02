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

/** Skor kaynağındaki İngilizce adları Türkçe göster (milli takımlar ve Türk kulüpleri). */
const DISPLAY_TR = {
  germany: 'Almanya', serbia: 'Sırbistan', greece: 'Yunanistan', netherlands: 'Hollanda', denmark: 'Danimarka',
  portugal: 'Portekiz', england: 'İngiltere', france: 'Fransa', spain: 'İspanya', italy: 'İtalya',
  turkiye: 'Türkiye', turkey: 'Türkiye', belgium: 'Belçika', croatia: 'Hırvatistan', switzerland: 'İsviçre',
  austria: 'Avusturya', poland: 'Polonya', czechia: 'Çekya', 'czech republic': 'Çekya', scotland: 'İskoçya',
  wales: 'Galler', hungary: 'Macaristan', romania: 'Romanya', ukraine: 'Ukrayna', sweden: 'İsveç',
  norway: 'Norveç', albania: 'Arnavutluk', kosovo: 'Kosova', 'bosnia and herzegovina': 'Bosna Hersek',
  bosnia: 'Bosna Hersek', slovakia: 'Slovakya', slovenia: 'Slovenya', finland: 'Finlandiya',
  'republic of ireland': 'İrlanda', ireland: 'İrlanda', 'northern ireland': 'Kuzey İrlanda', iceland: 'İzlanda',
  georgia: 'Gürcistan', montenegro: 'Karadağ', bulgaria: 'Bulgaristan', lithuania: 'Litvanya', latvia: 'Letonya',
  estonia: 'Estonya', armenia: 'Ermenistan', azerbaijan: 'Azerbaycan', kazakhstan: 'Kazakistan',
  luxembourg: 'Lüksemburg', cyprus: 'Kıbrıs', gibraltar: 'Cebelitarık', 'faroe islands': 'Faroe Adaları',
  liechtenstein: 'Lihtenştayn', 'north macedonia': 'Kuzey Makedonya', israel: 'İsrail', russia: 'Rusya',
  belarus: 'Belarus', moldova: 'Moldova', malta: 'Malta', andorra: 'Andorra', 'san marino': 'San Marino',
  brazil: 'Brezilya', argentina: 'Arjantin', morocco: 'Fas', egypt: 'Mısır', 'saudi arabia': 'Suudi Arabistan',
  japan: 'Japonya', 'south korea': 'Güney Kore', 'united states': 'ABD', usa: 'ABD', mexico: 'Meksika',
  colombia: 'Kolombiya', uruguay: 'Uruguay', chile: 'Şili', peru: 'Peru', ecuador: 'Ekvador', paraguay: 'Paraguay',
  venezuela: 'Venezuela', bolivia: 'Bolivya', canada: 'Kanada', australia: 'Avustralya', nigeria: 'Nijerya',
  senegal: 'Senegal', ghana: 'Gana', algeria: 'Cezayir', tunisia: 'Tunus', iran: 'İran', iraq: 'Irak',
  china: 'Çin', 'china pr': 'Çin', india: 'Hindistan', qatar: 'Katar', 'united arab emirates': 'BAE',
  cameroon: 'Kamerun', 'ivory coast': 'Fildişi Sahili', "cote d'ivoire": 'Fildişi Sahili', jamaica: 'Jamaika',
  cuba: 'Küba', 'new zealand': 'Yeni Zelanda', indonesia: 'Endonezya', vietnam: 'Vietnam', thailand: 'Tayland',
  fenerbahce: 'Fenerbahçe', besiktas: 'Beşiktaş', basaksehir: 'Başakşehir', 'istanbul basaksehir': 'Başakşehir',
  kasimpasa: 'Kasımpaşa', goztepe: 'Göztepe', eyupspor: 'Eyüpspor', 'caykur rizespor': 'Çaykur Rizespor',
  genclerbirligi: 'Gençlerbirliği', 'fatih karagumruk': 'Fatih Karagümrük', 'bayern munich': 'Bayern Münih',
};

export function toTurkishTeam(name) {
  const base = String(name || '')
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
  return DISPLAY_TR[base] || name;
}

/** İki maç adının (ev/deplasman sırası farklı olabilir) aynı maç olup olmadığı. */
export function sameFixture(teamsA, teamsB) {
  const [a1, a2] = (teamsA || []).map(normalizeTeam);
  const [b1, b2] = (teamsB || []).map(normalizeTeam);
  if (!a1 || !a2 || !b1 || !b2) return false;
  return (similar(a1, b1) && similar(a2, b2)) || (similar(a1, b2) && similar(a2, b1));
}
