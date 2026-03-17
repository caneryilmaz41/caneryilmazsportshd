const Header = () => {
  return (
    <div className="relative py-4 lg:py-8 border-b border-slate-700/30 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent pointer-events-none"></div>
      <div className="relative flex items-center justify-center">
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <img 
            src="/logom.png" 
            alt="Logo" 
            className="relative h-8 lg:h-14 transition-transform duration-300 group-hover:scale-105" 
          />
        </div>
      </div>
    </div>
  );
};

export default Header;