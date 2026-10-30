import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Calculator } from 'lucide-react';
import { SearchParams, SearchResult } from '../types';
import { initialParams, useStore } from '../store';
import { designCurrent, findMatches, loadRatio } from '../lib/matching';
import { classLabel } from '../i18n';
import { Button, Chip, FieldLabel, inputCls, Marker, Meta, Select, Tabs } from '../components/ui';
import { BreakerArt } from '../components/BreakerArt';
import { LoadLine, useProductActions } from '../components/Inspector';
import { CardHead } from '../components/CardHead';
import { cn } from '../lib/utils';

/** Resultado en vivo para los parámetros actuales (con pequeño retraso al teclear). */
export function useLiveResult(): SearchResult {
  const { catalog, params } = useStore();
  const [debounced, setDebounced] = useState(params);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(params), 120);
    return () => clearTimeout(id);
  }, [params]);
  return useMemo(() => findMatches(catalog, debounced), [catalog, debounced]);
}

export function SelectorView({ result }: { result: SearchResult }) {
  const { params, setParams, catalog, selectedCode, select, history, logSearch, t } = useStore();
  const set = (patch: Partial<SearchParams>) => setParams({ ...params, ...patch });

  // Registra la búsqueda en el historial cuando el usuario deja de mover filtros
  const lastLogged = useRef('');
  useEffect(() => {
    const key = JSON.stringify(params);
    const id = setTimeout(() => {
      if (key === lastLogged.current || key === JSON.stringify(history[0]?.params)) return;
      lastLogged.current = key;
      logSearch({ params, timestamp: new Date().toISOString(), resultCode: result.bestMatch?.Codigo ?? null, matchType: result.matchType });
    }, 1500);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, result]);

  useEffect(() => {
    if (result.bestMatch && !result.candidates.some(c => c.Codigo === selectedCode)) select(result.bestMatch.Codigo, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  const frames = useMemo(() => [...new Set(catalog.map(p => String(p.Frame)))].filter(Boolean).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })), [catalog]);
  const classes = useMemo(() => [...new Set(catalog.map(p => String(p.Class)))].filter(Boolean).sort(), [catalog]);
  const dirty = JSON.stringify(params) !== JSON.stringify(initialParams);

  return (
    <div className="px-4 sm:px-8 py-6 space-y-6 max-w-5xl mx-auto">
      <section className="space-y-6 rounded-[12px] bg-sheet border-[0.5px] border-line shadow-card p-5 sm:p-6">
        <CardHead title={t('req.title')} hint={t('hint.selector')}
          action={<Button size="sm" variant="text" disabled={!dirty} onClick={() => setParams(initialParams)}>{t('reset')}</Button>} />

        <div className="grid grid-cols-2 md:grid-cols-12 gap-x-6 md:gap-x-8 gap-y-6">
          <div className="col-span-2 md:col-span-7">
            <FieldLabel htmlFor="f-amp">{t('f.current')}</FieldLabel>
            <AmpInput value={params.amperage} onChange={a => set({ amperage: a })} />
          </div>
          <div className="col-span-2 md:col-span-5">
            <FieldLabel>{t('f.poles')}</FieldLabel>
            <Tabs label={t('f.poles')} value={params.poles} onChange={v => set({ poles: v })}
              options={['1P', '2P', '3P', '4P'].map(p => ({ value: p, label: p }))} />
          </div>

          <div className="col-span-2 md:col-span-5">
            <FieldLabel>{t('f.series')}</FieldLabel>
            <Tabs label={t('f.series')} value={params.series || 'all'}
              onChange={v => set({ series: v === 'all' ? '' : v, sensitivity: v === 'NV' ? params.sensitivity : '' })}
              options={[{ value: 'all', label: t('all') }, { value: 'NF', label: 'NF', title: t('series.NF') }, { value: 'NV', label: 'NV', title: t('series.NV') }]} />
          </div>
          <div className="col-span-2 md:col-span-7">
            <FieldLabel>{t('f.sens')}{params.series !== 'NV' && <span className="text-faint"> · {t('onlyNV')}</span>}</FieldLabel>
            <Tabs label={t('f.sens')} value={params.sensitivity || 'any'} disabled={params.series !== 'NV'}
              onChange={v => set({ sensitivity: v === 'any' ? '' : v })}
              options={[{ value: 'any', label: t('any') }, { value: '30mA', label: '30 mA', title: t('sens.30') }, { value: '100.200.500mA', label: '100–500 mA', title: t('sens.adj') }]} />
          </div>

          <div className="col-span-1 md:col-span-3">
            <FieldLabel htmlFor="f-frame">{t('f.frame')}</FieldLabel>
            <Select id="f-frame" value={params.frame} onChange={e => set({ frame: e.target.value })}>
              <option value="">{t('any')}</option>
              {frames.map(f => <option key={f} value={f}>{f}</option>)}
            </Select>
          </div>
          <div className="col-span-1 md:col-span-3">
            <FieldLabel htmlFor="f-class">{t('f.class')}</FieldLabel>
            <Select id="f-class" value={params.class} onChange={e => set({ class: e.target.value })}>
              <option value="">{t('any')}</option>
              {classes.map(c => <option key={c} value={c}>{classLabel(t, c)}</option>)}
            </Select>
          </div>
          <div className="col-span-1 md:col-span-3">
            <FieldLabel>{t('f.status')}</FieldLabel>
            <Tabs label={t('f.status')} value={params.marketStatus} onChange={v => set({ marketStatus: v })}
              options={[{ value: 'Available', label: t('available') }, { value: 'Discontinued', label: t('legacy') }]} />
          </div>
          <div className="col-span-1 md:col-span-3">
            <FieldLabel>{t('f.region')}</FieldLabel>
            <Tabs label={t('f.region')} value={params.region} onChange={v => set({ region: v })}
              options={[{ value: 'Global', label: 'Global' }, { value: 'Asia', label: 'Asia' }]} />
          </div>
        </div>
      </section>

      <ResultBlock result={result} />
    </div>
  );
}

