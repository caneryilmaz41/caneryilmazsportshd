import { getChannelLogoPath } from '../utils/channelUtils';

const ChannelList = ({ 
  channels, 
  selectedMatch, 
  onChannelSelect 
}) => {
  const filteredChannels = channels.filter((channel) => {
    const name = channel.name?.toLowerCase() || '';
    const hasVs = name.includes(' vs ') || name.includes(' - ') || name.includes(' x ');
    const hasTeamNames = name.includes('galatasaray') || name.includes('fenerbahçe') || name.includes('beşiktaş') || name.includes('trabzonspor');
    const isChannel = name.includes('tv') || name.includes('spor') || name.includes('kanal') || name.includes('sport');
    
    return !hasVs && !hasTeamNames && (isChannel || channel.status?.includes('/'));
  });

  return (
    <div className="divide-y divide-slate-700/50">
      {filteredChannels.map((channel) => {
        const isSelected = selectedMatch?.id === channel.id;
        return (
          <button
            key={channel.id}
            onClick={() => onChannelSelect(channel)}
            className={`w-full text-left p-4 transition-all duration-300 relative group ${
              isSelected
                ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-l-4 border-green-500 shadow-lg shadow-green-500/10"
                : "hover:bg-slate-700/50 hover:translate-x-1"
            }`}
            style={{ willChange: 'transform, background-color' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="relative">
                  <div className={`absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-300 ${
                    isSelected ? 'opacity-50' : ''
                  }`}></div>
                  <img 
                    src={getChannelLogoPath(channel.name)} 
                    alt={channel.name}
                    className="relative w-10 h-10 object-contain flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-white truncate">
                    {channel.name}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-400 font-medium">
                      {channel.status}
                    </span>
                  </div>
                </div>
              </div>
              {isSelected && (
                <div className="ml-3">
                  <div className="relative">
                    <div className="text-2xl animate-pulse">▶️</div>
                  </div>
                </div>
              )}
            </div>
          </button>
        );
      })}

      {filteredChannels.length === 0 && (
        <div className="p-8 text-center">
          <div className="text-slate-500 text-4xl mb-3">📺</div>
          <div className="text-slate-400 text-sm">Henüz kanal yok</div>
        </div>
      )}
    </div>
  );
};

export default ChannelList;