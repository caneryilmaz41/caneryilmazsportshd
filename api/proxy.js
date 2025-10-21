export default async function handler(req, res) {
  const { url } = req.query
  
  if (!url) {
    return res.status(400).json({ error: 'URL required' })
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://trgoals1431.xyz',
        'Origin': 'https://trgoals1431.xyz'
      }
    })
    
    const html = await response.text()
    
    res.setHeader('Content-Type', 'text/html')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', '*')
    
    return res.send(html)
    
  } catch (error) {
    return res.status(500).json({ error: 'Proxy failed' })
  }
}