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
    
    // Maçları çek - sadece #matches-tab içindekiler
    $('#matches-tab .channel-item').each((i, element) => {
      const href = $(element).attr('href')
      const name = $(element).find('.channel-name').text().trim()
      const time = $(element).find('.channel-status').text().trim()
      
      if (href && name && time) {
        const id = href.split('id=')[1] || `match_${i}`
        matches.push({ id, name, time })
      }
    })
    
    // Kanalları çek - sadece #24-7-tab içindekiler
    $('#24-7-tab .channel-item').each((i, element) => {
      const href = $(element).attr('href')
      const name = $(element).find('.channel-name').text().trim()
      const status = $(element).find('.channel-status').text().trim()
      
      if (href && name && status) {
        const id = href.split('id=')[1] || `channel_${i}`
        channels.push({ id, name, status })
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