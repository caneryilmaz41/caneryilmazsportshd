export default async function handler(req, res) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({ error: 'id required' })
  }

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }

  // 1. Kaynak: teletv3
  try {
    const r = await fetch(
      `https://teletv3.top/load/yayinlink.php?id=${encodeURIComponent(id)}`,
      { headers, signal: AbortSignal.timeout(8000) }
    )
    if (r.ok) {
      const data = await r.json()
      if (data?.deismackanal?.includes('m3u8')) {
        const url = data.deismackanal.replace(/edge\d+/g, 'edge3')
        return res.json({ embedUrl: url, type: 'hls', source: 'teletv3', success: true })
      }
    }
  } catch {}

  // 2. Kaynak: streamsport365 cinema
  try {
    const r = await fetch('https://streamsport365.com/cinema', {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Origin': 'https://streamsport365.com',
        'Referer': 'https://streamsport365.com/'
      },
      body: JSON.stringify({
        AppId: '5000',
        AppVer: '1',
        VpcVer: '1.0.12',
        Language: 'en',
        Token: '',
        VideoId: id
      }),
      signal: AbortSignal.timeout(8000)
    })
    if (r.ok) {
      const data = await r.json()
      if (data?.URL) {
        const url = data.URL.replace(/edge\d+/g, 'edge3')
        return res.json({ embedUrl: url, type: 'hls', source: 'cinema', success: true })
      }
    }
  } catch {}

  return res.json({ embedUrl: null, success: false })
}
