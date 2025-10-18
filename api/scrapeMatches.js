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
    
    // Farklı selector'ları dene
    const selectors = [
      '#matches-tab .channel-item',
      '.matches .channel-item', 
      '.match-list .item',
      '.channel-item',
      'a[href*="watch"]'
    ]
    
    for (const selector of selectors) {
      $(selector).each((i, element) => {
        const href = $(element).attr('href')
        const name = $(element).find('.channel-name, .name, .title').text().trim() || $(element).text().trim()
        const time = $(element).find('.channel-status, .time, .status').text().trim()
        
        if (href && name && name.length > 3) {
          const id = href.split('id=')[1] || href.split('/').pop() || `item_${i}`
          
          // Maç mı kanal mı kontrol et
          const isMatch = name.includes('-') || name.includes('vs') || /\d{1,2}:\d{2}/.test(time)
          
          if (isMatch) {
            matches.push({ id, name, time: time || 'Canlı' })
          } else {
            channels.push({ id, name, status: time || '7/24' })
          }
        }
      })
      
      if (matches.length > 0 || channels.length > 0) break
    }

    
    console.log(`Scraped from ${domain}: ${matches.length} matches, ${channels.length} channels`)
    return res.json({ matches, channels, domain })
    
  } catch (error) {
    return res.status(500).json({ 
      error: 'Scraping failed',
      matches: [],
      channels: []
    })
  }
}