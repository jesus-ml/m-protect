import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Square, X } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../store';
import { BreakerArt } from './BreakerArt';
import { Button, Meta, Row, Rows, Status, Stepper } from './ui';
import { exportSpecSheet } from '../lib/export';
import { loadRatio } from '../lib/matching';
import { classLabel } from '../i18n';
import { cn } from '../lib/utils';

/** Acciones comunes sobre un producto, con avisos. */
export function useProductActions() {
  const { addToQuote, toggleCompare, setToast, setView, maxCompare, t } = useStore();
  return {
    quote(p: Product, qty = 1) {
      addToQuote(p.Codigo, qty);
      setToast({ kind: 'ok', text: t('toast.quoted', { m: p.Model, a: p.Amperaje }), action: { label: t('view'), run: () => setView('quote') } });
    },
    compare(p: Product) {
      const r = toggleCompare(p.Codigo);
      if (r === 'full') setToast({ kind: 'error', text: t('toast.cmpFull', { n: maxCompare }), action: { label: t('open'), run: () => setView('compare') } });
      else if (r === 'added') setToast({ kind: 'ok', text: t('toast.cmpAdded', { c: p.Codigo }), action: { label: t('nav.compare'), run: () => setView('compare') } });
    },
  };
}

/** Botón de PDF. Lleva su propia copia oculta de la ilustración en colores de impresión. */
export function PdfButton({ product, className }: { product: Product; className?: string }) {
  const { setToast, t, lang } = useStore();
  const printRef = useRef<SVGSVGElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <>
      <div className="hidden" aria-hidden><BreakerArt ref={printRef} product={product} print /></div>
      <Button className={className} disabled={busy} onClick={async () => {
        setBusy(true);
        try {
          await exportSpecSheet(product, printRef.current, t, lang);
          setToast({ kind: 'ok', text: t('toast.pdfOk', { m: product.Model }) });
        } catch (e: any) {
          if (e?.code !== 'declined') setToast({ kind: 'error', text: t('toast.pdfErr') });
        } finally { setBusy(false); }
      }}>
        {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />} {t('pdf')}
      </Button>
    </>
  );
}

export function productMeta(p: Product, t: ReturnType<typeof useStore>['t']) {
  return [
    <Status ok={p.marketStatus === 'Available'}>{p.marketStatus === 'Available' ? t('available') : t('discontinued')}</Status>,
    p.region,
    /^NV/i.test(p.Model) ? t('series.NV') : t('series.NF'),
  ];
}

/** Panel con el detalle del producto seleccionado. */
export function Inspector({ product, requested, onClose }: { product: Product | null; requested?: number; onClose?: () => void }) {
  const { compare, t } = useStore();
  const actions = useProductActions();
  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 gap-2">
        <Square className="w-5 h-5 text-faint" strokeWidth={1} />
        <p className="text-[13px]">{t('insp.empty.title')}</p>
        <p className="text-[12px] text-sub max-w-52">{t('insp.empty.text')}</p>
      </div>
    );
  }

  const ratio = requested ? loadRatio(requested, Number(product.Amperaje)) : 0;
  const inCompare = compare.includes(product.Codigo);
  const specs = Object.entries(product.Specs ?? {}).filter(([k]) => !/rated current|number of poles/i.test(k));

  return (
    <motion.div key={product.Codigo} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="h-full flex flex-col">
      <div className="flex items-start justify-between gap-2 px-6 pt-6 pb-4">
        <div className="min-w-0 space-y-1">
          <p className="font-mono text-[11px] text-sub">{product.Codigo}</p>
          <h2 className="text-[24px] font-medium leading-tight tracking-[0.01em]">{product.Model}</h2>
          <Meta items={productMeta(product, t)} />
        </div>
        {onClose && (
          <button onClick={onClose} aria-label={t('closeDetail')} className="w-7 h-7 grid place-items-center text-sub hover:text-ink shrink-0">
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scroll-thin px-6 pb-6 space-y-7 stagger">
        <div className="border-y border-line py-6 flex justify-center">
          <BreakerArt product={product} className="h-40 w-auto" />
        </div>

        {requested ? (
          <section className="space-y-2">
            <div className="flex justify-between items-baseline text-[12px]">
              <span className="text-sub">{t('load')}</span>
              <span className={cn('tabular', ratio > 1 ? 'text-red' : ratio > 0.9 ? 'text-ochre' : 'text-ink')}>
                {requested} / {product.Amperaje} A · {Math.round(ratio * 100)} %
              </span>
            </div>
            <LoadLine ratio={ratio} />
            <p className="text-[12px] text-sub">
              {ratio > 1 ? t('insp.over') : ratio > 0.9 ? t('insp.tight') : t('insp.margin', { p: Math.round((1 / ratio - 1) * 100) })}
            </p>
          </section>
        ) : null}

        <Rows title={t('g.ident')}>
          <Row label={t('f.frame')}>{product.Frame}</Row>
          <Row label={t('f.class')}>{classLabel(t, String(product.Class))}</Row>
          <Row label={t('f.poles')}>{product.Polos}</Row>
          <Row label={t('row.in')}><span className="tabular">{product.Amperaje} A</span></Row>
        </Rows>

        {specs.length > 0 && (
          <Rows title={t('g.specs')}>
            {specs.map(([k, v]) => <Row key={k} label={k}><span className="tabular">{v}</span></Row>)}
          </Rows>
        )}

        <Rows title={t('g.desc')}>
          <p className="py-2 text-[12px] text-sub leading-relaxed">{product.Descripción}</p>
        </Rows>

        {product.Accessories?.length ? (
          <Rows title={t('g.acc')}>
            {product.Accessories.map((a, i) => <p key={i} className="py-2 text-[12px]">{a}</p>)}
          </Rows>
        ) : null}
      </div>

      <div className="border-t border-line px-6 py-4 space-y-2 bg-paper">
        <div className="flex items-center gap-2">
          <Stepper id="insp-qty" value={qty} onChange={setQty} labels={{ less: t('less'), more: t('more'), qty: t('qty') }} />
          <Button variant="ink" className="flex-1" onClick={() => { actions.quote(product, qty); setQty(1); }}>{t('quote.addLong')}</Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => actions.compare(product)} aria-pressed={inCompare} className={cn(inCompare && 'border-ink')}>
            {inCompare ? t('compare.remove') : t('compare.add')}
          </Button>
          <PdfButton product={product} />
        </div>
      </div>
    </motion.div>
  );
}

/** Línea de carga: 1.5 px, tinta; ocre cerca del límite, rojo si se pasa. */
export function LoadLine({ ratio, className, onSelected = false }: { ratio: number; className?: string; onSelected?: boolean }) {
  const pct = Math.min(100, Math.round(ratio * 100));
  return (
    <div className={cn('h-[3px] bg-line relative', className)} role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
      <div className={cn('absolute inset-y-0 left-0 transition-[width] duration-300',
        ratio > 1 ? 'bg-red' : ratio > 0.9 ? 'bg-ochre' : onSelected ? 'bg-ink' : 'bg-sub')} style={{ width: `${pct}%` }} />
    </div>
  );
}
