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

// Çalışan domain testi
const testDomain = async (domain) => {
  try {
    const response = await fetch(`${domain}/channel.html?id=yayin1`, {
      method: 'HEAD',
      timeout: 3000
    })
    return response.ok
  } catch {
    return false
  }
}

// Get stream URL - Domain testi ile
export const getStreamUrl = async (channelId) => {
  // İlk 3 domain'i hızlıca test et
  for (let i = 0; i < 3; i++) {
    const domain = TRGOALS_DOMAINS[i]
    const works = await testDomain(domain)
    if (works) {
      return `${domain}/channel.html?id=${channelId}`
    }
  }
  
  // Hiçbiri çalışmazsa fallback
  return `${TRGOALS_DOMAINS[0]}/channel.html?id=${channelId}`
}