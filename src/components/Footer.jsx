const Footer = () => {
  return (
    <footer className="mt-10 border-t border-white/[0.06] lg:mt-14">
      <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row lg:px-6">
        <img src="/logom.png" alt="caneryılmazsports" className="h-7 w-auto opacity-80" />
        <p className="text-center text-xs text-slate-500 sm:text-right">
          © 2026 <span className="font-semibold text-emerald-400">caneryılmazsportshd</span> · Tüm hakları saklıdır
        </p>
      </div>
    </footer>
  );
};

export default Footer;
