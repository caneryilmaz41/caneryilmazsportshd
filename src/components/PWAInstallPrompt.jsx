import { useEffect, useState } from 'react';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);

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
    <div className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-md rounded-xl border border-emerald-500/30 bg-slate-900/95 p-3 shadow-2xl backdrop-blur">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 text-base">📲</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-100">Ana Ekrana Ekle</p>
          {isIos && !deferredPrompt ? (
            <p className="mt-1 text-xs text-slate-300">
              Safari menüsünden <span className="font-semibold text-white">Paylaş</span> ve sonra
              <span className="font-semibold text-white"> Ana Ekrana Ekle</span> seçin.
            </p>
          ) : (
            <p className="mt-1 text-xs text-slate-300">
              Siteyi uygulama gibi kullanmak için yükleyin. Daha hızlı açılır.
            </p>
          )}
        </div>
      </div>

      {deferredPrompt ? (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={handleInstall}
            className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Yükle
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default PWAInstallPrompt;
