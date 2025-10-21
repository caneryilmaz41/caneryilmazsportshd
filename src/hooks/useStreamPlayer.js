import { useState } from 'react';
import { getStreamUrl } from '../components/StreamService';

export const useStreamPlayer = () => {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [streamLoading, setStreamLoading] = useState(false);


  const handleMatchSelect = async (match) => {
    setStreamLoading(true);
    setSelectedMatch(match);
    const streamUrl = await getStreamUrl(match.id);
    setSelectedMatch({ ...match, url: streamUrl });
    setStreamLoading(false);
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