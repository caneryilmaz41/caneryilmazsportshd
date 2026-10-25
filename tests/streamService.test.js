import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createServer } from 'vite'

let server
let getStreamUrl
before(async () => {
  server = await createServer({ configFile: false, server: { middlewareMode: true }, logLevel: 'error' })
  ;({ getStreamUrl } = await server.ssrLoadModule('/src/components/StreamService.js'))
})
after(async () => { await server?.close() })

const primary = 'https://edge1.example.com/live/edge2/stream.m3u8?token=edge4'
const backup = 'https://backup.example.com/live.m3u8'

function source(t) {
  const requests = []
  t.mock.method(globalThis, 'fetch', async (url) => {
    const value = String(url)
    requests.push(value)
    if (value.endsWith('/load/matches.php')) return new Response('<a href="matches?id=test">test</a>' + ' '.repeat(250))
    if (value.includes('/load/yayinlink.php?')) return Response.json({ deismackanal: primary })
    if (value.startsWith('/api/resolvePlayer?')) return Response.json({ embedUrl: backup, success: true })
    throw new Error('Unexpected preflight or request: ' + value)
  })
  return requests
}

test('passes browser-resolved stream to the player without probing the playlist', async (t) => {
  const requests = source(t)
  const stream = await getStreamUrl({ id: 'test' })
  assert.equal(stream.url, '/api/segment?u=' + encodeURIComponent(primary))
  assert.ok(!requests.some((url) => url.includes('/api/')))
  assert.ok(!requests.includes(primary))
})

test('forwards failed sources to the API and uses a different source', async (t) => {
  const requests = source(t)
  const stream = await getStreamUrl({ id: 'test' }, { exclude: [primary] })
  assert.equal(stream.url, '/api/segment?u=' + encodeURIComponent(backup))
  const request = new URL(requests.find((url) => url.startsWith('/api/')), 'http://localhost')
  assert.deepEqual(JSON.parse(request.searchParams.get('exclude')), [primary])
})

test('uses the official TRT stream without calling the third-party source', async (t) => {
  const requests = source(t)
  const stream = await getStreamUrl({ id: 'trt-spor' })
  assert.equal(stream.url, 'https://tv-trtspor1.medya.trt.com.tr/master.m3u8')
  assert.equal(requests.length, 0)
})

test('never substitutes an external player for an unavailable HLS source', async (t) => {
  const requests = source(t)
  const stream = await getStreamUrl({ id: 'test' }, { exclude: [primary] })
  assert.equal(stream.type, 'hls')
  assert.equal(stream.iframeUrl, null)
  assert.equal(stream.url, '/api/segment?u=' + encodeURIComponent(backup))
  assert.ok(!requests.some((url) => url.includes('trgooltv')))
})
