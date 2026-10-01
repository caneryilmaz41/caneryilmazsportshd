import { useRef, useState } from 'react';
import { getStreamUrl } from '../components/StreamService';

export const useStreamPlayer = () => {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [streamLoading, setStreamLoading] = useState(false);
  // Hızlı art arda seçimde eski isteğin sonucu yenisinin üstüne yazmasın.
  const reqRef = useRef(0);

  const handleMatchSelect = async (match) => {
    const req = ++reqRef.current;
    setStreamLoading(true);
    // TrGool channel.html'i önce yükleme — tam site iframe'de açılıyordu.
    setSelectedMatch({
      ...match,
      url: null,
      streamType: null,
      iframeUrl: null,
      attempt: 0,
      triedUrls: [],
    });
    let next;
    try {
      const result = await getStreamUrl(match);
      next = {
        ...match,
        url: result?.url || null,
        streamType: result?.type || 'hls',
        iframeUrl: result?.iframeUrl || null,
      };
    } catch {
      next = { ...match, url: null, streamType: 'hls', iframeUrl: null };
    }
    if (req !== reqRef.current) return;
    setSelectedMatch({ ...next, attempt: 0, triedUrls: [] });
    setStreamLoading(false);
  };

  /**
   * Yayın hata verdiğinde: denenmemiş bir kaynak ara; yoksa aynı adresi baştan yükle.
   * @returns {Promise<boolean>} yeni bir kaynak bulundu mu
   */
  const retryStream = async () => {
    const current = selectedMatch;
    if (!current) return false;
    const req = ++reqRef.current;
    const tried = [...(current.triedUrls || []), current.url].filter(Boolean);
    setStreamLoading(true);
    let found = null;
    try {
      const result = await getStreamUrl(current, { exclude: tried });
      found = result?.url || null;
    } catch {
      found = null;
    }
    if (req !== reqRef.current) return false;
    setSelectedMatch({
      ...current,
      url: found || current.url,
      triedUrls: tried,
      attempt: (current.attempt || 0) + 1,
    });
    setStreamLoading(false);
    return Boolean(found);
  };

  const toggleFullscreen = () => {
    const el = document.getElementById("video-player");
    const isFS = document.fullscreenElement || document.webkitFullscreenElement;
    
    if (isFS) {
      (document.exitFullscreen || document.webkitExitFullscreen || document.webkitCancelFullScreen)?.call(document);
    } else if (el) {
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      else {
        // iOS: iframe içindeki video'yu fullscreen yap
        const iframe = el.querySelector('iframe');
        if (iframe?.requestFullscreen) iframe.requestFullscreen();
        else if (iframe?.webkitRequestFullscreen) iframe.webkitRequestFullscreen();
      }
    }
  };

  return { selectedMatch, streamLoading, handleMatchSelect, retryStream, toggleFullscreen };
};
