import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { HistoryEntry, Product, QuoteLine, QuoteMeta, SearchParams } from './types';
import {
  emptyMeta, loadCatalog, loadCompare, loadHistory, loadQuote, loadQuoteMeta, saveCatalog, saveCompare, saveHistory, saveQuote, saveQuoteMeta, seedCatalog,
} from './lib/storage';
import { detectLang, Lang, makeT } from './i18n';

export type View = 'selector' | 'compare' | 'quote' | 'catalog' | 'history';
export type Stage = 'start' | 'app' | 'exit';
export type ThemePref = 'system' | 'light' | 'dark';
export type StylePref = 'classic' | 'glass';
export type Toast = { kind: 'ok' | 'error'; text: string; action?: { label: string; run: () => void } };

export const initialParams: SearchParams = {
  series: '', frame: '', class: '', poles: '3P', amperage: 50, sensitivity: '', marketStatus: 'Available', region: 'Global',
};

const MAX_COMPARE = 3;

function readPref(): ThemePref {
  // Por defecto: oscuro. (Clave v2 para que las preferencias guardadas antes no lo tapen.)
  try { return (localStorage.getItem('ps_theme_v2') as ThemePref) || 'dark'; } catch { return 'dark'; }
}

function useStoreValue() {
  const [stage, setStage] = useState<Stage>('start');
  const [view, setView] = useState<View>('selector');
  const [catalog, setCatalogState] = useState<Product[]>(loadCatalog);
  const [params, setParams] = useState<SearchParams>(initialParams);
  const [history, setHistoryState] = useState<HistoryEntry[]>(loadHistory);
  const [quote, setQuoteState] = useState<QuoteLine[]>(loadQuote);
  const [quoteMeta, setQuoteMetaState] = useState<QuoteMeta>(loadQuoteMeta);
  const [compare, setCompareState] = useState<string[]>(loadCompare);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [theme, setThemeState] = useState<ThemePref>(readPref);
  // Por defecto: Liquid Glass.
  const [style, setStyleState] = useState<StylePref>(() => { try { return localStorage.getItem('ps_style_v2') === 'classic' ? 'classic' : 'glass'; } catch { return 'glass'; } });
  const [lang, setLangState] = useState<Lang>(detectLang);
  const [sessionSearches, setSessionSearches] = useState(0);
  const [hints, setHintsState] = useState<boolean>(() => { try { return localStorage.getItem('ps_hints') !== 'off'; } catch { return true; } });
  const setHints = useCallback((on: boolean) => {
    setHintsState(on);
    try { localStorage.setItem('ps_hints', on ? 'on' : 'off'); } catch { /* sin almacenamiento */ }
  }, []);

  const t = useMemo(() => makeT(lang), [lang]);
  const isSeed = catalog === seedCatalog;
  const byCode = useMemo(() => new Map(catalog.map(p => [p.Codigo, p])), [catalog]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
    try { localStorage.setItem('ps_theme_v2', theme); } catch { /* sin almacenamiento */ }
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (style === 'glass') root.setAttribute('data-style', 'glass'); else root.removeAttribute('data-style');
    try { localStorage.setItem('ps_style_v2', style); } catch { /* sin almacenamiento */ }
  }, [style]);

  useEffect(() => {
    document.documentElement.lang = lang;
    try { localStorage.setItem('ps_lang', lang); } catch { /* sin almacenamiento */ }
  }, [lang]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), toast.action ? 7000 : 4000);
    return () => clearTimeout(id);
  }, [toast]);

  const setCatalog = useCallback((next: Product[] | null) => {
    setCatalogState(next ?? seedCatalog);
    saveCatalog(next);
  }, []);

  const setHistory = useCallback((h: HistoryEntry[]) => { setHistoryState(h); saveHistory(h); }, []);
  const logSearch = useCallback((entry: HistoryEntry) => {
    setHistoryState(prev => { const next = [entry, ...prev].slice(0, 20); saveHistory(next); return next; });
    setSessionSearches(n => n + 1);
  }, []);

  const setQuote = useCallback((q: QuoteLine[]) => { setQuoteState(q); saveQuote(q); }, []);
  const setQuoteMeta = useCallback((m: QuoteMeta) => { setQuoteMetaState(m); saveQuoteMeta(m); }, []);
  const addToQuote = useCallback((codigo: string, qty = 1) => {
    setQuoteState(prev => {
      const exists = prev.find(l => l.codigo === codigo);
      const next = exists ? prev.map(l => (l.codigo === codigo ? { ...l, qty: l.qty + qty } : l)) : [...prev, { codigo, qty }];
      saveQuote(next);
      return next;
    });
  }, []);

  const toggleCompare = useCallback((codigo: string): 'added' | 'removed' | 'full' => {
    let next: string[];
    let result: 'added' | 'removed';
    if (compare.includes(codigo)) { next = compare.filter(c => c !== codigo); result = 'removed'; }
    else if (compare.length >= MAX_COMPARE) return 'full';
    else { next = [...compare, codigo]; result = 'added'; }
    setCompareState(next);
    saveCompare(next);
    return result;
  }, [compare]);
  const clearCompare = useCallback(() => { setCompareState([]); saveCompare([]); }, []);

  const select = useCallback((codigo: string | null, openSheet = true) => {
    setSelectedCode(codigo);
    // La hoja de detalle solo se abre cuando el inspector no está fijo a la derecha (< 1280 px)
    const wide = typeof window !== 'undefined' && window.matchMedia?.('(min-width: 1280px)').matches;
    if (codigo && openSheet && !wide) setInspectorOpen(true);
  }, []);

  /** Borra todo lo guardado en este navegador (catálogo, cotización, comparar, historial). */
  const wipeData = useCallback(() => {
    setCatalog(null);
    setQuote([]);
    clearCompare();
    setHistory([]);
    setQuoteMetaState(emptyMeta);
    saveQuoteMeta(null);
    setSelectedCode(null);
    setParams(initialParams);
  }, [setCatalog, setQuote, clearCompare, setHistory]);

  const enter = useCallback(() => { setStage('app'); setSessionSearches(0); }, []);
  const exit = useCallback(() => { setPaletteOpen(false); setInspectorOpen(false); setSettingsOpen(false); setStage('exit'); }, []);
  /** Regresa a la pantalla de inicio sin borrar nada. */
  const goHome = useCallback(() => { setPaletteOpen(false); setInspectorOpen(false); setSettingsOpen(false); setStage('start'); }, []);

  return {
    stage, setStage, enter, exit, goHome, hints, setHints, view, setView, catalog, setCatalog, isSeed, byCode, params, setParams,
    history, setHistory, logSearch, sessionSearches, quote, setQuote, addToQuote, quoteMeta, setQuoteMeta,
    compare, toggleCompare, clearCompare, maxCompare: MAX_COMPARE,
    selectedCode, select, inspectorOpen, setInspectorOpen, paletteOpen, setPaletteOpen, settingsOpen, setSettingsOpen,
    toast, setToast, theme, setTheme: setThemeState, style, setStyle: setStyleState, lang, setLang: setLangState, t, wipeData,
  };
}

type Store = ReturnType<typeof useStoreValue>;
const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const value = useStoreValue();
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore fuera de StoreProvider');
  return s;
}
