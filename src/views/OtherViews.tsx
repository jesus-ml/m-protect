import React, { useRef, useState } from 'react';
import { ArrowRight, Columns3, FileSpreadsheet, History as HistoryIcon, Loader2, Receipt, ShoppingBag, X } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../store';
import { Button, Card, Empty, FieldLabel, inputCls, Meta, Stepper, Tabs } from '../components/ui';
import { BreakerArt } from '../components/BreakerArt';
import { useProductActions } from '../components/Inspector';
import { CardHead } from '../components/CardHead';
import { buildQuoteWorkbook, buildTemplate, mergeCatalogs, parseWorkbook } from '../lib/excel';
import { saveFile } from '../lib/download';
import { seedCatalog } from '../lib/storage';
import { exportQuoteTicket } from '../lib/export';
import { classLabel, locale } from '../i18n';
import { cn } from '../lib/utils';

const page = 'px-4 sm:px-8 py-6 max-w-5xl mx-auto';

/** Exporta la cotización a Excel (también se usa desde la pantalla de salida). */
export function useExportQuote() {
  const { quote, byCode, setToast, t, lang, quoteMeta } = useStore();
  const lines = quote.map(l => ({ ...l, product: byCode.get(l.codigo) })).filter(l => l.product) as (typeof quote[number] & { product: Product })[];
  return {
    lines,
    async run() {
      try {
        await saveFile(`${t('xls.file')}_${new Date().toISOString().slice(0, 10)}.xlsx`, new Blob([buildQuoteWorkbook(lines, t as any, locale(lang))]));
        setToast({ kind: 'ok', text: t('quote.exported') });
      } catch (e: any) { if (e?.code !== 'declined') setToast({ kind: 'error', text: t('quote.exportErr') }); }
    },
    async ticket() {
      try {
        const folio = await exportQuoteTicket(lines, quoteMeta, t, lang);
        setToast({ kind: 'ok', text: t('ticket.ok', { f: folio }) });
      } catch (e: any) { if (e?.code !== 'declined') setToast({ kind: 'error', text: t('ticket.err') }); }
    },
  };
}

// ---------- Comparar ----------

