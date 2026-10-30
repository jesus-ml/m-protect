import React from 'react';
import { Product } from '../types';

type Props = {
  product: Product;
  className?: string;
  /** Colores fijos para el PDF */
  print?: boolean;
  /** El trazo se dibuja solo al aparecer (pantalla de inicio) */
  draw?: boolean;
  /** La palanca sube a ON o baja a OFF */
  switchTo?: 'on' | 'off';
  /** Cada pocos segundos un destello recorre las líneas, como corriente que pasa */
  flow?: boolean;
};

/**
 * Dibujo técnico de un interruptor en caja moldeada: trazo fino, sin degradados.
 * En pantalla sigue el color del tema; con `print` usa colores fijos para el PDF.
 */
export const BreakerArt = React.forwardRef<SVGSVGElement, Props>(
  ({ product, className, print = false, draw = false, switchTo, flow = false }, ref) => {
    const poles = Math.min(4, Math.max(1, parseInt(String(product.Polos), 10) || 3));
    const isNV = /^NV/i.test(product.Model);
    const ink = print ? '#171717' : 'var(--ink)';
    const sub = print ? '#8a8883' : 'var(--sub)';
    const paper = print ? '#ffffff' : 'var(--sheet)';
    const red = print ? '#d50012' : 'var(--red)';
    const W = 200, H = 260, bx = 34, bw = 132, by = 34, bh = H - 68;
    const step = bw / poles;
    const s = { stroke: ink, strokeWidth: 1.1, fill: 'none' } as const;
    const font = 'Helvetica, Arial, sans-serif';
    const pl = draw || flow ? { pathLength: 1 } : {};

    /** Contornos del aparato. Se dibujan una vez normal y, con `flow`, otra vez como destello. */
    const outline = (layer: 'base' | 'flow') => {
      const isFlow = layer === 'flow';
      const st = (extra: React.CSSProperties = {}): React.CSSProperties =>
        isFlow ? { stroke: red, strokeWidth: 1.6, fill: 'none' } : { ...s, ...extra };
      const fillPaper = isFlow ? {} : { fill: paper };
      return (
        <g className={isFlow ? 'flow' : undefined} aria-hidden={isFlow || undefined}>
          {Array.from({ length: poles }).map((_, i) => {
            const cx = bx + step * i + step / 2;
            return (
              <g key={i}>
                {[12, H - 34].map(y => (
                  <g key={y}>
                    <rect {...pl} x={cx - 10} y={y} width={20} height={22} style={st(fillPaper)} />
                    <circle {...pl} cx={cx} cy={y + 11} r={5} style={st()} />
                  </g>
                ))}
              </g>
            );
          })}
          <rect {...pl} x={bx} y={by} width={bw} height={bh} rx={3} style={st({ ...fillPaper, strokeWidth: 1.3 })} />
          <rect {...pl} x={W / 2 - 26} y={86} width={52} height={64} style={st()} />
          <rect {...pl} x={bx + 14} y={164} width={bw - 28} height={40} style={st({ stroke: sub, strokeWidth: 0.8 })} />
          {isNV && <circle {...pl} cx={bx + bw - 18} cy={104} r={6} style={st()} />}
        </g>
      );
    };

    return (
      <svg ref={ref} data-draw={draw || undefined} data-switch={switchTo} data-flow={flow || undefined}
        viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" className={className} role="img"
        aria-label={`${product.Model} ${product.Polos} ${product.Amperaje} A`}>
        {outline('base')}
        {/* ranuras de los tornillos y divisiones */}
        {Array.from({ length: poles }).map((_, i) => {
          const cx = bx + step * i + step / 2;
          return [12, H - 34].map(y => <line key={`${i}-${y}`} {...pl} x1={cx - 3} y1={y + 11} x2={cx + 3} y2={y + 11} style={s} />);
        })}
        {Array.from({ length: poles - 1 }).map((_, i) => (
          <line key={i} {...pl} x1={bx + step * (i + 1)} y1={by} x2={bx + step * (i + 1)} y2={by + 30} style={{ ...s, stroke: sub, strokeWidth: 0.8 }} />
        ))}
        <line {...pl} x1={bx} y1={by + 30} x2={bx + bw} y2={by + 30} style={{ ...s, stroke: sub, strokeWidth: 0.8 }} />
        {/* palanca y piloto */}
        <rect className="late handle" x={W / 2 - 11} y={92} width={22} height={30} style={{ fill: ink, stroke: 'none' }} />
        {switchTo && <rect className="lamp" x={W / 2 - 37} y={89} width={5} height={5} style={{ fill: red }} />}
        <text className="late" x={W / 2} y={140} textAnchor="middle" fontFamily={font} fontSize={7} letterSpacing={1.5} style={{ fill: sub }}>ON · OFF</text>
        {isNV && <text className="late" x={bx + bw - 18} y={120} textAnchor="middle" fontFamily={font} fontSize={5.5} letterSpacing={0.8} style={{ fill: sub }}>TEST</text>}
        {/* placa de datos */}
        <rect className="late" x={bx + 20} y={171} width={3} height={3} style={{ fill: red }} />
        <text className="late" x={bx + 27} y={175} fontFamily={font} fontSize={9.5} fontWeight={700} style={{ fill: ink }}>{product.Model}</text>
        <text className="late" x={bx + 20} y={194} fontFamily={font} fontSize={9} style={{ fill: ink }}>In {product.Amperaje} A</text>
        <text className="late" x={bx + bw - 20} y={194} textAnchor="end" fontFamily={font} fontSize={9} style={{ fill: sub }}>{product.Polos}</text>
        {flow && outline('flow')}
      </svg>
    );
  },
);
