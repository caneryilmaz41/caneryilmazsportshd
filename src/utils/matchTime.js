/** "21:45" → bugünün o saati (Date). Saat değilse ("Canlı" vb.) null. */
export function kickoffToday(time, now = new Date()) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(time || '').trim());
  if (!m) return null;
  const d = new Date(now);
  d.setHours(Number(m[1]), Number(m[2]), 0, 0);
  return d;
}

export function isUpcoming(time, now = new Date()) {
  const d = kickoffToday(time, now);
  return Boolean(d && d.getTime() > now.getTime());
}
