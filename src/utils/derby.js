// GS - FB derbisi için sadece o güne özel banner tespiti.
// Not: tarih geçince bu dosyayı silmeye gerek yok, banner kendiliğinden kaybolur.
export const DERBY_SPECIAL_DATE = '2026-10-26';

const normalize = (s) =>
  (s || '')
    .toLowerCase()
    .replace(/[çc]/g, 'c')
    .replace(/[ğg]/g, 'g')
    .replace(/[ıi]/g, 'i')
    .replace(/[öo]/g, 'o')
    .replace(/[şs]/g, 's')
    .replace(/[üu]/g, 'u');

export function isGsFbDerby(matchName) {
  const n = normalize(matchName);
  return n.includes('galatasaray') && n.includes('fenerbahce');
}

export function isDerbySpecialDay(date = new Date()) {
  const local = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return local === DERBY_SPECIAL_DATE;
}
