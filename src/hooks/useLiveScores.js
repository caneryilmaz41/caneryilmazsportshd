import { useState, useEffect } from 'react';
import { fetchLiveScores } from '../services/liveScoresApi';

export function useLiveScores() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await fetchLiveScores();
      setScores(data);
    } catch (e) {
      setScores([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { scores, loading };
}
