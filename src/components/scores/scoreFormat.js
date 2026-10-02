/** Skor merkezi ortak biçimlendirme yardımcıları. */

export function kickoffTime(ms) {
  if (!ms) return '–';
  return new Date(ms).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

/** Satırın sol sütunu: saat, dakika, MS, ERT… */
export function statusCell(m) {
  switch (m.state) {
    case 'live':
      return { text: m.minute || 'CANLI', tone: 'live' };
    case 'ht':
      return { text: 'İY', tone: 'live' };
    case 'post':
      return { text: 'MS', tone: 'done' };
    case 'postponed':
      return { text: 'ERT', tone: 'muted' };
    case 'cancelled':
      return { text: 'İPT', tone: 'muted' };
    default:
      return { text: kickoffTime(m.kickoff), tone: 'pre' };
  }
}

export function winner(m) {
  if (m.homeScore == null || m.awayScore == null || !m.isFinished) return null;
  if (m.homeScore > m.awayScore) return 'home';
  if (m.awayScore > m.homeScore) return 'away';
  return 'draw';
}

export function dayLabel(iso, todayIso) {
  const [y, mo, d] = iso.split('-').map(Number);
  const dt = new Date(y, mo - 1, d);
  const [ty, tmo, td] = todayIso.split('-').map(Number);
  const diff = Math.round((dt - new Date(ty, tmo - 1, td)) / 86400000);
  const top = diff === 0 ? 'Bugün' : diff === -1 ? 'Dün' : diff === 1 ? 'Yarın' : dt.toLocaleDateString('tr-TR', { weekday: 'short' }).replace('.', '');
  return { top, bottom: `${String(d).padStart(2, '0')}.${String(mo).padStart(2, '0')}` };
}

export function shiftIso(iso, delta) {
  const [y, mo, d] = iso.split('-').map(Number);
  const dt = new Date(y, mo - 1, d + delta);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}
