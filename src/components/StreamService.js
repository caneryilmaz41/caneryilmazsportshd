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

// Çalışan domain bul
export const findActiveDomain = async () => {
  for (const domain of TRGOALS_DOMAINS) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch(`${domain}/`, {
        method: 'HEAD',
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        return domain
      }
    } catch (error) {
      continue
    }
  }
  
  // Fallback
  return TRGOALS_DOMAINS[0]
}

// Get stream URL
export const getStreamUrl = async (channelId) => {
  const activeDomain = await findActiveDomain()
  return `${activeDomain}/channel.html?id=${channelId}`
}