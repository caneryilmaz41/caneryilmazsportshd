import { useEffect } from 'react';

const SPLASH_BG =
  'linear-gradient(135deg, rgba(15,23,42,0.92), rgba(30,41,59,0.88)), url("https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")';

/* Açılış ekranı index.html içinde (#boot-preloader); uygulama hazır olunca kapatır */
const AppSplashScreen = () => {
  useEffect(() => {
    window.__hideBootPreloader?.();
  }, []);

  return null;
};

export { SPLASH_BG };
export default AppSplashScreen;
