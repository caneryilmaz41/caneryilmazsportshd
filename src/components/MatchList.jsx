import TeamLogo from './TeamLogo';
import { parseMatchTeams } from '../utils/teamUtils';

const MatchList = ({ 
  matches, 
  selectedMatch, 
  onMatchSelect, 
  logoState, 
  setLogoState 
}) => {
  return (
    <div className="divide-y divide-slate-700">
      {matches.map((match) => {
        const teams = parseMatchTeams(match.name);
        return (
          <button
            key={match.id}
            onClick={() => onMatchSelect(match)}
            className={`w-full text-left p-3 hover:bg-slate-700 transition-colors ${
              selectedMatch?.id === match.id
                ? "bg-blue-600/20 border-l-4 border-blue-500"
                : ""
            }`}
          >
            <div className="flex flex-col gap-2">
              {/* Kategori ve Özel Etiket */}
              <div className="flex items-center gap-2 text-xs">
                {match.category && (
                  <span className="text-slate-400">{match.category}</span>
                )}
                {match.special && (
                  <span className="text-yellow-400 font-semibold animate-pulse">
                    {match.special}
                  </span>
                )}
              </div>
              
              {/* Saat ve Lig */}
              <div className="text-xs text-slate-500">
                {match.time} | {match.league}
              </div>
              
              {/* Takımlar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  {match.homeLogo ? (
                    <img src={match.homeLogo} alt="Home" className="w-5 h-5 object-contain" />
                  ) : teams[0] && (
                    <TeamLogo 
                      teamName={teams[0]} 
                      logoState={logoState} 
                      setLogoState={setLogoState} 
                    />
                  )}
                  <div className="text-white text-sm font-medium">
                    {teams[0] || 'Takım 1'}
                  </div>
                </div>
                
                <div className="text-slate-400 text-xs mx-2">VS</div>
                
                <div className="flex items-center gap-2 flex-1 justify-end">
                  <div className="text-white text-sm font-medium">
                    {teams[1] || 'Takım 2'}
                  </div>
                  {match.awayLogo ? (
                    <img src={match.awayLogo} alt="Away" className="w-5 h-5 object-contain" />
                  ) : teams[1] && (
                    <TeamLogo 
                      teamName={teams[1]} 
                      logoState={logoState} 
                      setLogoState={setLogoState} 
                    />
                  )}
                </div>
              </div>
            </div>

            {selectedMatch?.id === match.id && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            )}
          </button>
        );
      })}
      {matches.length === 0 && (
        <div className="p-6 text-center text-slate-400 text-sm">
          Henüz maç yok
        </div>
      )}
    </div>
  );
};

export default MatchList;