function AmpInput({ value, onChange }: { value: number; onChange: (a: number) => void }) {
  const { t } = useStore();
  const [calc, setCalc] = useState(false);
  const steps = [16, 32, 63, 100, 125, 250, 400];
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="relative w-28 shrink-0">
          <input id="f-amp" type="number" min={1} max={1600} value={value}
            onChange={e => onChange(Math.max(0, Math.min(1600, Number(e.target.value) || 0)))}
            className={cn(inputCls, 'pr-8 h-11 text-[20px] tabular')} />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sub text-[13px] pointer-events-none">A</span>
        </div>
        <input type="range" min={1} max={400} value={Math.min(400, value)} onChange={e => onChange(Number(e.target.value))}
          aria-label={t('f.current')} className="ink-range flex-1 min-w-0" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {steps.map(s => <Chip key={s} on={value === s} onClick={() => onChange(s)}>{s} A</Chip>)}
        <Button size="sm" onClick={() => setCalc(c => !c)} aria-expanded={calc} className={cn('ml-auto', calc && 'border-ink')}>
          <Calculator className="w-3.5 h-3.5" strokeWidth={1.5} /> {t('calc.btn')}
        </Button>
      </div>
      {calc && <LoadCalculator onUse={a => { onChange(a); setCalc(false); }} />}
    </div>
  );
}

