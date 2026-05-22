const FALLBACK_API_ORIGIN = 'https://caneryilmazsportshd.vercel.app'
const isHlsUrl = (url) => typeof url === 'string' && url.toLowerCase().includes('m3u8')

function getApiBaseCandidates() {
  const envBase = (import.meta.env.VITE_PUBLIC_API_ORIGIN || '').trim().replace(/\/$/, '')
  const out = ['']
  if (envBase) out.push(envBase)
  if (!out.includes(FALLBACK_API_ORIGIN)) out.push(FALLBACK_API_ORIGIN)
  return out
}

async function resolveFromApi(id) {
  for (const base of getApiBaseCandidates()) {
    try {
      const res = await fetch(`${base}/api/resolvePlayer?id=${encodeURIComponent(id)}`)
      if (!res.ok) continue
      const data = await res.json()
      if (data?.embedUrl && data.success && isHlsUrl(data.embedUrl)) return data
    } catch {}
  }
  return null
}

const toHttps = (u) => (typeof u === 'string' ? u.trim().replace(/^http:\/\//i, 'https://') : u)

const M3U8_PROBE_MS = 8000

/** Yerel /api yokken teletv3 ölü m3u8 döndüğünde HLS+hata+TrGool düşüşünü engeller */
async function verifyM3u8ReachableBrowser(url) {
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

export const getStreamUrl = async (match) => {
  const id = match?.id || 'bein-sports-1'

  const returnHls = async (rawUrl, { probe = true } = {}) => {
    const playlist = toHttps(String(rawUrl)).replace(/edge\d+/g, 'edge3')
    if (!probe || (await verifyM3u8ReachableBrowser(playlist))) {
      return { url: playlist, type: 'hls', iframeUrl: null }
    }
    return null
  }

  if (match?.hlsUrl && isHlsUrl(String(match.hlsUrl))) {
    const ok = await returnHls(match.hlsUrl, { probe: false })
    if (ok) return ok
  }

  // 1) API (sunucuda doğrulanmış m3u8) — tarayıcıda tekrar probe etme (CORS)
  const apiData = await resolveFromApi(id)
  if (apiData?.embedUrl && isHlsUrl(apiData.embedUrl)) {
    const ok = await returnHls(apiData.embedUrl, { probe: false })
    if (ok) return ok
  }

  // 2) Client-side teletv3 (ölü linkleri elemek için probe)
  try {
    const res = await fetch(`https://teletv3.top/load/yayinlink.php?id=${encodeURIComponent(id)}`)
    if (res.ok) {
      const data = await res.json()
      const link = data?.deismackanal
      if (isHlsUrl(link)) {
        const ok = await returnHls(link, { probe: true })
        if (ok) return ok
      }
    }
  } catch {}

  return { url: null, type: 'hls', iframeUrl: null }
}
