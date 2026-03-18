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
    <div className="divide-y divide-slate-700/50">
      {matches.map((match) => {
        const teams = parseMatchTeams(match.name);
        const isSelected = selectedMatch?.id === match.id;
        return (
          <button
            key={match.id}
            onClick={() => onMatchSelect(match)}
            className={`w-full text-left p-4 relative ${
              isSelected
                ? "bg-green-500/20 border-l-4 border-green-500"
                : "hover:bg-slate-700/50"
            }`}
          >
            <div className="flex flex-col gap-2.5">
              {/* Kategori ve Özel Etiket */}
              <div className="flex items-center gap-2 text-xs">
                {match.category && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-300 font-medium">
                    {match.category}
                  </span>
                )}
                {match.special && (
                  <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 font-bold border border-yellow-500/30">
                    ⭐ {match.special}
                  </span>
                )}
              </div>
              
              {/* Saat ve Lig */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-green-400 font-semibold">🕒 {match.time}</span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-400">{match.league}</span>
              </div>
              
              {/* Takımlar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 flex-1">
                  {match.homeLogo ? (
                    <img src={match.homeLogo} alt="Home" className="w-6 h-6 object-contain" />
                  ) : teams[0] && (
                    <TeamLogo 
                      teamName={teams[0]} 
                      logoState={logoState} 
                      setLogoState={setLogoState} 
                    />
                  )}
                  <div className="text-white text-sm font-semibold">
                    {teams[0] || 'Takım 1'}
                  </div>
                </div>
                
                <div className="px-3 py-1 rounded-full bg-slate-700/50 text-slate-300 text-xs font-bold">VS</div>
                
                <div className="flex items-center gap-2.5 flex-1 justify-end">
                  <div className="text-white text-sm font-semibold">
                    {teams[1] || 'Takım 2'}
                  </div>
                  {match.awayLogo ? (
                    <img src={match.awayLogo} alt="Away" className="w-6 h-6 object-contain" />
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

            {isSelected && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 bg-green-400 rounded-full" />
            )}
          </button>
        );
      })}
      {matches.length === 0 && (
        <div className="p-8 text-center">
          <div className="text-slate-500 text-4xl mb-3">⚽</div>
          <div className="text-slate-400 text-sm">Henüz maç yok</div>
        </div>
      )}
    </div>
  );
};

export default MatchList;