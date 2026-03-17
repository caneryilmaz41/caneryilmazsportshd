const Footer = () => {
  return (
    <footer className="mt-16 border-t border-slate-700/30 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-t from-green-500/5 to-transparent pointer-events-none"></div>
      <div className="relative max-w-7xl mx-auto px-3 lg:px-6 py-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <img 
              src="/logom.png" 
              alt="Logo" 
              className="relative h-8 opacity-70 group-hover:opacity-100 transition-all duration-300" 
            />
          </div>
          <div className="text-slate-400 text-sm font-light flex items-center gap-2">
            <span>© 2026
              
            </span>
            <span className="text-green-400 font-medium">caneryılmazsportshd</span>
          </div>
          <div className="text-slate-500 text-xs">
            Tüm hakları saklıdır
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;