import { useState } from 'react';
import { getStreamUrl } from '../components/StreamService';

export const useStreamPlayer = () => {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [streamLoading, setStreamLoading] = useState(false);

  const handleMatchSelect = async (match) => {
    setStreamLoading(true);
    // URL'i temizle — eski trgool URL'i render edilmesin
    setSelectedMatch({ ...match, url: null });
    const url = await getStreamUrl(match);
    setSelectedMatch({ ...match, url });
    setStreamLoading(false);
  };

  const toggleFullscreen = () => {
    const el = document.getElementById("video-player");
    if (!document.fullscreenElement) {
      (el?.requestFullscreen || el?.webkitRequestFullscreen || el?.msRequestFullscreen)?.call(el);
    } else {
      (document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen)?.call(document);
    }
  };

  return { selectedMatch, streamLoading, handleMatchSelect, toggleFullscreen };
};
