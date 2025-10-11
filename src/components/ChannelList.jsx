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
    <div className="divide-y divide-slate-700">
      {filteredChannels.map((channel) => (
        <button
          key={channel.id}
          onClick={() => onChannelSelect(channel)}
          className={`w-full text-left p-4 hover:bg-slate-700 transition-colors ${
            selectedMatch?.id === channel.id
              ? "bg-blue-600/20 border-l-4 border-blue-500"
              : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <img 
                src={getChannelLogoPath(channel.name)} 
                alt={channel.name}
                className="w-8 h-8 object-contain flex-shrink-0"
                onError={(e) => e.target.style.display = 'none'}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-white truncate">
                  {channel.name}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {channel.status}
                </div>
              </div>
            </div>
            {selectedMatch?.id === channel.id && (
              <div className="text-blue-400 ml-2">▶️</div>
            )}
          </div>
        </button>
      ))}

      {filteredChannels.length === 0 && (
        <div className="p-6 text-center text-slate-400 text-sm">
          Henüz kanal yok
        </div>
      )}
    </div>
  );
};

export default ChannelList;