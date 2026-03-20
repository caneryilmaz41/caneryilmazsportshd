import { useEffect, useState } from 'react';
import { fetchLeagueTable, getCurrentSoccerSeason } from '../services/leagueTableApi';

export function useLeagueTable(leagueId, { enabled = true, season } = {}) {
  const [table, setTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSeason, setActiveSeason] = useState(season || getCurrentSoccerSeason());

  useEffect(() => {
    if (!enabled) return;

    const currentSeason = season || getCurrentSoccerSeason();
    setActiveSeason(currentSeason);
    setLoading(true);

    fetchLeagueTable({ leagueId, season: currentSeason })
      .then((res) => setTable(res.table || []))
      .catch(() => setTable([]))
      .finally(() => setLoading(false));
  }, [enabled, leagueId, season]);

  return { table, loading, season: activeSeason };
}

