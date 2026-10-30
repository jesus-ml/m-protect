import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore, View } from '../store';
import { Kbd } from './ui';
import { cn } from '../lib/utils';

type Item = { id: string; title: string; sub?: string; group: string; run: () => void };

/** Paleta de comandos (⌘K / Ctrl+K): productos, corriente, vistas y preferencias. */
export function CommandPalette() {
  const { paletteOpen, setPaletteOpen, catalog, select, setView, params, setParams, theme, setTheme, lang, setLang, exit, t, stage, setSettingsOpen } = useStore();
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (stage !== 'app') return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPaletteOpen(!paletteOpen); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [paletteOpen, setPaletteOpen, stage]);

  useEffect(() => { if (paletteOpen) { setQ(''); setIdx(0); setTimeout(() => inputRef.current?.focus(), 10); } }, [paletteOpen]);

  const close = () => setPaletteOpen(false);
  const go = (v: View) => () => { setView(v); close(); };

  const items = useMemo<Item[]>(() => {
    const s = q.trim().toLowerCase();
    const out: Item[] = [];
    const amp = s.match(/^(\d{1,4})\s*a?$/);
    if (amp) out.push({ id: 'amp', group: t('pal.action'), title: t('pal.amp', { a: amp[1] }), sub: `${params.poles} · ${params.series || 'NF / NV'}`,
      run: () => { setParams({ ...params, amperage: Number(amp[1]) }); setView('selector'); close(); } });

    out.push(...catalog
      .filter(p => !s || `${p.Codigo} ${p.Model} ${p.Amperaje}a ${p.Descripción}`.toLowerCase().includes(s))
      .slice(0, s ? 8 : 4)
      .map<Item>(p => ({ id: p.Codigo, group: t('pal.products'), title: `${p.Model} · ${p.Amperaje} A · ${p.Polos}`, sub: p.Codigo,
        run: () => { select(p.Codigo); setView('selector'); close(); } })));

    const rest: Item[] = [
      { id: 'v-sel', group: t('pal.goto'), title: t('nav.selector'), run: go('selector') },
      { id: 'v-cmp', group: t('pal.goto'), title: t('nav.compare'), run: go('compare') },
      { id: 'v-quo', group: t('pal.goto'), title: t('nav.quote'), run: go('quote') },
      { id: 'v-cat', group: t('pal.goto'), title: t('pal.catalog'), run: go('catalog') },
      { id: 'v-his', group: t('pal.goto'), title: t('nav.history'), run: go('history') },
      { id: 'p-theme', group: t('pal.prefs'), title: theme === 'dark' ? t('pal.light') : t('pal.dark'), run: () => { setTheme(theme === 'dark' ? 'light' : 'dark'); close(); } },
      { id: 'p-lang', group: t('pal.prefs'), title: t('pal.lang'), run: () => { setLang(lang === 'es' ? 'en' : 'es'); close(); } },
      { id: 'p-fs', group: t('pal.prefs'), title: document.fullscreenElement ? t('fs.exit') : t('fs.enter'),
        run: () => { close(); const el: any = document.documentElement; (document.fullscreenElement ? document.exitFullscreen() : el.requestFullscreen?.())?.catch?.(() => {}); } },
      { id: 'p-set', group: t('pal.prefs'), title: t('settings'), run: () => { close(); setSettingsOpen(true); } },
      { id: 'p-exit', group: t('pal.prefs'), title: t('pal.exit'), run: () => { exit(); } },
    ];
    out.push(...rest.filter(n => !s || n.title.toLowerCase().includes(s)));
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, catalog, params, theme, lang, t]);

  useEffect(() => { setIdx(0); }, [q]);
  useEffect(() => { listRef.current?.querySelector(`[data-i="${idx}"]`)?.scrollIntoView({ block: 'nearest' }); }, [idx]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(items.length - 1, i + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx(i => Math.max(0, i - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); items[idx]?.run(); }
    else if (e.key === 'Escape') close();
  };

  let lastGroup = '';
  return (
    <AnimatePresence>
      {paletteOpen && (
        <div className="fixed inset-0 z-[300] flex items-start justify-center pt-[14vh] px-4" role="dialog" aria-modal="true" aria-label={t('search')}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/10" onClick={close} />
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ type: 'spring', stiffness: 520, damping: 36 }}
            className="relative w-full max-w-xl rounded-[16px] bg-sheet/95 backdrop-blur-xl shadow-pop overflow-hidden">
            <div className="flex items-center gap-3 px-5 h-14 border-b border-line">
              <input ref={inputRef} id="palette-q" value={q} onChange={e => setQ(e.target.value)} onKeyDown={onKey}
                placeholder={t('pal.ph')} className="flex-1 bg-transparent text-[20px] font-light focus:outline-none focus-visible:outline-none focus-visible:shadow-none placeholder:text-faint" />
              <Kbd>esc</Kbd>
            </div>
            <div ref={listRef} className="max-h-[50vh] overflow-y-auto scroll-thin py-2">
              {items.length === 0 && <p className="text-center text-sub text-[13px] py-8">{t('pal.none', { q })}</p>}
              {items.map((it, i) => {
                const header = it.group !== lastGroup ? (lastGroup = it.group) : null;
                return (
                  <React.Fragment key={it.id}>
                    {header && <p className="px-5 pt-3 pb-1 text-[11px] font-semibold text-faint">{header}</p>}
                    <button data-i={i} onMouseMove={() => setIdx(i)} onClick={it.run}
                      className={cn('relative w-[calc(100%-12px)] mx-1.5 rounded-[8px] flex items-center gap-3 px-3.5 py-2 text-left text-[14px]', i === idx && 'bg-red text-on-ink')}>
                      <span className="flex-1 truncate text-[13px]">{it.title}</span>
                      {it.sub && <span className={cn('font-mono text-[11px] truncate', i === idx ? 'text-on-ink/80' : 'text-sub')}>{it.sub}</span>}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
            <div className="flex items-center gap-4 px-5 h-9 border-t border-line text-[11px] text-sub">
              <span className="flex items-center gap-1.5"><Kbd>↑</Kbd><Kbd>↓</Kbd> {t('pal.move')}</span>
              <span className="flex items-center gap-1.5"><Kbd>↵</Kbd> {t('pal.open')}</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
