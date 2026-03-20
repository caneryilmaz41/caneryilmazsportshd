const TabSelector = ({ activeTab, onTabChange, matchesCount, channelsCount }) => {
  const tabs = [
    { id: 'matches', label: 'Maçlar', icon: '⚽', count: matchesCount },
    { id: 'channels', label: 'Kanallar', icon: '📺', count: channelsCount },
  ];

  return (
    <div className="rounded-xl border border-slate-600/40 bg-slate-900/60 p-1 shadow-inner backdrop-blur-sm">
      <div className="grid grid-cols-2 gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`relative flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-b from-green-600 to-green-700 text-white shadow-md shadow-green-900/30 ring-1 ring-green-400/30'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <span className="text-sm opacity-90">{tab.icon}</span>
              <span className="tracking-wide">{tab.label}</span>
              <span
                className={`min-w-[1.25rem] rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-700/60 text-slate-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TabSelector;
