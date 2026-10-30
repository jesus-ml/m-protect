// Pruebas sin framework: `npm test`
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { findMatches, designCurrent } from '../src/lib/matching';
import { buildTemplate, mergeCatalogs, normalize, parseWorkbook } from '../src/lib/excel';
import seed from '../product_db.json';
import { Product, SearchParams } from '../src/types';

const base: SearchParams = { series: '', frame: '', class: '', poles: '3P', amperage: 50, sensitivity: '', marketStatus: 'Available', region: 'Global' };
const db = (seed as Product[]).map(normalize);
let n = 0;
const t = (name: string, fn: () => void) => { fn(); n++; console.log('ok -', name); };

t('exacto: 63 A NV da NV63-CV', () => {
  const r = findMatches(db, { ...base, series: 'NV', amperage: 63 });
  assert.equal(r.matchType, 'exact');
  assert.equal(r.bestMatch?.Model, 'NV63-CV');
});

t('superior inmediata: 55 A NF da 63 A, no 50 A', () => {
  const r = findMatches(db, { ...base, series: 'NF', amperage: 55 });
  assert.equal(r.matchType, 'nextUp');
  assert.equal(r.bestMatch?.Amperaje, 63);
});

t('insuficiente: 250 A avisa y da el mayor', () => {
  const r = findMatches(db, { ...base, amperage: 250 });
  assert.equal(r.matchType, 'undersized');
  assert.equal(r.bestMatch?.Amperaje, 125);
});

t('relaja clase si no hay nada', () => {
  const r = findMatches(db, { ...base, series: 'NF', class: 'Standard', amperage: 90 });
  assert.equal(r.matchType, 'relaxed');
  assert.deepEqual(r.relaxed, ['f.class']);
  assert.equal(r.bestMatch?.Amperaje, 100);
});

t('región Asia respeta el filtro', () => {
  const r = findMatches(db, { ...base, region: 'Asia', amperage: 100 });
  assert.equal(r.bestMatch?.Codigo, 'NFC100CMX3P100');
});

t('descontinuados', () => {
  const r = findMatches(db, { ...base, marketStatus: 'Discontinued', amperage: 30 });
  assert.equal(r.bestMatch?.Model, 'NF30-CS');
});

t('sensibilidad 30 mA', () => {
  const r = findMatches(db, { ...base, series: 'NV', sensitivity: '30mA', amperage: 40 });
  assert.equal(r.bestMatch?.Model, 'NV63-CV');
});

t('polos sin coincidencia → none', () => {
  assert.equal(findMatches(db, { ...base, poles: '1P' }).matchType, 'none');
});

t('corriente de diseño trifásica', () => {
  // 15 kW, 220 V, fp 0.9: 43.74 A; ×1.25 = 54.67 A
  assert.ok(Math.abs(designCurrent({ kw: 15, volts: 220, pf: 0.9, phases: 3, continuous: false }) - 43.74) < 0.01);
  assert.ok(Math.abs(designCurrent({ kw: 15, volts: 220, pf: 0.9, phases: 3, continuous: true }) - 54.67) < 0.01);
});

t('Excel: plantilla genera 22 productos con specs y accesorios', () => {
  const { products, sheets } = parseWorkbook(buildTemplate());
  assert.equal(products.length, 22);
  assert.deepEqual(sheets.map(s => s.count), [9, 13]);
  const p = products.find(x => x.Codigo === 'NV63SV3P63')!;
  assert.equal(p.Frame, '63');
  assert.equal(p.Class, 'Standard');
  assert.equal(p.Specs?.['Rated sensitivity current (mA)'], '30');
  assert.equal(p.Accessories?.length, 1);
  assert.equal(products.find(x => x.Model === 'NV32-SV')?.Frame, '32');
});

t('merge no duplica códigos', () => {
  const { products } = parseWorkbook(buildTemplate());
  const once = mergeCatalogs(db, products);
  const twice = mergeCatalogs(once, products);
  assert.equal(once.length, twice.length);
  assert.equal(new Set(twice.map(p => p.Codigo)).size, twice.length);
});

t('tras importar, 60 A NV da NV63-SV 63 A', () => {
  const cat = mergeCatalogs(db, parseWorkbook(buildTemplate()).products);
  const r = findMatches(cat, { ...base, series: 'NV', class: 'Standard', amperage: 60 });
  assert.equal(r.bestMatch?.Codigo, 'NV63SV3P63');
});

// Solo en local: el catálogo interno no está en el repositorio
if (fs.existsSync('data/catalog.full.json')) {
  const full = (JSON.parse(fs.readFileSync('data/catalog.full.json', 'utf8')) as Product[]).map(normalize);
  t('catálogo interno: códigos únicos y reglas de conversión', () => {
    assert.ok(full.length > 1000);
    assert.equal(new Set(full.map(p => p.Codigo)).size, full.length);
    assert.ok(full.some(x => x.Model === 'NF125-SGV' && x.Amperaje === 125));
    assert.ok(full.some(x => x.Model === 'NF250-SEV') && full.some(x => x.Model === 'NF250-SGV'));
    assert.ok(full.some(x => x.Model === 'BH-D6' && x.Polos === '1P' && x.Frame === 'MCB'));
  });
  t('catálogo interno: 100–500 mA a 300 A da un NV400', () => {
    const r = findMatches(full, { ...base, series: 'NV', sensitivity: '100.200.500mA', amperage: 300 });
    assert.match(String(r.bestMatch?.Model), /^NV400/);
  });
}

console.log(`\n${n} pruebas pasaron`);
