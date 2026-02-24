import * as cheerio from 'cheerio'

export default async function handler(req, res) {
  const { domain } = req.query
  
  if (!domain) {
    return res.status(400).json({ error: 'domain required' })
  }

  try {
    const response = await fetch(domain, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch')
    }
    
    const html = await response.text()
    const $ = cheerio.load(html)
    
    const matches = []
    const channels = []
    
    // Maçları çek - .item.football, .item.basketball, .item.tennis, .item.voleybol
    $('.item.football, .item.basketball, .item.tennis, .item.voleybol').each((i, element) => {
      const href = $(element).find('a').attr('href')
      const name = $(element).find('strong.name').text().trim()
      const time = $(element).find('time').text().trim()
      
      if (href && name) {
        const slug = href.split('/izle/')[1] || href.split('/').pop()
        matches.push({ 
          id: slug,
          name, 
          time: time || 'Canlı',
          url: `/channel/watch/${slug}`
        })
      }
    })
    
    // Kanalları çek - .item.live
    $('.item.live').each((i, element) => {
      const href = $(element).find('a').attr('href')
      const name = $(element).find('strong.name, strong.tvcp').text().trim()
      
      if (href && name) {
        const slug = href.split('/izle/')[1] || href.split('/').pop()
        channels.push({ 
          id: slug,
          name, 
          status: '7/24',
          url: `/channel/watch/${slug}`
        })
      }
    })
    
    console.log(`Scraped from ${domain}: ${matches.length} matches, ${channels.length} channels`)
    
    return res.json({ 
      matches, 
      channels, 
      domain,
      success: true
    })
    
  } catch (error) {
    console.error('Scraping error:', error)
    return res.status(500).json({ 
      error: 'Scraping failed',
      matches: [],
      channels: [],
      success: false
    })
  }
}