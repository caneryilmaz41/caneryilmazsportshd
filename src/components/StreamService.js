import { getPrimaryTrgoolDomain } from '../../trgoolDomains.js'
import { trgoolChannelEmbedUrl } from '../utils/trgoolEmbedUrl.js'

let cachedDomain = null
const FALLBACK_API_ORIGIN = 'https://caneryilmazsportshd.vercel.app'
const isHlsUrl = (url) => typeof url === 'string' && url.toLowerCase().includes('m3u8')
const isHttpUrl = (u) => typeof u === 'string' && /^https?:\/\//i.test(u.trim())

function getApiBaseCandidates() {
  const envBase = (import.meta.env.VITE_PUBLIC_API_ORIGIN || '').trim().replace(/\/$/, '')
  const out = ['']
  if (envBase) out.push(envBase)
  if (!out.includes(FALLBACK_API_ORIGIN)) out.push(FALLBACK_API_ORIGIN)
  return out
}

const resolveActiveDomain = async () => {
  if (cachedDomain) return cachedDomain
  for (const base of getApiBaseCandidates()) {
    try {
      const res = await fetch(`${base}/api/trgoolDomain`)
      if (res.ok) {
        const data = await res.json()
        if (data?.domain) { cachedDomain = data.domain; return cachedDomain }
      }
    } catch {}
  }
  cachedDomain = getPrimaryTrgoolDomain()
  return cachedDomain
}

async function resolveFromApi(id) {
  for (const base of getApiBaseCandidates()) {
    try {
      const res = await fetch(`${base}/api/resolvePlayer?id=${encodeURIComponent(id)}`)
      if (!res.ok) continue
      const data = await res.json()
      if (data?.embedUrl && data.success) return data
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
  const domain = await resolveActiveDomain()
  const embedPageUrl =
    trgoolChannelEmbedUrl(domain, id) ||
    `${String(domain).replace(/\/$/, '')}/channel.html?id=${encodeURIComponent(String(id))}`

  if (match?.hlsUrl && isHlsUrl(String(match.hlsUrl))) {
    return {
      url: toHttps(String(match.hlsUrl)).replace(/edge\d+/g, 'edge3'),
      type: 'hls',
      iframeUrl: embedPageUrl,
    }
  }

  // 1) API (local proxy or fallback origin) → m3u8 veya iframe
  const apiData = await resolveFromApi(id)
  if (apiData?.embedUrl) {
    if (isHlsUrl(apiData.embedUrl)) {
      return { url: toHttps(apiData.embedUrl), type: 'hls', iframeUrl: embedPageUrl }
    }
    if (isHttpUrl(apiData.embedUrl)) {
      // HTTP cevap /matches vb. olabilir; iframe'de yalnızca channel.html (embedPageUrl)
      return { url: embedPageUrl, type: 'iframe', iframeUrl: embedPageUrl }
    }
  }

  // 2) Client-side teletv3 → m3u8 veya harici oynatıcı sayfası
  try {
    const res = await fetch(`https://teletv3.top/load/yayinlink.php?id=${encodeURIComponent(id)}`)
    if (res.ok) {
      const data = await res.json()
      const link = data?.deismackanal
      if (isHlsUrl(link)) {
        const playlist = toHttps(String(link)).replace(/edge\d+/g, 'edge3')
        if (await verifyM3u8ReachableBrowser(playlist)) {
          return { url: playlist, type: 'hls', iframeUrl: embedPageUrl }
        }
        return { url: embedPageUrl, type: 'iframe', iframeUrl: embedPageUrl }
      }
      if (isHttpUrl(link) && !isHlsUrl(link)) {
        return { url: embedPageUrl, type: 'iframe', iframeUrl: embedPageUrl }
      }
    }
  } catch {}

  // 3) Fallback: yalnız oynatıcı sayfası (matches değil)
  return { url: embedPageUrl, type: 'iframe', iframeUrl: embedPageUrl }
}
