/** Tenis, buz hokeyi, basketbol vb. futbol-dışı yayınları maç listesinden ele; bunlar hem alakasız hem de çoğunlukla açılmıyor. */
export function isFootballMatch(match) {
  if (!match) return false;
  const label = (match.type || match.category || "").toLowerCase();
  if (!label) return true;
  return label.startsWith("futbol");
}

export function getFilteredMatches(matches) {
  return (matches || []).filter(isFootballMatch);
}
