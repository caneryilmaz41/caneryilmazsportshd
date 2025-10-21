// Aktif domain listesi - MatchScraper ile aynı
const TRGOALS_DOMAINS = [
  'https://trgoals1431.xyz',
  'https://trgoals1432.xyz',
  'https://trgoals1433.xyz',
  'https://trgoals1434.xyz',
  'https://trgoals1435.xyz',
  'https://trgoals1436.xyz',
  'https://trgoals1437.xyz',
  'https://trgoals1438.xyz',
  'https://trgoals1439.xyz',
  'https://trgoals1440.xyz',
  'https://trgoals1441.xyz',
  'https://trgoals1442.xyz',
  'https://trgoals1443.xyz',
  'https://trgoals1444.xyz',
  'https://trgoals1445.xyz',
  'https://trgoals1446.xyz'
]

// Get stream URL - Senin cache'ini simüle et
export const getStreamUrl = async (channelId) => {
  // Senin cache'indeki session bilgilerini ekle
  const sessionId = 'cached_user_' + Date.now()
  const userAgent = encodeURIComponent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
  const referer = encodeURIComponent('https://trgoals1431.xyz')
  
  return `${TRGOALS_DOMAINS[0]}/channel.html?id=${channelId}&session=${sessionId}&ua=${userAgent}&ref=${referer}&cached=true`
}