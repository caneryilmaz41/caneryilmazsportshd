import * as cheerio from 'cheerio'
import { getCachedWorkingTrgoolDomain } from '../trgoolDomains.js'
import { trgoolChannelEmbedUrl } from '../src/utils/trgoolEmbedUrl.js'

export default async function handler(req, res) {
  try {
    const TRGOOL_DOMAIN = await getCachedWorkingTrgoolDomain()
    // Ana sayfayı çek
    const response = await fetch(TRGOOL_DOMAIN, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch')
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    const matches = []
    const channels = []

    // Tüm .single-match elementlerini bul
    $('.single-match').each((i, el) => {
      const onclick = $(el).attr('onclick') || ''
      const name = $(el).find('.match-name').text().trim()
      const time = $(el).find('.match-time').text().trim()
      const matchType = $(el).attr('data-matchtype') || ''

      const idMatch = onclick.match(/changePlayer\(['"]([^'"]+)['"]\)/)
      if (idMatch && name) {
        const item = {
          id: idMatch[1],
          name,
          url: trgoolChannelEmbedUrl(TRGOOL_DOMAIN, idMatch[1]) || `${TRGOOL_DOMAIN}/channel.html?id=${idMatch[1]}`
        }

        // Eğer time varsa maç, yoksa kanal
        if (time) {
          item.time = time
          item.type = matchType
          matches.push(item)
        } else {
          item.status = '7/24'
          channels.push(item)
        }
      }
    })

    console.log(`Scraped: ${matches.length} matches, ${channels.length} channels`)

    res.setHeader('Content-Type', 'application/json')
    return res.status(200).json({
      matches,
      channels,
      success: true
    })

  } catch (error) {
    console.error('Scrape error:', error)
    res.setHeader('Content-Type', 'application/json')
    return res.status(500).json({
      matches: [],
      channels: [],
      success: false,
      error: error.message
    })
  }
}
