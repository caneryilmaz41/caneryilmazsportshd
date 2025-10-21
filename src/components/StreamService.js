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

// Cache için working domain
let workingDomain = null
let lastCheck = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 dakika

// Domain test fonksiyonu
const testDomain = async (domain) => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)
    
    const response = await fetch(`${domain}/channel.html?id=yayin1`, {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-cache'
    })
    
    clearTimeout(timeoutId)
    return response.ok
  } catch {
    return false
  }
}

// Çalışan domain bul
const findWorkingDomain = async () => {
  const now = Date.now()
  
  // Cache kontrolü
  if (workingDomain && (now - lastCheck) < CACHE_DURATION) {
    return workingDomain
  }
  
  // Paralel test - daha hızlı
  const promises = TRGOALS_DOMAINS.map(async (domain) => {
    const works = await testDomain(domain)
    return works ? domain : null
  })
  
  const results = await Promise.all(promises)
  const working = results.find(domain => domain !== null)
  
  if (working) {
    workingDomain = working
    lastCheck = now
    return working
  }
  
  // Fallback - ilk domain
  return TRGOALS_DOMAINS[0]
}

// Get stream URL - İlk defa giren cihazlar için domain kontrolü
export const getStreamUrl = async (channelId) => {
  try {
    const domain = await findWorkingDomain()
    const url = `${domain}/channel.html?id=${channelId}`
    
    // URL'e timestamp ekle - cache bypass
    const timestamp = Date.now()
    return `${url}&t=${timestamp}&autoplay=1&muted=1`
  } catch (error) {
    console.warn('Domain test failed, using fallback:', error)
    return `${TRGOALS_DOMAINS[0]}/channel.html?id=${channelId}&t=${Date.now()}&autoplay=1&muted=1`
  }
}