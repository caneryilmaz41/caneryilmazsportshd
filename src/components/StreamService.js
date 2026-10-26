import {
  getPrimaryTeletvBase,
  resolveWorkingTeletvBase,
  teletvLoadUrl,
} from '../../teletvHosts.js'

const OFFICIAL_CHANNEL_STREAMS = {
  'trt-spor': 'https://tv-trtspor1.medya.trt.com.tr/master.m3u8',
  'trt-spor-yildiz': 'https://tv-trtspor2.medya.trt.com.tr/master.m3u8',
  'trt-1': 'https://tv-trt1.medya.trt.com.tr/master.m3u8',
}

const FALLBACK_API_ORIGIN = 'https://caneryilmazsportshd.vercel.app'
const isHlsUrl = (url) => typeof url === 'string' && url.toLowerCase().includes('m3u8')

function getApiBaseCandidates() {
  const envBase = (import.meta.env.VITE_PUBLIC_API_ORIGIN || '').trim().replace(/\/$/, '')
  const out = ['']
  if (envBase) out.push(envBase)
  if (!out.includes(FALLBACK_API_ORIGIN)) out.push(FALLBACK_API_ORIGIN)
  return out
}

async function resolveFromApi(id, exclude) {
  for (const base of getApiBaseCandidates()) {
    try {
      const res = await fetch(`${base}/api/resolvePlayer?${new URLSearchParams({ id, exclude: JSON.stringify(exclude) })}`, { signal: AbortSignal.timeout(60000) })
      if (!res.ok) continue
      const data = await res.json()
      if (data?.success && data?.embedUrl && isHlsUrl(data.embedUrl) && !exclude.includes(toHttps(data.embedUrl))) return data
    } catch { /* Try the next API or provider. */ }
  }
  return null
}

const toHttps = (u) => (typeof u === 'string' ? u.trim().replace(/^http:\/\//i, 'https://') : u)

/**
 * @param {object} match
 * @param {{ exclude?: string[] }} [opts] exclude: hata veren adresler (yedek kaynak ararken atlanır)
 */
export const getStreamUrl = async (match, { exclude = [] } = {}) => {
  const id = match?.id
  const skip = new Set(exclude.filter(Boolean).map((value) => {
    try {
      const url = new URL(value, 'https://local.invalid')
      return url.pathname === '/api/segment' ? url.searchParams.get('u') || value : value
    } catch { return value }
  }))
  if (!id) {
    return { url: null, type: 'hls', iframeUrl: null }
  }

  const returnHls = (rawUrl, proxy = false) => {
    const playlist = toHttps(String(rawUrl))
    if (skip.has(playlist)) return null
    return { url: proxy ? '/api/segment?u=' + encodeURIComponent(playlist) : playlist, type: 'hls', iframeUrl: null }
  }

  if (match?.hlsUrl && isHlsUrl(String(match.hlsUrl))) {
    const ok = returnHls(match.hlsUrl)
    if (ok) return ok
  }

  const official = OFFICIAL_CHANNEL_STREAMS[id]
  if (official) {
    const stream = returnHls(official)
    if (stream) return stream
  }

  // 1) Server resolve first — returns HMAC-signed proxyUrl (survives CDN apex rotation)
  const apiData = await resolveFromApi(id, [...skip])
  if (apiData?.proxyUrl && typeof apiData.proxyUrl === 'string' && apiData.proxyUrl.startsWith('/api/segment?')) {
    return { url: apiData.proxyUrl, type: 'hls', iframeUrl: null }
  }
  if (apiData?.embedUrl && isHlsUrl(apiData.embedUrl)) {
    const ok = returnHls(apiData.embedUrl, true)
    if (ok) return ok
  }

  // 2) Client-side teletv fallback (unsigned proxy; pattern allowlist covers css.*.help)
  try {
    let dataBase = getPrimaryTeletvBase()
    try {
      dataBase = await resolveWorkingTeletvBase()
    } catch { /* Try the next API or provider. */ }
    const res = await fetch(teletvLoadUrl(dataBase, `yayinlink.php?id=${encodeURIComponent(id)}`), { signal: AbortSignal.timeout(8000), cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      const link = typeof data?.deismackanal === 'string' ? data.deismackanal.trim() : null
      if (isHlsUrl(link)) {
        const ok = returnHls(link, true)
        if (ok) return ok
      }
    }
  } catch { /* The provider may be unavailable. */ }

  return { url: null, type: 'hls', iframeUrl: null }
}
