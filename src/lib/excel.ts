import * as XLSX from 'xlsx';
import { Product } from '../types';

/**
 * Lee un libro de Excel con hojas de catálogo y lo convierte en productos.
 *
 * Formato esperado por hoja:
 *   fila 1           → título (p. ej. "Earth Leakage Circuit Breakers - Standard Class")
 *   fila "Parameter" → encabezados: Parameter | NV63-SV (Frame 63) | NV125-SV (Frame 125) ...
 *   filas siguientes → una especificación por fila; la fila "Rated current" lista
 *                      varios amperajes separados por espacio ("40 50 63").
 *   filas con "Note", "*" o "Accessory" → accesorios sugeridos.
 * Cada amperaje de cada columna se vuelve un producto.
 * Si una hoja no tiene fila "Parameter" se lee como tabla plana con las columnas de Product.
 */
export function parseWorkbook(data: ArrayBuffer): { products: Product[]; sheets: { name: string; count: number }[] } {
  const workbook = XLSX.read(data, { type: 'array' });
  const products: Product[] = [];
  const sheets: { name: string; count: number }[] = [];

  for (const sheetName of workbook.SheetNames) {
    const ws = workbook.Sheets[sheetName];
    const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
    const before = products.length;
    if (rows.length < 2) { sheets.push({ name: sheetName, count: 0 }); continue; }

    const headerRowIndex = rows.findIndex(r => r?.[0] && String(r[0]).toLowerCase().includes('parameter'));

    if (headerRowIndex === -1) {
      // Tabla plana: se normalizan los campos mínimos
      const flat = XLSX.utils.sheet_to_json<Record<string, any>>(ws);
      for (const r of flat) {
        if (!r.Model || r.Amperaje === undefined) continue;
        products.push(normalize({
          ...r,
          Amperaje: Number(r.Amperaje),
          Polos: String(r.Polos ?? '3P'),
          Frame: String(r.Frame ?? ''),
          marketStatus: r.marketStatus === 'Discontinued' ? 'Discontinued' : 'Available',
          region: r.region === 'Asia' ? 'Asia' : 'Global',
          Accessories: typeof r.Accessories === 'string' ? r.Accessories.split(/[;,]/).map((s: string) => s.trim()).filter(Boolean) : r.Accessories,
        } as Product));
      }
      sheets.push({ name: sheetName, count: products.length - before });
      continue;
    }

    const headerRow = rows[headerRowIndex];
    const title = rows[0]?.[0] ? String(rows[0][0]) : sheetName;

    const accessories: string[] = [];
    for (const r of rows) {
      const first = r?.[0] ? String(r[0]).toLowerCase() : '';
      if (/note|accessor|complement|^\*/.test(first)) {
        const text = r.filter(Boolean).join(' ').replace(/^\*\s*/, '').replace(/^note:\s*/i, '').trim();
        if (text.length > 5 && !/parameter/i.test(text)) accessories.push(text);
      }
    }

    const specRows: { name: string; index: number }[] = [];
    let currentRow = -1, polesRow = -1, frameRow = -1;
    for (let i = headerRowIndex + 1; i < rows.length; i++) {
      const name = rows[i]?.[0] ? String(rows[i][0]).trim() : '';
      if (!name || /^\*|^note/i.test(name)) continue;
      specRows.push({ name, index: i });
      const l = name.toLowerCase();
      if (l.includes('rated current')) currentRow = i;
      if (l.includes('number of poles') || l === 'poles' || l.includes('polos')) polesRow = i;
      if (l.includes('frame')) frameRow = i;
    }

    const klass = /economy/i.test(title) ? 'Economy' : /standard/i.test(title) ? 'Standard' : 'High-performance';

    for (let col = 1; col < headerRow.length; col++) {
      const header = headerRow[col];
      if (!header) continue;
      const model = String(header).split('(')[0].trim();
      const frameMatch = String(header).match(/\(Frame\s+([^)]+)\)/i);
      let frame = frameMatch ? frameMatch[1].trim() : frameRow !== -1 ? String(rows[frameRow][col] ?? '') : '';
      // "Frame 30/32" → nos quedamos con el número del modelo si aparece, si no con el primero
      const modelNum = model.match(/\d+/)?.[0];
      if (frame.includes('/')) frame = frame.split('/').includes(modelNum ?? '') ? modelNum! : frame.split('/')[0];
      if (!frame) frame = modelNum ?? '';

      const polesRaw = polesRow !== -1 ? String(rows[polesRow][col] ?? '3') : '3';
      const poles = polesRaw.replace(/\s|P$/gi, '') + 'P';

      const specs: Record<string, string> = {};
      for (const s of specRows) {
        const v = rows[s.index][col];
        if (v !== undefined && v !== null && v !== '') specs[s.name] = String(v);
      }

      const amps = currentRow !== -1 ? String(rows[currentRow][col] ?? '').match(/\d+/g) ?? [] : [];
      const summary = Object.entries(specs)
        .filter(([k]) => !/rated current|frame|number of poles/i.test(k))
        .map(([k, v]) => `${k}: ${v}`)
        .join(' | ');

      for (const a of amps) {
        const amperage = parseInt(a, 10);
        if (isNaN(amperage)) continue;
        products.push(normalize({
          Codigo: '',
          Model: model,
          Frame: frame,
          Class: klass,
          Polos: poles,
          Amperaje: amperage,
          Descripción: `${title} - ${model} ${poles} ${amperage}A${summary ? '. ' + summary : ''}`,
          marketStatus: /discontinued|legacy/i.test(title) ? 'Discontinued' : 'Available',
          region: /asia/i.test(title) ? 'Asia' : 'Global',
          Specs: { ...specs, 'Rated current In (A)': String(amperage) },
          Accessories: accessories.length ? accessories : undefined,
        }));
      }
    }
    sheets.push({ name: sheetName, count: products.length - before });
  }

  return { products, sheets };
}

