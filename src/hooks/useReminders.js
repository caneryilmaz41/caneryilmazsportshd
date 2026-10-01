import { useCallback, useEffect, useState } from 'react';
import { kickoffToday } from '../utils/matchTime';

const KEY = 'matchRemindersV1';
const LEAD_MS = 5 * 60 * 1000; // başlamadan 5 dk önce haber ver
const STALE_MS = 3 * 60 * 60 * 1000; // 3 saatten eski hatırlatıcıları at

function read() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '[]');
    const now = Date.now();
    return Array.isArray(parsed) ? parsed.filter((r) => r && r.id != null && r.at > now - STALE_MS) : [];
  } catch {
    return [];
  }
}

function write(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

async function showSystemNotification(r) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return false;
  const title = `⚽ ${r.name}`;
  const options = {
    body: 'Maç birazdan başlıyor — izlemek için dokun.',
    icon: '/cy.jpg',
    badge: '/cy.jpg',
    tag: `reminder-${r.id}`,
    data: { url: `/?mac=${encodeURIComponent(r.id)}` },
  };
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) {
      await reg.showNotification(title, options);
      return true;
    }
    new Notification(title, options);
    return true;
  } catch {
    return false;
  }
}

/**
 * Maç hatırlatıcıları. Bildirim, site/uygulama açıkken (arka plan sekmesi dahil) gönderilir;
 * tamamen kapalıyken bildirim için sunucu taraflı push gerekir.
 */
export function useReminders() {
  const [reminders, setReminders] = useState(read);
  const [toast, setToast] = useState(null);

  const has = useCallback((id) => reminders.some((r) => r.id === id), [reminders]);

  const toggle = useCallback(async (match) => {
    const kickoff = kickoffToday(match?.time);
    if (!kickoff) return;
    if (reminders.some((r) => r.id === match.id)) {
      const next = reminders.filter((r) => r.id !== match.id);
      setReminders(next);
      write(next);
      return;
    }
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch {
        /* ignore */
      }
    }
    const next = [...reminders, { id: match.id, name: match.name, at: kickoff.getTime() }];
    setReminders(next);
    write(next);
  }, [reminders]);

  useEffect(() => {
    const check = () => {
      const now = Date.now();
      const due = reminders.filter((r) => r.at - LEAD_MS <= now);
      if (!due.length) return;
      const rest = reminders.filter((r) => !due.includes(r));
      setReminders(rest);
      write(rest);
      due
        .filter((r) => r.at > now - STALE_MS)
        .forEach((r) => {
          showSystemNotification(r);
          setToast(r);
        });
    };
    check();
    const id = setInterval(check, 20 * 1000);
    return () => clearInterval(id);
  }, [reminders]);

  return { reminders, has, toggle, toast, dismissToast: () => setToast(null) };
}
