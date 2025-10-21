import { useState } from 'react';
import { getStreamUrl } from '../components/StreamService';

export const useStreamPlayer = () => {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [streamLoading, setStreamLoading] = useState(false);


  const handleMatchSelect = async (match) => {
    setStreamLoading(true);
    setSelectedMatch(match);
    
    try {
      const streamUrl = await getStreamUrl(match.id);
      setSelectedMatch({ ...match, url: streamUrl });
      
      // İlk defa giren kullanıcılar için ekstra bekleme
      const isFirstVisit = !localStorage.getItem('stream_visited');
      if (isFirstVisit) {
        // Biraz daha bekle ki domain testi tamamlansın
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
    } catch (error) {
      console.error('Stream URL error:', error);
      // Fallback URL
      const fallbackUrl = `https://trgoals1431.xyz/channel.html?id=${match.id}&t=${Date.now()}&autoplay=1&muted=1`;
      setSelectedMatch({ ...match, url: fallbackUrl });
    } finally {
      setStreamLoading(false);
    }
  };  

  const toggleFullscreen = () => {
    const playerElement = document.getElementById("video-player");
    if (!document.fullscreenElement) {
      if (playerElement.requestFullscreen) {
        playerElement.requestFullscreen();
      } else if (playerElement.webkitRequestFullscreen) {
        playerElement.webkitRequestFullscreen();
      } else if (playerElement.mozRequestFullScreen) {
        playerElement.mozRequestFullScreen();
      } else if (playerElement.msRequestFullscreen) {
        playerElement.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  return {
    selectedMatch,
    streamLoading,
    handleMatchSelect,
    toggleFullscreen
  };
};