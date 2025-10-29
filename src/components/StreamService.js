// Aktif domain listesi - MatchScraper ile aynı
const TRGOALS_DOMAINS = Array.from({length: 555}, (_, i) => `https://trgoals${1446 + i}.xyz`)

// Get stream URL - Özel URL mapping ile
export const getStreamUrl = async (channelId) => {
  // Arsenal maçı için özel URL
  // if (channelId === 'arsenal_atletico') {
  //   return 'https://m3u8player.org/player.html?url=https://hlssssssss.puanicinumut.workers.dev/https://corestream.ronaldovurdu.help//hls/tabii.m3u8'
  // }
  
  return `${TRGOALS_DOMAINS[0]}/channel.html?id=${channelId}`
}