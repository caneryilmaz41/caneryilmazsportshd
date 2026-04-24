import { useState, useEffect, useMemo } from 'react';
import { buildInAppPlayoutMap } from '../utils/probeHlsStatus';

/**
 * Açık: .env VITE_DISABLE_STREAM_LIST_FILTER=1 (liste filtresi tamamen kapanır, acil debug).
 * Not: Daha önce `import.meta.env.DEV` ile filtre atlanıyordu; `npm run dev` ile
 * hiç uygulanmıyormuş gibi bir davranış veriyordu — bu kaldırıldı.
 */
const listFilterOff = import.meta.env.VITE_DISABLE_STREAM_LIST_FILTER === '1';

/**
 * @param {Array<{id: string|number}>} rawMatches
 * @returns {{ hlsMatches: typeof rawMatches, hlsProbing: boolean }}
 */
export function useHlsMatchList(rawMatches) {
  const [probeMap, setProbeMap] = useState(null);
  const [hlsProbing, setHlsProbing] = useState(false);

  useEffect(() => {
    if (listFilterOff) {
      return;
    }
    if (!rawMatches.length) {
      setProbeMap(new Map());
      setHlsProbing(false);
      return;
    }
    const ids = rawMatches.map((m) => m.id);
    let cancel = false;
    setHlsProbing(true);
    setProbeMap(null);
    buildInAppPlayoutMap(ids, 3)
      .then((m) => {
        if (!cancel) setProbeMap(m);
      })
      .catch(() => {
        if (!cancel) setProbeMap(new Map());
      })
      .finally(() => {
        if (!cancel) setHlsProbing(false);
      });
    return () => {
      cancel = true;
    };
  }, [rawMatches]);

  const hlsMatches = useMemo(() => {
    if (listFilterOff) {
      return rawMatches;
    }
    if (!rawMatches.length) {
      return [];
    }
    if (probeMap == null) {
      return [];
    }
    return rawMatches.filter((m) => probeMap.get(String(m.id)) === true);
  }, [rawMatches, probeMap]);

  return { hlsMatches, hlsProbing: listFilterOff ? false : hlsProbing };
}
