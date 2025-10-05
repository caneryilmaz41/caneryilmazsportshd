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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                {teams[0] && (
                  <TeamLogo 
                    teamName={teams[0]} 
                    logoState={logoState} 
                    setLogoState={setLogoState} 
                  />
                )}
                <div className="flex-1 min-w-0 px-2">
                  <div className="text-center">
                    <div className="text-xs text-slate-400 mb-1">
                      Futbol
                    </div>
                    <div className="text-xs text-slate-500 mb-2">
                      {match.time}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-white text-sm font-medium text-right flex-1">
                        {teams[0] || 'Takım 1'}
                      </div>
                      <div className="text-slate-400 text-xs mx-2">
                        VS
                      </div>
                      <div className="text-white text-sm font-medium text-left flex-1">
                        {teams[1] || 'Takım 2'}
                      </div>
                    </div>
                  </div>
                </div>
                {teams[1] && (
                  <TeamLogo 
                    teamName={teams[1]} 
                    logoState={logoState} 
                    setLogoState={setLogoState} 
                  />
                )}
              </div>

              {selectedMatch?.id === match.id && (
                <div className="text-green-400 ml-2 flex-shrink-0">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
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