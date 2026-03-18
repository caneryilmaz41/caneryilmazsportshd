const Footer = () => {
  return (
    <footer className="mt-16 border-t border-slate-700/30">
      <div className="max-w-7xl mx-auto px-3 lg:px-6 py-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <img src="/logom.png" alt="Logo" className="h-8 opacity-70" />
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