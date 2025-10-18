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
    
    // Maçları çek - #matches-tab içindeki .channel-item'lar
    $('#matches-tab .channel-item').each((i, element) => {
      const href = $(element).attr('href')
      const name = $(element).find('.channel-name').text().trim()
      const time = $(element).find('.channel-status').text().trim()
      
      if (href && name && time) {
        const id = href.split('id=')[1] || `match_${i}`
        matches.push({ id, name, time })
      }
    })
    
    // Kanalları çek - #24-7-tab içindeki .channel-item'lar
    $('#24-7-tab .channel-item').each((i, element) => {
      const href = $(element).attr('href')
      const name = $(element).find('.channel-name').text().trim()
      const status = $(element).find('.channel-status').text().trim()
      
      if (href && name && status) {
        const id = href.split('id=')[1] || `channel_${i}`
        channels.push({ id, name, status })
      }
    })

    
    console.log(`Scraped from ${domain}: ${matches.length} matches, ${channels.length} channels`)
    console.log('HTML length:', html.length)
    console.log('First 500 chars:', html.substring(0, 500))
    
    return res.json({ 
      matches, 
      channels, 
      domain,
      htmlLength: html.length,
      debug: {
        matchesFound: matches.length,
        channelsFound: channels.length
      }
    })
    
  } catch (error) {
    return res.status(500).json({ 
      error: 'Scraping failed',
      matches: [],
      channels: []
    })
  }
}