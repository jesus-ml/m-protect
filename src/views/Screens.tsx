import { useEffect, useState } from 'react';
import { animate, motion, useReducedMotion } from 'framer-motion';

/** Entrada escalonada: cada bloque sube 8 px y aparece. */
const stagger = { show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } };
const rise = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

/** Número que cuenta desde 0 hasta su valor. */
function CountUp({ to }: { to: number }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? to : 0);
  useEffect(() => {
    if (reduce) { setN(to); return; }
    const c = animate(0, to, { duration: 0.9, ease: [0.22, 1, 0.36, 1], onUpdate: v => setN(Math.round(v)) });
    return () => c.stop();
  }, [to, reduce]);
  return <>{n}</>;
}
import { ArrowRight } from 'lucide-react';
import { useStore } from '../store';
import { Logo } from '../components/Brand';
import { BreakerArt } from '../components/BreakerArt';
import { Button, Tabs } from '../components/ui';
import { useExportQuote } from './OtherViews';
import { BRAND } from '../config';
import { Lang } from '../i18n';
import { Product } from '../types';

const DEMO: Product = {
  Codigo: 'NF125CV3P100', Model: 'NF125-CV', Frame: '125', Class: 'Economy', Polos: '3P', Amperaje: 100,
  Descripción: '', marketStatus: 'Available', region: 'Global',
};

function LangSwitch() {
  const { lang, setLang, t } = useStore();
  return (
    <Tabs<Lang> label={t('lang')} value={lang} onChange={setLang} className="w-40"
      options={[{ value: 'es', label: 'Español' }, { value: 'en', label: 'English' }]} />
  );
}

/** Pantalla de inicio. */
export function StartScreen() {
  const { enter, t, catalog, quote } = useStore();
  const pieces = quote.reduce((a, l) => a + l.qty, 0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Enter' && !(e.target as HTMLElement)?.closest('button,input')) enter(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enter]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
      className="h-full overflow-y-auto bg-paper">
      <div className="min-h-full max-w-6xl mx-auto px-6 sm:px-12 py-10 flex flex-col">
        <header className="flex items-center justify-between gap-6">
          <Logo size={34} />
          <LangSwitch />
        </header>

        <main className="flex-1 grid md:grid-cols-[1.25fr_1fr] gap-12 md:gap-20 items-center py-16">
          <motion.div className="space-y-10" variants={stagger} initial="hidden" animate="show">
            <div className="space-y-5">
              <motion.p variants={rise} className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-sub">
                <span aria-hidden className="w-[6px] h-[6px] bg-red" />{t('app.tagline')}
              </motion.p>
              <motion.h1 variants={rise} className="text-[48px] sm:text-[68px] font-display font-display font-light leading-[1.02] tracking-[0.01em]" style={{ whiteSpace: "nowrap" }}>{BRAND.app}</motion.h1>
              <motion.p variants={rise} className="text-[16px] text-sub max-w-md leading-relaxed">{t('start.lead')}</motion.p>
            </div>
            <motion.div variants={stagger} className="max-w-md">
              <motion.p variants={rise} className="text-[12px] font-semibold text-sub mb-1">{t('start.how')}</motion.p>
              <ol className="border-t border-line">
                {[t('start.s1'), t('start.s2'), t('start.s3')].map((p, i) => (
                  <motion.li variants={rise} key={p} className="flex gap-3 py-3 border-b border-line text-[14px]">
                    <span className="w-6 h-6 shrink-0 rounded-full bg-red text-on-ink text-[12px] font-semibold grid place-items-center tabular">{i + 1}</span>
                    <span className="pt-[2px]">{p}</span>
                  </motion.li>
                ))}
              </ol>
            </motion.div>
            <motion.div variants={rise} className="flex flex-wrap items-center gap-6">
              <Button variant="ink" size="lg" onClick={enter} autoFocus>
                {t('start.enter')} <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </Button>
              {pieces > 0 && <span className="text-[12px] text-sub">{t('start.resume', { n: pieces })}</span>}
            </motion.div>
          </motion.div>
          <div className="hidden md:flex justify-center">
            <BreakerArt product={DEMO} draw switchTo="on" flow className="w-full max-w-[300px] h-auto" />
          </div>
        </main>

        <footer className="flex flex-wrap justify-between gap-2 text-[11px] text-faint border-t border-line pt-4">
          <span>{t('start.catalog', { n: catalog.length })}</span>
        </footer>
      </div>
    </motion.div>
  );
}

/** Pantalla de salida: resumen de la sesión, exportar, borrar datos y volver. */
export function ExitScreen() {
  const { enter, setStage, t, sessionSearches, quote, compare, wipeData } = useStore();
  const { lines, run, ticket } = useExportQuote();
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [wiped, setWiped] = useState(false);

  const stats = [
    [t('exit.searches'), sessionSearches],
    [t('exit.lines'), quote.length],
    [t('exit.compared'), compare.length],
  ] as const;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
      className="h-full overflow-y-auto bg-paper">
      <div className="min-h-full max-w-xl mx-auto px-6 py-10 flex flex-col">
        <header className="flex items-center justify-between gap-6">
          <Logo size={28} />
          <LangSwitch />
        </header>

        <motion.main variants={stagger} initial="hidden" animate="show" className="flex-1 flex flex-col justify-center py-16 space-y-12">
          <motion.div variants={rise} className="flex justify-start">
            <BreakerArt product={DEMO} switchTo="off" className="h-36 w-auto" />
          </motion.div>
          <motion.div variants={rise} className="space-y-4">
            <p className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-sub">
              <span aria-hidden className="w-[6px] h-[6px] bg-red" />{t('exit.title')}
            </p>
            <h1 className="text-[36px] sm:text-[44px] font-display font-display font-light leading-tight">{t('exit.thanks', { app: BRAND.app.replace('-', '\u2011') })}</h1>
          </motion.div>

          <motion.dl variants={rise} className="grid grid-cols-3 border-y border-line divide-x divide-line">
            {stats.map(([label, n]) => (
              <div key={label} className="py-5 px-4 first:pl-0">
                <dt className="text-[11px] text-sub">{label}</dt>
                <dd className="text-[32px] font-display font-light tabular leading-none mt-2"><CountUp to={n} /></dd>
              </div>
            ))}
          </motion.dl>

          <motion.div variants={rise} className="space-y-5">
            <p className="text-[13px] text-sub">{wiped ? t('exit.wiped') : t('exit.saved')}</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="ink" size="lg" onClick={enter}>{t('exit.back')}</Button>
              <Button size="lg" onClick={() => setStage('start')}>{t('exit.home')}</Button>
              {lines.length > 0 && <Button size="lg" onClick={ticket}>{t('ticket.btn')}</Button>}
              {lines.length > 0 && <Button size="lg" variant="text" onClick={run}>{t('exit.export')}</Button>}
            </div>
            {!wiped && (
              confirmWipe ? (
                <div className="flex flex-wrap items-center gap-3 text-[12px]">
                  <span className="text-sub">{t('exit.wipeConfirm')}</span>
                  <Button size="sm" variant="danger" onClick={() => { wipeData(); setWiped(true); setConfirmWipe(false); }}>{t('exit.wipeYes')}</Button>
                  <Button size="sm" variant="text" onClick={() => setConfirmWipe(false)}>{t('cancel')}</Button>
                </div>
              ) : (
                <Button size="sm" variant="text" className="px-0" onClick={() => setConfirmWipe(true)}>{t('exit.wipe')}</Button>
              )
            )}
          </motion.div>
        </motion.main>
      </div>
    </motion.div>
  );
}
