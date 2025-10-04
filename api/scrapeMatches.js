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
    
    // Tüm .channel-item'ları çek ve akıllıca ayır
    $('.channel-item').each((i, element) => {
      const href = $(element).attr('href')
      const name = $(element).find('.channel-name').text().trim()
      const timeOrStatus = $(element).find('.channel-status').text().trim()
      
      if (href && name && timeOrStatus) {
        const id = href.includes('id=') ? href.split('id=')[1] : `item_${i}`
        
        // Saat formatı varsa maç, 7/24 varsa kanal
        if (timeOrStatus.includes(':') || timeOrStatus.includes('LIVE') || timeOrStatus.includes('Başladı')) {
          // Maç - saat formatı içeriyor
          matches.push({ id, name, time: timeOrStatus })
        } else {
          // Kanal - 7/24, HD, vs. içeriyor
          channels.push({ id, name, status: timeOrStatus })
        }
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