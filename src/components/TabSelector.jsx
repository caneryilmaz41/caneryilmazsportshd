const TabSelector = ({ activeTab, onTabChange, matchesCount, channelsCount }) => {
  const tabs = [
    { id: 'matches', label: 'Maçlar', icon: '⚽', count: matchesCount },
    { id: 'program', label: 'Program', icon: '🗓️' },
    { id: 'channels', label: 'Kanallar', icon: '📺', count: channelsCount },
  ];

  return (
    <div className="rounded-xl border border-white/[0.06] bg-slate-950/60 p-1">
      <div className="grid grid-cols-3 gap-1" role="tablist">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex min-w-0 items-center justify-center gap-1.5 rounded-lg px-1.5 py-2 text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-900/40 ring-1 ring-emerald-300/30'
                  : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-200'
              }`}
            >
              <span className="hidden text-sm opacity-90 min-[420px]:inline xl:hidden">{tab.icon}</span>
              <span className="truncate tracking-wide">{tab.label}</span>
              {tab.count != null ? (
              <span
                className={`min-w-[1.25rem] rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                  isActive ? 'bg-white/20 text-white' : 'bg-white/[0.06] text-slate-500'
                }`}
              >
                {tab.count}
              </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TabSelector;
