import assert from 'node:assert/strict'
import { test } from 'node:test'
import handler from '../api/resolvePlayer.js'

const primary = 'https://edge1.example.com/live/edge2/stream.m3u8?token=edge4'
const backup = 'https://backup.example.com/live.m3u8'

async function resolve(t, { exclude = [], primaryStatus = 200, primaryBody = '#EXTM3U\nsegment.ts' } = {}) {
  const requests = []
  t.mock.method(globalThis, 'fetch', async (url, init = {}) => {
    requests.push({ url: String(url), method: init.method || 'GET' })
    if (String(url).endsWith('/load/matches.php')) {
      return new Response('<a href="matches?id=test">test</a>' + ' '.repeat(250))
    }
    if (String(url).includes('/load/yayinlink.php?')) return Response.json({ deismackanal: primary })
    if (String(url) === primary) return new Response(primaryBody, { status: primaryStatus })
    if (String(url) === 'https://streamsport365.com/cinema') return Response.json({ URL: backup })
    if (String(url) === backup) return new Response('#EXTM3U\nbackup.ts')
    throw new Error('Unexpected request: ' + url)
  })
  const res = {
    statusCode: 200,
    setHeader() {},
    status(code) { this.statusCode = code; return this },
    json(body) { this.body = body; return this },
  }
  await handler({ query: { id: 'test', exclude: JSON.stringify(exclude) } }, res)
  return { res, requests }
}

test('preserves the supplied CDN hostname, path and token', async (t) => {
  const { res, requests } = await resolve(t)
  assert.equal(res.body.embedUrl, primary)
  assert.ok(String(res.body.proxyUrl || '').startsWith('/api/segment?'))
  assert.ok(String(res.body.proxyUrl).includes(encodeURIComponent(primary)))
  assert.ok(String(res.body.proxyUrl).includes('s='))
  assert.ok(!requests.some((r) => r.url === primary))
})

test('skips an excluded playlist and resolves the backup provider', async (t) => {
  const { res, requests } = await resolve(t, { exclude: [primary] })
  assert.equal(res.body.embedUrl, backup)
  assert.ok(!requests.some((r) => r.url === primary))
})

test('does not discard browser-playable streams based on a server 403', async (t) => {
  const { res, requests } = await resolve(t, { primaryStatus: 403, primaryBody: 'Forbidden' })
  assert.equal(res.body.embedUrl, primary)
  assert.ok(!requests.some((r) => r.url === primary))
})

test('does not probe the backup playlist from the server either', async (t) => {
  const { res, requests } = await resolve(t, { exclude: [primary] })
  assert.equal(res.body.embedUrl, backup)
  assert.ok(!requests.some((r) => r.url === backup))
})

test('rejects malformed exclusion input', async () => {
  const res = { setHeader() {}, status(code) { this.statusCode = code; return this }, json(body) { this.body = body } }
  await handler({ query: { id: 'test', exclude: '{}' } }, res)
  assert.equal(res.statusCode, 400)
})
