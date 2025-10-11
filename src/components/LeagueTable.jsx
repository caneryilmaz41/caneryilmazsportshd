import { useState } from 'react';

const LeagueTable = () => {
  const [selectedLeague, setSelectedLeague] = useState('turkey');

  const leagues = {
    'turkey': { name: 'Türkiye Süper Lig', url: 'turkey/super-lig' },
    'england': { name: 'Premier League', url: 'england/premier-league' },
    'spain': { name: 'La Liga', url: 'spain/primera-division' },
    'italy': { name: 'Serie A', url: 'italy/serie-a' },
    'france': { name: 'Ligue 1', url: 'france/ligue-1' },
    'germany': { name: 'Bundesliga', url: 'germany/bundesliga' }
  };

  const getIframeUrl = (leagueKey) => {
    const urls = {
      'turkey': 'https://www.fctables.com/turkey/super-lig/iframe/?type=table&lang_id=7&country=220&template=33&stage=&team=&timezone=Europe/Istanbul&time=24&po=1&ma=1&wi=1&dr=1&los=1&gf=1&ga=1&gd=1&pts=1&ng=0&form=0&width=300&height=400&font=Verdana&fs=11&lh=28&bg=1e293b&fc=fff&logo=0&tlink=0&ths=1&thb=1&thba=10b981&thc=0f172a&bc=1e293b&hob=334155&hobc=1e293b&lc=475569&sh=0&hfb=1&hbc=0f172a&hfc=ffffff',
      'england': 'https://www.fctables.com/england/premier-league/iframe/?type=table&lang_id=7&country=14&template=33&stage=&team=&timezone=Europe/Istanbul&time=24&po=1&ma=1&wi=1&dr=1&los=1&gf=1&ga=1&gd=1&pts=1&ng=0&form=0&width=300&height=400&font=Verdana&fs=11&lh=28&bg=1e293b&fc=fff&logo=0&tlink=0&ths=1&thb=1&thba=10b981&thc=0f172a&bc=1e293b&hob=334155&hobc=1e293b&lc=475569&sh=0&hfb=1&hbc=0f172a&hfc=ffffff',
      'spain': 'https://www.fctables.com/spain/primera-division/iframe/?type=table&lang_id=7&country=67&template=33&stage=&team=&timezone=Europe/Istanbul&time=24&po=1&ma=1&wi=1&dr=1&los=1&gf=1&ga=1&gd=1&pts=1&ng=0&form=0&width=300&height=400&font=Verdana&fs=11&lh=28&bg=1e293b&fc=fff&logo=0&tlink=0&ths=1&thb=1&thba=10b981&thc=0f172a&bc=1e293b&hob=334155&hobc=1e293b&lc=475569&sh=0&hfb=1&hbc=0f172a&hfc=ffffff',
      'italy': 'https://www.fctables.com/italy/serie-a/iframe/?type=table&lang_id=7&country=108&template=33&stage=&team=&timezone=Europe/Istanbul&time=24&po=1&ma=1&wi=1&dr=1&los=1&gf=1&ga=1&gd=1&pts=1&ng=0&form=0&width=300&height=400&font=Verdana&fs=11&lh=28&bg=1e293b&fc=fff&logo=0&tlink=0&ths=1&thb=1&thba=10b981&thc=0f172a&bc=1e293b&hob=334155&hobc=1e293b&lc=475569&sh=0&hfb=1&hbc=0f172a&hfc=ffffff',
      'france': 'https://www.fctables.com/france/ligue-1/iframe/?type=table&lang_id=7&country=16&template=33&stage=&team=&timezone=Europe/Istanbul&time=24&po=1&ma=1&wi=1&dr=1&los=1&gf=1&ga=1&gd=1&pts=1&ng=0&form=0&width=300&height=400&font=Verdana&fs=11&lh=28&bg=1e293b&fc=fff&logo=0&tlink=0&ths=1&thb=1&thba=10b981&thc=0f172a&bc=1e293b&hob=334155&hobc=1e293b&lc=475569&sh=0&hfb=1&hbc=0f172a&hfc=ffffff',
      'germany': 'https://www.fctables.com/germany/bundesliga/iframe/?type=table&lang_id=7&country=81&template=33&stage=&team=&timezone=Europe/Istanbul&time=24&po=1&ma=1&wi=1&dr=1&los=1&gf=1&ga=1&gd=1&pts=1&ng=0&form=0&width=300&height=400&font=Verdana&fs=11&lh=28&bg=1e293b&fc=fff&logo=0&tlink=0&ths=1&thb=1&thba=10b981&thc=0f172a&bc=1e293b&hob=334155&hobc=1e293b&lc=475569&sh=0&hfb=1&hbc=0f172a&hfc=ffffff'
    };
    return urls[leagueKey];
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-600 mb-4 overflow-hidden">
      <div className="flex justify-between items-center p-4 pb-2">
        <h3 className="text-lg font-semibold text-green-400">Puan Durumu</h3>
        <select 
          value={selectedLeague}
          onChange={(e) => setSelectedLeague(e.target.value)}
          className="bg-slate-700 text-white text-xs rounded px-2 py-1 border border-slate-600 max-w-32"
        >
          {Object.entries(leagues).map(([key, league]) => (
            <option key={key} value={key}>{league.name}</option>
          ))}
        </select>
      </div>
      
      <div className="px-4 pb-4">
        <iframe
          src={getIframeUrl(selectedLeague)}
          width="100%"
          height="400"
          frameBorder="0"
          className="rounded border border-slate-600"
          title={`${leagues[selectedLeague].name} Puan Durumu`}
        />
      </div>
    </div>
  );
};

export default LeagueTable;