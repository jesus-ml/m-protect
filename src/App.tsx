import React, { useEffect } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { Columns3, Database, History, Home, LogOut, Maximize2, Minimize2, Settings2, PanelRight, Search, ShoppingBag, SlidersHorizontal, X } from 'lucide-react';
import { StoreProvider, StylePref, ThemePref, useStore, View } from './store';
import { Brand } from './components/Brand';
import { CommandPalette } from './components/CommandPalette';
import { Inspector } from './components/Inspector';
import { Tabs } from './components/ui';
import { SelectorView, useLiveResult } from './views/SelectorView';
import { CatalogView, CompareView, HistoryView, QuoteView } from './views/OtherViews';
import { ExitScreen, StartScreen } from './views/Screens';
import { BRAND } from './config';
import { Lang } from './i18n';
import { cn } from './lib/utils';
import { useFullscreen } from './lib/fullscreen';

const NAV: { id: View; key: 'nav.selector' | 'nav.compare' | 'nav.quote' | 'nav.catalog' | 'nav.history'; icon: React.ElementType }[] = [
  { id: 'selector', key: 'nav.selector', icon: SlidersHorizontal },
  { id: 'compare', key: 'nav.compare', icon: Columns3 },
  { id: 'quote', key: 'nav.quote', icon: ShoppingBag },
  { id: 'catalog', key: 'nav.catalog', icon: Database },
  { id: 'history', key: 'nav.history', icon: History },
];

export default function App() {
  return (
    <StoreProvider>
      {/* Respeta "reducir movimiento" del sistema */}
      <MotionConfig reducedMotion="user">
        <Root />
      </MotionConfig>
    </StoreProvider>
  );
}

function Root() {
  const { stage, style } = useStore();
  return (
    <>
      {style === 'glass' && <GlassBackdrop stage={stage} />}
      <AnimatePresence mode="wait">
        {stage === 'start' && <StartScreen key="start" />}
        {stage === 'app' && <Shell key="app" />}
        {stage === 'exit' && <ExitScreen key="exit" />}
      </AnimatePresence>
      <ToastView />
    </>
  );
}

/** Fondo para el modo Liquid Glass: formas de color muy suaves que se mueven lento detrás del vidrio. */
function GlassBackdrop({ stage }: { stage: string }) {
  return (
    <div aria-hidden data-stage={stage} className="glass-scene fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <span className="blob blob-a" />
      <span className="blob blob-b" />
      <span className="blob blob-c" />
    </div>
  );
}

