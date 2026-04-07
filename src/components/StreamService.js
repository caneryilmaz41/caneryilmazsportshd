import { getPrimaryTrgoolDomain } from '../../trgoolDomains.js'

let cachedDomain = null

const resolveActiveDomain = async () => {
  if (cachedDomain) return cachedDomain
  try {
    const res = await fetch('/api/trgoolDomain')
    if (res.ok) {
      const data = await res.json()
      if (data?.domain) {
        cachedDomain = data.domain
        return cachedDomain
      }
    }
  } catch {}
  cachedDomain = getPrimaryTrgoolDomain()
  return cachedDomain
}

export const getStreamUrl = async (match) => {
  const id = match?.id || 'bein-sports-1'
  const domain = await resolveActiveDomain()
  return `${domain}/matches?id=${id}`
}
