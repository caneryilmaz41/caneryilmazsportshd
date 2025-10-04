import * as cheerio from 'cheerio'

export default async function handler(req, res) {
  const { domain } = req.query
  
  if (!domain) {
    return res.status(400).json({ error: 'domain required' })
  }

  try {
    const response = await fetch(domain, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch')
    }
    
    const html = await response.text()
    const $ = cheerio.load(html)
    
    const matches = []
    const channels = []
    const allItems = []
    
    // Tüm .channel-item'ları topla
    $('.channel-item').each((i, element) => {
      const href = $(element).attr('href')
      const name = $(element).find('.channel-name').text().trim()
      const timeOrStatus = $(element).find('.channel-status').text().trim()
      
      if (href && name && timeOrStatus) {
        const id = href.includes('id=') ? href.split('id=')[1] : `item_${i}`
        allItems.push({ id, name, timeOrStatus, element: $(element).html() })
      }
    })
    
    // Akıllı ayrım yap
    allItems.forEach((item, index) => {
      const { id, name, timeOrStatus } = item
      
      // Maç belirtileri
      const isMatch = 
        name.includes(' - ') ||           // Takım - Takım
        name.includes(' vs ') ||          // Takım vs Takım  
        name.includes(' x ') ||           // Takım x Takım
        /\d{1,2}:\d{2}/.test(timeOrStatus) || // Saat formatı (20:00)
        timeOrStatus.includes('LIVE') ||   // Canlı yayın
        timeOrStatus.includes('Maç') ||     // Maç kelimesi
        name.toLowerCase().includes('maç')   // İsimde maç
      
      // Kanal belirtileri  
      const isChannel = 
        name.includes('Sports') ||        // BeIN Sports, S Sport
        name.includes('TV') ||            // TRT1, ATV
        name.includes('Spor') ||          // Spor kanalları
        timeOrStatus.includes('7/24') ||  // 7/24 yayın
        timeOrStatus.includes('HD') ||    // HD kanal
        /^[A-Z]+ \d+$/.test(name)        // "BEIN 1", "TRT 1" formatı
      
      if (isMatch && !isChannel) {
        matches.push({ id: `match_${id}`, name, time: timeOrStatus })
      } else {
        channels.push({ id: `channel_${id}`, name, status: timeOrStatus })
      }
    })
    
    return res.json({ matches, channels })
    
  } catch (error) {
    return res.status(500).json({ 
      error: 'Scraping failed',
      matches: [],
      channels: []
    })
  }
}