import React, { useId } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

type BtnVariant = 'ink' | 'line' | 'text' | 'danger';

/**
 * Botones al estilo macOS moderno: planos, blancos, con borde fino y sombra de 1 px.
 * El principal (`ink`) es el botón por defecto, en el rojo de acento. Alturas cómodas de tocar.
 */
export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: 'sm' | 'md' | 'lg' }>(
  ({ className, variant = 'line', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-[7px] transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-150 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none select-none whitespace-nowrap',
        size === 'sm' && 'h-8 px-3 text-[13px]',
        size === 'md' && 'h-9 px-4 text-[14px]',
        size === 'lg' && 'h-11 px-6 text-[15px]',
        variant === 'ink' && 'bg-red text-on-ink shadow-btn hover:brightness-110 active:brightness-95',
        variant === 'line' && 'bg-sheet text-ink border-[0.5px] border-line-strong shadow-btn hover:bg-wash active:bg-wash',
        variant === 'text' && 'text-sub hover:text-ink hover:bg-wash px-3',
        variant === 'danger' && 'text-red hover:bg-red-wash px-3',
        className,
      )}
      {...props}
    />
  ),
);

/**
 * Control segmentado de macOS moderno: una pista gris con una pastilla blanca
 * que se desliza hasta la opción elegida.
 */
