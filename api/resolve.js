export default async function handler(req, res) {
  const { pageUrl } = req.query
  
  if (!pageUrl) {
    return res.status(400).json({ error: 'pageUrl required' })
  }

  try {
    const response = await fetch(pageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': new URL(pageUrl).origin
      },
      timeout: 10000
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const html = await response.text()
    
    // M3U8 linkini bul
    const m3u8Patterns = [
      /https?:\/\/[^\s"']+\.m3u8[^\s"']*/gi,
      /"(https?:\/\/[^"]+\.m3u8[^"]*)"/gi,
      /'(https?:\/\/[^']+\.m3u8[^']*)'/gi
    ]
    
    let m3u8Url = null
    for (const pattern of m3u8Patterns) {
      const matches = html.match(pattern)
      if (matches) {
        m3u8Url = matches[0].replace(/['"]/g, '')
        break
      }
    }
    
    if (!m3u8Url) {
      throw new Error('M3U8 not found')
    }
    
    // M3U8 içeriğini al
    const m3u8Response = await fetch(m3u8Url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': pageUrl
      }
    })
    
    if (!m3u8Response.ok) {
      throw new Error(`M3U8 fetch failed: ${m3u8Response.status}`)
    }
    
    let m3u8Content = await m3u8Response.text()
    const baseUrl = m3u8Url.substring(0, m3u8Url.lastIndexOf('/') + 1)
    
    // URL'leri proxy'e yönlendir
    const lines = m3u8Content.split('\n')
    const rewrittenLines = lines.map(line => {
      if (line.startsWith('#') || !line.trim()) return line
      
      let segmentUrl = line.trim()
      if (!segmentUrl.startsWith('http')) {
        segmentUrl = baseUrl + segmentUrl
      }
      
      return `/api/segment?u=${encodeURIComponent(segmentUrl)}`
    })
    
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl')
    res.setHeader('Cache-Control', 'max-age=30')
    return res.send(rewrittenLines.join('\n'))
    
  } catch (error) {
    console.error('Resolve error:', error)
    return res.status(500).json({ error: error.message })
  }
}