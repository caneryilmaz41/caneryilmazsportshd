import { getPrimaryTrgoolDomain } from '../../trgoolDomains.js'
import { trgoolChannelEmbedUrl } from '../utils/trgoolEmbedUrl.js'
import {
  resolveWorkingTeletvBase,
  teletvLoadUrl,
} from '../../teletvHosts.js'

const FALLBACK_API_ORIGIN = 'https://caneryilmazsportshd.vercel.app'

const getApiBaseCandidates = () => {
  const envBase = (import.meta.env.VITE_PUBLIC_API_ORIGIN || '').trim().replace(/\/$/, '')
  const out = ['']
  if (envBase) out.push(envBase)
  if (!out.includes(FALLBACK_API_ORIGIN)) out.push(FALLBACK_API_ORIGIN)
  return out
}

const resolveActiveDomain = async () => {
  for (const base of getApiBaseCandidates()) {
    try {
      const res = await fetch(`${base}/api/trgoolDomain`)
      if (res.ok) {
        const data = await res.json()
        if (data?.domain) return data.domain
      }
    } catch {
      /* local /api veya fallback origin cevap vermezse sıradaki aday */
    }
  }
  return getPrimaryTrgoolDomain()
}

let activeDomain = getPrimaryTrgoolDomain()

const formatTwoDigits = (value) => String(value).padStart(2, '0')

const normalizeMatchTime = (rawTime, specialTag) => {
  const value = (rawTime || '').trim()
  if (!value) return value

  // Kaynakta "GÜNÜN MAÇI" satırlarında 10:00, 10:01 gibi placeholder saatler dönebiliyor.
  if (specialTag && /^10:0\d$/.test(value)) {
    return 'Canlı'
  }

  const withMinutes = value.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i)
  if (withMinutes) {
    let hour = Number(withMinutes[1])
    const minute = withMinutes[2]
    const meridiem = withMinutes[3]?.toUpperCase()

    if (meridiem === 'AM') {
      hour = hour === 12 ? 0 : hour
      return `${formatTwoDigits(hour)}:${minute}`
    }
    if (meridiem === 'PM') {
      hour = hour === 12 ? 12 : hour + 12
      return `${formatTwoDigits(hour)}:${minute}`
    }

    return `${formatTwoDigits(hour)}:${minute}`
  }

  const onlyHour = value.match(/^(\d{1,2})$/)
  if (onlyHour) {
    const hour = Number(onlyHour[1])
    return `${formatTwoDigits(hour)}:00`
  }

  return value
}

const extractMatchId = (tagOpen) => {
  const m = tagOpen.match(/href=["']matches\?id=([^"']+)["']/i)
  return m ? m[1].trim() : null
}

