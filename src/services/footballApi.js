// Tamamen ücretsiz API - TheSportsDB
export const fetchLeagueStandings = async (leagueId) => {
  try {
    const leagueMapping = {
      '2021': '4351', // Türkiye Süper Lig
      '2014': '4335', // La Liga
      '2002': '4331', // Bundesliga
      '2019': '4332', // Serie A
      '2015': '4334'  // Ligue 1
    };

    const apiLeagueId = leagueMapping[leagueId];
    const season = '2024-2025';
    
    const response = await fetch(`https://www.thesportsdb.com/api/v1/json/3/lookuptable.php?l=${apiLeagueId}&s=${season}`);
    
    if (response.ok) {
      const data = await response.json();
      if (data.table) {
        return data.table.map(team => ({
          position: parseInt(team.intRank),
          team: { name: team.strTeam },
          points: parseInt(team.intPoints || 0),
          playedGames: parseInt(team.intPlayed || 0),
          won: parseInt(team.intWin || 0),
          draw: parseInt(team.intDraw || 0),
          lost: parseInt(team.intLoss || 0),
          goalDifference: parseInt(team.intGoalDifference || 0)
        })).sort((a, b) => a.position - b.position);
      }
    }
    
    // Fallback: Football-data.org API
    return await fetchFromFootballData(leagueId);
  } catch (error) {
    console.error('TheSportsDB API Error:', error);
    return await fetchFromFootballData(leagueId);
  }
};

const fetchFromFootballData = async (leagueId) => {
  try {
    const response = await fetch(`https://api.football-data.org/v4/competitions/${leagueId}/standings`, {
      headers: {
        'X-Auth-Token': '64f1cc5eb6ed4c24812e06d8f80e6fc9'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.standings[0].table;
    }
  } catch (error) {
    console.error('Football-data API Error:', error);
  }
  
  return [];
};