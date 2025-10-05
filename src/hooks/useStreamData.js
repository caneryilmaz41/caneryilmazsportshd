import { useState, useEffect } from 'react';
import { scrapeMatches, getFallbackData } from '../components/MatchScraper';

export const useStreamData = () => {
  const [matches, setMatches] = useState([]);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const scrapedData = await scrapeMatches();
        if (scrapedData.matches.length > 0) {
          setMatches(scrapedData.matches);
          setChannels(scrapedData.channels);
          localStorage.setItem("lastUpdate", Date.now().toString());
        } else {
          const fallbackData = getFallbackData();
          setMatches(fallbackData.matches);
          setChannels(fallbackData.channels);
        }
      } catch (error) {
        console.error("Data loading error:", error);
        const fallbackData = getFallbackData();
        setMatches(fallbackData.matches);
        setChannels(fallbackData.channels);
      }
      setLoading(false);
    };

    loadData();

    const interval = setInterval(() => {
      const lastUpdate = localStorage.getItem("lastUpdate");
      const now = Date.now();

      if (!lastUpdate || now - parseInt(lastUpdate) > 60 * 60 * 1000) {
        loadData();
      }
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return { matches, channels, loading };
};