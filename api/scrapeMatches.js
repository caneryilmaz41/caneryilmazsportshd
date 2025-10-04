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
    
    // Sabit kanal listesi - hiç değişmiyor
    const channels = [
      { id: 'yayin1', name: 'BeIN Sports 1', status: '7/24' },
      { id: 'yayinb2', name: 'BeIN Sports 2', status: '7/24' },
      { id: 'yayinb3', name: 'BeIN Sports 3', status: '7/24' },
      { id: 'yayinb4', name: 'BeIN Sports 4', status: '7/24' },
      { id: 'yayinb5', name: 'BeIN Sports 5', status: '7/24' },
      { id: 'yayinbm1', name: 'BeIN Max 1', status: '7/24' },
      { id: 'yayinbm2', name: 'BeIN Max 2', status: '7/24' },
      { id: 'yayinss', name: 'S Sport', status: '7/24' },
      { id: 'yayinss2', name: 'S Sport 2', status: '7/24' },
      { id: 'yayint1', name: 'Tivibu 1', status: '7/24' },
      { id: 'yayint2', name: 'Tivibu 2', status: '7/24' },
      { id: 'yayint3', name: 'Tivibu 3', status: '7/24' },
      { id: 'yayint4', name: 'Tivibu 4', status: '7/24' },
      { id: 'yayinsmarts', name: 'Smartspor', status: '7/24' },
      { id: 'yayinsms2', name: 'Smartspor 2', status: '7/24' },
      { id: 'yayintrtspor', name: 'TRT Spor', status: '7/24' },
      { id: 'yayintrtspor2', name: 'TRT Spor 2', status: '7/24' },
      { id: 'yayintrt1', name: 'TRT 1', status: '7/24' },
      { id: 'yayinas', name: 'A Spor', status: '7/24' },
      { id: 'yayinatv', name: 'ATV', status: '7/24' },
      { id: 'yayintv8', name: 'TV 8', status: '7/24' },
      { id: 'yayintv85', name: 'TV 8,5', status: '7/24' },
      { id: 'yayinnbatv', name: 'NBA TV', status: '7/24' },
      { id: 'yayineu1', name: 'Euro Sport 1', status: '7/24' },
      { id: 'yayineu2', name: 'Euro Sport 2', status: '7/24' }
    ]
    
    // Sadece maçları çek
    $('.channel-item').each((i, element) => {
      const href = $(element).attr('href')
      const name = $(element).find('.channel-name').text().trim()
      const time = $(element).find('.channel-status').text().trim()
      
      if (href && name && time) {
        const id = href.split('id=')[1] || `match_${i}`
        
        // Kanal değilse maç olarak ekle
        const isChannel = channels.some(channel => channel.name === name)
        if (!isChannel) {
          matches.push({ id, name, time })
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