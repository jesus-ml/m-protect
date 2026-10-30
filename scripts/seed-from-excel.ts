/**
 * Convierte data/mitsubishi_breakers.xlsx en data/catalog.full.json (catálogo interno, no va al repositorio).
 *   npx tsx scripts/seed-from-excel.ts [ruta.xlsx]
 *
 * Cada hoja tiene una fila "Parameter" con un modelo por columna. Por cada columna:
 *   · "same" copia el valor de la columna de la izquierda;
 *   · rangos térmicos "16-20" y "Adj 63-125" toman el valor máximo como In;
 *   · rangos UL "15~125" se llenan con los amperajes estándar dentro del rango;
 *   · "2 / 3 / 4" polos se vuelve un producto por número de polos;
 *   · columnas combinadas ("NF250-SGV / SEV") se separan en dos modelos.
 */
import fs from 'node:fs';
import * as XLSX from 'xlsx';
import type { Product } from '../src/types';

const src = process.argv[2] ?? 'data/mitsubishi_breakers.xlsx';
const wb = XLSX.read(fs.readFileSync(src));

const STD = [0.5, 1, 1.6, 2, 3, 4, 5, 6, 10, 13, 15, 16, 20, 25, 30, 32, 40, 50, 60, 63, 75, 80, 100, 125, 150, 160, 175, 200, 225, 250, 300, 350, 400];
const SKIP_SHEETS = /history|notes/i;
// Filas que no ayudan a elegir (se quedan en el Excel original)
const NOISE = /dimension|mass|marking|ccc|operating cycles|pollution|emc|trip button|utilization|reverse|suitability|impulse|based on standard|ul file|csa|marine|max\. voltage/i;
// Filas que son accesorios: si la celda trae ● se agregan a la lista
const ACCESSORY = /switch \(|trip \(|terminal block|pre-alarm|plug-in|solderless|handle|terminal cover|enclosure|electrical operation|interlock|rail mounting|module|accessory/i;

const SHEET_TYPE: [RegExp, string][] = [
  [/motor/i, 'Motor protection'], [/^UL/i, 'UL 489'], [/MCB|miniature/i, 'Miniature (MCB/RCBO)'],
  [/DC High/i, 'DC high voltage'], [/MDU/i, 'With measuring display (MDU)'], [/NV/i, 'Earth leakage (ELCB)'],
  [/Ultra/i, 'Ultra current-limiting'], [/.*/, 'Molded case (MCCB)'],
];

function classOf(model: string, sheet: string): string {
  if (/^B|^KB/i.test(model)) return 'Miniature';
  const suffix = model.split('-')[1]?.[0]?.toUpperCase();
  if (suffix === 'C') return 'Economy';
  if (suffix === 'S') return 'Standard';
  if (suffix === 'U') return 'Ultra current-limiting';
  if (suffix === 'H' || suffix === 'L' || suffix === 'R') return 'High-performance';
  return /economy/i.test(sheet) ? 'Economy' : /standard/i.test(sheet) ? 'Standard' : 'High-performance';
}

const clean = (v: unknown) => String(v ?? '').replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();

/** Amperajes de una celda de "Rated current". */
function parseAmps(raw: string): number[] {
  let s = raw.replace(/\(\*\d+\)/g, '').replace(/\([\d.,/A ]*step\)/gi, '').replace(/\((AC|DC)\)/gi, '');
  const out = new Set<number>();
  // rangos UL / MCB: 0.5~50
  for (const m of s.matchAll(/\(?([\d.]+)\)?\s*~\s*([\d.]+)/g)) {
    const lo = Number(m[1]), hi = Number(m[2]);
    STD.filter(a => a >= lo && a <= hi).forEach(a => out.add(a));
    out.add(hi);
  }
  s = s.replace(/\(?[\d.]+\)?\s*~\s*[\d.]+/g, ' ');
  // rangos térmicos / ajustables: 16-20 → 20
  for (const m of s.matchAll(/([\d.]+)\s*-\s*([\d.]+)/g)) out.add(Number(m[2]));
  s = s.replace(/[\d.]+\s*-\s*[\d.]+/g, ' ');
  for (const m of s.matchAll(/\d+(?:\.\d+)?/g)) out.add(Number(m[0]));
  return [...out].filter(a => a > 0).sort((a, b) => a - b);
}

/** "1/2/3/4(3+N)/2(1+N)" → ['1P','2P','3P','4P'] */
function parsePoles(raw: string): string[] {
  const n = [...new Set(raw.replace(/\([^)]*\)/g, '').match(/\d/g) ?? [])].filter(d => +d >= 1 && +d <= 4).sort();
  return n.length ? n.map(d => d + 'P') : ['3P'];
}

/** Normaliza la sensibilidad para el filtro: "30 · 100.200.500" */
function sensitivity(raw: string): string {
  const tags: string[] = [];
  if (/\b30\b/.test(raw)) tags.push('30');
  if (/100\s*\/\s*200\s*\/\s*500/.test(raw)) tags.push('100.200.500');
  return tags.join(' · ');
}

const products: Product[] = [];
const seen = new Set<string>();
const report: string[] = [];

for (const name of wb.SheetNames) {
  if (SKIP_SHEETS.test(name)) continue;
  const rows: any[][] = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: '' });
  const h = rows.findIndex(r => /^parameter/i.test(clean(r?.[0])));
  if (h < 0) continue;
  const title = clean(rows[0]?.[0]).split(' – ')[0];
  const header = rows[h];
  const type = SHEET_TYPE.find(([re]) => re.test(name))![1];
  const body = rows.slice(h + 1).filter(r => clean(r[0]) && !/^\*|^note/i.test(clean(r[0])));

  // resuelve "same" de izquierda a derecha
  const cell = new Map<string, string>();
  for (const r of body) {
    let prev = '';
    for (let c = 1; c < header.length; c++) {
      let v = clean(r[c]);
      if (/^same/i.test(v)) v = prev;
      cell.set(`${clean(r[0])}|${c}`, v);
      prev = v;
    }
  }
  const get = (row: string, c: number) => cell.get(`${row}|${c}`) ?? '';
  const curRow = body.map(r => clean(r[0])).find(n => /^rated current/i.test(n));
  const poleRow = body.map(r => clean(r[0])).find(n => /number of poles/i.test(n));
  const sensRow = body.map(r => clean(r[0])).find(n => /sensitivity/i.test(n) && !/time-delay/i.test(n));
  const before = products.length;

  for (let c = 1; c < header.length; c++) {
    const head = clean(header[c]);
    if (!head || /^notes?$/i.test(head)) continue;
    const frameText = head.match(/\(Frame ([^)]+)\)/i)?.[1] ?? '';
    const headPole = head.match(/(\d)-pole/i)?.[1];
    const baseModel = head.replace(/\(.*$/, '').replace(/\d-pole/i, '').trim();

    // columnas combinadas: "NF250-SGV / SEV" con "SGV: ... / SEV: ..."
    const ampsRaw = curRow ? get(curRow, c) : '';
    const polesRaw = poleRow ? get(poleRow, c) : '';
    const parts = ampsRaw.split(/\s\/\s(?=[A-Z][\w-]*:)/);
    const variants = parts.length > 1
      ? parts.map((p, i) => {
          const [label, rest] = [p.slice(0, p.indexOf(':')).trim(), p.slice(p.indexOf(':') + 1)];
          const model = label.includes('-') ? label : `${baseModel.split('-')[0]}-${label}`;
          const pp = polesRaw.split(/\s\/\s/);
          return { model, amps: rest, poles: pp[i] ?? polesRaw };
        })
      : [{ model: baseModel, amps: ampsRaw, poles: polesRaw }];

    for (const v of variants) {
      const model = v.model.replace(/\s+/g, ' ');
      const num = model.match(/\d+/)?.[0] ?? '';
      const nums = frameText.match(/\d+/g) ?? [];
      const frame = /^(B|KB)/i.test(model) ? 'MCB' : nums.length === 1 ? nums[0] : nums.includes(num) ? num : nums.at(-1) ?? num;
      const poles = headPole ? [headPole + 'P'] : parsePoles(v.poles);
      const amps = parseAmps(v.amps);

      const specs: Record<string, string> = { Type: type };
      const accessories: string[] = [];
      if (sensRow) { const s = sensitivity(get(sensRow, c)); if (s) specs['Sensitivity (mA)'] = s; }
      if (/adj/i.test(v.amps)) specs['Setting'] = 'Adjustable';
      for (const r of body) {
        const k = clean(r[0]);
        const val = get(k, c);
        if (!val || val === '—' || k === curRow || k === poleRow) continue;
        if (ACCESSORY.test(k)) { if (val.startsWith('●')) accessories.push(k.replace(/\s+–\s+Accessory/i, '')); continue; }
        if (NOISE.test(k)) continue;
        specs[k] = val;
      }
      specs['Rated current (catalog)'] = v.amps;

      for (const p of poles) for (const a of amps) {
        const code = `${model}${p}${a}`.replace(/[\s\-/]+/g, '').toUpperCase();
        if (seen.has(code)) continue;
        seen.add(code);
        products.push({
          Codigo: code, Model: model, Frame: frame, Class: classOf(model, name), Polos: p, Amperaje: a,
          Descripción: `${type} · ${model} ${p} ${a} A`,
          marketStatus: 'Available', region: 'Global',
          Specs: { ...specs, 'Rated current In (A)': String(a) },
          Accessories: accessories.length ? accessories : undefined,
        });
      }
    }
  }
  report.push(`${name}: ${products.length - before}`);
}

fs.writeFileSync('data/catalog.full.json', JSON.stringify(products));
console.log(report.join('\n'));
console.log(`total ${products.length} productos, ${(fs.statSync('data/catalog.full.json').size / 1024).toFixed(0)} KB`);
