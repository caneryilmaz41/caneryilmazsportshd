import { useState, useEffect } from 'react';

const NAMES = ['İmsak', 'Güneş', 'Öğle', 'İkindi', 'Akşam', 'Yatsı'];
const KEYS = ['Imsak', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const KAABA = { lat: 21.4225, lng: 39.8262 };

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function toDeg(rad) {
  return (rad * 180) / Math.PI;
}

function normalizeDeg(deg) {
  return ((deg % 360) + 360) % 360;
}

function calculateQiblaBearing(lat, lng) {
  const lat1 = toRad(lat);
  const lng1 = toRad(lng);
  const lat2 = toRad(KAABA.lat);
  const lng2 = toRad(KAABA.lng);
  const y = Math.sin(lng2 - lng1);
  const x = Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(lng2 - lng1);
  return normalizeDeg(toDeg(Math.atan2(y, x)));
}

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
  const [qiblaBearing, setQiblaBearing] = useState(null);
  const [heading, setHeading] = useState(null);
  const [qiblaStatus, setQiblaStatus] = useState('Kıble için konum izni verin');
  const [orientationEnabled, setOrientationEnabled] = useState(false);

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

  useEffect(() => {
    if (!orientationEnabled) return undefined;

    const onOrientation = (event) => {
      // iOS Safari: doğru heading değeri.
      if (typeof event.webkitCompassHeading === 'number') {
        setHeading(normalizeDeg(event.webkitCompassHeading));
        return;
      }

      // Diğer mobil tarayıcılar: alpha'dan kuzey referansı türet.
      if (typeof event.alpha === 'number') {
        setHeading(normalizeDeg(360 - event.alpha));
      }
    };

    window.addEventListener('deviceorientation', onOrientation, true);
    return () => window.removeEventListener('deviceorientation', onOrientation, true);
  }, [orientationEnabled]);

  const enableQiblaFinder = async () => {
    if (!navigator.geolocation) {
      setQiblaStatus('Cihazınız konum desteği sunmuyor');
      return;
    }

    setQiblaStatus('Konum alınıyor...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setQiblaBearing(calculateQiblaBearing(lat, lng));
        setQiblaStatus('Pusulayı düz tutup kıble yönünü takip edin');
      },
      () => {
        setQiblaStatus('Konum izni reddedildi veya alınamadı');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
    );

    if (
      typeof window.DeviceOrientationEvent !== 'undefined' &&
      typeof window.DeviceOrientationEvent.requestPermission === 'function'
    ) {
      try {
        const permission = await window.DeviceOrientationEvent.requestPermission();
        if (permission === 'granted') {
          setOrientationEnabled(true);
        } else {
          setQiblaStatus('Pusula izni verilmedi, sadece açı bilgisi gösteriliyor');
        }
      } catch {
        setQiblaStatus('Pusula izni alınamadı, sadece açı bilgisi gösteriliyor');
      }
      return;
    }

    setOrientationEnabled(true);
  };

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

  const qiblaRelative = qiblaBearing == null || heading == null
    ? null
    : normalizeDeg(qiblaBearing - heading);
  const isAligned = qiblaRelative != null && (qiblaRelative < 10 || qiblaRelative > 350);

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

      <div className="mx-2 mb-2 rounded-xl border border-emerald-500/20 bg-gradient-to-br from-slate-800/80 to-slate-900/90 p-2.5 shadow-[0_8px_24px_rgba(15,23,42,0.35)] sm:mx-auto sm:max-w-xl">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold text-slate-100">🧭 Kıble Bulucu</p>
            <p className="text-[10px] text-slate-400 leading-tight">{qiblaStatus}</p>
          </div>
          <button
            type="button"
            onClick={enableQiblaFinder}
            className="rounded-lg border border-emerald-500/45 bg-emerald-500/15 px-2.5 py-1 text-[10px] font-semibold text-emerald-200 transition hover:bg-emerald-500/25"
          >
            Kıbleyi Bul
          </button>
        </div>

        {qiblaBearing != null ? (
          <div className="mt-2.5 flex items-center gap-3">
            <div className="relative h-16 w-16 shrink-0 rounded-full border border-slate-500/45 bg-slate-950/85">
              <div className="absolute left-1/2 top-1 h-2 w-0.5 -translate-x-1/2 bg-slate-300" />
              <div
                className={`absolute left-1/2 top-1/2 h-6 w-0.5 -translate-x-1/2 -translate-y-full origin-bottom ${isAligned ? 'bg-emerald-400' : 'bg-amber-300'}`}
                style={{ transform: `translateX(-50%) translateY(-100%) rotate(${qiblaRelative || 0}deg)` }}
              />
              <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-200" />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] text-slate-300">
                Kıble Açısı: <span className="font-semibold text-white">{qiblaBearing.toFixed(1)}°</span>
              </p>
              <p className="text-[11px] text-slate-300">
                {heading == null ? 'Pusula bekleniyor...' : `Cihaz Yönü: ${heading.toFixed(1)}°`}
              </p>
              {isAligned ? (
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                    Kıble burası
                  </span>
                  <span className="text-[10px] font-medium text-emerald-300">Allah kabul etsin</span>
                </div>
              ) : (
                <p className="text-[11px] font-medium text-amber-300">
                  Telefonu yavaşça çevirerek oku yukarı alın
                </p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PrayerCountdown;
