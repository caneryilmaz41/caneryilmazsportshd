// TRGoals'dan maç listesini çek
export const scrapeMatches = async () => {
  try {
    const activeDomain = localStorage.getItem('activeTRGoalsDomain') || 'https://trgoals1424.xyz'
    
    // Kendi API'mizi kullan - cache busting ile
    const timestamp = Date.now()
    const response = await fetch(`/api/scrapeMatches?domain=${encodeURIComponent(activeDomain)}&t=${timestamp}`, {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache'
      }
    })
    const data = await response.json()
    
    if (data.matches || data.channels) {
      return { 
        matches: data.matches || [], 
        channels: data.channels || [] 
      }
    } else {
      return getFallbackData()
    }
  } catch (error) {
    console.error('Scraping error:', error)
    return getFallbackData()
  }
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