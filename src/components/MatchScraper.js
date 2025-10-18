// Aktif domain listesi - 1430-1445 aralığı
const TRGOALS_DOMAINS = [
  'https://trgoals1430.xyz',
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
  'https://trgoals1445.xyz'
]

// TRGoals'dan maç listesini çek
export const scrapeMatches = async () => {
  let activeDomain = localStorage.getItem('activeTRGoalsDomain')
  
  // Yeni kullanıcı için domain set et
  if (!activeDomain) {
    activeDomain = TRGOALS_DOMAINS[0]
    localStorage.setItem('activeTRGoalsDomain', activeDomain)
  }
  
  // Tüm domainleri dene
  for (const domain of TRGOALS_DOMAINS) {
    try {
      const timestamp = Date.now()
      const response = await fetch(`/api/scrapeMatches?domain=${encodeURIComponent(domain)}&t=${timestamp}`, {
        cache: 'no-cache',
        headers: { 'Cache-Control': 'no-cache' },
        timeout: 5000
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.matches || data.channels) {
          // Çalışan domaini kaydet
          localStorage.setItem('activeTRGoalsDomain', domain)
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

// Fallback data
export const getFallbackData = () => ({
  matches: [
    { id: 'yayin1', name: 'Galatasaray - Fenerbahçe', time: '20:00' },
    { id: 'yayinb2', name: 'Real Madrid - Barcelona ', time: '20:00' },
    { id: 'yayint3', name: 'Kocaelispor - Beşiktaş', time: '19:30' },
    { id: 'yayint3', name: 'Vanspor - Erzurumspor', time: '19:30' }
      
  ],
  channels: [
    { id: 'yayin1', name: 'BeIN Sports 1', status: '7/24' },
    { id: 'yayinb2', name: 'BeIN Sports 2', status: '7/24' },
    { id: 'yayinss', name: 'S Sport', status: '7/24' }
  ]
})