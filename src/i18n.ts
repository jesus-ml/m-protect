export type Lang = 'es' | 'en';

const es = {
  'app.tagline': 'Selección de interruptores en caja moldeada y de fuga a tierra',
  'home': 'Inicio',
  'style': 'Estilo', 'style.classic': 'Clásico', 'style.glass': 'Liquid Glass',
  'settings': 'Ajustes', 'fs.enter': 'Pantalla completa', 'fs.exit': 'Salir de pantalla completa', 'fs.na': 'La pantalla completa no está disponible en esta ventana.',
  'hint.label': 'Instrucciones', 'hint.on': 'Mostrar', 'hint.off': 'Ocultar', 'hint.hide': 'Ocultar',
  'hint.selector': 'Escribe la corriente que necesitas o toca un atajo, y elige los polos. La recomendación aparece abajo.',
  'hint.result': 'Toca «Cotizar» para agregarla a tu cotización o «Comparar» para verla junto a otras.',
  'hint.list': 'Toca una fila para ver su detalle completo.',
  'hint.compare': 'Las filas marcadas con un cuadro rojo son las que cambian entre productos.',
  'hint.quote': 'Ajusta cantidades y notas. Al terminar, toca «Ticket PDF» y muéstraselo a tu asesor.',
  'hint.catalog': 'Arrastra tu Excel a la izquierda o toca «Datos de ejemplo» para recuperar el catálogo precargado. La plantilla muestra el formato.',
  'hint.history': 'Toca una búsqueda para repetirla con los mismos filtros.',
  'start.how': 'Cómo se usa',
  'start.s1': 'Escribe la corriente que necesitas y elige los polos.',
  'start.s2': 'Revisa la recomendación y toca «Cotizar».',
  'start.s3': 'En Cotización genera el ticket PDF y muéstralo a tu asesor.',
  'exit.home': 'Pantalla de inicio',
  'nav.selector': 'Selector', 'nav.compare': 'Comparar', 'nav.quote': 'Cotización', 'nav.catalog': 'Catálogo', 'nav.history': 'Historial',
  'title.selector': 'Selector de interruptores',
  'head.looking': 'Buscas {a} A en {p} polos', 'head.series': 'serie {s}', 'head.best': 'Recomendado: {m} de {a} A', 'head.none': 'Sin producto compatible',
  'search': 'Buscar', 'exit': 'Salir',
  'products': '{n} productos',
  'catalog.sample': 'Catálogo de ejemplo', 'catalog.imported': 'Catálogo importado',
  'theme': 'Apariencia', 'theme.system': 'Sistema', 'theme.light': 'Claro', 'theme.dark': 'Oscuro',
  'lang': 'Idioma',

  'req.title': 'Requisitos', 'reset': 'Restablecer',
  'f.current': 'Corriente requerida', 'f.poles': 'Polos', 'f.series': 'Serie', 'all': 'Todas',
  'f.sens': 'Sensibilidad', 'onlyNV': 'solo NV', 'any': 'Cualquiera', 'f.frame': 'Frame', 'f.class': 'Clase',
  'f.status': 'Estado', 'available': 'Disponible', 'legacy': 'Legado', 'discontinued': 'Descontinuado', 'f.region': 'Región',
  'series.NF': 'Caja moldeada', 'series.NV': 'Fuga a tierra',
  'sens.30': 'Protección de personas', 'sens.adj': 'Ajustable',
  'class.Economy': 'Económica', 'class.Standard': 'Estándar', 'class.High-performance': 'Alto desempeño', 'class.Ultra current-limiting': 'Ultralimitadora', 'class.Miniature': 'Miniatura (riel DIN)',

  'calc.btn': 'Desde la carga', 'calc.kw': 'Potencia (kW)', 'calc.v': 'Tensión (V)', 'calc.pf': 'Factor de potencia',
  'calc.system': 'Sistema', 'calc.3': 'Trifásico', 'calc.1': 'Monofásico', 'calc.cont': 'Carga continua (×1.25)',
  'calc.use': 'Usar {a} A',
  'calc.note': 'I = P / (√3·V·fp) en trifásico y P / (V·fp) en monofásico. El 125 % aplica a cargas continuas según la NOM-001-SEDE. Es una guía rápida y no sustituye el cálculo del proyecto.',

  'match.exact': 'Coincidencia exacta', 'match.nextUp': 'Capacidad inmediata superior', 'match.relaxed': 'Coincidencia aproximada',
  'match.undersized': 'Capacidad insuficiente', 'match.none': 'Sin resultado',
  'msg.exact': 'Hay un producto de exactamente {req} A.',
  'msg.nextUp': 'No hay {req} A exactos. {inA} A es la menor In que los cubre.',
  'msg.relaxed': 'Para encontrar algo se ignoró: {f}.',
  'msg.undersized': 'Nada compatible llega a {req} A. El mayor disponible es {inA} A.',
  'none.title': 'No hay productos compatibles',
  'none.text': 'Ningún producto tiene esa combinación de serie, polos y estado. Cambia esos filtros o importa un catálogo más completo.',

  'load': 'Carga sobre In',
  'quote.add': 'Cotizar', 'quote.addLong': 'Agregar a cotización',
  'compare.add': 'Comparar', 'compare.remove': 'Quitar de comparar', 'detail': 'Ver detalle', 'pdf': 'Hoja técnica PDF',
  'list.meets': 'Cumplen {req} A', 'list.biggest': 'Mayores disponibles', 'list.hint': '↑ ↓ para recorrer', 'list.count': '{n} opciones',

  'insp.empty.title': 'Sin selección', 'insp.empty.text': 'Elige un producto de la lista para ver sus especificaciones.',
  'insp.over': 'La corriente pedida supera la In. Este interruptor no es suficiente.',
  'insp.tight': 'Margen menor al 10 %. Considera la siguiente capacidad si la carga puede crecer.',
  'insp.margin': 'Margen de {p} % sobre la corriente pedida.',
  'g.ident': 'Identificación', 'g.specs': 'Especificaciones', 'g.desc': 'Descripción', 'g.acc': 'Accesorios sugeridos',
  'row.in': 'Corriente nominal', 'qty': 'Cantidad', 'less': 'Menos', 'more': 'Más', 'close': 'Cerrar', 'closeDetail': 'Cerrar detalle',

  'toast.quoted': '{m} {a} A agregado a la cotización.', 'view': 'Ver', 'open': 'Abrir',
  'toast.cmpFull': 'Solo se comparan {n} productos a la vez. Quita uno primero.',
  'toast.cmpAdded': '{c} agregado a comparar.',
  'toast.pdfOk': 'Hoja técnica de {m} lista.', 'toast.pdfErr': 'No se pudo generar el PDF. Intenta de nuevo.',
  'closeToast': 'Cerrar aviso',

  'compare.empty.title': 'Nada que comparar',
  'compare.empty.text': 'Usa “Comparar” en hasta {n} productos para verlos lado a lado.',
  'goSelector': 'Ir al selector', 'compare.hint': 'Las filas marcadas cambian entre productos.', 'clear': 'Vaciar', 'accessories': 'Accesorios',

  'quote.empty.title': 'La cotización está vacía',
  'quote.empty.text': 'Agrega productos con “Cotizar” desde el selector. Aquí ajustas cantidades y exportas a Excel.',
  'quote.summary': '{l} partidas · {p} piezas', 'quote.clearQ': '¿Vaciar la cotización?', 'cancel': 'Cancelar',
  'export': 'Exportar a Excel', 'quote.exported': 'Cotización exportada a Excel.', 'quote.exportErr': 'No se pudo exportar la cotización.',
  'quote.missing': '{n} partida(s) ya no están en el catálogo actual y no se exportarán.',
  'note.ph': 'Nota (tablero, ubicación…)', 'remove': 'Quitar {c}',

  'cat.drop': 'Suelta tu Excel aquí o haz clic para elegirlo',
  'cat.dropSub': '.xlsx, .xls o .csv. Se lee en tu navegador y no se sube a ningún servidor.',
  'cat.import': 'Importación', 'cat.onImport': 'Al importar', 'cat.merge': 'Agregar', 'cat.replace': 'Reemplazar',
  'cat.template': 'Plantilla', 'cat.sample': 'Datos de ejemplo', 'cat.more': 'Mostrar más ({n} restantes)', 'cat.restore': 'Restaurar ejemplo', 'cat.restoreYes': 'Sí, restaurar', 'no': 'No',
  'cat.sheet': 'Hoja {s}: {n} productos', 'cat.filter': 'Filtrar por código o modelo',
  'col.code': 'Código', 'col.model': 'Modelo', 'col.in': 'In', 'noMatch': 'Ningún producto coincide con “{q}”.',
  'imp.none': '“{f}” no tiene productos reconocibles. Cada hoja necesita una fila “Parameter” y otra “Rated current”. Descarga la plantilla para ver el formato.',
  'imp.ok': '{n} productos leídos de {f}. El catálogo tiene {t}.',
  'imp.err': 'No se pudo leer “{f}”. Debe ser un .xlsx, .xls o .csv válido.',
  'tpl.err': 'No se pudo descargar la plantilla.', 'sample.ok': 'Se agregaron {n} productos de ejemplo.',
  'restored': 'Catálogo restaurado al ejemplo.',

  'history.empty.title': 'Sin búsquedas todavía',
  'history.empty.text': 'Cada búsqueda en el selector se guarda aquí para repetirla con un clic.',
  'history.clear': 'Borrar historial',

  'pal.ph': 'Código, modelo, “63 A” o una acción', 'pal.none': 'Sin resultados para “{q}”.', 'pal.move': 'moverse', 'pal.open': 'abrir',
  'pal.action': 'Acción', 'pal.products': 'Productos', 'pal.goto': 'Ir a', 'pal.prefs': 'Preferencias',
  'pal.amp': 'Buscar interruptor de {a} A', 'pal.catalog': 'Catálogo e importación de Excel',
  'pal.light': 'Usar modo claro', 'pal.dark': 'Usar modo oscuro', 'pal.lang': 'Switch to English', 'pal.exit': 'Salir de la aplicación',

  'start.lead': 'Elige el interruptor correcto a partir de la corriente que necesitas.',
  'start.p1': 'Resultado en vivo con la menor In que cubre tu carga',
  'start.p2': 'Comparación lado a lado y lista de cotización',
  'start.p3': 'Hojas técnicas en PDF y exportación a Excel',
  'start.enter': 'Comenzar', 'start.catalog': '{n} productos en el catálogo',
  'start.resume': 'Tienes una cotización guardada con {n} piezas.',

  'exit.title': 'Sesión terminada', 'exit.thanks': 'Gracias por usar {app}.',
  'exit.searches': 'Búsquedas', 'exit.lines': 'Partidas cotizadas', 'exit.compared': 'En comparación',
  'exit.saved': 'Tus datos quedan guardados en este navegador para la próxima vez.',
  'exit.wipe': 'Borrar mis datos de este navegador', 'exit.wipeConfirm': '¿Borrar catálogo, cotización e historial?',
  'exit.wipeYes': 'Sí, borrar', 'exit.wiped': 'Se borraron tus datos de este navegador.',
  'exit.export': 'Exportar cotización', 'exit.back': 'Volver a entrar',

  // PDF y Excel
  'pdf.title': 'Hoja de especificaciones técnicas', 'pdf.art': 'Ilustración de referencia', 'pdf.param': 'Parámetro', 'pdf.value': 'Valor',
  'pdf.noDesc': 'Sin descripción', 'pdf.generated': 'Generado el {d} con {app}.',
  'pdf.disclaimer': 'Documento de referencia. Verifique los valores con el catálogo oficial del fabricante.',
  'xls.title': 'Lista de cotización', 'xls.generated': 'Generada el {d}', 'xls.desc': 'Descripción', 'xls.poles': 'Polos',
  'xls.qty': 'Cantidad', 'xls.note': 'Nota', 'xls.total': 'Total de piezas', 'xls.sheet': 'Cotización', 'xls.file': 'cotizacion',
  'ticket.btn': 'Ticket PDF', 'ticket.title': 'Solicitud de cotización', 'ticket.folio': 'Folio', 'ticket.date': 'Fecha',
  'ticket.client': 'Cliente', 'ticket.contact': 'Contacto', 'ticket.note': 'Nota', 'ticket.items': 'Partidas', 'ticket.pieces': 'Piezas',
  'ticket.qty': 'Cant.', 'ticket.product': 'Producto',
  'ticket.advisor': 'Precios, existencias y tiempos de entrega los confirma tu asesor.',
  'ticket.attended': 'Atendió', 'ticket.signature': 'Firma', 'ticket.dateLine': 'Fecha',
  'ticket.show': 'Muestra este ticket a la persona que te ayudará con tu compra.',
  'ticket.notReceipt': 'No es comprobante fiscal ni cotización formal.',
  'ticket.ok': 'Ticket {f} listo.', 'ticket.err': 'No se pudo generar el ticket. Intenta de nuevo.', 'ticket.file': 'ticket_cotizacion',
  'meta.title': 'Datos para tu asesor', 'meta.hint': 'Opcionales. Aparecen en el ticket.',
  'meta.name': 'Nombre o empresa', 'meta.contact': 'Teléfono o correo', 'meta.note': 'Nota general (proyecto, obra, fecha requerida…)',

} as const;

