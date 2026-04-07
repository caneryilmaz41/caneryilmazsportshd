import { getPrimaryTrgoolDomain } from '../../trgoolDomains.js'

let cachedDomain = null

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
  const iframeUrl = `${domain}/matches?id=${id}`

  // 1) Vercel API → m3u8
  try {
    const res = await fetch(`/api/resolvePlayer?id=${encodeURIComponent(id)}`)
    if (res.ok) {
      const data = await res.json()
      if (data?.embedUrl && data.success) {
        return { url: data.embedUrl, type: 'hls', iframeUrl }
      }
    }
  } catch {}

  // 2) Client-side teletv3 → m3u8
  try {
    const res = await fetch(`https://teletv3.top/load/yayinlink.php?id=${encodeURIComponent(id)}`)
    if (res.ok) {
      const data = await res.json()
      if (data?.deismackanal?.includes('m3u8')) {
        return { url: data.deismackanal.replace(/edge\d+/g, 'edge3'), type: 'hls', iframeUrl }
      }
    }
  } catch {}

  // 3) Fallback: iframe
  return { url: iframeUrl, type: 'iframe', iframeUrl }
}
