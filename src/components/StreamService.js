export const getStreamUrl = async (match) => {
  const id = match?.id || 'bein-sports-1'

  // 1) Vercel API üzerinden m3u8 çöz
  try {
    const res = await fetch(`/api/resolvePlayer?id=${encodeURIComponent(id)}`)
    if (res.ok) {
      const data = await res.json()
      if (data?.embedUrl && data.success) return data.embedUrl
    }
  } catch {}

  // 2) Client-side: teletv3'ten direkt dene
  try {
    const res = await fetch(`https://teletv3.top/load/yayinlink.php?id=${encodeURIComponent(id)}`)
    if (res.ok) {
      const data = await res.json()
      if (data?.deismackanal?.includes('m3u8')) {
        return data.deismackanal.replace(/edge\d+/g, 'edge3')
      }
    }
  } catch {}

  return null
}
