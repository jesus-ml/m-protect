export interface Product {
  Codigo: string;
  Model: string;
  Frame: string;
  Class: string;
  Polos: string;
  Amperaje: number;
  Descripción: string;
  marketStatus: 'Available' | 'Discontinued';
  region: 'Global' | 'Asia';
  Specs?: Record<string, string>;
  Accessories?: string[];
  [key: string]: any;
}

export interface SearchParams {
  series: string;
  frame: string;
  class: string;
  poles: string;
  amperage: number;
  sensitivity: string;
  marketStatus: 'Available' | 'Discontinued';
  region: 'Global' | 'Asia';
}

/**
 * exact     → hay un producto con exactamente el amperaje pedido
 * nextUp    → no hay exacto; se propone la capacidad inmediata superior (lo correcto al dimensionar)
 * relaxed   → hubo que ignorar algún filtro secundario para encontrar algo
 * undersized→ ningún producto alcanza el amperaje pedido; se muestra el mayor disponible
 * none      → el catálogo no tiene nada compatible ni relajando filtros
 */
export type MatchType = 'exact' | 'nextUp' | 'relaxed' | 'undersized' | 'none';

export interface SearchResult {
  bestMatch: Product | null;
  alternatives: Product[];
  /** Todos los productos que cumplen, ordenados por In ascendente */
  candidates: Product[];
  matchType: MatchType;
  /** Claves de traducción de los filtros que se ignoraron para poder dar un resultado */
  relaxed: string[];
}

export interface HistoryEntry {
  params: SearchParams;
  timestamp: string;
  resultCode: string | null;
  matchType: MatchType;
}

export interface QuoteLine {
  codigo: string;
  qty: number;
  note?: string;
}

/** Datos opcionales del cliente que aparecen en el ticket de cotización */
export interface QuoteMeta {
  name: string;
  contact: string;
  note: string;
}
