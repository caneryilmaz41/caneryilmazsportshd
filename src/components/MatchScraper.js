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

// Fallback data - TRGoals'dan alınan gerçek veriler
export const getFallbackData = () => ({
  matches: [
    { id: 'yayin1', name: 'Başakşehir - Galatasaray', time: '20:00' },
    { id: 'yayinb2', name: 'Beşiktaş - Gençlerbirliği', time: '17:00' },
    { id: 'yayin1', name: 'Çaykur Rizespor - Trabzonspor', time: '17:00' },
    { id: 'yayinbm2', name: 'Manisa FK - Erzurumspor FK', time: '13:30' },
    { id: 'yayintrtspor', name: 'Van Spor FK - Pendikspor', time: '13:30' },
    { id: 'yayinb3', name: 'Not.Forest - Chelsea', time: '14:30' },
    { id: 'yayinss', name: 'Sevilla - Mallorca', time: '15:00' },
    { id: 'yayint1', name: 'Bayern Münih - Dortmund', time: '19:30' },
    { id: 'yayinss', name: 'Barcelona - Girona', time: '17:15' }
  ],
  channels: [
    { id: 'yayin1', name: 'BeIN Sports 1', status: '7/24' },
    { id: 'yayinb2', name: 'BeIN Sports 2', status: '7/24' },
    { id: 'yayinb3', name: 'BeIN Sports 3', status: '7/24' },
    { id: 'yayinb4', name: 'BeIN Sports 4', status: '7/24' },
    { id: 'yayinss', name: 'S Sport', status: '7/24' },
    { id: 'yayinss2', name: 'S Sport 2', status: '7/24' },
    { id: 'yayint1', name: 'Tivibu 1', status: '7/24' },
    { id: 'yayint2', name: 'Tivibu 2', status: '7/24' },
    { id: 'yayintrtspor', name: 'TRT Spor', status: '7/24' },
    { id: 'yayinas', name: 'A Spor', status: '7/24' }
  ]
})