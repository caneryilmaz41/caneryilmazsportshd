import { getPrimaryTrgoolDomain } from './trgoolDomains.js'

// Only the upstream hosts observed in the provider playlist may be proxied.
const defaults = ['css.d6e3eae5e065d5.help', 'd1dshreoaq9swe.cloudfront.net']
export function isAllowedStreamUrl(value) {
  try {
    const url = new URL(value)
    const configured = (globalThis.process?.env?.STREAM_PROXY_ALLOWED_HOSTS || '').split(',').map((s) => s.trim()).filter(Boolean)
    return url.protocol === 'https:' && !url.username && !url.password && (!url.port || url.port === '443') && [...defaults, ...configured].includes(url.hostname)
  } catch { return false }
}

export function streamProxyUrl(value) {
  if (!isAllowedStreamUrl(value)) throw new Error('Stream host is not allowed')
  return '/api/segment?u=' + encodeURIComponent(value)
}

export function rewriteStreamPlaylist(text, baseUrl) {
  const rewrite = (value) => {
    if (/^(data|skd):/i.test(value)) return value
    return streamProxyUrl(new URL(value, baseUrl).href)
  }
  return text.split(/\r?\n/).map((line) => {
    if (!line.trim()) return line
    if (!line.startsWith('#')) return rewrite(line.trim())
    return line.replace(/URI=("([^"]+)"|'([^']+)')/g, (_all, _quoted, double, single) => 'URI="' + rewrite(double || single) + '"')
  }).join('\n')
}

export function streamRequestHeaders() {
  const source = new URL(getPrimaryTrgoolDomain())
  if (!source.hostname.startsWith('www.')) source.hostname = 'www.' + source.hostname
  return {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    Origin: source.origin,
    Referer: source.origin + '/matches',
    Accept: '*/*',
  }
}
