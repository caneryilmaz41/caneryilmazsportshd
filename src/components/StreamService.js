// Aktif domain listesi - MatchScraper ile aynı
const TRGOALS_DOMAINS = Array.from({length: 555}, (_, i) => `https://trgoals${1446 + i}.xyz`)

// Get stream URL - M3U8 player ile
export const getStreamUrl = async (channelId) => {
  // Başakşehir - Kocaelispor maçı için özel URL
  if (channelId === 'basaksehir_kocaeli') {
    return 'https://m3u8player.org/player.html?url=https://cold-moon-1018.firstayland1.workers.dev/https://corestream.ronaldovurdu.help//hls/bein-sports-1.m3u8'
  }
  
  // TRGoals'ten m3u8 linkini çıkar ve m3u8player ile oynat
  for (const domain of TRGOALS_DOMAINS) {
    try {
      const response = await fetch(`/api/getM3u8Link?domain=${encodeURIComponent(domain)}&channelId=${channelId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.playerUrl) {
          return data.playerUrl
        }
      }
    } catch (error) {
      console.log(`M3U8 extraction failed for ${domain}:`, error)
      continue
    }
  }
  
  // Fallback: direkt TRGoals iframe
  return `${TRGOALS_DOMAINS[0]}/channel.html?id=${channelId}`
}