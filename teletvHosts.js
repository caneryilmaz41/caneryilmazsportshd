/**
 * Maç / kanal listesi + yayinlink kaynağı.
 * teletv3.top sık düşüyor; güncel ayna teletv5.top (env ile sabitlemek mümkün).
 */

const DEFAULT_HOSTS = [
  'https://teletv5.top',
  'https://teletv6.top',
  'https://teletv4.top',
  'https://teletv3.top',
]

const CACHE_TTL_MS = 5 * 60_000
let cachedBase = null
let cachedAt = 0

function readEnvHost() {
  const node = globalThis.process?.env?.TELET_V_HOST
  if (node && String(node).trim()) {
    return String(node).trim().replace(/\/$/, '')
  }
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TELET_V_HOST) {
    const v = String(import.meta.env.VITE_TELET_V_HOST).trim()
    if (v) return v.replace(/\/$/, '')
  }
  return null
}

export function getTeletvHostCandidates() {
  const envHost = readEnvHost()
  const out = []
  if (envHost) out.push(envHost)
  for (const h of DEFAULT_HOSTS) {
    if (!out.includes(h)) out.push(h)
  }
  return out
}

/** Senkron varsayılan (liste URL’leri için); canlı keşif yoksa teletv5. */
export function getPrimaryTeletvBase() {
  return getTeletvHostCandidates()[0]
}

export function teletvLoadUrl(base, path) {
  const b = String(base || getPrimaryTeletvBase()).replace(/\/$/, '')
  const p = String(path || '').replace(/^\//, '')
  return `${b}/load/${p}`
}

/**
 * Çalışan teletv hostunu bul (matches.php yanıtı + maç id’si).
 * @returns {Promise<string>} host origin, örn. https://teletv5.top
 */
export async function resolveWorkingTeletvBase(fetchImpl = globalThis.fetch) {
  const now = Date.now()
  if (cachedBase && now - cachedAt < CACHE_TTL_MS) return cachedBase

  for (const host of getTeletvHostCandidates()) {
    try {
      const res = await fetchImpl(teletvLoadUrl(host, 'matches.php'), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Accept: 'text/html,application/json,*/*',
        },
        signal: AbortSignal.timeout(10_000),
      })
      if (!res.ok) continue
      const html = await res.text()
      if (html.length > 200 && /matches\?id=/i.test(html)) {
        cachedBase = host
        cachedAt = now
        return host
      }
    } catch {
      /* sıradaki ayna */
    }
  }

  const fallback = getPrimaryTeletvBase()
  cachedBase = fallback
  cachedAt = now
  return fallback
}
