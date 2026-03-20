import { useState, useEffect } from 'react';
import { fetchLiveScores } from '../services/liveScoresApi';

export function useLiveScores(selectedDate, { enabled = true } = {}) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await fetchLiveScores({ selectedDate });
      setScores(data);
    } catch (e) {
      setScores([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    load();
    const interval = setInterval(load, 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedDate, enabled]);

  return { scores, loading };
}
