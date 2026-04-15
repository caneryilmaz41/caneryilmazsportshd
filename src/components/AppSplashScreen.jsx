import { useEffect, useState } from 'react';

const AppSplashScreen = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (!standalone) return;

    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), 1700);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{
        backgroundImage:
          'linear-gradient(135deg, rgba(15,23,42,0.92), rgba(30,41,59,0.88)), url("https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="rounded-2xl border border-white/20 bg-slate-900/45 px-8 py-7 shadow-2xl backdrop-blur-sm">
        <img src="/logom.png" alt="caneryılmazsports" className="mx-auto h-20 w-auto object-contain" />
      </div>
    </div>
  );
};

export default AppSplashScreen;
