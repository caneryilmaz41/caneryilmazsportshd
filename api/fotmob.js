/**
 * FotMob aracı: tarayıcıdan doğrudan erişimde CORS başlığı her zaman gelmediği için
 * skor merkezi verisini buradan geçirir. Sadece izin verilen uçlar, kısa CDN önbelleği.
 *   /api/fotmob?path=matches&date=20261003
 *   /api/fotmob?path=matchDetails&matchId=123
 *   /api/fotmob?path=leagues&id=71
 */
const ALLOWED = {
  matches: 20, // canlı skorlar: 20 sn
  matchDetails: 20,
  leagues: 600, // puan durumu: 10 dk
}

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  const { path, ...rest } = req.query || {}
  const ttl = ALLOWED[path]
  if (!ttl) return res.status(400).json({ error: 'invalid path' })

  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(rest)) {
    if (typeof v === 'string' && /^[\w./%-]{1,64}$/.test(v)) qs.set(k, v)
  }

  try {
    const upstream = await fetch(`https://www.fotmob.com/api/data/${path}?${qs}`, {
      headers: { 'User-Agent': UA, Accept: 'application/json' },
      signal: AbortSignal.timeout(12000),
    })
    if (!upstream.ok) return res.status(502).json({ error: `upstream ${upstream.status}` })
    const body = await upstream.text()
    if (!body.trimStart().startsWith('{') && !body.trimStart().startsWith('[')) {
      return res.status(502).json({ error: 'upstream not json' })
    }
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    // vercel.json /api için no-cache koyuyor; CDN önbelleğini ayrı başlıkla ver.
    res.setHeader('Vercel-CDN-Cache-Control', `max-age=${ttl}, stale-while-revalidate=${ttl * 2}`)
    return res.status(200).send(body)
  } catch {
    return res.status(504).json({ error: 'upstream timeout' })
  }
}
