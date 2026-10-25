import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isAllowedStreamUrl, rewriteStreamPlaylist } from '../streamProxy.js'

const base = 'https://css.d6e3eae5e065d5.help/live/index.m3u8'
test('rewrites variant playlists, keys, maps and absolute media segments', () => {
  const text = '#EXTM3U\n#EXT-X-KEY:METHOD=AES-128,URI="key.bin"\n#EXT-X-MAP:URI="init.mp4"\nvariant.m3u8\nhttps://d1dshreoaq9swe.cloudfront.net/live/part.jpg'
  const result = rewriteStreamPlaylist(text, base)
  for (const url of ['https://css.d6e3eae5e065d5.help/live/key.bin', 'https://css.d6e3eae5e065d5.help/live/init.mp4', 'https://css.d6e3eae5e065d5.help/live/variant.m3u8', 'https://d1dshreoaq9swe.cloudfront.net/live/part.jpg']) assert.ok(result.includes('/api/segment?u=' + encodeURIComponent(url)))
})
test('allows current Fastly segment CDN and cloudfront/fastly suffix hosts', () => {
  assert.equal(isAllowedStreamUrl('https://viagsak-skak-skma.global.ssl.fastly.net/beintv/part.jpg'), true)
  assert.equal(isAllowedStreamUrl('https://other-edge.global.ssl.fastly.net/live/a.jpg'), true)
  assert.equal(isAllowedStreamUrl('https://abc123.cloudfront.net/live/a.jpg'), true)
})
test('blocks private addresses, arbitrary hosts and credentials', () => {
  for (const url of ['http://127.0.0.1/', 'https://169.254.169.254/', 'https://example.com/a', 'https://user@css.d6e3eae5e065d5.help/a', 'https://css.d6e3eae5e065d5.help.evil.example/a', 'https://evil-global.ssl.fastly.net.attacker.com/a']) assert.equal(isAllowedStreamUrl(url), false)
  assert.throws(() => rewriteStreamPlaylist('#EXTM3U\nhttps://example.com/segment.ts', base))
})