function LoadCalculator({ onUse }: { onUse: (amps: number) => void }) {
  const { t } = useStore();
  const [load, setLoad] = useState({ kw: 15, volts: 220, pf: 0.9, phases: 3 as 1 | 3, continuous: true });
  const ib = designCurrent(load);
  const num = (k: 'kw' | 'volts' | 'pf') => (e: React.ChangeEvent<HTMLInputElement>) => setLoad({ ...load, [k]: Number(e.target.value) });
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-l border-ink pl-4 py-1 space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div><FieldLabel htmlFor="c-kw">{t('calc.kw')}</FieldLabel><input id="c-kw" type="number" step="0.1" value={load.kw} onChange={num('kw')} className={inputCls} /></div>
        <div><FieldLabel htmlFor="c-v">{t('calc.v')}</FieldLabel><input id="c-v" type="number" value={load.volts} onChange={num('volts')} className={inputCls} /></div>
        <div><FieldLabel htmlFor="c-pf">{t('calc.pf')}</FieldLabel><input id="c-pf" type="number" step="0.01" min={0.1} max={1} value={load.pf} onChange={num('pf')} className={inputCls} /></div>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <Tabs label={t('calc.system')} value={String(load.phases)} onChange={v => setLoad({ ...load, phases: Number(v) as 1 | 3 })} className="w-56"
          options={[{ value: '3', label: t('calc.3') }, { value: '1', label: t('calc.1') }]} />
        <label className="flex items-center gap-2 text-[12px] cursor-pointer">
          <input id="c-cont" type="checkbox" checked={load.continuous} onChange={e => setLoad({ ...load, continuous: e.target.checked })} className="accent-[var(--ink)]" />
          {t('calc.cont')}
        </label>
        <span className="ml-auto text-[13px] tabular">I = {ib.toFixed(1)} A</span>
        <Button size="sm" variant="ink" disabled={!ib} onClick={() => onUse(Math.ceil(ib))}>{t('calc.use', { a: Math.ceil(ib) })}</Button>
      </div>
      <p className="text-[11px] text-sub leading-relaxed max-w-prose">{t('calc.note')}</p>
    </motion.div>
  );
}

