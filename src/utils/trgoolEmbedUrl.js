/**
 * trgool sitelerinde tam sayfa (/matches) yerine yalnızca oynatıcı / iframe dostu
 * channel.html kullanılır; aksi halde sitede header/nav iç içe açılır.
 */
export function trgoolChannelEmbedUrl(domain, id) {
  if (!domain || id == null || id === '') return null;
  const b = String(domain).replace(/\/$/, '');
  return `${b}/channel.html?id=${encodeURIComponent(String(id))}`;
}

/**
 * teletv3 / cinema bazen m3u8 yerine harici bir "oynatıcı sayfası" URL'si verir;
 * bu adresler genelde X-Frame-Options veya tüm site UI ile iframe'de açılır
 * (kaynak siteye girmiş gibi). Yalnızca aktif trgool ile aynı host'taki sayfalar
 * doğrudan iframe'e uygundur; diğerlerinde trgool channel.html kabuğu kullanılır.
 */
export function isStreamPageOnTrgoolDomain(streamPageUrl, trgoolBaseUrl) {
  if (!streamPageUrl || !trgoolBaseUrl) return false;
  try {
    const a = new URL(String(streamPageUrl).trim());
    const b = new URL(String(trgoolBaseUrl).trim());
    return a.hostname === b.hostname;
  } catch {
    return false;
  }
}
