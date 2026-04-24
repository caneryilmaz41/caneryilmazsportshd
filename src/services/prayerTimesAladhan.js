const API_KEYS = ['Imsak', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

function fmtDate(d) {
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
}

export const PRAYER_NAMES = ['İmsak', 'Güneş', 'Öğle', 'İkindi', 'Akşam', 'Yatsı'];

/**
 * Kocaeli bölgesi (PrayerCountdown ile aynı koordinat & metot).
 * @param {Date} date
 * @returns {Promise<string[]>} Saat stringleri, sıra API_KEYS ile aynı
 */
export async function fetchAladhanTimings(date) {
  const res = await fetch(
    `https://api.aladhan.com/v1/timings/${fmtDate(date)}?latitude=40.7654&longitude=29.9408&method=13`
  );
  if (!res.ok) throw new Error('timings');
  const data = await res.json();
  const t = data.data.timings;
  return API_KEYS.map((k) => t[k]);
}
