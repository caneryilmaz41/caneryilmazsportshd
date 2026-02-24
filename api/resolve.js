import * as cheerio from 'cheerio'

export default async function handler(req, res) {
  const { slug } = req.query
  
  if (!slug) {
    return res.status(400).json({ error: 'slug required' })
  }

  const domains = [
    'https://selcuktvsporhd.in',
    'https://selcuksportshd.com',
    'https://selcuksports.tv'
  ]

  for (const domain of domains) {
    try {
      const pageUrl = `${domain}/izle/${slug}`
      const response = await fetch(pageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })
      
      if (!response.ok) continue
      
      const html = await response.text()
      const $ = cheerio.load(html)
      
      // Player URL'ini bul - data-player-url attribute'u
      const playerUrl = $('.x-embed-container').attr('data-player-url')
      
      if (playerUrl) {
        const fullPlayerUrl = playerUrl.startsWith('http') ? playerUrl : `${domain}${playerUrl}`
        return res.json({ 
          playerUrl: fullPlayerUrl,
          success: true 
        })
      }
    } catch (error) {
      continue
    }
  }
  
  return res.status(404).json({ 
    error: 'Player URL not found',
    success: false 
  })
}
