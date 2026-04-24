import { useEffect, useState } from 'react';

const SPLASH_BG =
  'linear-gradient(135deg, rgba(15,23,42,0.92), rgba(30,41,59,0.88)), url("https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")';

const AppSplashScreen = () => {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (!standalone) return;

    setVisible(true);
    const fadeTimer = window.setTimeout(() => setExiting(true), 1150);
    const hideTimer = window.setTimeout(() => setVisible(false), 1580);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-[420ms] ease-out ${
        exiting ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      style={{
        backgroundImage: SPLASH_BG,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div
        className={`rounded-2xl border border-white/20 bg-slate-900/45 px-8 py-7 shadow-2xl backdrop-blur-sm transition-transform duration-[420ms] ease-out ${
          exiting ? 'scale-[0.98]' : 'scale-100'
        }`}
      >
        <img src="/logom.png" alt="caneryılmazsports" className="mx-auto h-20 w-auto object-contain" />
        <div className="mt-4 h-0.5 w-36 max-w-full overflow-hidden rounded-full bg-slate-800/90">
          <div className="relative h-full w-full">
            <div className="stream-open-shine" />
          </div>
        </div>
      </div>
    </div>
  );
};

export { SPLASH_BG };
export default AppSplashScreen;
