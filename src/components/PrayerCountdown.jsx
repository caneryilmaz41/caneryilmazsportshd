import { useState, useEffect, useRef } from 'react';

const NAMES = ['İmsak', 'Güneş', 'Öğle', 'İkindi', 'Akşam', 'Yatsı'];
const KEYS = ['Imsak', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

function fmtDate(d) {
  return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
}

async function fetchTimes(date) {
  const res = await fetch(
    `https://api.aladhan.com/v1/timings/${fmtDate(date)}?latitude=40.7654&longitude=29.9408&method=13`
  );
  const data = await res.json();
  const t = data.data.timings;
  return KEYS.map(k => t[k]);
}

function toSec(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 3600 + m * 60;
}

const PrayerCountdown = () => {
  const [todayTimes, setTodayTimes] = useState(null);
  const [tomorrowImsak, setTomorrowImsak] = useState(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    fetchTimes(today).then(setTodayTimes).catch(() => {});
    fetchTimes(tomorrow).then(t => setTomorrowImsak(t[0])).catch(() => {});
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!todayTimes) return null;

  const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  // Sıradaki vakti bul
  let nextIdx = -1;
  let diff = 0;
  for (let i = 0; i < todayTimes.length; i++) {
    const pSec = toSec(todayTimes[i]);
    if (pSec > nowSec) {
      nextIdx = i;
      diff = pSec - nowSec;
      break;
    }
  }

  // Tüm vakitler geçtiyse → yarının imsak vaktine geri sayım
  let nextName, cdText;
  if (nextIdx === -1) {
    nextName = 'İmsak';
    if (tomorrowImsak) {
      const imsakSec = toSec(tomorrowImsak);
      diff = (24 * 3600 - nowSec) + imsakSec;
    } else {
      diff = 0;
    }
  } else {
    nextName = NAMES[nextIdx];
  }

  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  cdText = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;

  return (
    <div className="bg-slate-900/80 border-b border-slate-700/30">
      <div className="flex items-center justify-center gap-3 py-1.5 text-xs">
        <span className="text-slate-500">🕌 Kocaeli</span>
        <span className="text-slate-400">{nextName} Vaktine Kalan</span>
        <span className="font-mono text-emerald-400 font-bold text-sm tabular-nums">{cdText}</span>
      </div>
      <div className="flex items-center justify-center gap-1 pb-1.5 px-2 flex-wrap">
        {todayTimes.map((t, i) => (
          <div
            key={i}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] sm:text-xs ${
              i === nextIdx
                ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                : 'text-slate-500'
            }`}
          >
            <span>{NAMES[i]}</span>
            <span className={i === nextIdx ? 'text-white' : 'text-slate-400'}>{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrayerCountdown;
