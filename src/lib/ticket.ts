import jsPDF from 'jspdf';
import { Product, QuoteMeta } from '../types';
import { BRAND } from '../config';
import { Lang, locale, T } from '../i18n';

const INK: [number, number, number] = [29, 29, 31];
const SUB: [number, number, number] = [110, 110, 115];
const LINE: [number, number, number] = [200, 200, 204];
const RED: [number, number, number] = [213, 0, 18];
const BG: [number, number, number] = [238, 238, 240];

export type TicketLine = { product: Product; qty: number; note?: string };

/** Folio legible: MP-AAMMDD-XXXX */
export function makeFolio(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, '0');
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase().padEnd(4, '0');
  return `MP-${String(d.getFullYear()).slice(2)}${p(d.getMonth() + 1)}${p(d.getDate())}-${rnd}`;
}

/**
 * Ticket de solicitud de cotización: tira de papel con bordes dentados,
 * pensada para mostrarse o imprimirse y entregarse al asesor de ventas.
 */
export function buildQuoteTicket(
  lines: TicketLine[], meta: QuoteMeta, t: T, lang: Lang, folio: string,
  logo?: { png: string; ratio: number },
): Blob {
  const W = 92;           // ancho de página (mm)
  const PX = 5;           // margen de la tira de papel
  const M = PX + 7;       // margen del texto
  const R = W - M;        // borde derecho del texto
  const tooth = 2.2;      // tamaño del dentado

  // Altura según el contenido
  const probe = new jsPDF({ unit: 'mm', format: [W, 200] });
  probe.setFontSize(8);
  const wrap = (s: string, w: number) => probe.splitTextToSize(s, w) as string[];
  const metaRows = [meta.name && t('ticket.client'), meta.contact && t('ticket.contact')].filter(Boolean).length;
  const noteLines = meta.note ? wrap(meta.note, R - M).length : 0;
  const itemH = lines.reduce((h, l) => h + 11 + (l.note ? wrap(l.note, R - M - 8).length * 3.4 : 0), 0);
  const H = 58 + metaRows * 5 + (noteLines ? 6 + noteLines * 3.6 : 0) + 12 + itemH + 22 + 30 + 26;

  const doc = new jsPDF({ unit: 'mm', format: [W, H] });

  // Fondo y tira de papel con dentado arriba y abajo
  doc.setFillColor(...BG);
  doc.rect(0, 0, W, H, 'F');
  const pts: [number, number][] = [];
  const top = PX, bottom = H - PX, left = PX, right = W - PX;
  const n = Math.floor((right - left) / (tooth * 2));
  const step = (right - left) / n;
  for (let i = 0; i < n; i++) { pts.push([left + i * step, top + tooth]); pts.push([left + i * step + step / 2, top]); }
  pts.push([right, top + tooth]);
  pts.push([right, bottom - tooth]);
  for (let i = n; i > 0; i--) { pts.push([left + i * step - step / 2, bottom]); pts.push([left + (i - 1) * step, bottom - tooth]); }
  const segs = pts.slice(1).map((p, i) => [p[0] - pts[i][0], p[1] - pts[i][1]]);
  doc.setFillColor(255, 255, 255);
  doc.lines(segs, pts[0][0], pts[0][1], [1, 1], 'F', true);

  let y = top + tooth + 9;
  const center = W / 2;

  // Encabezado
  if (logo) {
    const h = 7, w = h * logo.ratio;
    try { doc.addImage(logo.png, 'PNG', center - w / 2, y - 2, w, h); } catch { /* sin logo */ }
    y += h + 3;
  } else if (BRAND.company) {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...INK);
    doc.text(BRAND.company.toUpperCase(), center, y + 2, { align: 'center' });
    y += 7;
  }
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...SUB);
  doc.text(BRAND.app, center, y, { align: 'center' });
  y += 7;

  // Título centrado a mano: jsPDF no descuenta el espaciado entre letras al centrar
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(...INK);
  const title = t('ticket.title').toUpperCase();
  const cs = 0.4;
  const tw = doc.getTextWidth(title) + cs * (title.length - 1);
  const tx = center - tw / 2 + 1.6;
  doc.setFillColor(...RED);
  doc.rect(tx - 3.6, y + 0.4, 1.6, 1.6, 'F');
  doc.text(title, tx, y + 2.5, { charSpace: cs });
  y += 9;

  const kv = (k: string, v: string, bold = false) => {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...SUB);
    doc.text(k, M, y);
    doc.setFont(bold ? 'courier' : 'helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(bold ? 9 : 8); doc.setTextColor(...INK);
    doc.text(v, R, y, { align: 'right' });
    y += 5;
  };
  kv(t('ticket.folio'), folio, true);
  kv(t('ticket.date'), new Date().toLocaleString(locale(lang), { dateStyle: 'medium', timeStyle: 'short' }));
  if (meta.name) kv(t('ticket.client'), meta.name.slice(0, 40));
  if (meta.contact) kv(t('ticket.contact'), meta.contact.slice(0, 40));
  if (meta.note) {
    y += 1;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...SUB);
    doc.text(t('ticket.note'), M, y); y += 3.8;
    doc.setTextColor(...INK);
    doc.text(wrap(meta.note, R - M), M, y); y += noteLines * 3.6 + 1;
  }

  const dashed = () => {
    doc.setDrawColor(...LINE); doc.setLineWidth(0.25); doc.setLineDashPattern([1, 0.9], 0);
    doc.line(M, y, R, y);
    doc.setLineDashPattern([], 0);
  };

  y += 1; dashed(); y += 5;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(...SUB);
  doc.text(t('ticket.qty').toUpperCase(), M, y);
  doc.text(t('ticket.product').toUpperCase(), M + 9, y);
  doc.text('In', R, y, { align: 'right' });
  y += 5;

  // Partidas
  for (const l of lines) {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.setTextColor(...INK);
    doc.text(`${l.qty}`, M, y);
    doc.text(l.product.Model, M + 9, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${l.product.Amperaje} A`, R, y, { align: 'right' });
    y += 4;
    doc.setFont('courier', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...SUB);
    doc.text(l.product.Codigo, M + 9, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${l.product.Polos} · ${/^NV/i.test(l.product.Model) ? t('series.NV') : t('series.NF')}`, R, y, { align: 'right' });
    y += 3.4;
    if (l.note) {
      doc.setFont('helvetica', 'italic'); doc.setFontSize(7.5); doc.setTextColor(...INK);
      const nl = wrap(l.note, R - M - 8);
      doc.text(nl, M + 9, y); y += nl.length * 3.4;
    }
    y += 3.6;
  }

  dashed(); y += 6;
  const pieces = lines.reduce((a, l) => a + l.qty, 0);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...SUB);
  doc.text(t('ticket.items'), M, y);
  doc.setTextColor(...INK); doc.text(String(lines.length), R, y, { align: 'right' });
  y += 5.5;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
  doc.text(t('ticket.pieces'), M, y);
  doc.text(String(pieces), R, y, { align: 'right' });
  y += 7;

  doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...SUB);
  const adv = wrap(t('ticket.advisor'), R - M);
  doc.text(adv, M, y); y += adv.length * 3.4 + 5;

  // Espacio para el asesor
  doc.setDrawColor(...LINE); doc.setLineWidth(0.25);
  for (const label of [t('ticket.attended'), t('ticket.signature'), t('ticket.dateLine')]) {
    doc.setFontSize(7.5); doc.setTextColor(...SUB);
    doc.text(label, M, y);
    doc.line(M + 17, y + 0.6, R, y + 0.6);
    y += 7.5;
  }

  y += 1; dashed(); y += 5.5;
  doc.setFontSize(7.5); doc.setTextColor(...INK);
  const show = wrap(t('ticket.show'), R - M);
  doc.text(show, center, y, { align: 'center' }); y += show.length * 3.4 + 1.5;
  doc.setTextColor(...SUB); doc.setFontSize(6.5);
  doc.text(t('ticket.notReceipt'), center, y, { align: 'center' }); y += 3.2;
  doc.text(`${BRAND.app} · ${folio}`, center, y, { align: 'center' });

  return doc.output('blob');
}