type Key = keyof typeof es;

const en: Record<Key, string> = {
  'app.tagline': 'Molded case and earth leakage circuit breaker selection',
  'home': 'Home',
  'style': 'Style', 'style.classic': 'Classic', 'style.glass': 'Liquid Glass',
  'settings': 'Settings', 'fs.enter': 'Full screen', 'fs.exit': 'Exit full screen', 'fs.na': 'Full screen is not available in this window.',
  'hint.label': 'Instructions', 'hint.on': 'Show', 'hint.off': 'Hide', 'hint.hide': 'Hide',
  'hint.selector': 'Type the current you need or tap a shortcut, and choose the poles. The recommendation appears below.',
  'hint.result': 'Tap “Quote” to add it to your quote, or “Compare” to see it next to others.',
  'hint.list': 'Tap a row to see its full details.',
  'hint.compare': 'Rows marked with a red square are the ones that differ between products.',
  'hint.quote': 'Adjust quantities and notes. When you are done, tap “Ticket PDF” and show it to your advisor.',
  'hint.catalog': 'Drop your Excel file on the left or tap “Sample data” to bring back the preloaded catalog. The template shows the format.',
  'hint.history': 'Tap a search to run it again with the same filters.',
  'start.how': 'How it works',
  'start.s1': 'Type the current you need and choose the poles.',
  'start.s2': 'Check the recommendation and tap “Quote”.',
  'start.s3': 'In Quote, create the PDF ticket and show it to your advisor.',
  'exit.home': 'Home screen',
  'nav.selector': 'Selector', 'nav.compare': 'Compare', 'nav.quote': 'Quote', 'nav.catalog': 'Catalog', 'nav.history': 'History',
  'title.selector': 'Breaker selector',
  'head.looking': 'Looking for {a} A, {p} poles', 'head.series': '{s} series', 'head.best': 'Recommended: {m}, {a} A', 'head.none': 'No compatible product',
  'search': 'Search', 'exit': 'Exit',
  'products': '{n} products',
  'catalog.sample': 'Sample catalog', 'catalog.imported': 'Imported catalog',
  'theme': 'Appearance', 'theme.system': 'System', 'theme.light': 'Light', 'theme.dark': 'Dark',
  'lang': 'Language',

  'req.title': 'Requirements', 'reset': 'Reset',
  'f.current': 'Required current', 'f.poles': 'Poles', 'f.series': 'Series', 'all': 'All',
  'f.sens': 'Sensitivity', 'onlyNV': 'NV only', 'any': 'Any', 'f.frame': 'Frame', 'f.class': 'Class',
  'f.status': 'Status', 'available': 'Available', 'legacy': 'Legacy', 'discontinued': 'Discontinued', 'f.region': 'Region',
  'series.NF': 'Molded case', 'series.NV': 'Earth leakage',
  'sens.30': 'Personnel protection', 'sens.adj': 'Adjustable',
  'class.Economy': 'Economy', 'class.Standard': 'Standard', 'class.High-performance': 'High performance', 'class.Ultra current-limiting': 'Ultra current-limiting', 'class.Miniature': 'Miniature (DIN rail)',

  'calc.btn': 'From load', 'calc.kw': 'Power (kW)', 'calc.v': 'Voltage (V)', 'calc.pf': 'Power factor',
  'calc.system': 'System', 'calc.3': 'Three-phase', 'calc.1': 'Single-phase', 'calc.cont': 'Continuous load (×1.25)',
  'calc.use': 'Use {a} A',
  'calc.note': 'I = P / (√3·V·pf) for three-phase and P / (V·pf) for single-phase. The 125 % factor applies to continuous loads (NOM-001-SEDE / NEC). A quick guide, not a replacement for the project calculation.',

  'match.exact': 'Exact match', 'match.nextUp': 'Next rating up', 'match.relaxed': 'Approximate match',
  'match.undersized': 'Insufficient rating', 'match.none': 'No result',
  'msg.exact': 'There is a product rated exactly {req} A.',
  'msg.nextUp': 'No exact {req} A rating. {inA} A is the smallest In that covers it.',
  'msg.relaxed': 'To find a match, these filters were ignored: {f}.',
  'msg.undersized': 'Nothing compatible reaches {req} A. The largest available is {inA} A.',
  'none.title': 'No compatible products',
  'none.text': 'No product has that combination of series, poles and status. Change those filters or import a fuller catalog.',

  'load': 'Load on In',
  'quote.add': 'Quote', 'quote.addLong': 'Add to quote',
  'compare.add': 'Compare', 'compare.remove': 'Remove from compare', 'detail': 'Details', 'pdf': 'Spec sheet PDF',
  'list.meets': 'Rated for {req} A', 'list.biggest': 'Largest available', 'list.hint': '↑ ↓ to browse', 'list.count': '{n} options',

  'insp.empty.title': 'Nothing selected', 'insp.empty.text': 'Pick a product from the list to see its specifications.',
  'insp.over': 'The requested current exceeds In. This breaker is not enough.',
  'insp.tight': 'Less than 10 % headroom. Consider the next rating if the load may grow.',
  'insp.margin': '{p} % headroom over the requested current.',
  'g.ident': 'Identification', 'g.specs': 'Specifications', 'g.desc': 'Description', 'g.acc': 'Suggested accessories',
  'row.in': 'Rated current', 'qty': 'Quantity', 'less': 'Less', 'more': 'More', 'close': 'Close', 'closeDetail': 'Close details',

  'toast.quoted': '{m} {a} A added to the quote.', 'view': 'View', 'open': 'Open',
  'toast.cmpFull': 'You can compare up to {n} products. Remove one first.',
  'toast.cmpAdded': '{c} added to compare.',
  'toast.pdfOk': 'Spec sheet for {m} is ready.', 'toast.pdfErr': 'Could not create the PDF. Try again.',
  'closeToast': 'Dismiss',

  'compare.empty.title': 'Nothing to compare',
  'compare.empty.text': 'Use “Compare” on up to {n} products to see them side by side.',
  'goSelector': 'Go to selector', 'compare.hint': 'Marked rows differ between products.', 'clear': 'Clear', 'accessories': 'Accessories',

  'quote.empty.title': 'The quote is empty',
  'quote.empty.text': 'Add products with “Quote” in the selector. Here you set quantities and export to Excel.',
  'quote.summary': '{l} lines · {p} pieces', 'quote.clearQ': 'Clear the quote?', 'cancel': 'Cancel',
  'export': 'Export to Excel', 'quote.exported': 'Quote exported to Excel.', 'quote.exportErr': 'Could not export the quote.',
  'quote.missing': '{n} line(s) are no longer in the current catalog and will not be exported.',
  'note.ph': 'Note (panel, location…)', 'remove': 'Remove {c}',

  'cat.drop': 'Drop your Excel file here or click to choose it',
  'cat.dropSub': '.xlsx, .xls or .csv. It is read in your browser and never uploaded.',
  'cat.import': 'Import', 'cat.onImport': 'On import', 'cat.merge': 'Merge', 'cat.replace': 'Replace',
  'cat.template': 'Template', 'cat.sample': 'Sample data', 'cat.more': 'Show more ({n} left)', 'cat.restore': 'Restore sample', 'cat.restoreYes': 'Yes, restore', 'no': 'No',
  'cat.sheet': 'Sheet {s}: {n} products', 'cat.filter': 'Filter by code or model',
  'col.code': 'Code', 'col.model': 'Model', 'col.in': 'In', 'noMatch': 'No product matches “{q}”.',
  'imp.none': '“{f}” has no recognizable products. Each sheet needs a “Parameter” row and a “Rated current” row. Download the template to see the format.',
  'imp.ok': '{n} products read from {f}. The catalog now has {t}.',
  'imp.err': 'Could not read “{f}”. It must be a valid .xlsx, .xls or .csv file.',
  'tpl.err': 'Could not download the template.', 'sample.ok': '{n} sample products added.',
  'restored': 'Catalog restored to the sample.',

  'history.empty.title': 'No searches yet',
  'history.empty.text': 'Every search in the selector is kept here so you can run it again with one click.',
  'history.clear': 'Clear history',

  'pal.ph': 'Code, model, “63 A” or an action', 'pal.none': 'No results for “{q}”.', 'pal.move': 'move', 'pal.open': 'open',
  'pal.action': 'Action', 'pal.products': 'Products', 'pal.goto': 'Go to', 'pal.prefs': 'Preferences',
  'pal.amp': 'Find a {a} A breaker', 'pal.catalog': 'Catalog and Excel import',
  'pal.light': 'Use light mode', 'pal.dark': 'Use dark mode', 'pal.lang': 'Cambiar a español', 'pal.exit': 'Exit the app',

  'start.lead': 'Choose the right breaker from the current you need.',
  'start.p1': 'Live results with the smallest In that covers your load',
  'start.p2': 'Side-by-side comparison and a quote list',
  'start.p3': 'PDF spec sheets and Excel export',
  'start.enter': 'Start', 'start.catalog': '{n} products in the catalog',
  'start.resume': 'You have a saved quote with {n} pieces.',

  'exit.title': 'Session closed', 'exit.thanks': 'Thank you for using {app}.',
  'exit.searches': 'Searches', 'exit.lines': 'Quote lines', 'exit.compared': 'In compare',
  'exit.saved': 'Your data stays saved in this browser for next time.',
  'exit.wipe': 'Erase my data from this browser', 'exit.wipeConfirm': 'Erase catalog, quote and history?',
  'exit.wipeYes': 'Yes, erase', 'exit.wiped': 'Your data was erased from this browser.',
  'exit.export': 'Export quote', 'exit.back': 'Enter again',

  'pdf.title': 'Technical specification sheet', 'pdf.art': 'Reference illustration', 'pdf.param': 'Parameter', 'pdf.value': 'Value',
  'pdf.noDesc': 'No description', 'pdf.generated': 'Generated on {d} with {app}.',
  'pdf.disclaimer': "Reference document. Check all values against the manufacturer's official catalog.",
  'xls.title': 'Quote list', 'xls.generated': 'Generated on {d}', 'xls.desc': 'Description', 'xls.poles': 'Poles',
  'xls.qty': 'Quantity', 'xls.note': 'Note', 'xls.total': 'Total pieces', 'xls.sheet': 'Quote', 'xls.file': 'quote',
  'ticket.btn': 'Ticket PDF', 'ticket.title': 'Quote request', 'ticket.folio': 'Ref.', 'ticket.date': 'Date',
  'ticket.client': 'Customer', 'ticket.contact': 'Contact', 'ticket.note': 'Note', 'ticket.items': 'Lines', 'ticket.pieces': 'Pieces',
  'ticket.qty': 'Qty', 'ticket.product': 'Product',
  'ticket.advisor': 'Prices, stock and lead times are confirmed by your sales advisor.',
  'ticket.attended': 'Served by', 'ticket.signature': 'Signature', 'ticket.dateLine': 'Date',
  'ticket.show': 'Show this ticket to the person helping you with your purchase.',
  'ticket.notReceipt': 'Not a tax receipt or a formal quotation.',
  'ticket.ok': 'Ticket {f} is ready.', 'ticket.err': 'Could not create the ticket. Try again.', 'ticket.file': 'quote_ticket',
  'meta.title': 'Details for your advisor', 'meta.hint': 'Optional. Shown on the ticket.',
  'meta.name': 'Name or company', 'meta.contact': 'Phone or email', 'meta.note': 'General note (project, site, date needed…)',

};

const dicts: Record<Lang, Record<Key, string>> = { es, en };

export type T = (key: Key, vars?: Record<string, string | number>) => string;

export function makeT(lang: Lang): T {
  return (key, vars) => {
    let s = dicts[lang][key] ?? es[key] ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
    return s;
  };
}

export const locale = (lang: Lang) => (lang === 'es' ? 'es-MX' : 'en-US');

export function detectLang(): Lang {
  try {
    const saved = localStorage.getItem('ps_lang');
    if (saved === 'es' || saved === 'en') return saved;
  } catch { /* sin almacenamiento */ }
  return typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'es';
}

export function classLabel(t: T, c: string) {
  const k = `class.${c}` as Key;
  return k in es ? t(k) : c;
}
