import { useEffect, useState } from 'react';
import { BRAND } from '../config';
import { cn } from '../lib/utils';

/** Prueba una lista de URLs y devuelve la primera que carga como imagen, o null. */
function firstLoadable(urls: string[]): Promise<string | null> {
  return urls.reduce<Promise<string | null>>(
    (prev, url) => prev.then(found => found ?? new Promise(res => {
      const img = new Image();
      img.onload = () => res(url);
      img.onerror = () => res(null);
      img.src = url;
    })),
    Promise.resolve(null),
  );
}

let cache: Promise<{ light: string | null; dark: string | null }> | null = null;
export function findLogos() {
  cache ??= Promise.all([firstLoadable(BRAND.logos), firstLoadable(BRAND.logosDark)]).then(([light, dark]) => ({ light, dark }));
  return cache;
}

export function useLogos() {
  const [logos, setLogos] = useState<{ light: string | null; dark: string | null }>({ light: null, dark: null });
  useEffect(() => { findLogos().then(setLogos); }, []);
  return logos;
}

/** Logo (o el nombre en texto si no hay archivo). `size` en píxeles de alto. */
export function Logo({ size = 28, className }: { size?: number; className?: string }) {
  const logos = useLogos();
  const style = { height: size, width: 'auto' };
  if (logos.light) {
    return (
      <span className={cn('block', className)}>
        <img src={logos.light} alt={BRAND.company || BRAND.app} style={style} className={cn('max-w-full', logos.dark && 'brand-light')} />
        {logos.dark && <img src={logos.dark} alt={BRAND.company || BRAND.app} style={style} className="brand-dark max-w-full" />}
      </span>
    );
  }
  if (!BRAND.company) return null;
  return (
    <span className={cn('inline-flex items-center gap-2 text-ink font-bold tracking-[0.12em] uppercase', className)} style={{ fontSize: Math.max(11, size * 0.42) }}>
      <span aria-hidden className="w-[5px] h-[5px] bg-red" />{BRAND.company}
    </span>
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex flex-col gap-2 min-w-0">
      <Logo size={compact ? 22 : 30} />
      {!compact && <span className="text-[13px] font-semibold text-ink">{BRAND.app}</span>}
    </div>
  );
}
