const TabSelector = ({ 
  activeTab, 
  onTabChange, 
  matchesCount, 
  channelsCount 
}) => {
  return (
    <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-1.5 shadow-xl shadow-black/20">
      <div className="flex relative">
        <div
          className={`absolute top-1 bottom-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl transition-all duration-500 ease-out shadow-lg shadow-green-500/30 ${
            activeTab === "matches"
              ? "left-1 right-1/2 mr-0.5"
              : "left-1/2 right-1 ml-0.5"
          }`}
          style={{ willChange: 'left, right' }}
        ></div>

        <button
          onClick={() => onTabChange("matches")}
          className={`relative flex-1 py-3.5 px-4 text-sm font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2.5 rounded-xl ${
            activeTab === "matches"
              ? "text-white scale-105"
              : "text-slate-400 hover:text-slate-200 hover:scale-102"
          }`}
          style={{ willChange: 'transform' }}
        >
          <span className="text-xs lg:text-sm">⚽ MAÇLAR</span>
          <span
            className={`text-xs px-2 py-1 rounded-full font-semibold transition-all duration-300 ${
              activeTab === "matches"
                ? "bg-white/20 text-white shadow-lg"
                : "bg-slate-700/50 text-slate-400"
            }`}
          >
            {matchesCount}
          </span>
        </button>

        <button
          onClick={() => onTabChange("channels")}
          className={`relative flex-1 py-3.5 px-4 text-sm font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2.5 rounded-xl ${
            activeTab === "channels"
              ? "text-white scale-105"
              : "text-slate-400 hover:text-slate-200 hover:scale-102"
          }`}
          style={{ willChange: 'transform' }}
        >
          <span className="text-xs lg:text-sm">📺 KANALLAR</span>
          <span
            className={`text-xs px-2 py-1 rounded-full font-semibold transition-all duration-300 ${
              activeTab === "channels"
                ? "bg-white/20 text-white shadow-lg"
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