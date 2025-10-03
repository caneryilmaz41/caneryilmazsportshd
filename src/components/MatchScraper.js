// TRGoals'dan maç listesini çek
export const scrapeMatches = async () => {
  try {
    const activeDomain = localStorage.getItem('activeTRGoalsDomain') || 'https://trgoals1424.xyz'
    
    // Proxy kullanarak CORS'u aş
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(activeDomain)}`
    
    const response = await fetch(proxyUrl)
    const data = await response.json()
    const html = data.contents
    
    // HTML'den maç listesini parse et
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    
    const matches = []
    const channels = []
    
    // Maçları çek
    const matchElements = doc.querySelectorAll('#matches-tab .channel-item')
    matchElements.forEach(element => {
      const href = element.getAttribute('href')
      const name = element.querySelector('.channel-name')?.textContent?.trim()
      const time = element.querySelector('.channel-status')?.textContent?.trim()
      
      if (href && name && time) {
        const id = href.split('id=')[1]
        matches.push({ id, name, time })
      }
    })
    
    // Kanalları çek
    const channelElements = doc.querySelectorAll('#24-7-tab .channel-item')
    channelElements.forEach(element => {
      const href = element.getAttribute('href')
      const name = element.querySelector('.channel-name')?.textContent?.trim()
      const status = element.querySelector('.channel-status')?.textContent?.trim()
      
      if (href && name && status) {
        const id = href.split('id=')[1]
        channels.push({ id, name, status })
      }
    })
    
    return { matches, channels }
  } catch (error) {
    console.error('Scraping error:', error)
    return { matches: [], channels: [] }
  }
}

// Fallback data
export const getFallbackData = () => ({
  matches: [
    { id: 'yayin1', name: 'Trabzonspor - Kayserispor', time: '20:00' },
    { id: 'yayinb2', name: 'Antalyaspor - Çaykur Rizespor', time: '20:00' },
    { id: 'yayint3', name: 'F. Düsseldorf - Nürnberg', time: '19:30' }
  ],
  channels: [
    { id: 'yayin1', name: 'BeIN Sports 1', status: '7/24' },
    { id: 'yayinb2', name: 'BeIN Sports 2', status: '7/24' },
    { id: 'yayinss', name: 'S Sport', status: '7/24' }
  ]
})