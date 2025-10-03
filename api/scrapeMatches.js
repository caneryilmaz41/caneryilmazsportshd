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
    
    // Maçları çek - daha spesifik selectors
    $('.match-item, .live-match, [data-type="match"]').each((i, element) => {
      const href = $(element).attr('href') || $(element).find('a').attr('href')
      const name = $(element).find('.match-name, .channel-name').first().text().trim()
      const time = $(element).find('.match-time, .channel-status').first().text().trim()
      
      if (href && name && time && name.includes('-')) {
        const id = href.includes('id=') ? href.split('id=')[1] : `match_${i}`
        matches.push({ id: `match_${id}`, name, time, type: 'match' })
      }
    })
    
    // Kanalları çek - TV kanalları için
    $('.channel-item, .tv-channel, [data-type="channel"]').each((i, element) => {
      const href = $(element).attr('href') || $(element).find('a').attr('href')
      const name = $(element).find('.channel-name').first().text().trim()
      const status = $(element).find('.channel-status').first().text().trim()
      
      if (href && name && status && !name.includes('-')) {
        const id = href.includes('id=') ? href.split('id=')[1] : `channel_${i}`
        channels.push({ id: `channel_${id}`, name, status, type: 'channel' })
      }
    })
    
    // Fallback - genel scraping
    if (matches.length === 0 && channels.length === 0) {
      $('.channel-item').each((i, element) => {
        const href = $(element).attr('href')
        const name = $(element).find('.channel-name').text().trim()
        const timeOrStatus = $(element).find('.channel-status').text().trim()
        
        if (href && name && timeOrStatus) {
          const id = href.includes('id=') ? href.split('id=')[1] : `item_${i}`
          
          if (name.includes('-') || timeOrStatus.includes(':')) {
            matches.push({ id: `match_${id}`, name, time: timeOrStatus, type: 'match' })
          } else {
            channels.push({ id: `channel_${id}`, name, status: timeOrStatus, type: 'channel' })
          }
        }
      })
    }
    
    return res.json({ matches, channels })
    
  } catch (error) {
    return res.status(500).json({ 
      error: 'Scraping failed',
      matches: [],
      channels: []
    })
  }
}