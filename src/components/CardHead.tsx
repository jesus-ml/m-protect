import React from 'react';
import { useStore } from '../store';
import { cn } from '../lib/utils';

/**
 * Encabezado de tarjeta: título y, debajo, una instrucción breve (se oculta desde
 * Preferencias → Instrucciones). La acción va a la derecha.
 */
export function CardHead({ title, hint, info, action, className }: {
  title: React.ReactNode; hint?: string; info?: React.ReactNode; action?: React.ReactNode; className?: string;
}) {
  const { hints } = useStore();
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-x-4 gap-y-2', className)}>
      <div className="min-w-0 space-y-1">
        <h2 className="text-[17px] font-semibold tracking-[-0.01em] leading-tight">{title}</h2>
        {info && <p className="text-[13px] text-sub leading-relaxed">{info}</p>}
        {hints && hint && <p className="text-[13px] text-faint leading-relaxed max-w-[62ch]">{hint}</p>}
      </div>
      {action && <div className="flex flex-wrap items-center gap-2 shrink-0">{action}</div>}
    </div>
  );
}
