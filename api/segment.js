export default async function handler(req, res) {
  const { u } = req.query
  
  if (!u) {
    return res.status(400).json({ error: 'u parameter required' })
  }

  try {
    const response = await fetch(u, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': new URL(u).origin
      },
      timeout: 15000
    })
    
    if (!response.ok) {
      throw new Error(`Segment fetch failed: ${response.status}`)
    }
    
    // Content-Type'ı koru
    const contentType = response.headers.get('content-type')
    if (contentType) {
      res.setHeader('Content-Type', contentType)
    }
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET')
    res.setHeader('Cache-Control', 'max-age=3600')
    
    // Stream the response
    const reader = response.body.getReader()
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      res.write(value)
    }
    
    res.end()
    
  } catch (error) {
    console.error('Segment proxy error:', error)
    return res.status(500).json({ error: error.message })
  }
}