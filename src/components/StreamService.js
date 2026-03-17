// Trgooltv domain listesi
const TRGOOL_DOMAINS = [
  'https://trgooltv61.top',
  'https://trgooltv60.top',
  'https://trgooltv59.top'
]

// Stream URL'i direkt kullan
export const getStreamUrl = async (match) => {
  // Match objesinde URL varsa direkt kullan
  if (match?.url) {
    return match.url
  }
  
  // Yoksa ID'den oluştur
  const id = match?.id || 'bein-sports-1'
  return `${TRGOOL_DOMAINS[0]}/matches?id=${id}`
}