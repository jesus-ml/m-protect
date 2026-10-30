import { Product } from '../types';
import { buildSpecSheet } from './pdf';
import { saveFile } from './download';
import { findLogos } from '../components/Brand';
import { Lang, T } from '../i18n';

/** Rasteriza una imagen (SVG o PNG) a PNG para jsPDF. */
function rasterize(src: string, maxW = 600): Promise<{ png: string; ratio: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const ratio = (img.naturalWidth || 4) / (img.naturalHeight || 1);
      const w = maxW, h = Math.round(maxW / ratio);
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const ctx = c.getContext('2d');
      if (!ctx) return reject(new Error('canvas'));
      ctx.drawImage(img, 0, 0, w, h);
      resolve({ png: c.toDataURL('image/png'), ratio });
    };
    img.onerror = () => reject(new Error('imagen'));
    img.src = src;
  });
}

/** Genera y guarda la hoja técnica. `svg` debe ser la ilustración en modo impresión (colores fijos). */
export async function exportSpecSheet(product: Product, svg: SVGSVGElement | null, t: T, lang: Lang) {
  let art: string | undefined;
  if (svg) {
    try {
      const xml = new XMLSerializer().serializeToString(svg);
      art = (await rasterize('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml), 480)).png;
    } catch { /* sin ilustración */ }
  }
  let logo: { png: string; ratio: number } | undefined;
  const { light } = await findLogos();
  if (light) { try { logo = await rasterize(light); } catch { /* sin logo */ } }
  await saveFile(`${product.Codigo}_${lang === 'es' ? 'hoja_tecnica' : 'spec_sheet'}.pdf`, buildSpecSheet(product, t, lang, art, logo));
}

/** Genera y guarda el ticket de la cotización. Devuelve el folio. */
export async function exportQuoteTicket(
  lines: import('./ticket').TicketLine[], meta: import('../types').QuoteMeta, t: T, lang: Lang,
) {
  const { buildQuoteTicket, makeFolio } = await import('./ticket');
  const folio = makeFolio();
  let logo: { png: string; ratio: number } | undefined;
  const { light } = await findLogos();
  if (light) { try { logo = await rasterize(light); } catch { /* sin logo */ } }
  await saveFile(`${t('ticket.file')}_${folio}.pdf`, buildQuoteTicket(lines, meta, t, lang, folio, logo));
  return folio;
}