/** Código uniforme: modelo sin guiones + polos + amperaje (NV63SV3P63). */
export function normalize(p: Product): Product {
  const code = p.Codigo && String(p.Codigo).trim()
    ? String(p.Codigo).replace(/\s+/g, '')
    : `${p.Model}${p.Polos}${p.Amperaje}`.replace(/[\s-]+/g, '').toUpperCase();
  return { ...p, Codigo: code };
}

/** Une catálogos; si un código ya existe, el nuevo lo reemplaza. */
export function mergeCatalogs(current: Product[], incoming: Product[]): Product[] {
  const map = new Map(current.map(p => [p.Codigo, p]));
  for (const p of incoming) map.set(p.Codigo, p);
  return [...map.values()];
}

/** Plantilla de ejemplo con el formato que entiende el lector. */
export function buildTemplate(): ArrayBuffer {
  const wb = XLSX.utils.book_new();
  const nv = [
    ['Earth Leakage Circuit Breakers - Standard Class'],
    [],
    ['Parameter', 'NV32-SV (Frame 32)', 'NV63-SV (Frame 63)', 'NV125-SV (Frame 125)'],
    ['Rated current In (A)', '15 20 30 32', '40 50 63', '100 125'],
    ['Number of poles', '3', '3', '3'],
    ['Rated voltage (V AC)', '100-440', '100-440', '100-440'],
    ['Rated sensitivity current (mA)', '30', '30', '100.200.500'],
    ['Breaking capacity Icu 440V (kA)', '2.5', '7.5', '25'],
    [],
    ['* Note: Terminal cover and auxiliary switch available as optional accessories'],
  ];
  const nf = [
    ['Molded Case Circuit Breakers - Economy Class'],
    [],
    ['Parameter', 'NF63-CV (Frame 63)', 'NF250-CV (Frame 250)'],
    ['Rated current In (A)', '10 16 20 32 40 50 63', '125 150 175 200 225 250'],
    ['Number of poles', '3', '3'],
    ['Rated voltage (V AC)', '690', '690'],
    ['Breaking capacity Icu 440V (kA)', '7.5', '25'],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(nv), 'NV-SV');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(nf), 'NF-CV');
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
}

/** Exporta la lista de cotización a Excel. */
export function buildQuoteWorkbook(
  lines: { product: Product; qty: number; note?: string }[],
  t: (k: any, v?: Record<string, string | number>) => string,
  localeTag = 'es-MX',
): ArrayBuffer {
  const rows = [
    [t('xls.title')],
    [t('xls.generated', { d: new Date().toLocaleString(localeTag) })],
    [],
    [t('col.code'), t('col.model'), t('xls.desc'), t('xls.poles'), 'In (A)', t('xls.qty'), t('xls.note')],
    ...lines.map(l => [l.product.Codigo, l.product.Model, l.product.Descripción, l.product.Polos, l.product.Amperaje, l.qty, l.note ?? '']),
    [],
    ['', '', '', '', t('xls.total'), lines.reduce((a, l) => a + l.qty, 0)],
  ];
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 16 }, { wch: 12 }, { wch: 60 }, { wch: 6 }, { wch: 8 }, { wch: 9 }, { wch: 30 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, t('xls.sheet'));
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
}