function ResultBlock({ result }: { result: SearchResult }) {
  const { params, selectedCode, select, t } = useStore();
  const actions = useProductActions();
  const best = result.bestMatch;
  const listRef = useRef<HTMLDivElement>(null);

  if (!best) {
    return (
      <section className="space-y-4 rounded-[12px] bg-sheet border-[0.5px] border-line shadow-card p-6">
        <CardHead title={t('match.none')} />
        <div className="py-10 text-center space-y-2">
          <p className="text-[15px]">{t('none.title')}</p>
          <p className="text-[12px] text-sub max-w-md mx-auto">{t('none.text')}</p>
        </div>
      </section>
    );
  }

  const message = {
    exact: t('msg.exact', { req: params.amperage }),
    nextUp: t('msg.nextUp', { req: params.amperage, inA: best.Amperaje }),
    relaxed: t('msg.relaxed', { f: result.relaxed.map(k => t(k as any).toLowerCase()).join(', ') }),
    undersized: t('msg.undersized', { req: params.amperage, inA: best.Amperaje }),
    none: '',
  }[result.matchType];
  const good = result.matchType === 'exact' || result.matchType === 'nextUp';
  const ratio = loadRatio(params.amperage, Number(best.Amperaje));

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const i = result.candidates.findIndex(c => c.Codigo === selectedCode);
    const next = result.candidates[Math.max(0, Math.min(result.candidates.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1)))];
    if (next) {
      select(next.Codigo, false);
      listRef.current?.querySelector<HTMLElement>(`[data-code="${next.Codigo}"]`)?.focus();
    }
  };

  return (
    <div className="space-y-6">
      <motion.section key={best.Codigo + result.matchType} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="space-y-5 rounded-[12px] bg-sheet border-[0.5px] border-line shadow-card p-5 sm:p-6">
        <CardHead title={<span className={cn(!good && 'text-ochre')}>{t(`match.${result.matchType}` as any)}</span>} info={message} hint={t('hint.result')} />

        <div className="flex flex-col sm:flex-row gap-8 sm:items-end">
          <button onClick={() => select(best.Codigo)} className="w-32 shrink-0 self-start" aria-label={`${t('detail')} ${best.Model}`}>
            <motion.div key={best.Codigo} initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 26 }}>
              <BreakerArt product={best} className="w-full h-auto" />
            </motion.div>
          </button>
          <div className="flex-1 min-w-0 space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
              <div className="space-y-1">
                <p className="font-mono text-[11px] text-sub">{best.Codigo}</p>
                <h2 className="text-[30px] font-medium leading-none tracking-[0.01em]">{best.Model}</h2>
              </div>
              <p className="leading-none tabular flex items-baseline">
                <span className="relative inline-block overflow-hidden h-[60px]">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span key={best.Amperaje} initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -24, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      className={cn('inline-block text-[56px] font-display font-display font-light leading-[60px]', good ? 'text-red' : 'text-ink')}>{best.Amperaje}</motion.span>
                  </AnimatePresence>
                </span>
                <span className="text-[18px] text-sub ml-1.5">A</span>
              </p>
            </div>
            <Meta items={[best.Polos, `Frame ${best.Frame}`, classLabel(t, best.Class), best.region]} />
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-sub"><span>{t('load')}</span><span className="tabular">{Math.round(ratio * 100)} %</span></div>
              <LoadLine ratio={ratio} onSelected />
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button variant="ink" onClick={() => actions.quote(best)}>{t('quote.add')}</Button>
              <Button onClick={() => actions.compare(best)}>{t('compare.add')}</Button>
              <Button variant="text" className="xl:hidden" onClick={() => select(best.Codigo)}>{t('detail')} <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} /></Button>
            </div>
          </div>
        </div>
      </motion.section>

      {result.candidates.length > 1 && (
        <section className="rounded-[12px] bg-sheet border-[0.5px] border-line shadow-card overflow-hidden">
          <CardHead className="px-5 sm:px-6 pt-5 pb-4 border-b border-line"
            title={result.matchType === 'undersized' ? t('list.biggest') : t('list.meets', { req: params.amperage })}
            hint={t('hint.list')}
            action={<span className="text-[13px] text-sub tabular">{t('list.count', { n: result.candidates.length })}</span>} />
          <div ref={listRef} role="listbox" aria-label={t('list.meets', { req: params.amperage })} onKeyDown={onKey} className="divide-y divide-line">
            {result.candidates.slice(0, 30).map((p, i) => {
              const r = loadRatio(params.amperage, Number(p.Amperaje));
              const active = p.Codigo === selectedCode;
              return (
                <motion.div key={p.Codigo} layout="position"
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(i, 8) * 0.03, ease: [0.22, 1, 0.36, 1] }} data-code={p.Codigo} role="option" aria-selected={active} tabIndex={active ? 0 : -1}
                  onClick={() => select(p.Codigo)} onFocus={() => select(p.Codigo, false)}
                  className={cn('relative grid grid-cols-[1fr_auto] sm:grid-cols-[minmax(0,1.5fr)_4.5rem_minmax(0,1fr)_auto] items-center gap-4 pl-6 pr-2 py-3 cursor-default outline-none transition-colors',
                    active ? 'bg-wash' : 'hover:bg-wash/60 focus-visible:bg-wash/60')}>
                  {active && <Marker id="row-marker" className="left-2 top-1/2 -mt-[2.5px]" />}
                  <div className="min-w-0">
                    <p className="text-[14px] truncate">{p.Model} <span className="text-sub">· {p.Polos}</span></p>
                    <p className="font-mono text-[11px] text-sub truncate">{p.Codigo}</p>
                  </div>
                  <p className="hidden sm:block text-right tabular">{p.Amperaje} A</p>
                  <div className="hidden sm:flex items-center gap-3 min-w-0">
                    <LoadLine ratio={r} onSelected={active} className="flex-1" />
                    <span className="text-[11px] tabular text-sub w-9 text-right">{Math.round(r * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="sm:hidden tabular">{p.Amperaje} A</span>
                    <Button size="sm" onClick={e => { e.stopPropagation(); actions.quote(p); }}>{t('quote.add')}</Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
