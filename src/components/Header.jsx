const Header = () => {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#060a13]/75 backdrop-blur-xl supports-[backdrop-filter]:bg-[#060a13]/60">
      <div className="mx-auto grid h-14 max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 lg:h-16 lg:px-6">
        <div aria-hidden />

        <a href="/" className="flex min-w-0 items-center justify-center" aria-label="Ana sayfa">
          <img src="/logom.png" alt="caneryılmazsports" className="h-7 w-auto object-contain sm:h-8 lg:h-10" />
        </a>

        <div className="flex items-center justify-end gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/10 px-2 py-1 text-[10px] min-[420px]:px-3 font-bold uppercase tracking-[0.18em] text-red-300 sm:text-[11px]">
            <span className="live-dot" aria-hidden />
            <span className="sr-only min-[420px]:not-sr-only">Canlı</span>
          </span>
          <span className="hidden rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-300 md:inline-flex">
            HD Yayın
          </span>
        </div>
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent"
        aria-hidden
      />
    </header>
  );
};

export default Header;