function Shell() {
  const { view, setView, compare, quote, catalog, isSeed, byCode, selectedCode, params, inspectorOpen, setInspectorOpen, setPaletteOpen, exit, goHome, setSettingsOpen, t } = useStore();
  const result = useLiveResult();
  const selected = selectedCode ? byCode.get(selectedCode) ?? null : null;
  const counts: Partial<Record<View, number>> = { compare: compare.length, quote: quote.reduce((a, l) => a + l.qty, 0) };
  const current = NAV.find(n => n.id === view)!;
  const showInspector = view === 'selector';
  const title = view === 'selector' ? t('title.selector') : t(current.key);

  useEffect(() => { document.title = `${t(current.key)} · ${BRAND.app}`; }, [current, t]);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.985 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }} className="h-full flex flex-col bg-paper origin-center">
      <div className="flex-1 min-h-0 flex">
        {/* Barra lateral */}
        <aside className="hidden md:flex w-56 lg:w-60 shrink-0 flex-col border-r-[0.5px] border-line-strong bg-side backdrop-blur-xl">
          {/* El logo también regresa a la pantalla de inicio */}
          <button onClick={goHome} title={t('home')} className="mx-3 mt-5 mb-5 px-2 py-2 rounded-[8px] text-left hover:bg-[var(--sel)] transition-colors">
            <Brand />
          </button>
          <nav className="px-2.5" aria-label={t('nav.selector')}>
            {NAV.map(n => {
              const on = view === n.id;
              return (
                <button key={n.id} onClick={() => setView(n.id)} aria-current={on ? 'page' : undefined}
                  className="relative w-full flex items-center gap-2.5 h-9 px-2.5 text-[14px] rounded-[7px] text-ink">
                  {on && <motion.span layoutId="nav-sel" aria-hidden className="absolute inset-0 rounded-[7px] bg-[var(--sel)]"
                    transition={{ type: 'spring', stiffness: 520, damping: 42 }} />}
                  <n.icon className="relative w-[17px] h-[17px] text-red" strokeWidth={1.6} />
                  <span className="relative flex-1 text-left">{t(n.key)}</span>
                  {!!counts[n.id] && (
                    <motion.span key={counts[n.id]} initial={{ scale: 1.6, color: 'var(--red)' }} animate={{ scale: 1, color: 'var(--sub)' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 18 }} className="relative text-[12px] tabular inline-block">{counts[n.id]}</motion.span>
                  )}
                </button>
              );
            })}
          </nav>
          <div className="mt-auto px-5 pb-5 space-y-5">
            <p className="text-[11px] text-sub leading-relaxed">
              <span className="text-ink tabular">{t('products', { n: catalog.length })}</span><br />
              {isSeed ? t('catalog.sample') : t('catalog.imported')}
            </p>
            <SettingsButton />
            <div className="grid grid-cols-2 gap-2">
              <button onClick={goHome} className="flex items-center justify-center gap-2 h-9 text-[13px] text-ink rounded-[7px] bg-sheet border-[0.5px] border-line-strong shadow-btn hover:bg-wash transition-colors">
                <Home className="w-3.5 h-3.5" strokeWidth={1.5} /> {t('home')}
              </button>
              <button onClick={exit} className="flex items-center justify-center gap-2 h-9 text-[13px] text-ink rounded-[7px] bg-sheet border-[0.5px] border-line-strong shadow-btn hover:bg-wash transition-colors">
                <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} /> {t('exit')}
              </button>
            </div>
          </div>
        </aside>

        {/* Área principal */}
        <div className="flex-1 min-w-0 flex flex-col">
          <header className="h-[52px] shrink-0 flex items-center gap-4 px-4 sm:px-6 bg-bar border-b-[0.5px] border-line-strong">
            <button onClick={goHome} className="md:hidden" aria-label={t('home')}><Brand compact /></button>
            <h1 className="text-[14px] font-semibold truncate hidden md:block">{title}</h1>
            {view === 'selector' && <HeaderSummary result={result} />}
            <div className="ml-auto flex items-center gap-1.5">
              <button onClick={() => setPaletteOpen(true)} aria-label={t('search')}
                className="hidden md:flex items-center gap-1.5 h-[30px] w-52 px-2.5 rounded-[8px] bg-sheet border-[0.5px] border-line-strong shadow-[inset_0_0.5px_1px_rgba(0,0,0,0.08)] text-[13px] text-faint hover:border-sub transition-colors">
                <Search className="w-3.5 h-3.5" strokeWidth={1.75} /> {t('search')}
              </button>
              <button onClick={() => setPaletteOpen(true)} className="md:hidden w-9 h-9 grid place-items-center text-sub hover:text-ink" aria-label={t('search')}>
                <Search className="w-4 h-4" strokeWidth={1.5} />
              </button>
              <FullscreenButton />
              <button onClick={() => setSettingsOpen(true)} className="md:hidden w-9 h-9 grid place-items-center text-sub hover:text-ink" aria-label={t('settings')}>
                <Settings2 className="w-4 h-4" strokeWidth={1.5} />
              </button>
              {showInspector && selected && (
                <button onClick={() => setInspectorOpen(true)} className="xl:hidden w-8 h-8 grid place-items-center text-sub hover:text-ink" aria-label={t('detail')}>
                  <PanelRight className="w-4 h-4" strokeWidth={1.5} />
                </button>
              )}
              <button onClick={exit} className="md:hidden w-8 h-8 grid place-items-center text-sub hover:text-ink" aria-label={t('exit')}>
                <LogOut className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </header>

          <div className="flex-1 min-h-0 flex">
            <main className="flex-1 min-w-0 overflow-y-auto scroll-thin pb-20 md:pb-8">
              <AnimatePresence mode="wait">
                <motion.div key={view} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}>
                  {view === 'selector' && <SelectorView result={result} />}
                  {view === 'compare' && <CompareView />}
                  {view === 'quote' && <QuoteView />}
                  {view === 'catalog' && <CatalogView />}
                  {view === 'history' && <HistoryView />}
                </motion.div>
              </AnimatePresence>
              {/* Preferencias en móvil, al final de cada vista */}
            </main>

            {showInspector && (
              <aside className="hidden xl:block w-[368px] shrink-0 p-3 pl-0" aria-label={t('detail')}>
                <div className="h-full rounded-[12px] bg-panel border-[0.5px] border-line shadow-card overflow-hidden">
                <Inspector product={selected} requested={params.amperage} />
                </div>
              </aside>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showInspector && inspectorOpen && selected && (
          <div className="xl:hidden fixed inset-0 z-[150] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/20" onClick={() => setInspectorOpen(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 380, damping: 38 }}
              className="relative w-full sm:w-[400px] h-full bg-panel border-l-[0.5px] border-line-strong shadow-pop" role="dialog" aria-modal="true" aria-label={t('detail')}>
              <Inspector product={selected} requested={params.amperage} onClose={() => setInspectorOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 h-16 flex bg-bar/90 backdrop-blur-xl border-t-[0.5px] border-line-strong" aria-label={t('nav.selector')}>
        {NAV.map(n => {
          const on = view === n.id;
          return (
            <button key={n.id} onClick={() => setView(n.id)} aria-current={on ? 'page' : undefined}
              className={cn('relative flex-1 flex flex-col items-center justify-center gap-1', on ? 'text-red' : 'text-sub')}>
              <n.icon className="w-[18px] h-[18px]" strokeWidth={on ? 1.75 : 1.25} />
              <span className="text-[10px]">{t(n.key)}{counts[n.id] ? ` ${counts[n.id]}` : ''}</span>
            </button>
          );
        })}
      </nav>

      <CommandPalette />
      <SettingsPanel />
    </motion.div>
  );
}

/** Resumen legible de lo que se está buscando y la recomendación. */
function HeaderSummary({ result }: { result: ReturnType<typeof useLiveResult> }) {
  const { params, select, t } = useStore();
  const poles = parseInt(params.poles, 10) || params.poles;
  const best = result.bestMatch;
  const looking = t('head.looking', { a: params.amperage, p: poles }) + (params.series ? `, ${t('head.series', { s: params.series })}` : '');
  return (
    <div className="hidden sm:flex items-center gap-4 min-w-0 text-[13px]">
      <span className="text-sub truncate">{looking}</span>
      <AnimatePresence mode="wait" initial={false}>
        {best ? (
          <motion.button key={best.Codigo} onClick={() => select(best.Codigo)}
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}
            className="hidden lg:inline-flex items-center gap-2 h-[30px] px-3 rounded-[7px] bg-sheet border-[0.5px] border-line-strong shadow-btn hover:bg-wash whitespace-nowrap active:scale-[0.97] transition-transform">
            <span aria-hidden className="w-[5px] h-[5px] bg-red" />
            {t('head.best', { m: best.Model, a: best.Amperaje })}
          </motion.button>
        ) : (
          <motion.span key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-ochre whitespace-nowrap">{t('head.none')}</motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Botón de ajustes en la barra lateral. */
function SettingsButton() {
  const { setSettingsOpen, settingsOpen, t } = useStore();
  return (
    <button onClick={() => setSettingsOpen(!settingsOpen)} aria-expanded={settingsOpen}
      className="w-full flex items-center gap-2.5 h-9 px-3 text-[13px] text-ink rounded-[7px] bg-sheet border-[0.5px] border-line-strong shadow-btn hover:bg-wash transition-colors">
      <Settings2 className="w-4 h-4 text-sub" strokeWidth={1.5} />
      <span className="flex-1 text-left">{t('settings')}</span>
    </button>
  );
}

/** Pantalla completa (se oculta si el navegador no la permite). */
function FullscreenButton({ withLabel = false }: { withLabel?: boolean }) {
  const { t, setToast } = useStore();
  const fs = useFullscreen();
  if (!fs.available) return null;
  const Icon = fs.active ? Minimize2 : Maximize2;
  const label = fs.active ? t('fs.exit') : t('fs.enter');
  const run = async () => { if (!(await fs.toggle())) setToast({ kind: 'error', text: t('fs.na') }); };
  if (withLabel) {
    return (
      <button onClick={run} className="w-full flex items-center gap-2.5 h-10 px-3 text-[14px] rounded-[7px] bg-sheet border-[0.5px] border-line-strong shadow-btn hover:bg-wash">
        <Icon className="w-4 h-4 text-sub" strokeWidth={1.5} /><span className="flex-1 text-left">{label}</span>
      </button>
    );
  }
  return (
    <button onClick={run} title={label} aria-label={label} className="hidden md:grid w-[30px] h-[30px] place-items-center rounded-[8px] text-sub hover:text-ink hover:bg-wash">
      <Icon className="w-4 h-4" strokeWidth={1.5} />
    </button>
  );
}

/** Panel de ajustes: flota sobre la barra lateral en escritorio y sube desde abajo en móvil. */
function SettingsPanel() {
  const { settingsOpen, setSettingsOpen, t } = useStore();
  useEffect(() => {
    if (!settingsOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSettingsOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [settingsOpen, setSettingsOpen]);
  return (
    <AnimatePresence>
      {settingsOpen && (
        <div className="fixed inset-0 z-[250]" role="dialog" aria-modal="true" aria-label={t('settings')}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/10 md:bg-transparent" onClick={() => setSettingsOpen(false)} />
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 460, damping: 36 }}
            className="absolute left-3 right-3 bottom-3 md:right-auto md:left-3 md:bottom-[104px] md:w-[268px] origin-bottom-left rounded-[14px] bg-sheet/95 backdrop-blur-xl shadow-pop p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[15px] font-semibold">{t('settings')}</p>
              <button onClick={() => setSettingsOpen(false)} aria-label={t('close')} className="w-7 h-7 grid place-items-center rounded-full text-sub hover:text-ink hover:bg-wash">
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
            <Prefs />
            <FullscreenButton withLabel />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Prefs() {
  const { theme, setTheme, lang, setLang, t, hints, setHints, style, setStyle } = useStore();
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[11px] font-semibold text-faint mb-1.5">{t('style')}</p>
        <Tabs<StylePref> label={t('style')} value={style} onChange={setStyle}
          options={[{ value: 'glass', label: t('style.glass') }, { value: 'classic', label: t('style.classic') }]} />
      </div>
      <div>
        <p className="text-[11px] font-semibold text-faint mb-1.5">{t('lang')}</p>
        <Tabs<Lang> label={t('lang')} value={lang} onChange={setLang}
          options={[{ value: 'es', label: 'ES', title: 'Español' }, { value: 'en', label: 'EN', title: 'English' }]} />
      </div>
      <div>
        <p className="text-[11px] font-semibold text-faint mb-1.5">{t('theme')}</p>
        <Tabs<ThemePref> label={t('theme')} value={theme} onChange={setTheme}
          options={[{ value: 'dark', label: t('theme.dark') }, { value: 'light', label: t('theme.light') }, { value: 'system', label: t('theme.system') }]} />
      </div>
      <div>
        <p className="text-[11px] font-semibold text-faint mb-1.5">{t('hint.label')}</p>
        <Tabs<'on' | 'off'> label={t('hint.label')} value={hints ? 'on' : 'off'} onChange={v => setHints(v === 'on')}
          options={[{ value: 'on', label: t('hint.on') }, { value: 'off', label: t('hint.off') }]} />
      </div>
    </div>
  );
}

function ToastView() {
  const { toast, setToast, t } = useStore();
  return (
    <AnimatePresence>
      {toast && (
        <motion.div key={toast.text} initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 28 }}
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          role="status"
          className="fixed top-4 right-4 left-4 sm:left-auto sm:w-[360px] z-[400] rounded-[14px] bg-sheet/95 backdrop-blur-xl shadow-pop px-4 py-3 flex items-start gap-3">
          <span aria-hidden className={cn('mt-[7px] w-[6px] h-[6px] shrink-0', toast.kind === 'ok' ? 'bg-ink' : 'bg-red')} />
          <p className="flex-1 text-[13px] leading-snug">{toast.text}</p>
          {toast.action && (
            <button onClick={() => { toast.action!.run(); setToast(null); }} className="text-[12px] underline underline-offset-4 shrink-0">{toast.action.label}</button>
          )}
          <button onClick={() => setToast(null)} aria-label={t('closeToast')} className="text-sub hover:text-ink shrink-0"><X className="w-3.5 h-3.5" strokeWidth={1.5} /></button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
