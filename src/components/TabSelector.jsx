const TabSelector = ({ 
  activeTab, 
  onTabChange, 
  matchesCount, 
  channelsCount 
}) => {
  return (
    <div className="relative bg-slate-800/90 rounded-2xl border border-slate-700/50 p-1.5 shadow-lg">
      <div className="flex relative">
        <div
          className={`absolute top-1 bottom-1 bg-green-500 rounded-xl ${
            activeTab === "matches"
              ? "left-1 right-1/2 mr-0.5"
              : "left-1/2 right-1 ml-0.5"
          }`}
        ></div>

        <button
          onClick={() => onTabChange("matches")}
          className={`relative flex-1 py-3.5 px-4 text-sm font-bold tracking-wide flex items-center justify-center gap-2.5 rounded-xl ${
            activeTab === "matches"
              ? "text-white"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span className="text-xs lg:text-sm">⚽ MAÇLAR</span>
          <span
            className={`text-xs px-2 py-1 rounded-full font-semibold ${
              activeTab === "matches"
                ? "bg-white/20 text-white"
                : "bg-slate-700/50 text-slate-400"
            }`}
          >
            {matchesCount}
          </span>
        </button>

        <button
          onClick={() => onTabChange("channels")}
          className={`relative flex-1 py-3.5 px-4 text-sm font-bold tracking-wide flex items-center justify-center gap-2.5 rounded-xl ${
            activeTab === "channels"
              ? "text-white"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span className="text-xs lg:text-sm">📺 KANALLAR</span>
          <span
            className={`text-xs px-2 py-1 rounded-full font-semibold ${
              activeTab === "channels"
                ? "bg-white/20 text-white"
                : "bg-slate-700/50 text-slate-400"
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