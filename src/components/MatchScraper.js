// Aktif domain listesi - 1431'den başlatıp güncel olanlar
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

// TRGoals'dan maç listesini çek
export const scrapeMatches = async () => {
  // Tüm domainleri dene, çalışan ilkini kullan
  for (const domain of TRGOALS_DOMAINS) {
    try {
      const timestamp = Date.now()
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)
      
      const response = await fetch(`/api/scrapeMatches?domain=${encodeURIComponent(domain)}&t=${timestamp}`, {
        cache: 'no-cache',
        headers: { 'Cache-Control': 'no-cache' },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const data = await response.json()
        if (data.matches || data.channels) {
          return { 
            matches: data.matches || [], 
            channels: data.channels || [] 
          }
        }
      }
    } catch (error) {
      console.log(`Domain ${domain} failed:`, error)
      continue
    }
  }
  
  // Hiçbiri çalışmazsa fallback
  return getFallbackData()
}

// Fallback data - TRGoals'dan alınan gerçek veriler
export const getFallbackData = () => ({
  matches: [
    { id: 'yayin1', name: 'Fenerbahçe - Galatasaray', time: '20:00' },
    { id: 'yayinb2', name: 'Beşiktaş - Gençlerbirliği', time: '17:00' },
    { id: 'yayin1', name: 'Çaykur Rizespor - Trabzonspor', time: '17:00' },
 
  ],
  channels: [
    { id: 'yayin1', name: 'BeIN Sports 1', status: '7/24' },
    { id: 'yayinb2', name: 'BeIN Sports 2', status: '7/24' },
    { id: 'yayinb3', name: 'BeIN Sports 3', status: '7/24' },
 
  ]
})