import { getStreamUrl } from '../components/StreamService';

/**
 * Tıklandığında `getStreamUrl` ile aynı sonuç: yalnızca `type === 'hls'`
 * (iç player.html) ise true. iframe / kabuk (browser / harici) yolu false.
 */
export async function matchPlaysInAppHlsPlayer(id) {
  try {
    const r = await getStreamUrl({ id: id ?? '' });
    return r?.type === 'hls';
  } catch {
    return false;
  }
}

/**
 * Sınırlı eşzamanlı: her maç için `getStreamUrl` (tıkla = aynı mantık).
 */
export async function buildInAppPlayoutMap(ids, concurrency = 3) {
  const unique = [...new Set(ids.map(String))];
  const map = new Map();
  if (unique.length === 0) return map;
  let cursor = 0;
  const worker = async () => {
    for (;;) {
      const i = cursor++;
      if (i >= unique.length) return;
      const id = unique[i];
      const ok = await matchPlaysInAppHlsPlayer(id);
      map.set(id, ok);
    }
  };
  const n = Math.min(concurrency, unique.length);
  await Promise.all(Array.from({ length: n }, () => worker()));
  return map;
}