export function Tabs<T extends string>({ value, options, onChange, label, className, disabled }: {
  value: T; options: { value: T; label: React.ReactNode; title?: string }[]; onChange: (v: T) => void;
  label: string; className?: string; disabled?: boolean;
}) {
  const id = useId();
  return (
    <div role="radiogroup" aria-label={label} aria-disabled={disabled}
      className={cn('flex p-[2px] rounded-[8px] bg-wash border-[0.5px] border-line', disabled && 'opacity-40 pointer-events-none', className)}>
      {options.map(o => {
        const on = value === o.value;
        return (
          <button key={o.value} role="radio" aria-checked={on} title={o.title} onClick={() => onChange(o.value)}
            className={cn('relative flex-1 h-8 px-2.5 text-[13px] rounded-[6px] transition-colors whitespace-nowrap',
              on ? 'text-ink font-medium' : 'text-sub hover:text-ink')}>
            {on && <motion.span layoutId={`seg-${id}`} aria-hidden
              className="absolute inset-0 rounded-[6px] bg-thumb shadow-[0_1px_2px_rgba(0,0,0,0.12),0_0_0_0.5px_rgba(0,0,0,0.06)]"
              transition={{ type: 'spring', stiffness: 520, damping: 40 }} />}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Botón pequeño que se puede marcar (atajos de corriente). */
export function Chip({ on, children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { on?: boolean }) {
  return (
    <button aria-pressed={on} {...props}
      className={cn('h-8 px-3 rounded-[7px] text-[13px] tabular border-[0.5px] shadow-btn transition-colors active:scale-[0.97]',
        on ? 'bg-seg text-on-ink border-transparent' : 'bg-sheet text-ink border-line-strong hover:bg-wash', className)}>
      {children}
    </button>
  );
}

export const inputCls =
  'h-9 w-full rounded-[7px] bg-sheet border-[0.5px] border-line-strong px-3 text-[14px] text-ink placeholder:text-faint shadow-[inset_0_0.5px_1px_rgba(0,0,0,0.08)] focus:outline-none focus:border-red/60 focus:shadow-[0_0_0_3.5px_var(--ring)] transition-[border-color,box-shadow]';

/** Menú desplegable con las flechas dobles de los menús emergentes de macOS. */
export const Select = ({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div className="relative">
    <select {...props} className={cn(inputCls, 'appearance-none pr-9 cursor-pointer shadow-btn', className)} />
    <span aria-hidden className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 w-[22px] h-[22px] rounded-[5px] bg-red grid place-items-center">
      <svg width="8" height="11" viewBox="0 0 8 11"><path d="M1 4l3-3 3 3M1 7l3 3 3-3" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  </div>
);

export const FieldLabel = ({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) => (
  <label htmlFor={htmlFor} className="block text-[12px] text-sub mb-1.5">{children}</label>
);

/** Rótulo de sección: texto pequeño espaciado; la acción o el conteo van a la derecha. */
export function SectionTitle({ children, action, className }: { children: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-baseline justify-between gap-4', className)}>
      <h3 className="text-[12px] font-semibold text-sub whitespace-nowrap">{children}</h3>
      {action}
    </div>
  );
}

/** Marca de selección: un cuadro rojo de 5 px que se desliza al elemento activo. */
export function Marker({ id, className }: { id: string; className?: string }) {
  return (
    <motion.span layoutId={id} aria-hidden className={cn('absolute w-[5px] h-[5px] bg-red', className)}
      transition={{ type: 'spring', stiffness: 520, damping: 40 }} />
  );
}

/** Tarjeta agrupada al estilo de Ajustes del Sistema (macOS Ventura/Sonoma). */
export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn('rounded-[12px] bg-sheet border-[0.5px] border-line shadow-card p-5', className)}>{children}</section>;
}

/** Metadatos en línea separados por punto medio (sustituye a las etiquetas de color). */
export function Meta({ items, className }: { items: React.ReactNode[]; className?: string }) {
  const list = items.filter(Boolean);
  return (
    <p className={cn('text-[13px] text-sub flex flex-wrap items-center gap-x-2 gap-y-0.5', className)}>
      {list.map((it, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span aria-hidden className="text-faint">·</span>}
          <span>{it}</span>
        </React.Fragment>
      ))}
    </p>
  );
}

/** Estado con un pequeño cuadro de color, sin fondo. */
export function Status({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden className={cn('w-[7px] h-[7px] rounded-[2px]', ok ? 'bg-moss live-dot' : 'bg-ochre')} />
      {children}
    </span>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="inline-flex items-center h-[18px] px-1.5 border border-line rounded-[2px] text-[10px] text-sub" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>{children}</kbd>;
}

/** Lista de pares etiqueta / valor separada por líneas finas. */
export function Rows({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('space-y-2', className)}>
      {title && <SectionTitle>{title}</SectionTitle>}
      <div className="divide-y divide-line">{children}</div>
    </section>
  );
}

export function Row({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-sub text-[13px] shrink-0">{label}</span>
      <span className="text-[14px] text-right min-w-0 break-words">{children}</span>
    </div>
  );
}

/** Estado vacío. */
export function Empty({ icon: Icon, title, text, action }: { icon: React.ElementType; title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="h-full min-h-[55vh] flex flex-col items-center justify-center text-center gap-3 p-8">
      <Icon className="w-6 h-6 text-faint" strokeWidth={1.25} />
      <p className="text-[15px]">{title}</p>
      <p className="text-[12px] text-sub max-w-sm">{text}</p>
      {action && <div className="pt-3">{action}</div>}
    </div>
  );
}

/** Contador − n + */
export function Stepper({ value, onChange, id, labels }: { value: number; onChange: (n: number) => void; id: string; labels: { less: string; more: string; qty: string } }) {
  return (
    <div className="flex items-center border-[0.5px] border-line-strong bg-sheet shadow-btn h-9 shrink-0 rounded-[7px]">
      <button className="w-9 h-full text-[16px] text-sub hover:text-ink hover:bg-wash rounded-l-[7px]" onClick={() => onChange(Math.max(1, value - 1))} aria-label={labels.less}>−</button>
      <input id={id} type="number" min={1} value={value} aria-label={labels.qty}
        onChange={e => onChange(Math.max(1, Number(e.target.value) || 1))}
        className="w-10 text-center bg-transparent text-[14px] tabular focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
      <button className="w-9 h-full text-[16px] text-sub hover:text-ink hover:bg-wash rounded-r-[7px]" onClick={() => onChange(value + 1)} aria-label={labels.more}>+</button>
    </div>
  );
}
