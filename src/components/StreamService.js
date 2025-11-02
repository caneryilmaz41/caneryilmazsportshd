// Aktif domain listesi - MatchScraper ile aynı
const TRGOALS_DOMAINS = Array.from({length: 555}, (_, i) => `https://trgoals${1446 + i}.xyz`)

// Get stream URL - Özel URL mapping ile
export const getStreamUrl = async (channelId) => {
  // Başakşehir - Kocaelispor maçı için özel URL
  if (channelId === 'basaksehir_kocaeli') {
    return 'https://m3u8player.org/player.html?url=https://cold-moon-1018.firstayland1.workers.dev/https://corestream.ronaldovurdu.help//hls/bein-sports-1.m3u8'
  }
  
  return `${TRGOALS_DOMAINS[0]}/channel.html?id=${channelId}`
}