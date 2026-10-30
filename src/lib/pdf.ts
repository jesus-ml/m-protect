import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Product } from '../types';
import { BRAND } from '../config';
import { classLabel, Lang, locale, T } from '../i18n';

const INK: [number, number, number] = [22, 22, 22];
const SUB: [number, number, number] = [110, 108, 104];
const LINE: [number, number, number] = [218, 216, 210];
const RED: [number, number, number] = [213, 0, 18];

/** Hoja técnica en PDF, sobria: tinta, líneas finas y un solo acento rojo. */
export function buildSpecSheet(
  product: Product, t: T, lang: Lang, imagePng?: string, logo?: { png: string; ratio: number },
): Blob {
  const doc = new jsPDF();
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 20;

  // Encabezado
  if (logo) {
    const h = 9;
    try { doc.addImage(logo.png, 'PNG', M, 14, h * logo.ratio, h); } catch { /* sin logo */ }
  } else if (BRAND.company) {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...INK);
    doc.text(BRAND.company.toUpperCase(), M, 20);
  }
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...SUB);
  doc.text(BRAND.app.toUpperCase(), W - M, 20, { align: 'right' });
  doc.setDrawColor(...LINE); doc.setLineWidth(0.2);
  doc.line(M, 28, W - M, 28);

  // Título
  doc.setFillColor(...RED);
  doc.rect(M, 37.2, 1.6, 1.6, 'F');
  doc.setFontSize(8); doc.setTextColor(...SUB);
  doc.text(t('pdf.title').toUpperCase(), M + 4, 38.6);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(24); doc.setTextColor(...INK);
  doc.text(product.Model, M, 50);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...SUB);
  doc.text(product.Codigo, M, 57);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(30); doc.setTextColor(...INK);
  doc.text(`${product.Amperaje} A`, W - M, 52, { align: 'right' });

  // Ilustración
  const artX = W - M - 46, artY = 66;
  doc.setDrawColor(...LINE); doc.rect(artX, artY, 46, 58);
  if (imagePng) { try { doc.addImage(imagePng, 'PNG', artX + 2, artY + 2, 42, 54); } catch { /* sin imagen */ } }
  doc.setFontSize(7); doc.setTextColor(...SUB);
  doc.text(t('pdf.art'), artX, artY + 63);

  const plain = {
    theme: 'plain' as const,
    styles: { fontSize: 9.5, cellPadding: { top: 2.2, bottom: 2.2, left: 0, right: 2 }, textColor: INK, lineColor: LINE, lineWidth: { bottom: 0.2 } },
  };

  autoTable(doc, {
    ...plain,
    startY: 66,
    margin: { left: M, right: W - artX + 8 },
    columnStyles: { 0: { textColor: SUB, cellWidth: 42 } },
    body: [
      [t('f.frame'), String(product.Frame)],
      [t('f.class'), classLabel(t, String(product.Class))],
      [t('f.poles'), String(product.Polos)],
      [t('row.in'), `${product.Amperaje} A`],
      [t('f.status'), product.marketStatus === 'Available' ? t('available') : t('discontinued')],
      [t('f.region'), product.region],
      [t('f.series'), /^NV/i.test(product.Model) ? t('series.NV') : t('series.NF')],
    ],
  });

  let y = Math.max((doc as any).lastAutoTable.finalY + 12, artY + 74);

  const heading = (label: string) => {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...SUB);
    doc.text(label.toUpperCase(), M, y);
    y += 3;
  };

  heading(t('g.desc'));
  doc.setFontSize(9.5); doc.setTextColor(...INK);
  const desc = doc.splitTextToSize(product.Descripción || t('pdf.noDesc'), W - 2 * M);
  doc.text(desc, M, y + 4);
  y += 10 + desc.length * 4.6;

  const specs = Object.entries(product.Specs ?? {}).filter(([k]) => !/rated current|number of poles/i.test(k));
  if (specs.length) {
    heading(t('g.specs'));
    autoTable(doc, {
      ...plain, startY: y, margin: { left: M, right: M },
      columnStyles: { 0: { textColor: SUB, cellWidth: 90 } },
      body: specs,
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  if (product.Accessories?.length) {
    heading(t('g.acc'));
    autoTable(doc, { ...plain, startY: y, margin: { left: M, right: M }, body: product.Accessories.map(a => [a]) });
  }

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setDrawColor(...LINE); doc.setLineWidth(0.2); doc.line(M, H - 20, W - M, H - 20);
    doc.setFontSize(7.5); doc.setTextColor(...SUB);
    doc.text(t('pdf.generated', { d: new Date().toLocaleDateString(locale(lang)), app: BRAND.app }), M, H - 14);
    doc.text(t('pdf.disclaimer'), M, H - 10);
    doc.text(`${i} / ${pages}`, W - M, H - 10, { align: 'right' });
  }

  return doc.output('blob');
}
