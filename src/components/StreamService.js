// Aktif domain listesi - MatchScraper ile aynı
const TRGOALS_DOMAINS = Array.from({length: 607}, (_, i) => `https://trgoals${1494 + i}.xyz`)

// Get stream URL - Çalışan domain bul ve kullan
export const getStreamUrl = async (channelId) => {
  // Başakşehir - Kocaelispor maçı için özel URL
  if (channelId === 'basaksehir_kocaeli') {
    return 'https://m3u8player.org/player.html?url=https://cold-moon-1018.firstayland1.workers.dev/https://corestream.ronaldovurdu.help//hls/bein-sports-1.m3u8'
  }
  
  // Çalışan domain bul
  for (const domain of TRGOALS_DOMAINS) {
    try {
      const testUrl = `${domain}/channel.html?id=${channelId}`
      const response = await fetch(testUrl, { 
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      })
      return testUrl
    } catch (error) {
      continue
    }
  }
  
  // Fallback - ilk domain'i kullan
  return `${TRGOALS_DOMAINS[0]}/channel.html?id=${channelId}`
}