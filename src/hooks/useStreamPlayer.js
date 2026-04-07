import { useState } from 'react';
import { getStreamUrl } from '../components/StreamService';

export const useStreamPlayer = () => {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [streamLoading, setStreamLoading] = useState(false);

  const handleMatchSelect = async (match) => {
    setStreamLoading(true);
    setSelectedMatch({ ...match, url: null, streamType: null, iframeUrl: null });
    const result = await getStreamUrl(match);
    setSelectedMatch({
      ...match,
      url: result.url,
      streamType: result.type,
      iframeUrl: result.iframeUrl
    });
    setStreamLoading(false);
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

  return { selectedMatch, streamLoading, handleMatchSelect, toggleFullscreen };
};
