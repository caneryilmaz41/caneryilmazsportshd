import { createHmac, timingSafeEqual } from 'node:crypto'
import { getPrimaryTrgoolDomain } from './trgoolDomains.js'

/**
 * Provider CDN hostnames rotate often (css.* → google.* → Fastly, …).
 * 1) Suffix allowlist covers known CDN families for the first playlist hop.
 * 2) Playlist rewrite HMAC-signs every segment URL so a brand-new CDN host
 *    still proxies without a code change (open-proxy safe: only signed URLs).
 */
const defaultHosts = [
  'css.d6e3eae5e065d5.help',
  'google.d6e3eae5e065d5.help',
  'd1dshreoaq9swe.cloudfront.net',
  'viagsak-skak-skma.global.ssl.fastly.net',
]
const defaultSuffixes = [
  '.d6e3eae5e065d5.help',
  '.global.ssl.fastly.net',
  '.cloudfront.net',
]

function splitEnvList(name) {
  return (globalThis.process?.env?.[name] || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function proxySecret() {
  return globalThis.process?.env?.STREAM_PROXY_SECRET || 'caneryilmaz-stream-proxy-v1'
}

function allowedHostList() {
  return [...defaultHosts, ...splitEnvList('STREAM_PROXY_ALLOWED_HOSTS')]
}

function allowedSuffixList() {
  return [...defaultSuffixes, ...splitEnvList('STREAM_PROXY_ALLOWED_SUFFIXES')]
}

function isAllowedHostname(hostname) {
  if (!hostname) return false
  const host = hostname.toLowerCase()
  if (allowedHostList().some((h) => h.toLowerCase() === host)) return true
  return allowedSuffixList().some((suffix) => {
    const s = (suffix.startsWith('.') ? suffix : `.${suffix}`).toLowerCase()
    return host.length > s.length && host.endsWith(s)
  })
}

export function isSafeHttpsUrl(value) {
  try {
    const url = new URL(value)
    return (
      url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      (!url.port || url.port === '443')
    )
  } catch {
    return false
  }
}

export function isAllowedStreamUrl(value) {
  if (!isSafeHttpsUrl(value)) return false
  try {
    return isAllowedHostname(new URL(value).hostname)
  } catch {
    return false
  }
}

export function signStreamUrl(value) {
  return createHmac('sha256', proxySecret()).update(String(value)).digest('base64url')
}

function signaturesMatch(expected, provided) {
  if (typeof provided !== 'string' || !provided) return false
  try {
    const a = Buffer.from(expected)
    const b = Buffer.from(provided)
    return a.length === b.length && timingSafeEqual(a, b)
  } catch {
    return false
  }
}

/** First playlist hop (allowlist) or any later segment hop (valid HMAC). */
export function isAuthorizedStreamProxyRequest(u, s) {
  if (typeof u !== 'string' || !isSafeHttpsUrl(u)) return false
  if (isAllowedStreamUrl(u)) return true
  return signaturesMatch(signStreamUrl(u), s)
}

export function streamProxyUrl(value, { sign = false } = {}) {
  if (!isSafeHttpsUrl(value)) throw new Error('Stream URL must be https without credentials')
  if (!sign && !isAllowedStreamUrl(value)) throw new Error('Stream host is not allowed')
  const href = new URL(value).href
  const params = new URLSearchParams({ u: href })
  if (sign || !isAllowedStreamUrl(href)) params.set('s', signStreamUrl(href))
  return `/api/segment?${params}`
}

export function rewriteStreamPlaylist(text, baseUrl) {
  if (!isSafeHttpsUrl(baseUrl)) throw new Error('Playlist base must be https')
  const rewrite = (value) => {
    if (/^(data|skd):/i.test(value)) return value
    const absolute = new URL(value, baseUrl).href
    // Always sign rewritten URLs so CDN hostname rotation never breaks playback.
    return streamProxyUrl(absolute, { sign: true })
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
