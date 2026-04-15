import { useEffect, useState } from 'react';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    setIsInstalled(Boolean(standalone));
    setIsIos(/iphone|ipad|ipod/i.test(window.navigator.userAgent));

    const onBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    const onInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  if (isInstalled) return null;
  if (!deferredPrompt && !isIos) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-md rounded-2xl border border-emerald-400/25 bg-gradient-to-br from-slate-900/95 to-slate-800/95 p-3.5 shadow-2xl backdrop-blur">
      <div className="flex items-start gap-3">
        <img src="/icons/icon-192.svg" alt="CanerYilmaz Sports" className="h-9 w-9 rounded-lg ring-1 ring-emerald-400/35" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-100">CanerYilmaz Sports Uygulaması</p>
          {isIos && !deferredPrompt ? (
            <p className="mt-1 text-xs text-slate-300">
              iPhone'da tek dokunuşla rehberi acip hizli kurulum yapin.
            </p>
          ) : (
            <p className="mt-1 text-xs text-slate-300">
              Ana ekrana ekleyin, uygulama gibi acilsin ve premium gorunsun.
            </p>
          )}
        </div>
      </div>

      {deferredPrompt ? (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={handleInstall}
            className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            Simdi Yukle
          </button>
        </div>
      ) : (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowIosGuide((prev) => !prev)}
            className="rounded-lg border border-slate-500/40 bg-slate-700/30 px-3 py-1.5 text-xs font-semibold text-slate-100 transition hover:bg-slate-700/45"
          >
            {showIosGuide ? 'Rehberi Gizle' : 'iPhone Icin Kolay Kurulum'}
          </button>

          {showIosGuide ? (
            <div className="mt-2 rounded-xl border border-slate-500/30 bg-black/20 p-2.5 text-xs text-slate-200">
              <p className="font-semibold text-emerald-300">3 adimda kurulum:</p>
              <p className="mt-1">1) Safari alt bardaki <span className="font-semibold text-white">Paylas</span> simgesine dokun.</p>
              <p>2) Listeden <span className="font-semibold text-white">Ana Ekrana Ekle</span> sec.</p>
              <p>3) Adi <span className="font-semibold text-white">CanerYilmaz Sports</span> olarak onayla.</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default PWAInstallPrompt;
