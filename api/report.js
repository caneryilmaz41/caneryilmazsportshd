/**
 * "Bu yayın çalışmıyor" bildirimleri.
 * Her bildirim Vercel → Logs ekranında `[stream-report]` ile görünür.
 * REPORT_WEBHOOK_URL ortam değişkeni varsa (Discord webhook gibi) oraya da iletilir.
 */
const REASONS = new Set(['acilmiyor', 'donuyor', 'yanlis', 'ses', 'otomatik'])

const clip = (v, n) => String(v ?? '').slice(0, n)

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  if (req.method !== 'POST') return res.status(405).json({ ok: false })

  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      body = {}
    }
  }
  const reason = REASONS.has(body?.reason) ? body.reason : 'acilmiyor'
  const report = {
    at: new Date().toISOString(),
    reason,
    kind: clip(body?.kind, 16),
    id: clip(body?.id, 120),
    name: clip(body?.name, 160),
    src: clip(body?.src, 400),
    ua: clip(req.headers['user-agent'], 200),
  }
  if (!report.id) return res.status(400).json({ ok: false })

  console.log('[stream-report]', JSON.stringify(report))

  const hook = (globalThis.process?.env?.REPORT_WEBHOOK_URL || '').trim()
  if (hook) {
    try {
      await fetch(hook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `⚠️ **${report.name || report.id}** — ${report.reason} (${report.kind})\n${report.src}`,
        }),
      })
    } catch {
      /* webhook düşerse bildirim yine logda */
    }
  }
  return res.status(200).json({ ok: true })
}
