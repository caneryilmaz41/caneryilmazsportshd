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
    
    // Tüm .channel-item'ları çek ve ayır
    $('.channel-item').each((i, element) => {
      const href = $(element).attr('href')
      const name = $(element).find('.channel-name').text().trim()
      const timeOrStatus = $(element).find('.channel-status').text().trim()
      
      if (href && name && timeOrStatus) {
        const id = href.includes('id=') ? href.split('id=')[1] : `item_${i}`
        
        // 7/24 içeriyorsa kanal, diğerleri maç
        if (timeOrStatus.includes('7/24') || timeOrStatus.includes('HD') || timeOrStatus.includes('24/7')) {
          // Kanal - 7/24 formatı
          channels.push({ id, name, status: timeOrStatus })
        } else {
          // Maç - saat formatı veya diğer
          matches.push({ id, name, time: timeOrStatus })
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