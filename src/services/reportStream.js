const KEY = 'streamReportsV1';
const COOLDOWN_MS = 10 * 60 * 1000; // aynı yayın için 10 dk'da bir bildirim

export const REPORT_REASONS = [
  { id: 'acilmiyor', label: 'Açılmıyor' },
  { id: 'donuyor', label: 'Donuyor / takılıyor' },
  { id: 'yanlis', label: 'Yanlış yayın' },
  { id: 'ses', label: 'Ses yok' },
];

function recent() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') || {};
  } catch {
    return {};
  }
}

export function wasReportedRecently(id) {
  const at = recent()[id];
  return Boolean(at && Date.now() - at < COOLDOWN_MS);
}

/** @returns {Promise<boolean>} gönderildi mi (cooldown'daysa false) */
export async function reportStream({ id, name, kind, src, reason }) {
  if (!id || wasReportedRecently(id)) return false;
  const all = recent();
  all[id] = Date.now();
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
  try {
    const res = await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name, kind, src, reason }),
      keepalive: true,
    });
    return res.ok;
  } catch {
    return false;
  }
}
