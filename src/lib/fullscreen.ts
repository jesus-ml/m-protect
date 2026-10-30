import { useEffect, useState } from 'react';

/** Pantalla completa con la API del navegador. Algunos visores la bloquean: `available` lo indica. */
export function useFullscreen() {
  const available = typeof document !== 'undefined' && !!(document.fullscreenEnabled || (document as any).webkitFullscreenEnabled);
  const [active, setActive] = useState(() => typeof document !== 'undefined' && !!document.fullscreenElement);
  useEffect(() => {
    const on = () => setActive(!!(document.fullscreenElement || (document as any).webkitFullscreenElement));
    document.addEventListener('fullscreenchange', on);
    document.addEventListener('webkitfullscreenchange', on);
    return () => { document.removeEventListener('fullscreenchange', on); document.removeEventListener('webkitfullscreenchange', on); };
  }, []);
  const toggle = async () => {
    try {
      if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
        await (document.exitFullscreen?.() ?? (document as any).webkitExitFullscreen?.());
      } else {
        const el: any = document.documentElement;
        await (el.requestFullscreen?.() ?? el.webkitRequestFullscreen?.());
      }
      return true;
    } catch {
      return false;
    }
  };
  return { available, active, toggle };
}
