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
    
    // Sabit kanal listesi
    const channelNames = [
      'BeIN Sports 1', 'BeIN Sports 2', 'BeIN Sports 3', 'BeIN Sports 4', 'BeIN Sports 5',
      'BeIN Max 1', 'BeIN Max 2', 'S Sport', 'S Sport 2', 'Tivibu 1', 'Tivibu 2', 
      'Tivibu 3', 'Tivibu 4', 'Smartspor', 'Smartspor 2', 'TRT Spor', 'TRT Spor 2', 
      'TRT 1', 'A Spor', 'ATV', 'TV 8', 'TV 8,5', 'NBA TV', 'Euro Sport 1', 'Euro Sport 2'
    ]
    
    // Tüm .channel-item'ları çek ve ayır
    $('.channel-item').each((i, element) => {
      const href = $(element).attr('href')
      const name = $(element).find('.channel-name').text().trim()
      const timeOrStatus = $(element).find('.channel-status').text().trim()
      
      if (href && name && timeOrStatus) {
        const id = href.split('id=')[1] || `item_${i}`
        
        // Kanal listesinde var mı kontrol et
        if (channelNames.includes(name)) {
          // Kanal
          channels.push({ id, name, status: timeOrStatus })
        } else {
          // Maç
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