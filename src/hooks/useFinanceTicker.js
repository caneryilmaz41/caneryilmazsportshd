import { TICKER_SEGMENTS } from '../services/financeTicker';

/**
 * Kayan şerit metni (tek satır, senkron).
 */
export function useFinanceTicker() {
  return { segments: TICKER_SEGMENTS };
}
