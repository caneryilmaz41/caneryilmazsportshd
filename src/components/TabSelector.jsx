const TabSelector = ({ 
  activeTab, 
  onTabChange, 
  matchesCount, 
  channelsCount 
}) => {
  return (
    <div className="relative bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-1">
      <div className="flex relative">
        <div
          className={`absolute top-1 bottom-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg transition-all duration-300 ease-out ${
            activeTab === "matches"
              ? "left-1 right-1/2 mr-0.5"
              : "left-1/2 right-1 ml-0.5"
          }`}
        ></div>

        <button
          onClick={() => onTabChange("matches")}
          className={`relative flex-1 py-3 px-3 text-sm font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === "matches"
              ? "text-green-400"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span className="text-xs">MAÇLAR</span>
          <span
            className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
              activeTab === "matches"
                ? "bg-green-500/20 text-green-400"
                : "bg-slate-600/50 text-slate-400"
            }`}
          >
            {matchesCount}
          </span>
        </button>

        <button
          onClick={() => onTabChange("channels")}
          className={`relative flex-1 py-3 px-3 text-sm font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === "channels"
              ? "text-green-400"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span className="text-xs">KANALLAR</span>
          <span
            className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
              activeTab === "channels"
                ? "bg-green-500/20 text-green-400"
                : "bg-slate-600/50 text-slate-400"
            }`}
          >
            {channelsCount}
          </span>
        </button>
      </div>
    </div>
  );
};

export default TabSelector;