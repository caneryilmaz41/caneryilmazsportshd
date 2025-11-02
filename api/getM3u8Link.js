import * as cheerio from 'cheerio'

export default async function handler(req, res) {
  const { domain, channelId } = req.query
  
  if (!domain || !channelId) {
    return res.status(400).json({ error: 'domain and channelId required' })
  }

  try {
    const channelUrl = `${domain}/channel.html?id=${channelId}`
    const response = await fetch(channelUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch channel page')
    }
    
    const html = await response.text()
    
    // m3u8 linkini bul - çeşitli pattern'ler dene
    const m3u8Patterns = [
      /https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/g,
      /"(https?:\/\/[^"]+\.m3u8[^"]*)"/g,
      /'(https?:\/\/[^']+\.m3u8[^']*)'/g,
      /src\s*=\s*["'](https?:\/\/[^"']+\.m3u8[^"']*)/g
    ]
    
    let m3u8Link = null
    
    for (const pattern of m3u8Patterns) {
      const matches = html.match(pattern)
      if (matches && matches.length > 0) {
        m3u8Link = matches[0].replace(/['"]/g, '')
        break
      }
    }
    
    if (m3u8Link) {
      return res.json({ 
        m3u8Link,
        playerUrl: `https://m3u8player.org/player.html?url=${encodeURIComponent(m3u8Link)}`
      })
    } else {
      return res.status(404).json({ error: 'M3U8 link not found' })
    }
    
  } catch (error) {
    return res.status(500).json({ 
      error: 'Failed to extract M3U8 link',
      message: error.message
    })
  }
}