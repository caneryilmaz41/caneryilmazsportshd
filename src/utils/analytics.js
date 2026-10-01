/**
 * Vercel Web Analytics: sadece production'da ve Vercel'de yüklenir.
 * Panelden Analytics açık değilse script 404 döner; site etkilenmez.
 */
export function initAnalytics() {
  if (!import.meta.env.PROD || typeof window === 'undefined') return;
  if (/^(localhost|127\.|192\.168\.)/.test(window.location.hostname)) return;
  window.va =
    window.va ||
    function (...args) {
      (window.vaq = window.vaq || []).push(args);
    };
  const s = document.createElement('script');
  s.defer = true;
  s.src = '/_vercel/insights/script.js';
  document.head.appendChild(s);
}

/** Özel olay (Vercel Pro planında panelde görünür; diğer planlarda sessizce yok sayılır). */
export function track(name, data) {
  try {
    window.va?.('event', { name, data });
  } catch {
    /* ignore */
  }
}
