import { getCachedWorkingTrgoolDomain } from '../trgoolDomains.js'

const TIMEOUT = 10_000
const M3U8_PROBE_MS = 8000

/**
 * teletv3 bazen ölü / 404 playlist döner; HLS patlayınca player.html tam TrGool sayfasına düşer.
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

function extractM3u8List(html) {
  if (!html || typeof html !== 'string') return []
  const re = /https?:\/\/[^\s"'<>\\]+\.m3u8[^\s"'<>\\]*/gi
  const m = html.match(re)
  if (!m) return []
  return [...new Set(m.map((u) => u.replace(/&amp;/g, '&').replace(/\\u0026/g, '&').trim()))]
}

const htmlHeaders = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}

/**
 * trgool channel.html / matches HTML içinde (script'lerde) gömülü m3u8.
 * Böylece iframe yerine doğrudan HLS açılır; tam site + reklam yüklenmez.
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
  const scored = uniq.map((raw) => {
    const n = raw.replace(/edge\d+/g, 'edge3')
    return {
      u: n,
      s:
        (n.includes('edge') ? 3 : 0) +
        (n.includes('live') || n.includes('hls') ? 2 : 0) +
        (n.startsWith('https:') ? 1 : 0),
    }
  })
  scored.sort((a, b) => b.s - a.s)
  for (const { u } of scored) {
    if (await verifyM3u8Reachable(u)) return u
  }
  return null
}

export default async function handler(req, res) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({ error: 'id required' })
  }

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept: 'text/html,application/json,*/*',
  }

  let teletvNonM3u8 = null
  let cinemaNonM3u8 = null

  // 1. teletv3 (playlist ölüyse atla → cinema / trgool-html)
  try {
    const r = await fetch(
      `https://teletv3.top/load/yayinlink.php?id=${encodeURIComponent(id)}`,
      { headers, signal: AbortSignal.timeout(8000) }
    )
    if (r.ok) {
      const data = await r.json()
      const raw = data?.deismackanal
      if (typeof raw === 'string' && raw.includes('m3u8')) {
        const url = raw.replace(/edge\d+/g, 'edge3')
        if (await verifyM3u8Reachable(url)) {
          return res.json({ embedUrl: url, type: 'hls', source: 'teletv3', success: true })
        }
      } else if (typeof raw === 'string' && /^https?:\/\//i.test(raw.trim())) {
        teletvNonM3u8 = raw.trim()
      }
    }
  } catch {}

  // 2. streamsport365
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
        const u = String(data.URL)
        if (u.includes('m3u8')) {
          const url = u.replace(/edge\d+/g, 'edge3')
          if (await verifyM3u8Reachable(url)) {
            return res.json({ embedUrl: url, type: 'hls', source: 'cinema', success: true })
          }
        } else if (/^https?:\/\//i.test(u)) {
          cinemaNonM3u8 = u
        }
      }
    }
  } catch {}

  // 3. trgool sayfa HTML'inden m3u8 — adaylar içinden erişilebilir olanı seç
  try {
    const fromTrgool = await tryM3u8FromTrgoolPages(id)
    if (fromTrgool) {
      return res.json({ embedUrl: fromTrgool, type: 'hls', source: 'trgool-html', success: true })
    }
  } catch {}

  // 4. en son: harici oynatıcı URL (istemci kabuğa alır)
  if (teletvNonM3u8) {
    return res.json({
      embedUrl: teletvNonM3u8,
      type: 'iframe',
      success: true,
      source: 'teletv3-embed',
    })
  }
  if (cinemaNonM3u8) {
    return res.json({ embedUrl: cinemaNonM3u8, type: 'iframe', success: true, source: 'cinema-embed' })
  }

  return res.json({ embedUrl: null, success: false })
}
