import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  isAllowedStreamUrl,
  isAuthorizedStreamProxyRequest,
  rewriteStreamPlaylist,
  signStreamUrl,
  streamProxyUrl,
} from '../streamProxy.js'

const base = 'https://css.d6e3eae5e065d5.help/live/index.m3u8'

test('rewrites variant playlists, keys, maps and absolute media segments', () => {
  const text = '#EXTM3U\n#EXT-X-KEY:METHOD=AES-128,URI="key.bin"\n#EXT-X-MAP:URI="init.mp4"\nvariant.m3u8\nhttps://d1dshreoaq9swe.cloudfront.net/live/part.jpg'
  const result = rewriteStreamPlaylist(text, base)
  for (const url of [
    'https://css.d6e3eae5e065d5.help/live/key.bin',
    'https://css.d6e3eae5e065d5.help/live/init.mp4',
    'https://css.d6e3eae5e065d5.help/live/variant.m3u8',
    'https://d1dshreoaq9swe.cloudfront.net/live/part.jpg',
  ]) {
    assert.ok(result.includes('/api/segment?'))
    assert.ok(result.includes(encodeURIComponent(url)))
  }
})

test('allows rotated provider .help apex and cloudfront/fastly families', () => {
  assert.equal(isAllowedStreamUrl('https://css.d6e3eae5e065d5.help/a.m3u8'), true)
  assert.equal(isAllowedStreamUrl('https://css.d6e3cae2e245k5.help/a.m3u8'), true)
  assert.equal(isAllowedStreamUrl('https://google.deadbeefcafe01.help/a.m3u8'), true)
  assert.equal(isAllowedStreamUrl('https://viagsak-skak-skma.global.ssl.fastly.net/beintv/part.jpg'), true)
  assert.equal(isAllowedStreamUrl('https://other-edge.global.ssl.fastly.net/live/a.jpg'), true)
  assert.equal(isAllowedStreamUrl('https://d31beekkopsyst.cloudfront.net/live/a.jpg'), true)
  assert.equal(isAllowedStreamUrl('https://abc123.cloudfront.net/live/a.jpg'), true)
})

test('signs unknown segment hosts so playlist rewrite survives CDN rotation', () => {
  const unknown = 'https://brand-new-cdn.example.net/live/part.jpg'
  assert.equal(isAllowedStreamUrl(unknown), false)
  assert.equal(isAuthorizedStreamProxyRequest(unknown, null), false)
  const signed = streamProxyUrl(unknown, { sign: true })
  const params = new URL(signed, 'http://local').searchParams
  assert.equal(params.get('u'), unknown)
  assert.ok(params.get('s'))
  assert.equal(isAuthorizedStreamProxyRequest(params.get('u'), params.get('s')), true)
  assert.equal(isAuthorizedStreamProxyRequest(params.get('u'), 'bad'), false)
})

test('rewrite signs brand-new segment hosts found inside a trusted playlist', () => {
  const text = '#EXTM3U\nhttps://totally-new-edge.example.org/seg.jpg'
  const result = rewriteStreamPlaylist(text, base)
  const line = result.split('\n').find((l) => l.includes('/api/segment?'))
  assert.ok(line)
  const params = new URL(line, 'http://local').searchParams
  assert.equal(params.get('u'), 'https://totally-new-edge.example.org/seg.jpg')
  assert.equal(params.get('s'), signStreamUrl(params.get('u')))
  assert.equal(isAuthorizedStreamProxyRequest(params.get('u'), params.get('s')), true)
})

test('blocks private addresses, arbitrary hosts and credentials', () => {
  for (const url of [
    'http://127.0.0.1/',
    'https://169.254.169.254/',
    'https://example.com/a',
    'https://evil.help/a',
    'https://user@css.d6e3eae5e065d5.help/a',
    'https://css.d6e3eae5e065d5.help.evil.example/a',
    'https://evil-global.ssl.fastly.net.attacker.com/a',
  ]) {
    assert.equal(isAllowedStreamUrl(url), false)
    assert.equal(isAuthorizedStreamProxyRequest(url, null), false)
  }
})
