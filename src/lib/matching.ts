import { Product, SearchParams, SearchResult } from '../types';

type Filter = { key: string; label: string; test: (p: Product, s: SearchParams) => boolean };

// Filtros duros: definen qué es el producto. No se relajan nunca.
const HARD: Filter[] = [
  { key: 'series', label: 'Serie', test: (p, s) => !s.series || String(p.Model ?? '').toUpperCase().startsWith(s.series.toUpperCase()) },
  { key: 'poles', label: 'Polos', test: (p, s) => !s.poles || String(p.Polos) === s.poles },
  { key: 'marketStatus', label: 'Estado', test: (p, s) => !s.marketStatus || p.marketStatus === s.marketStatus },
];

// Filtros secundarios. Si no hay resultado se relajan empezando por el ÚLTIMO
// de la lista (clase), luego frame, sensibilidad y al final región.
const SOFT: Filter[] = [
  { key: 'region', label: 'f.region', test: (p, s) => !s.region || p.region === s.region },
  {
    key: 'sensitivity', label: 'f.sens',
    test: (p, s) => !s.sensitivity || sensitivityOf(p).includes(s.sensitivity.replace(/mA$/i, '')),
  },
  { key: 'frame', label: 'f.frame', test: (p, s) => !s.frame || String(p.Frame) === s.frame },
  { key: 'class', label: 'f.class', test: (p, s) => !s.class || String(p.Class) === s.class },
];

/** Busca la sensibilidad (mA) en las specs o en la descripción. */
export function sensitivityOf(p: Product): string {
  const spec = Object.entries(p.Specs ?? {}).find(([k]) => /sensitiv/i.test(k));
  if (spec) return spec[1];
  const m = String(p.Descripción ?? '').match(/([\d.]+)\s*mA/i);
  return m ? m[1] : '';
}

const byAmp = (a: Product, b: Product) => Number(a.Amperaje) - Number(b.Amperaje);

/**
 * Regla de selección de un interruptor: la corriente nominal In debe ser
 * mayor o igual a la corriente que se pide. Se elige la menor In que cumpla.
 */
export function findMatches(database: Product[], params: SearchParams): SearchResult {
  const empty: SearchResult = { bestMatch: null, alternatives: [], candidates: [], matchType: 'none', relaxed: [] };
  if (!database?.length) return empty;

  const target = Number(params.amperage) || 0;
  const base = database.filter(p => HARD.every(f => f.test(p, params)));
  if (!base.length) return empty;

  // Intenta con todos los filtros; si no alcanza, quita filtros secundarios uno por uno.
  for (let drop = 0; drop <= SOFT.length; drop++) {
    const active = SOFT.slice(0, SOFT.length - drop);
    const relaxed = SOFT.slice(SOFT.length - drop).filter(f => (params as any)[f.key]).map(f => f.label);
    const pool = base.filter(p => active.every(f => f.test(p, params)));
    if (!pool.length) continue;

    const enough = pool.filter(p => Number(p.Amperaje) >= target).sort(byAmp);
    if (enough.length) {
      const best = enough[0];
      const exact = Number(best.Amperaje) === target;
      return {
        bestMatch: best,
        alternatives: enough.slice(1, 4),
        candidates: enough,
        matchType: relaxed.length ? 'relaxed' : exact ? 'exact' : 'nextUp',
        relaxed,
      };
    }
    // Hay productos con esos filtros pero ninguno alcanza el amperaje: sigue relajando
    // y, si al final nada alcanza, se reporta el mayor disponible.
  }

  const biggest = [...base].sort(byAmp).reverse();
  return { bestMatch: biggest[0], alternatives: biggest.slice(1, 4), candidates: biggest, matchType: 'undersized', relaxed: [] };
}

/** Corriente de diseño a partir de la carga. */
export function designCurrent(opts: { kw: number; volts: number; pf: number; phases: 1 | 3; continuous: boolean }) {
  const { kw, volts, pf, phases, continuous } = opts;
  if (!(kw > 0 && volts > 0 && pf > 0)) return 0;
  const i = (kw * 1000) / ((phases === 3 ? Math.sqrt(3) : 1) * volts * pf);
  return continuous ? i * 1.25 : i;
}

/** Qué tan cargado queda el interruptor: corriente pedida / In. */
export function loadRatio(requested: number, inRating: number) {
  return inRating > 0 ? requested / inRating : 0;
}
