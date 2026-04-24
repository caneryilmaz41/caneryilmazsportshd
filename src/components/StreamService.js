import { getPrimaryTrgoolDomain } from '../../trgoolDomains.js'
import { trgoolChannelEmbedUrl, isStreamPageOnTrgoolDomain } from '../utils/trgoolEmbedUrl.js'

let cachedDomain = null
const isHlsUrl = (url) => typeof url === 'string' && url.toLowerCase().includes('m3u8')
const isHttpUrl = (u) => typeof u === 'string' && /^https?:\/\//i.test(u.trim())

/** Harici oynatıcı sayfaları iframe'de açma; trgool kabuğunda aynı id ile oynat */
function resolveIframePage(candidateHttpUrl, domain, id) {
  const shell = trgoolChannelEmbedUrl(domain, id) || `${String(domain).replace(/\/$/, '')}/channel.html?id=${encodeURIComponent(String(id))}`
  if (!candidateHttpUrl || !isHttpUrl(candidateHttpUrl) || isHlsUrl(candidateHttpUrl)) {
    return { pageUrl: shell, usedShell: true }
  }
  if (isStreamPageOnTrgoolDomain(candidateHttpUrl, domain)) {
    return { pageUrl: String(candidateHttpUrl).trim(), usedShell: false }
  }
  return { pageUrl: shell, usedShell: true }
}

const resolveActiveDomain = async () => {
  if (cachedDomain) return cachedDomain
  try {
    const res = await fetch('/api/trgoolDomain')
    if (res.ok) {
      const data = await res.json()
      if (data?.domain) { cachedDomain = data.domain; return cachedDomain }
    }
  } catch {}
  cachedDomain = getPrimaryTrgoolDomain()
  return cachedDomain
}

export const getStreamUrl = async (match) => {
  const id = match?.id || 'bein-sports-1'
  const domain = await resolveActiveDomain()
  const embedPageUrl = trgoolChannelEmbedUrl(domain, id) || `${domain}/channel.html?id=${id}`

  if (match?.hlsUrl && isHlsUrl(String(match.hlsUrl))) {
    return {
      url: String(match.hlsUrl).trim().replace(/edge\d+/g, 'edge3'),
      type: 'hls',
      iframeUrl: embedPageUrl,
    }
  }

  // 1) Vercel API → m3u8 veya (HTTP ise) trgool ile aynı host değilse kabuk URL
  try {
    const res = await fetch(`/api/resolvePlayer?id=${encodeURIComponent(id)}`)
    if (res.ok) {
      const data = await res.json()
      if (data?.embedUrl && data.success) {
        if (isHlsUrl(data.embedUrl)) {
          return { url: data.embedUrl, type: 'hls', iframeUrl: embedPageUrl }
        }
        if (isHttpUrl(data.embedUrl)) {
          const { pageUrl } = resolveIframePage(data.embedUrl, domain, id)
          return { url: pageUrl, type: 'iframe', iframeUrl: pageUrl }
        }
      }
    }
  } catch {}

  // 2) Client-side teletv3 → m3u8 veya harici oynatıcı sayfası
  try {
    const res = await fetch(`https://teletv3.top/load/yayinlink.php?id=${encodeURIComponent(id)}`)
    if (res.ok) {
      const data = await res.json()
      const link = data?.deismackanal
      if (isHlsUrl(link)) {
        return { url: String(link).replace(/edge\d+/g, 'edge3'), type: 'hls', iframeUrl: embedPageUrl }
      }
      if (isHttpUrl(link) && !isHlsUrl(link)) {
        const { pageUrl } = resolveIframePage(String(link).trim(), domain, id)
        return { url: pageUrl, type: 'iframe', iframeUrl: pageUrl }
      }
    }
  } catch {}

  // 3) Fallback: yalnız oynatıcı sayfası (matches değil)
  return { url: embedPageUrl, type: 'iframe', iframeUrl: embedPageUrl }
}
