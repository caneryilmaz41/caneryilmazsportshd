import { useCallback, useState } from 'react';

const KEY = 'favoritesV1';

/** Takım adları ve kanal id'leri için ortak anahtar: büyük/küçük harf ve boşluk farkını yok say. */
export const favKey = (kind, value) => `${kind}:${String(value || '').trim().toLocaleLowerCase('tr-TR')}`;

function read() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favs, setFavs] = useState(() => new Set(read()));

  const toggle = useCallback((key) => {
    setFavs((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      try {
        localStorage.setItem(KEY, JSON.stringify([...next]));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const has = useCallback((key) => favs.has(key), [favs]);

  return { favs, has, toggle };
}
