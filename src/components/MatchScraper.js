import { getPrimaryTrgoolDomain } from '../../trgoolDomains.js'
import { trgoolChannelEmbedUrl } from '../utils/trgoolEmbedUrl.js'

const DATA_API = 'https://teletv3.top/load'

const resolveActiveDomain = async () => {
  try {
    const res = await fetch('/api/trgoolDomain')
    if (res.ok) {
      const data = await res.json()
      if (data?.domain) return data.domain
    }
  } catch {
    /* Vite dev: /api yok; production dışı */
  }
  return getPrimaryTrgoolDomain()
}

let activeDomain = getPrimaryTrgoolDomain()

// Direkt PHP endpoint'lerinden çek
export const scrapeMatches = async () => {
  try {
    console.log('Fetching matches and channels...')
    activeDomain = await resolveActiveDomain()
    
    const [matchesRes, channelsRes] = await Promise.all([
      fetch(`${DATA_API}/matches.php`),
      fetch(`${DATA_API}/channels.php`)
    ])

    if (matchesRes.ok && channelsRes.ok) {
      const matchesHtml = await matchesRes.text()
      const channelsHtml = await channelsRes.text()

      console.log('Matches HTML length:', matchesHtml.length)
      console.log('Channels HTML length:', channelsHtml.length)
      console.log('Full matches HTML:', matchesHtml)
      console.log('Full channels HTML:', channelsHtml)
      
      const matches = parseMatches(matchesHtml)
      const channels = parseChannels(channelsHtml)
      
      console.log(`Final: ${matches.length} matches, ${channels.length} channels`)
      
      return { matches, channels }
    }
  } catch (error) {
    console.error('Scrape error:', error)
  }
  
  console.log('Using fallback data')
  return getFallbackData()
}


const parseMatches = (html) => {
  const matches = []
  

  const aTagRegex = /<a[^>]*class="single-match[^"]*"[^>]*href="matches\?id=([^"]+)"[^>]*>([\s\S]*?)<\/a>/g
  
  let aMatch
  while ((aMatch = aTagRegex.exec(html)) !== null) {
    const id = aMatch[1]
    const content = aMatch[2]
    
    // Takım logoları
    const homeLogoMatch = content.match(/<img[^>]*src="([^"]+)"[^>]*alt="Home"/)
    const awayLogoMatch = content.match(/<img[^>]*src="([^"]+)"[^>]*alt="Away"/)
    
    // Takım isimleri
    const homeMatch = content.match(/<div class="home">([^<]+)<\/div>/)
    const awayMatch = content.match(/<div class="away">([^<]+)<\/div>/)
    
    // Saat ve lig bilgisi
    const eventMatch = content.match(/<div class="event">\s*([^<|]+)\s*\|\s*([^<]+)<\/div>/)
    
    // Kategori (Futbol TR, Basketbol vb.)
    const categoryMatch = content.match(/<div class="date">\s*([^<\s]+)/)
    
    // Özel etiket (GÜNÜN MAÇI vb.)
    const specialMatch = content.match(/<span class="colorling">([^<]+)<\/span>/)
    
    // data-matchtype
    const typeMatch = content.match(/data-matchtype="([^"]+)"/)
    
    if (homeMatch && awayMatch && eventMatch) {
      matches.push({
        id,
        name: `${homeMatch[1].trim()} - ${awayMatch[1].trim()}`,
        homeLogo: homeLogoMatch ? homeLogoMatch[1] : null,
        awayLogo: awayLogoMatch ? awayLogoMatch[1] : null,
        time: eventMatch[1].trim(),
        league: eventMatch[2].trim(),
        category: categoryMatch ? categoryMatch[1].trim() : '',
        special: specialMatch ? specialMatch[1].trim() : null,
        type: typeMatch ? typeMatch[1] : '',
        url: trgoolChannelEmbedUrl(activeDomain, id) || `${activeDomain}/channel.html?id=${id}`
      })
    }
  }
  
  console.log(`Parsed ${matches.length} matches`)
  return matches
}

// HTML'den kanalları parse et
const parseChannels = (html) => {
  const channels = []
  
  // <a> tag'lerini bul
  const aTagRegex = /<a[^>]*class="single-match[^"]*"[^>]*href="matches\?id=([^"]+)"[^>]*>([\s\S]*?)<\/a>/g
  
  let aMatch
  while ((aMatch = aTagRegex.exec(html)) !== null) {
    const id = aMatch[1]
    const content = aMatch[2]
    
    // İçerikten home çek
    const homeMatch = content.match(/<div class="home">([^<]+)<\/div>/)
    
    if (homeMatch) {
      channels.push({
        id,
        name: homeMatch[1].trim(),
        status: '7/24',
        url: trgoolChannelEmbedUrl(activeDomain, id) || `${activeDomain}/channel.html?id=${id}`
      })
    }
  }
  
  console.log(`Parsed ${channels.length} channels`)
  return channels
}

// Fallback data
export const getFallbackData = () => {
  const base = getPrimaryTrgoolDomain()
  const w = (id) => trgoolChannelEmbedUrl(base, id) || `${base}/channel.html?id=${id}`
  return {
    matches: [
      { id: 'bein-sports-1', name: 'Fenerbahçe - Galatasaray', time: '20:00', url: w('bein-sports-1') },
      { id: 'bein-sports-2', name: 'Beşiktaş - Trabzonspor', time: '19:00', url: w('bein-sports-2') }
    ],
    channels: [
      { id: 'bein-sports-1', name: 'BEIN SPORTS 1', status: '7/24', url: w('bein-sports-1') },
      { id: 'bein-sports-2', name: 'BEIN SPORTS 2', status: '7/24', url: w('bein-sports-2') },
      { id: 'bein-sports-3', name: 'BEIN SPORTS 3', status: '7/24', url: w('bein-sports-3') },
      { id: 's-sport', name: 'S SPORT', status: '7/24', url: w('s-sport') },
      { id: 'trt-spor', name: 'TRT SPOR', status: '7/24', url: w('trt-spor') }
    ]
  }
}