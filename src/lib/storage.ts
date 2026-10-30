import { HistoryEntry, Product } from '../types';
import seed from '@seed';
import { normalize } from './excel';

// Todo vive en el navegador (localStorage). Si el navegador lo bloquea, la app
// sigue funcionando con el catálogo de ejemplo, solo que no recuerda cambios.

const CATALOG_KEY = 'ps_catalog_v2';
const HISTORY_KEY = 'ps_history_v1';

export const seedCatalog: Product[] = (seed as Product[]).map(normalize);

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* almacenamiento no disponible */
  }
}

export const loadCatalog = (): Product[] => read<Product[]>(CATALOG_KEY) ?? seedCatalog;
export const saveCatalog = (c: Product[] | null) => write(CATALOG_KEY, c);
export const loadHistory = (): HistoryEntry[] => read<HistoryEntry[]>(HISTORY_KEY) ?? [];
export const saveHistory = (h: HistoryEntry[]) => write(HISTORY_KEY, h);

const QUOTE_KEY = 'ps_quote_v1';
const COMPARE_KEY = 'ps_compare_v1';
export const loadQuote = () => read<import('../types').QuoteLine[]>(QUOTE_KEY) ?? [];
export const saveQuote = (q: import('../types').QuoteLine[]) => write(QUOTE_KEY, q);
export const loadCompare = () => read<string[]>(COMPARE_KEY) ?? [];
export const saveCompare = (c: string[]) => write(COMPARE_KEY, c);

const META_KEY = 'ps_quote_meta_v1';
export const emptyMeta: import('../types').QuoteMeta = { name: '', contact: '', note: '' };
export const loadQuoteMeta = () => ({ ...emptyMeta, ...(read<import('../types').QuoteMeta>(META_KEY) ?? {}) });
export const saveQuoteMeta = (m: import('../types').QuoteMeta | null) => write(META_KEY, m);