export function CompareView() {
  const { compare, byCode, toggleCompare, clearCompare, setView, select, maxCompare, t } = useStore();
  const actions = useProductActions();
  const items = compare.map(c => byCode.get(c)).filter(Boolean) as Product[];
  if (!items.length) {
    return <Empty icon={Columns3} title={t('compare.empty.title')} text={t('compare.empty.text', { n: maxCompare })}
      action={<Button onClick={() => setView('selector')}>{t('goSelector')}</Button>} />;
  }

  const specKeys = [...new Set(items.flatMap(p => Object.keys(p.Specs ?? {})))].filter(k => !/rated current|number of poles/i.test(k));
  const rows: [string, (p: Product) => React.ReactNode][] = [
    [t('row.in'), p => `${p.Amperaje} A`],
    [t('f.poles'), p => p.Polos],
    [t('f.frame'), p => p.Frame],
    [t('f.class'), p => classLabel(t, p.Class)],
    [t('f.status'), p => (p.marketStatus === 'Available' ? t('available') : t('discontinued'))],
    [t('f.region'), p => p.region],
    ...specKeys.map(k => [k, (p: Product) => p.Specs?.[k] ?? '—'] as [string, (p: Product) => React.ReactNode]),
    [t('accessories'), p => (p.Accessories?.length ? p.Accessories.join(' · ') : '—')],
  ];
  const differs = (fn: (p: Product) => React.ReactNode) => new Set(items.map(p => String(fn(p)))).size > 1;

  return (
    <div className={cn(page, 'space-y-6')}>
      <div className="rounded-[12px] bg-sheet border-[0.5px] border-line shadow-card px-5 sm:px-6 pt-5">
      <CardHead className="pb-2" title={t('nav.compare')} hint={t('hint.compare')}
        action={<Button size="sm" variant="text" onClick={clearCompare}>{t('clear')}</Button>} />
      <div className="overflow-x-auto">
        <table className="w-full text-[13px] min-w-[560px]">
          <thead>
            <tr className="border-b border-line">
              <th className="w-44" />
              {items.map(p => (
                <th key={p.Codigo} className="py-4 pr-4 text-left align-top font-normal">
                  <div className="flex justify-between items-start gap-2">
                    <BreakerArt product={p} className="h-24 w-auto" />
                    <button onClick={() => toggleCompare(p.Codigo)} aria-label={t('remove', { c: p.Codigo })} className="text-sub hover:text-ink"><X className="w-4 h-4" strokeWidth={1.25} /></button>
                  </div>
                  <p className="text-[18px] font-medium mt-3">{p.Model}</p>
                  <p className="font-mono text-[11px] text-sub">{p.Codigo}</p>
                  <div className="flex gap-3 mt-3">
                    <Button size="sm" variant="ink" onClick={() => actions.quote(p)}>{t('quote.add')}</Button>
                    <Button size="sm" variant="text" onClick={() => { select(p.Codigo); setView('selector'); }}>{t('detail')}</Button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, fn]) => {
              const d = differs(fn);
              return (
                <tr key={label} className="border-b border-line">
                  <td className="py-2.5 pr-4 text-sub text-[12px] align-top">
                    <span className="inline-flex items-center gap-2">
                      <span aria-hidden className={cn('w-[5px] h-[5px]', d ? 'bg-red' : 'bg-transparent')} />{label}
                    </span>
                  </td>
                  {items.map(p => <td key={p.Codigo} className={cn('py-2.5 pr-4 align-top tabular', !d && 'text-sub')}>{fn(p)}</td>)}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}

// ---------- Cotización ----------

export function QuoteView() {
  const { quote, setQuote, setView, select, t, quoteMeta, setQuoteMeta } = useStore();
  const [confirm, setConfirm] = useState(false);
  const { lines, run, ticket } = useExportQuote();
  const missing = quote.length - lines.length;
  const total = lines.reduce((a, l) => a + l.qty, 0);

  if (!quote.length) {
    return <Empty icon={ShoppingBag} title={t('quote.empty.title')} text={t('quote.empty.text')}
      action={<Button onClick={() => setView('selector')}>{t('goSelector')}</Button>} />;
  }

  const update = (codigo: string, patch: Partial<{ qty: number; note: string }>) =>
    setQuote(quote.map(l => (l.codigo === codigo ? { ...l, ...patch } : l)));
  const setMeta = (k: keyof typeof quoteMeta) => (e: React.ChangeEvent<HTMLInputElement>) => setQuoteMeta({ ...quoteMeta, [k]: e.target.value });

  return (
    <div className={cn(page, 'space-y-6')}>
      <Card className="p-0 overflow-hidden">
        <CardHead className="px-5 sm:px-6 pt-5 pb-4 border-b border-line"
          title={t('quote.summary', { l: lines.length, p: total })}
          hint={t('hint.quote')}
          info={missing > 0 ? <span className="text-ochre">{t('quote.missing', { n: missing })}</span> : undefined}
          action={confirm ? (
            <>
              <span className="text-[13px] text-sub">{t('quote.clearQ')}</span>
              <Button size="sm" variant="danger" onClick={() => { setQuote([]); setConfirm(false); }}>{t('clear')}</Button>
              <Button size="sm" variant="text" onClick={() => setConfirm(false)}>{t('cancel')}</Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="text" onClick={() => setConfirm(true)}>{t('clear')}</Button>
              <Button size="sm" onClick={run}>{t('export')}</Button>
              <Button size="sm" variant="ink" onClick={ticket}><Receipt className="w-3.5 h-3.5" strokeWidth={1.75} /> {t('ticket.btn')}</Button>
            </>
          )} />
        <div className="divide-y divide-line">
        {lines.map(l => (
          <div key={l.codigo} className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4">
            <button onClick={() => { select(l.codigo); setView('selector'); }} className="flex items-center gap-4 min-w-0 flex-1 text-left">
              <BreakerArt product={l.product} className="h-14 w-auto shrink-0" />
              <div className="min-w-0">
                <p className="text-[15px] font-medium truncate">{l.product.Model}</p>
                <Meta items={[`${l.product.Amperaje} A`, l.product.Polos, <span className="font-mono">{l.codigo}</span>]} />
              </div>
            </button>
            <input id={`note-${l.codigo}`} placeholder={t('note.ph')} value={l.note ?? ''} onChange={e => update(l.codigo, { note: e.target.value })} className={cn(inputCls, 'sm:w-56')} />
            <div className="flex items-center gap-3">
              <Stepper id={`qty-${l.codigo}`} value={l.qty} onChange={n => update(l.codigo, { qty: n })} labels={{ less: t('less'), more: t('more'), qty: t('qty') }} />
              <button onClick={() => setQuote(quote.filter(q => q.codigo !== l.codigo))} aria-label={t('remove', { c: l.codigo })}
                className="w-8 h-8 grid place-items-center rounded-full text-sub hover:text-red hover:bg-red-wash">
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <CardHead title={t('meta.title')} info={t('meta.hint')} />
        <div className="grid sm:grid-cols-2 gap-4">
          <div><FieldLabel htmlFor="m-name">{t('meta.name')}</FieldLabel><input id="m-name" value={quoteMeta.name} onChange={setMeta('name')} className={inputCls} autoComplete="organization" /></div>
          <div><FieldLabel htmlFor="m-contact">{t('meta.contact')}</FieldLabel><input id="m-contact" value={quoteMeta.contact} onChange={setMeta('contact')} className={inputCls} autoComplete="tel" /></div>
          <div className="sm:col-span-2"><FieldLabel htmlFor="m-note">{t('meta.note')}</FieldLabel><input id="m-note" value={quoteMeta.note} onChange={setMeta('note')} className={inputCls} /></div>
        </div>
        <div className="flex justify-end">
          <Button variant="ink" onClick={ticket}><Receipt className="w-4 h-4" strokeWidth={1.75} /> {t('ticket.btn')}</Button>
        </div>
      </Card>
    </div>
  );
}

// ---------- Catálogo ----------

export function CatalogView() {
  const { catalog, setCatalog, isSeed, setToast, select, setView, t } = useStore();
  const [mode, setMode] = useState<'merge' | 'replace'>('merge');
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState<{ file: string; sheets: { name: string; count: number }[] } | null>(null);
  const [filter, setFilter] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setBusy(true);
    try {
      const { products, sheets } = parseWorkbook(await file.arrayBuffer());
      if (!products.length) { setToast({ kind: 'error', text: t('imp.none', { f: file.name }) }); return; }
      const next = mode === 'merge' ? mergeCatalogs(catalog, products) : products;
      setCatalog(next);
      setReport({ file: file.name, sheets });
      setToast({ kind: 'ok', text: t('imp.ok', { n: products.length, f: file.name, t: next.length }) });
    } catch {
      setToast({ kind: 'error', text: t('imp.err', { f: file.name }) });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const [limit, setLimit] = useState(120);
  const shown = catalog.filter(p => !filter || `${p.Codigo} ${p.Model} ${p.Descripción}`.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className={cn(page, 'space-y-12')}>
      <section className="grid md:grid-cols-[1.4fr_1fr] gap-8">
        <div
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
          onClick={() => inputRef.current?.click()}
          onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
          role="button" tabIndex={0}
          className={cn('rounded-[12px] border-[1.5px] border-dashed p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors min-h-48',
            drag ? 'border-ink bg-wash' : 'border-line-strong hover:border-ink')}
        >
          {busy ? <Loader2 className="w-6 h-6 animate-spin text-sub mb-3" /> : <FileSpreadsheet className="w-6 h-6 text-faint mb-3" strokeWidth={1.25} />}
          <p className="text-[14px]">{t('cat.drop')}</p>
          <p className="text-[12px] text-sub mt-1 max-w-sm">{t('cat.dropSub')}</p>
          <input ref={inputRef} id="file-upload" type="file" className="hidden" accept=".xlsx,.xls,.csv"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </div>
        <div className="space-y-5 rounded-[12px] bg-sheet border-[0.5px] border-line shadow-card p-5">
          <CardHead title={t('cat.import')} hint={t('hint.catalog')} />
          <div>
            <p className="text-[11px] text-sub mb-1.5">{t('cat.onImport')}</p>
            <Tabs<'merge' | 'replace'> label={t('cat.onImport')} value={mode} onChange={setMode}
              options={[{ value: 'merge', label: t('cat.merge') }, { value: 'replace', label: t('cat.replace') }]} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={async () => {
              try { await saveFile('plantilla_catalogo.xlsx', new Blob([buildTemplate()])); }
              catch (e: any) { if (e?.code !== 'declined') setToast({ kind: 'error', text: t('tpl.err') }); }
            }}>{t('cat.template')}</Button>
            <Button size="sm" onClick={() => {
              const next = mergeCatalogs(catalog, seedCatalog);
              setCatalog(next);
              setToast({ kind: 'ok', text: t('sample.ok', { n: next.length - catalog.length }) });
            }}>{t('cat.sample')}</Button>
            {!isSeed && (confirmReset ? (
              <span className="flex items-center gap-1">
                <Button size="sm" variant="danger" onClick={() => { setCatalog(null); setConfirmReset(false); setReport(null); setToast({ kind: 'ok', text: t('restored') }); }}>{t('cat.restoreYes')}</Button>
                <Button size="sm" variant="text" onClick={() => setConfirmReset(false)}>{t('no')}</Button>
              </span>
            ) : <Button size="sm" variant="text" onClick={() => setConfirmReset(true)}>{t('cat.restore')}</Button>)}
          </div>
          {report && (
            <div className="text-[12px] border-l border-ink pl-3 space-y-0.5">
              <p>{report.file}</p>
              {report.sheets.map(s => <p key={s.name} className="text-sub">{t('cat.sheet', { s: s.name, n: s.count })}</p>)}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-[12px] bg-sheet border-[0.5px] border-line shadow-card px-5 sm:px-6 pt-5">
        <CardHead className="pb-3" title={t('products', { n: catalog.length })} info={isSeed ? t('catalog.sample') : t('catalog.imported')}
          action={<input id="cat-filter" placeholder={t('cat.filter')} value={filter} onChange={e => setFilter(e.target.value)} className={cn(inputCls, 'w-44 sm:w-60')} />} />
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="text-[11px] text-sub">
              <tr className="border-b border-line">
                {[t('col.code'), t('col.model'), t('f.frame'), t('f.class'), t('f.poles'), t('col.in'), t('f.status'), t('f.region'), ''].map((h, i) => (
                  <th key={i} className="text-left font-normal py-2 pr-4 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {shown.slice(0, limit).map(p => (
                <tr key={p.Codigo} className="hover:bg-wash/60">
                  <td className="py-2 pr-4 font-mono text-[11px] whitespace-nowrap">{p.Codigo}</td>
                  <td className="py-2 pr-4 whitespace-nowrap">{p.Model}</td>
                  <td className="py-2 pr-4 tabular">{p.Frame}</td>
                  <td className="py-2 pr-4 whitespace-nowrap text-sub">{classLabel(t, p.Class)}</td>
                  <td className="py-2 pr-4">{p.Polos}</td>
                  <td className="py-2 pr-4 tabular whitespace-nowrap">{p.Amperaje} A</td>
                  <td className="py-2 pr-4 whitespace-nowrap text-sub">{p.marketStatus === 'Available' ? t('available') : t('discontinued')}</td>
                  <td className="py-2 pr-4 text-sub">{p.region}</td>
                  <td className="py-2 whitespace-nowrap text-right">
                    <button onClick={() => { select(p.Codigo); setView('selector'); }} className="text-[12px] hover:underline underline-offset-4 mr-4">{t('view')}</button>
                    <button onClick={() => setCatalog(catalog.filter(x => x.Codigo !== p.Codigo))} aria-label={t('remove', { c: p.Codigo })} className="text-faint hover:text-red align-middle">
                      <X className="w-3.5 h-3.5 inline" strokeWidth={1.25} />
                    </button>
                  </td>
                </tr>
              ))}
              {!shown.length && <tr><td colSpan={9} className="py-10 text-center text-sub">{t('noMatch', { q: filter })}</td></tr>}
            </tbody>
          </table>
        </div>
        {shown.length > limit && (
          <div className="border-t border-line py-3 flex justify-center">
            <Button size="sm" onClick={() => setLimit(l => l + 240)}>{t('cat.more', { n: shown.length - limit })}</Button>
          </div>
        )}
      </section>
    </div>
  );
}

// ---------- Historial ----------

export function HistoryView() {
  const { history, setHistory, setParams, setView, t, lang } = useStore();
  if (!history.length) {
    return <Empty icon={HistoryIcon} title={t('history.empty.title')} text={t('history.empty.text')} />;
  }
  const fmt = (s: string) => { const d = new Date(s); return isNaN(+d) ? s : d.toLocaleString(locale(lang), { dateStyle: 'medium', timeStyle: 'short' }); };
  return (
    <div className={cn(page, 'space-y-4')}>
      <div className="rounded-[12px] bg-sheet border-[0.5px] border-line shadow-card px-5 sm:px-6 pt-5">
      <CardHead className="pb-3" title={t('nav.history')} hint={t('hint.history')}
        action={<Button size="sm" variant="text" onClick={() => setHistory([])}>{t('history.clear')}</Button>} />
      <div className="divide-y divide-line border-t border-line">
        {history.map((h, i) => (
          <button key={i} onClick={() => { setParams(h.params); setView('selector'); }}
            className="w-full text-left flex items-center gap-4 py-3 px-1 hover:bg-wash/60 group">
            <div className="flex-1 min-w-0 space-y-0.5">
              <Meta className="text-ink text-[13px]" items={[h.params.series || t('all'), h.params.poles, `${h.params.amperage} A`,
                h.params.frame && `Frame ${h.params.frame}`, h.params.class && classLabel(t, h.params.class), h.params.sensitivity]} />
              <p className="text-[12px] text-sub truncate">
                {fmt(h.timestamp)} · {h.resultCode ? <><span className="font-mono">{h.resultCode}</span> · {t(`match.${h.matchType}` as any)}</> : t('match.none')}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-faint group-hover:text-ink" strokeWidth={1.25} />
          </button>
        ))}
      </div>
      </div>
    </div>
  );
}
