/**
 * Maç listesi: kaynak scrape sonucu aynen gösterilir.
 * (Eski HLS pre-filter her maç için resolve çağırıyordu; yavaştı ve
 * hatalı “maç yok” / yanlış filtre üretiyordu.)
 *
 * @param {Array<{id: string|number}>} rawMatches
 * @returns {{ hlsMatches: typeof rawMatches, hlsProbing: boolean }}
 */
export function useHlsMatchList(rawMatches) {
  return { hlsMatches: rawMatches || [], hlsProbing: false }
}
