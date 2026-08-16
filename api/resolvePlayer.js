import { getCachedWorkingTrgoolDomain } from '../trgoolDomains.js'
import { resolveWorkingTeletvBase, teletvLoadUrl } from '../teletvHosts.js'

const TIMEOUT = 10_000
const M3U8_PROBE_MS = 8000

/**
 * teletv bazen ölü / 404 playlist döner; HLS patlayınca player.html kırılır.
 * Kaynak seçerken manifest’in gerçekten açıldığını doğrula.
 */
async function verifyM3u8Reachable(url) {
  if (!url || typeof url !== 'string') return false
  const u = url.trim().replace(/edge\d+/g, 'edge3')
  if (!/^https?:\/\//i.test(u)) return false
  try {
    let res = await fetch(u, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(M3U8_PROBE_MS) })
    if (res.ok) return true
    res = await fetch(u, {
      method: 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(M3U8_PROBE_MS),
      headers: { Range: 'bytes=0-8191' },
    })
    return res.ok
  } catch {
    return false
  }
}

function normalizeM3u8(raw) {
  if (!raw || typeof raw !== 'string') return null
  const u = raw.trim().replace(/&amp;/g, '&').replace(/\\u0026/g, '&')
  if (!u.toLowerCase().includes('m3u8')) return null
  return u.replace(/edge\d+/g, 'edge3')
}

function extractM3u8List(html) {
  if (!html || typeof html !== 'string') return []
  const re = /https?:\/\/[^\s"'<>\\]+\.m3u8[^\s"'<>\\]*/gi
  const m = html.match(re)
  if (!m) return []
  return [...new Set(m.map((u) => normalizeM3u8(u)).filter(Boolean))]
}

const htmlHeaders = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}

/**
 * Son çare: trgool HTML. Sayfada reklam / varsayılan player aynı m3u8’i
 * her id için basabiliyor — yalnızca id içeren veya az adaylı sonuçları kabul et.
 */
async function tryM3u8FromTrgoolPages(id) {
  let domain
  try {
    domain = await getCachedWorkingTrgoolDomain()
  } catch {
    return null
  }
  if (!domain) return null

  const base = String(domain).replace(/\/$/, '')
  const paths = [
    `/channel.html?id=${encodeURIComponent(id)}`,
    `/matches?id=${encodeURIComponent(id)}`,
  ]
  const results = await Promise.allSettled(
    paths.map((path) =>
      fetch(`${base}${path}`, {
        method: 'GET',
        headers: htmlHeaders,
        signal: AbortSignal.timeout(TIMEOUT),
        redirect: 'follow',
      }).then((r) => (r.ok ? r.text() : ''))
    )
  )
  const all = []
  for (const pr of results) {
    if (pr.status === 'fulfilled' && pr.value) {
      all.push(...extractM3u8List(pr.value))
    }
  }
  const uniq = [...new Set(all)]
  if (!uniq.length) return null

  const idLower = String(id).toLowerCase()
  const idHit = uniq.filter((u) => u.toLowerCase().includes(idLower))
  const pool = idHit.length ? idHit : uniq.length <= 2 ? uniq : []
  if (!pool.length) return null

  const scored = pool.map((raw) => {
    const n = raw
    return {
      u: n,
      s:
        (n.includes('edge') ? 3 : 0) +
        (n.includes('live') || n.includes('hls') ? 2 : 0) +
        (n.startsWith('https:') ? 1 : 0) +
        (idHit.includes(n) ? 5 : 0),
    }
  })
  scored.sort((a, b) => b.s - a.s)
  for (const { u } of scored) {
    if (await verifyM3u8Reachable(u)) return u
  }
  return null
}

async function tryTeletvYayinlink(id) {
  const dataBase = await resolveWorkingTeletvBase()
  const r = await fetch(teletvLoadUrl(dataBase, `yayinlink.php?id=${encodeURIComponent(id)}`), {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'application/json,text/html,*/*',
    },
    signal: AbortSignal.timeout(8000),
  })
  if (!r.ok) return null
  const data = await r.json()
  const url = normalizeM3u8(data?.deismackanal)
  if (!url) return null
  if (await verifyM3u8Reachable(url)) return url
  // corestream vb. sunucu HEAD’i reddedebilir; ID’ye özel link yine de kullan
  return url
}

export default async function handler(req, res) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({ error: 'id required' })
  }

  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept: 'text/html,application/json,*/*',
  }

  // 1) teletv yayinlink — maç/kanal id’sine özel m3u8 (asıl doğru kaynak)
  try {
    const fromTeletv = await tryTeletvYayinlink(id)
    if (fromTeletv) {
      return res.json({ embedUrl: fromTeletv, type: 'hls', source: 'teletv', success: true })
    }
  } catch {}

  // 2) streamsport365 cinema
  try {
    const r = await fetch('https://streamsport365.com/cinema', {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        Accept: '*/*',
        Origin: 'https://streamsport365.com',
        Referer: 'https://streamsport365.com/',
      },
      body: JSON.stringify({
        AppId: '5000',
        AppVer: '1',
        VpcVer: '1.0.12',
        Language: 'en',
        Token: '',
        VideoId: id,
      }),
      signal: AbortSignal.timeout(8000),
    })
    if (r.ok) {
      const data = await r.json()
      if (data?.URL) {
        const url = normalizeM3u8(String(data.URL))
        if (url && (await verifyM3u8Reachable(url))) {
          return res.json({ embedUrl: url, type: 'hls', source: 'cinema', success: true })
        }
      }
    }
  } catch {}

  // 3) trgool HTML — yalnızca id’ye özgü / az adaylı m3u8 (ortak varsayılan stream yok)
  try {
    const fromTrgool = await tryM3u8FromTrgoolPages(id)
    if (fromTrgool) {
      return res.json({ embedUrl: fromTrgool, type: 'hls', source: 'trgool-html', success: true })
    }
  } catch {}

  return res.json({ embedUrl: null, success: false })
}
