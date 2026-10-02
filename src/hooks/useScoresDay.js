import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchScoresDay, toIsoDate } from '../services/scoresApi';

/**
 * Seçili günün maçları. Bugün için 30 sn'de bir, diğer günler 5 dk'da bir yenilenir;
 * sekme arka plandayken istek atılmaz, geri gelince hemen güncellenir.
 */
export function useScoresDay(iso, { enabled = true } = {}) {
  const [state, setState] = useState({ leagues: [], source: null, loading: true, error: null, updatedAt: null });
  const loadRef = useRef(() => {});

  useEffect(() => {
    if (!enabled) return undefined;
    let alive = true;
    const isToday = iso === toIsoDate(new Date());

    const load = async (force) => {
      try {
        const v = await fetchScoresDay(iso, { force });
        if (alive) setState({ ...v, loading: false, error: null, updatedAt: Date.now() });
      } catch {
        if (alive) setState((s) => ({ ...s, loading: false, error: 'Skorlar şu an alınamadı' }));
      }
    };
    loadRef.current = load;

    setState({ leagues: [], source: null, loading: true, error: null, updatedAt: null });
    load(false);
    const timer = setInterval(() => {
      if (!document.hidden) load(true);
    }, isToday ? 30 * 1000 : 5 * 60 * 1000);
    const onVisible = () => {
      if (!document.hidden) load(false);
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      alive = false;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [iso, enabled]);

  const refresh = useCallback(() => loadRef.current(true), []);
  return { ...state, refresh };
}
