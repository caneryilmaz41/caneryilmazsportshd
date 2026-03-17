const DATA_API = 'https://teletv3.top/load'
const TRGOOL_DOMAIN = 'https://trgooltv61.top'

export default async function handler(req, res) {
  try {
    const [matchesRes, channelsRes] = await Promise.all([
      fetch(`${DATA_API}/matches.php`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': TRGOOL_DOMAIN,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      }),
      fetch(`${DATA_API}/channels.php`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': TRGOOL_DOMAIN,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      })
    ])

    if (!matchesRes.ok || !channelsRes.ok) {
      throw new Error('Failed to fetch')
    }

    const matchesHtml = await matchesRes.text()
    const channelsHtml = await channelsRes.text()

    const matches = parseMatches(matchesHtml)
    const channels = parseChannels(channelsHtml)

    return res.json({ matches, channels, success: true })

  } catch (error) {
    console.error('Fetch error:', error)
    return res.status(500).json({ 
      matches: [], 
      channels: [], 
      success: false,
      error: error.message
    })
  }
}

function parseMatches(html) {
  const matches = []
  const regex = /onclick=["']changePlayer\(["']([^"']+)["']\)["'][^>]*>.*?<div class=["']match-name["']>([^<]+)<\/div>.*?<div class=["']match-time["']>([^<]+)<\/div>/gs
  
  let match
  while ((match = regex.exec(html)) !== null) {
    const id = match[1]
    const name = match[2].trim()
    const time = match[3].trim()
    
    if (id && name) {
      matches.push({
        id,
        name,
        time: time || 'Canlı',
        url: `${TRGOOL_DOMAIN}/matches?id=${id}`
      })
    }
  }
  
  return matches
}

function parseChannels(html) {
  const channels = []
  const regex = /onclick=["']changePlayer\(["']([^"']+)["']\)["'][^>]*>.*?<div class=["']match-name["']>([^<]+)<\/div>/gs
  
  let match
  while ((match = regex.exec(html)) !== null) {
    const id = match[1]
    const name = match[2].trim()
    
    if (id && name) {
      channels.push({
        id,
        name,
        status: '7/24',
        url: `${TRGOOL_DOMAIN}/matches?id=${id}`
      })
    }
  }
  
  return channels
}
