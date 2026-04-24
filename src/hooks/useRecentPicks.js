import { useState, useCallback, useEffect } from 'react';

const KEY = 'recentPicksV1';
const MAX = 6;

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (x) =>
          x &&
          typeof x.id !== 'undefined' &&
          (x.kind === 'match' || x.kind === 'channel') &&
          typeof x.name === 'string',
      )
      .slice(0, MAX);
  } catch {
    return [];
  }
}

export function useRecentPicks() {
  const [recent, setRecent] = useState(() => (typeof window !== 'undefined' ? read() : []));

  useEffect(() => {
    setRecent(read());
  }, []);

  const addPick = useCallback((item) => {
    const { id, name, kind } = item;
    if (id == null || !name) return;
    setRecent((prev) => {
      const next = [
        { id, name, kind, at: Date.now() },
        ...prev.filter((p) => p.id !== id),
      ].slice(0, MAX);
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return { recent, addPick };
}
