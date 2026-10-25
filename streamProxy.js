import { getPrimaryTrgoolDomain } from './trgoolDomains.js'

// Playlist origin + segment CDNs observed from the provider. Suffixes cover CDN hostname rotation.
const defaultHosts = [
  'css.d6e3eae5e065d5.help',
  'd1dshreoaq9swe.cloudfront.net',
  'viagsak-skak-skma.global.ssl.fastly.net',
]
const defaultSuffixes = ['.global.ssl.fastly.net', '.cloudfront.net']

function allowedHostList() {
  const configured = (globalThis.process?.env?.STREAM_PROXY_ALLOWED_HOSTS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return [...defaultHosts, ...configured]
}

function allowedSuffixList() {
  const configured = (globalThis.process?.env?.STREAM_PROXY_ALLOWED_SUFFIXES || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return [...defaultSuffixes, ...configured]
}

function isAllowedHostname(hostname) {
  if (!hostname) return false
  if (allowedHostList().includes(hostname)) return true
  return allowedSuffixList().some((suffix) => {
    const s = suffix.startsWith('.') ? suffix : `.${suffix}`
    return hostname.length > s.length && hostname.endsWith(s)
  })
}

export function isAllowedStreamUrl(value) {
  try {
    const url = new URL(value)
    return (
      url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      (!url.port || url.port === '443') &&
      isAllowedHostname(url.hostname)
    )
  } catch {
    return false
  }
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
