/**
 * trgooltv{N}.top — numara taranır; env yokken varsayılan olarak 85 değil,
 * makul bir "ipucu" (62) kullanılır. Sadece HTTP 200 yetmez; sayfada gerçek
 * Trgool içeriği (changePlayer / single-match vb.) aranır.
 *
 * Sabitlemek için: TRGOOL_DOMAIN veya VITE_TRGOOL_DOMAIN
 * Aralık: TRGOOL_SCAN_HIGH / TRGOOL_SCAN_LOW (veya VITE_*)
 * Env yokken fallback numara: TRGOOL_HINT (varsayılan 62)
 */

const DEFAULT_SCAN_HIGH = 72
const DEFAULT_SCAN_LOW = 50
const DEFAULT_HINT_N = 62
const BATCH_SIZE = 10
const PICK_TTL_MS = 60_000
const VERIFY_TIMEOUT_MS = 5000
const PROBE_TIMEOUT_MS = 7000

function buildTrgoolUrl(n) {
  return `https://trgooltv${n}.top`
}

function readIntEnv(nodeKey, viteKey, fallback) {
  const fromNode = globalThis.process?.env?.[nodeKey]
  if (fromNode != null && fromNode !== '') {
    const v = parseInt(String(fromNode), 10)
    if (!Number.isNaN(v)) return v
  }
  if (typeof import.meta !== 'undefined' && import.meta.env?.[viteKey] != null && import.meta.env[viteKey] !== '') {
    const v = parseInt(String(import.meta.env[viteKey]), 10)
    if (!Number.isNaN(v)) return v
  }
  return fallback
}

function getHintN() {
  return readIntEnv('TRGOOL_HINT', 'VITE_TRGOOL_HINT', DEFAULT_HINT_N)
}

function getScanRange() {
  const high = readIntEnv('TRGOOL_SCAN_HIGH', 'VITE_TRGOOL_SCAN_HIGH', DEFAULT_SCAN_HIGH)
  const low = readIntEnv('TRGOOL_SCAN_LOW', 'VITE_TRGOOL_SCAN_LOW', DEFAULT_SCAN_LOW)
  return { high: Math.max(high, low), low: Math.min(high, low) }
}

export function getPrimaryTrgoolDomain() {
  const nodeDomain = globalThis.process?.env?.TRGOOL_DOMAIN
  if (nodeDomain && String(nodeDomain).trim()) {
    return String(nodeDomain).trim().replace(/\/$/, '')
  }
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TRGOOL_DOMAIN) {
    const v = String(import.meta.env.VITE_TRGOOL_DOMAIN).trim()
    if (v) return v.replace(/\/$/, '')
  }
  return buildTrgoolUrl(getHintN())
}

function probeInit(timeoutMs) {
  const init = {
    method: 'GET',
    redirect: 'follow',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  }
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    init.signal = AbortSignal.timeout(timeoutMs)
  }
  return init
}

function looksLikeTrgoolMatchPage(html) {
  if (!html || typeof html !== 'string') return false
  const s = html.slice(0, 100_000)
  return /changePlayer|single-match|match-name|trgool/i.test(s)
}

async function probeTrgoolMatchPage(domain, fetchImpl, timeoutMs) {
  try {
    const res = await fetchImpl(`${domain}/matches?id=bein-sports-1`, probeInit(timeoutMs))
    if (!res.ok) return false
    const text = await res.text()
    return looksLikeTrgoolMatchPage(text)
  } catch {
    return false
  }
}

let cachedPick = { domain: null, at: 0 }

export async function getCachedWorkingTrgoolDomain(fetchImpl = fetch) {
  const now = Date.now()
  if (cachedPick.domain && now - cachedPick.at < PICK_TTL_MS) {
    const stillOk = await probeTrgoolMatchPage(cachedPick.domain, fetchImpl, VERIFY_TIMEOUT_MS)
    if (stillOk) return cachedPick.domain
  }
  const domain = await pickWorkingTrgoolDomain(fetchImpl)
  cachedPick = { domain, at: Date.now() }
  return domain
}

export async function pickWorkingTrgoolDomain(fetchImpl = fetch) {
  const { high, low } = getScanRange()

  for (let batchTop = high; batchTop >= low; batchTop -= BATCH_SIZE) {
    const batchBottom = Math.max(batchTop - BATCH_SIZE + 1, low)
    const nums = []
    for (let n = batchTop; n >= batchBottom; n--) nums.push(n)

    const outcomes = await Promise.all(
      nums.map(async (n) => {
        const domain = buildTrgoolUrl(n)
        const ok = await probeTrgoolMatchPage(domain, fetchImpl, PROBE_TIMEOUT_MS)
        return ok ? n : null
      })
    )

    const winners = outcomes.map((o, i) => (o !== null ? nums[i] : null)).filter((x) => x !== null)
    if (winners.length > 0) {
      const best = Math.max(...winners)
      return buildTrgoolUrl(best)
    }
  }

  return getPrimaryTrgoolDomain()
}
