import { createHmac, timingSafeEqual } from 'node:crypto'
import { getPrimaryTrgoolDomain } from './trgoolDomains.js'

/**
 * Provider CDN hostnames rotate constantly:
 *   css.d6e3eae5e065d5.help → css.d6e3cae2e245k5.help
 *   google.* / Fastly / CloudFront …
 *
 * Strategy (durable):
 * 1) Pattern + CDN-family suffix allowlist for the first playlist hop
 * 2) HMAC-sign every rewritten segment so unknown hosts still proxy safely
 */
const defaultHosts = [
  'css.d6e3eae5e065d5.help',
  'google.d6e3eae5e065d5.help',
  'css.d6e3cae2e245k5.help',
  'd1dshreoaq9swe.cloudfront.net',
  'd31beekkopsyst.cloudfront.net',
  'viagsak-skak-skma.global.ssl.fastly.net',
]
const defaultSuffixes = [
  '.global.ssl.fastly.net',
  '.cloudfront.net',
]

/** css.<token>.help / google.<token>.help — token (apex) rotates without notice */
const PROVIDER_HELP_HOST =
  /^(css|google|cdn|edge|live|stream|www)\.[a-z0-9]{6,}\.help$/i

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

export function isAllowedHostname(hostname) {
  if (!hostname) return false
  const host = hostname.toLowerCase()
  if (allowedHostList().some((h) => h.toLowerCase() === host)) return true
  if (PROVIDER_HELP_HOST.test(host)) return true
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

/** First playlist hop (allowlist/pattern) or any later hop (valid HMAC). */
export function isAuthorizedStreamProxyRequest(u, s) {
  if (typeof u !== 'string' || !isSafeHttpsUrl(u)) return false
  if (isAllowedStreamUrl(u)) return true
  return signaturesMatch(signStreamUrl(u), s)
}

export function streamProxyUrl(value, { sign = true } = {}) {
  if (!isSafeHttpsUrl(value)) throw new Error('Stream URL must be https without credentials')
  const href = new URL(value).href
  // Prefer signing always so clients never depend on a frozen host list.
  if (!sign && !isAllowedStreamUrl(href)) throw new Error('Stream host is not allowed')
  const params = new URLSearchParams({ u: href })
  if (sign) params.set('s', signStreamUrl(href))
  return `/api/segment?${params}`
}

export function rewriteStreamPlaylist(text, baseUrl) {
  if (!isSafeHttpsUrl(baseUrl)) throw new Error('Playlist base must be https')
  const rewrite = (value) => {
    if (/^(data|skd):/i.test(value)) return value
    const absolute = new URL(value, baseUrl).href
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