/** class / href sırası değişse de yakala */
const MATCH_ANCHOR_RE =
  /<a\b[^>]*\bclass=["'][^"']*\bsingle-match\b[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi

export const scrapeMatches = async () => {
  try {
    console.log('Fetching matches and channels...')
    activeDomain = await resolveActiveDomain()
    const dataBase = await resolveWorkingTeletvBase()

    const [matchesRes, channelsRes] = await Promise.all([
      fetch(teletvLoadUrl(dataBase, 'matches.php')),
      fetch(teletvLoadUrl(dataBase, 'channels.php')),
    ])

    if (matchesRes.ok && channelsRes.ok) {
      const matchesHtml = await matchesRes.text()
      const channelsHtml = await channelsRes.text()

      console.log('Data host:', dataBase)
      console.log('Matches HTML length:', matchesHtml.length)
      console.log('Channels HTML length:', channelsHtml.length)

      const matches = parseMatches(matchesHtml)
      const channels = parseChannels(channelsHtml)

      console.log(`Final: ${matches.length} matches, ${channels.length} channels`)

      if (matches.length > 0 || channels.length > 0) {
        return { matches, channels }
      }
    }
  } catch (error) {
    console.error('Scrape error:', error)
  }

  // Sunucu tarafı parse (Vercel) — tarayıcıdan teletv engelliyse
  for (const base of getApiBaseCandidates()) {
    try {
      const res = await fetch(`${base}/api/fetchTrgool`)
      if (!res.ok) continue
      const data = await res.json()
      if (data?.success && (data.matches?.length > 0 || data.channels?.length > 0)) {
        return { matches: data.matches || [], channels: data.channels || [] }
      }
    } catch {
      /* sıradaki */
    }
  }

  console.log('Using fallback data')
  return getFallbackData()
}

const parseMatches = (html) => {
  const matches = []
  let aMatch
  MATCH_ANCHOR_RE.lastIndex = 0
  while ((aMatch = MATCH_ANCHOR_RE.exec(html)) !== null) {
    const tagOpen = aMatch[0].slice(0, aMatch[0].indexOf('>') + 1)
    const id = extractMatchId(tagOpen)
    const content = aMatch[1]
    if (!id) continue

    const homeLogoMatch = content.match(/<img[^>]*src="([^"]+)"[^>]*alt="Home"/)
    const awayLogoMatch = content.match(/<img[^>]*src="([^"]+)"[^>]*alt="Away"/)
    const homeMatch = content.match(/<div class="home">([^<]+)<\/div>/)
    const awayMatch = content.match(/<div class="away">([^<]+)<\/div>/)
    const eventMatch = content.match(/<div class="event">\s*([^<|]+)\s*\|\s*([^<]+)<\/div>/)
    const categoryMatch = content.match(/<div class="date">\s*([^<\s]+)/)
    const specialMatch = content.match(/<span class="colorling">([^<]+)<\/span>/)
    const typeMatch = tagOpen.match(/data-matchtype="([^"]+)"/)

    if (homeMatch && awayMatch && eventMatch) {
      const special = specialMatch ? specialMatch[1].trim() : null
      matches.push({
        id,
        name: `${homeMatch[1].trim()} - ${awayMatch[1].trim()}`,
        homeLogo: homeLogoMatch ? homeLogoMatch[1] : null,
        awayLogo: awayLogoMatch ? awayLogoMatch[1] : null,
        time: normalizeMatchTime(eventMatch[1], special),
        league: eventMatch[2].trim(),
        category: categoryMatch ? categoryMatch[1].trim() : '',
        special,
        type: typeMatch ? typeMatch[1] : '',
        url: trgoolChannelEmbedUrl(activeDomain, id) || `${activeDomain}/channel.html?id=${id}`,
      })
    }
  }

  console.log(`Parsed ${matches.length} matches`)
  return matches
}

const parseChannels = (html) => {
  const channels = []
  MATCH_ANCHOR_RE.lastIndex = 0
  let aMatch
  while ((aMatch = MATCH_ANCHOR_RE.exec(html)) !== null) {
    const tagOpen = aMatch[0].slice(0, aMatch[0].indexOf('>') + 1)
    const id = extractMatchId(tagOpen)
    const content = aMatch[1]
    if (!id) continue

    const homeMatch = content.match(/<div class="home">([^<]+)<\/div>/)
    if (homeMatch) {
      channels.push({
        id,
        name: homeMatch[1].trim(),
        status: '7/24',
        url: trgoolChannelEmbedUrl(activeDomain, id) || `${activeDomain}/channel.html?id=${id}`,
      })
    }
  }

  console.log(`Parsed ${channels.length} channels`)
  return channels
}

export const getFallbackData = () => {
  const base = getPrimaryTrgoolDomain()
  const w = (id) => trgoolChannelEmbedUrl(base, id) || `${base}/channel.html?id=${id}`
  return {
    matches: [],
    channels: [
      { id: 'bein-sports-1', name: 'BEIN SPORTS 1', status: '7/24', url: w('bein-sports-1') },
      { id: 'bein-sports-2', name: 'BEIN SPORTS 2', status: '7/24', url: w('bein-sports-2') },
      { id: 'bein-sports-3', name: 'BEIN SPORTS 3', status: '7/24', url: w('bein-sports-3') },
      { id: 's-sport', name: 'S SPORT', status: '7/24', url: w('s-sport') },
      { id: 'trt-spor', name: 'TRT SPOR', status: '7/24', url: w('trt-spor') },
    ],
  }
}
