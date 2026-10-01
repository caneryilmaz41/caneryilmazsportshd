import { useEffect, useState } from 'react';
import { fetchTodayScores } from '../services/liveScoresApi';
import { findScoreFor } from '../utils/scoreMatch';

/** Oynatıcıdaki maçın canlı skorunu 60 sn'de bir yeniler. Eşleşme yoksa null. */
export function useMatchScore(teams, enabled) {
  const [score, setScore] = useState(null);
  const home = teams?.[0] || '';
  const away = teams?.[1] || '';

  useEffect(() => {
    setScore(null);
    if (!enabled || !home || !away) return undefined;
    let alive = true;
    const load = async () => {
      try {
        const all = await fetchTodayScores();
        if (alive) setScore(findScoreFor([home, away], all));
      } catch {
        /* skor yoksa başlık VS olarak kalır */
      }
    };
    load();
    const id = setInterval(load, 60 * 1000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [home, away, enabled]);

  return score;
}
