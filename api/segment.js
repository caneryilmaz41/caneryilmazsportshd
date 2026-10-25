import { once } from 'node:events'
import { isAllowedStreamUrl, rewriteStreamPlaylist, streamRequestHeaders } from '../streamProxy.js'

export default async function handler(req, res) {
  const { u } = req.query
  res.setHeader('Cache-Control', 'no-store')
  if (typeof u !== 'string' || !isAllowedStreamUrl(u)) return res.status(400).json({ error: 'Stream host is not allowed' })
  if (req.method && req.method !== 'GET') return res.status(405).json({ error: 'GET required' })
  const abort = new AbortController()
  const timer = setTimeout(() => abort.abort(), 15000)
  const onClose = () => abort.abort()
  res.on('close', onClose)
  try {
    let url = u
    let response
    for (let count = 0; count < 4; count++) {
      if (!isAllowedStreamUrl(url)) return res.status(400).json({ error: 'Redirect host is not allowed' })
      const headers = streamRequestHeaders()
      if (req.headers.range) headers.Range = req.headers.range
      response = await fetch(url, { headers, redirect: 'manual', signal: abort.signal })
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        await response.body?.cancel()
        const target = response.headers.get('location')
        if (!target) throw new Error('Invalid stream redirect')
        url = new URL(target, url).href
        response = null
        continue
      }
      break
    }
    if (!response) throw new Error('Too many stream redirects')
    if (!response.ok) {
      await response.body?.cancel()
      return res.status(response.status).json({ error: 'Upstream stream request failed', upstreamStatus: response.status })
    }
    const type = response.headers.get('content-type') || 'application/octet-stream'
    const playlist = new URL(url).pathname.endsWith('.m3u8') || /mpegurl/i.test(type)
    if (playlist) {
      const text = await response.text()
      if (!text.trimStart().startsWith('#EXTM3U')) throw new Error('Upstream did not return an HLS playlist')
      const rewritten = rewriteStreamPlaylist(text, url)
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl')
      res.statusCode = 200
      res.end(rewritten)
    } else {
      res.statusCode = response.status
      res.setHeader('Content-Type', type)
      for (const name of ['content-range', 'accept-ranges', 'content-length']) {
        const value = response.headers.get(name)
        if (value && !(name === 'content-length' && response.headers.has('content-encoding'))) res.setHeader(name, value)
      }
      for await (const chunk of response.body) {
        if (!res.write(chunk)) await once(res, 'drain', { signal: abort.signal })
      }
      res.end()
    }
  } catch {
    if (!res.destroyed) {
      if (!res.headersSent) res.status(502).json({ error: 'Stream proxy request failed' })
      else res.destroy()
    }
  } finally {
    clearTimeout(timer)
    res.off('close', onClose)
  }
}
