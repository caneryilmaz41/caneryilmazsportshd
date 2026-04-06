import { getPrimaryTrgoolDomain } from '../../trgoolDomains.js'

// Stream URL'i direkt kullan
export const getStreamUrl = async (match) => {
  // Match objesinde URL varsa direkt kullan
  if (match?.url) {
    return match.url
  }

  const id = match?.id || 'bein-sports-1'
  return `${getPrimaryTrgoolDomain()}/matches?id=${id}`
}