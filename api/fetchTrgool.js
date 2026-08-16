import { getCachedWorkingTrgoolDomain } from '../trgoolDomains.js'
import { trgoolChannelEmbedUrl } from '../src/utils/trgoolEmbedUrl.js'
import { resolveWorkingTeletvBase, teletvLoadUrl } from '../teletvHosts.js'

export default async function handler(req, res) {
  try {
    const TRGOOL_DOMAIN = await getCachedWorkingTrgoolDomain()
    const dataBase = await resolveWorkingTeletvBase()

    const [matchesRes, channelsRes] = await Promise.all([
      fetch(teletvLoadUrl(dataBase, 'matches.php'), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Referer: TRGOOL_DOMAIN,
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      }),
      fetch(teletvLoadUrl(dataBase, 'channels.php'), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Referer: TRGOOL_DOMAIN,
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      }),
    ])

    if (!matchesRes.ok || !channelsRes.ok) {
      throw new Error('Failed to fetch')
    }

    const matchesHtml = await matchesRes.text()
    const channelsHtml = await channelsRes.text()

    const matches = parseMatches(matchesHtml, TRGOOL_DOMAIN)
    const channels = parseChannels(channelsHtml, TRGOOL_DOMAIN)

    return res.json({ matches, channels, success: true, dataHost: dataBase })
  } catch (error) {
    console.error('Fetch error:', error)
    return res.status(500).json({
      matches: [],
      channels: [],
      success: false,
      error: error.message,
    })
  }
}

const MATCH_ANCHOR_RE =
  /<a\b[^>]*\bclass=["'][^"']*\bsingle-match\b[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi

function extractMatchId(tagOpen) {
  const m = tagOpen.match(/href=["']matches\?id=([^"']+)["']/i)
  return m ? m[1].trim() : null
}

function parseMatches(html, trgoolDomain) {
  const matches = []
  MATCH_ANCHOR_RE.lastIndex = 0
  let match
  while ((match = MATCH_ANCHOR_RE.exec(html)) !== null) {
    const tagOpen = match[0].slice(0, match[0].indexOf('>') + 1)
    const id = extractMatchId(tagOpen)
    const content = match[1]
    if (!id) continue

    const homeMatch = content.match(/<div class="home">([^<]+)<\/div>/)
    const awayMatch = content.match(/<div class="away">([^<]+)<\/div>/)
    const eventMatch = content.match(/<div class="event">\s*([^<|]+)\s*\|\s*([^<]+)<\/div>/)
    const timeOnly = content.match(/<div class=["']match-time["']>([^<]+)<\/div>/)
    const nameOnly = content.match(/<div class=["']match-name["']>([^<]+)<\/div>/)

    if (homeMatch && awayMatch) {
      const time = eventMatch ? eventMatch[1].trim() : 'Canlı'
      const league = eventMatch ? eventMatch[2].trim() : ''
      matches.push({
        id,
        name: `${homeMatch[1].trim()} - ${awayMatch[1].trim()}`,
        time: time || 'Canlı',
        league,
        url: trgoolChannelEmbedUrl(trgoolDomain, id) || `${trgoolDomain}/channel.html?id=${id}`,
      })
      continue
    }

    // Eski trgool ana sayfa formatı
    if (nameOnly) {
      matches.push({
        id,
        name: nameOnly[1].trim(),
        time: timeOnly ? timeOnly[1].trim() : 'Canlı',
        url: trgoolChannelEmbedUrl(trgoolDomain, id) || `${trgoolDomain}/channel.html?id=${id}`,
      })
    }
  }

  return matches
}

function parseChannels(html, trgoolDomain) {
  const channels = []
  MATCH_ANCHOR_RE.lastIndex = 0
  let match
  while ((match = MATCH_ANCHOR_RE.exec(html)) !== null) {
    const tagOpen = match[0].slice(0, match[0].indexOf('>') + 1)
    const id = extractMatchId(tagOpen)
    const content = match[1]
    if (!id) continue

    const homeMatch = content.match(/<div class="home">([^<]+)<\/div>/)
    const nameOnly = content.match(/<div class=["']match-name["']>([^<]+)<\/div>/)
    const name = homeMatch?.[1]?.trim() || nameOnly?.[1]?.trim()
    if (!name) continue

    channels.push({
      id,
      name,
      status: '7/24',
      url: trgoolChannelEmbedUrl(trgoolDomain, id) || `${trgoolDomain}/channel.html?id=${id}`,
    })
  }

  return channels
}
