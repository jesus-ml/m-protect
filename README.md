# M-Protect

Selector de interruptores en caja moldeada (serie NF) y de fuga a tierra (serie NV).
Indicas la corriente que necesitas y propone la **menor corriente nominal In que la cubre**,
con alternativas, accesorios sugeridos y hoja técnica en PDF.

Es una app 100 % estática (React + Vite): no necesita servidor ni claves de API.
El Excel se lee en el navegador y el catálogo importado se guarda en `localStorage`.

## Funciones

- **Instrucciones breves** dentro de cada tarjeta, bajo su título (se ocultan o muestran en la barra lateral).
- **Volver al inicio** desde el botón «Inicio», el logo o la pantalla de salida.
- **Pantalla de inicio y de salida**: la salida resume la sesión y permite exportar la cotización o borrar los datos del navegador.
- **Español e inglés** en toda la interfaz, el PDF y el Excel exportado (selector en la barra lateral, en la pantalla de inicio o en ⌘K).

- **Búsqueda en vivo**: el resultado cambia mientras mueves los filtros; no hay botón “Buscar”.
- **Carga sobre In**: cada opción muestra qué porcentaje de su In usa la corriente pedida (verde < 90 %, ámbar 90–100 %, rojo > 100 %).
- **Inspector** a la derecha con especificaciones, accesorios, cantidad y PDF. En pantallas angostas se abre como hoja lateral.
- **Comparar** hasta 3 productos lado a lado; se resaltan las filas que cambian.
- **Cotización**: lista con cantidades y notas por partida, exportable a Excel.
- **Ticket PDF de cotización**: tira tipo ticket con folio (MP-AAMMDD-XXXX), fecha, datos opcionales del cliente,
  partidas, total de piezas y espacio para que el asesor anote quién atendió. Pensado para mostrarlo a quien ayuda con la compra.
- **⌘K / Ctrl+K**: busca por código o modelo, escribe “63” para buscar 63 A, o salta a cualquier sección.
- Flechas ↑ ↓ para recorrer la lista de resultados.
- Calculadora de corriente desde kW, V y fp.
- **Ajustes** en un solo panel (barra lateral → Ajustes): estilo, idioma, apariencia e instrucciones.
- **Pantalla completa** desde Ajustes, el botón junto a la búsqueda o ⌘K / Ctrl+K.
- Modo claro, oscuro o según el sistema.
- **Liquid Glass oscuro por defecto**: paneles de vidrio translúcido con desenfoque, bordes con brillo, esquinas amplias
  y un fondo de color suave en movimiento. En Ajustes se puede cambiar a Clásico y a modo claro o según el sistema.

## Logo y marca

- Coloca el logotipo en `public/brand/logo.svg` (o `.png`). Opcional: `logo-dark.svg` para modo oscuro.
  Aparece en la barra lateral y en el encabezado del PDF. Si no hay archivo, se muestra el nombre en texto.
- El nombre de la empresa está en `src/config.ts`. Para compilar sin marca: `VITE_COMPANY="" npm run build`.
- Usa el logotipo y el nombre solo si tienes autorización para usar la marca.

## Diseño

macOS moderno (Big Sur–Sonoma) con sobriedad japonesa. Fondo gris muy claro con el contenido en
tarjetas blancas redondeadas, sin degradados; barra lateral translúcida; barra de herramientas con campo de búsqueda; controles
segmentados con una pastilla blanca que se desliza; menús con flechas sobre un cuadro rojo.
Tipografía del sistema (San Francisco). Un solo acento rojo: botón por defecto, íconos de la barra
lateral, selección y la In recomendada. Botones de 36 px o más y texto de 14 px.

## Uso local

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # pruebas de búsqueda y lector de Excel
npm run build        # dist/ para cualquier hosting estático
npm run build:single # dist-single/index.html, todo en un archivo
```

## Publicar en GitHub Pages

1. Sube el repo a GitHub (rama `main`).
2. En **Settings → Pages → Build and deployment**, elige **GitHub Actions**.
3. Cada push a `main` ejecuta `.github/workflows/deploy.yml` (lint, pruebas, build y despliegue).
   La URL queda como `https://<usuario>.github.io/<repo>/`.

## Cómo elige el producto

1. **Filtros duros** (nunca se relajan): serie, polos y estado (disponible o descontinuado).
2. Entre lo que queda, toma los productos con `In ≥ corriente pedida` y elige el de menor In.
   - `In == pedida` → *Coincidencia exacta*.
   - `In > pedida` → *Capacidad inmediata superior*.
3. Si no hay ninguno, relaja filtros secundarios en este orden: clase, frame, sensibilidad, región,
   y avisa cuáles ignoró (*Coincidencia aproximada*).
4. Si ni así algo alcanza la corriente, muestra el de mayor In con aviso de *Capacidad insuficiente*.

La calculadora opcional obtiene la corriente desde la carga:
`I = P / (√3·V·fp)` en trifásico, `P / (V·fp)` en monofásico, ×1.25 si es carga continua.

## Formato del Excel

Una hoja por familia. Puedes descargar la plantilla desde la sección **Catálogo**.

| Parameter                       | NV63-SV (Frame 63) | NV125-SV (Frame 125) |
|---------------------------------|--------------------|----------------------|
| Rated current In (A)            | 40 50 63           | 100 125              |
| Number of poles                 | 3                  | 3                    |
| Rated sensitivity current (mA)  | 30                 | 100.200.500          |
| …cualquier otra especificación  | …                  | …                    |

- La primera celda de la hoja es el título; de ahí se toma la clase (`Economy`, `Standard`; si no, `High-performance`),
  y si dice `Asia` o `Discontinued` se marca región o estado.
- Cada amperaje de la fila *Rated current* se vuelve un producto.
- Filas que empiezan con `*`, `Note` o `Accessory` se toman como accesorios sugeridos.
- Una hoja sin fila `Parameter` se lee como tabla plana con columnas `Model, Frame, Class, Polos, Amperaje, …`.
- Al importar puedes **agregar** (el código repetido se sobrescribe) o **reemplazar** el catálogo.

## Estructura

```
src/
  App.tsx                     ventana: barra lateral, barra de título, inspector, avisos
  store.tsx                   estado global (catálogo, filtros, cotización, comparar, tema)
  config.ts                   nombre de empresa y rutas del logo
  views/SelectorView.tsx      requisitos, calculadora, mejor opción y lista de candidatos
  views/OtherViews.tsx        comparar, cotización, catálogo e historial
  components/Inspector.tsx    detalle del producto y acciones
  components/CommandPalette.tsx  paleta ⌘K
  components/Brand.tsx        logo o nombre
  components/BreakerArt.tsx   ilustración SVG del interruptor (también va al PDF)
  components/ui.tsx           botones, controles segmentados, grupos
  lib/matching.ts             lógica de selección y calculadora de corriente
  lib/excel.ts                lector de Excel, plantilla y exportación de cotización
  lib/pdf.ts, lib/export.ts   hoja técnica con jsPDF + autotable
  lib/ticket.ts               ticket PDF de la cotización
  lib/storage.ts              persistencia en localStorage
product_db.json               catálogo de ejemplo (el que usa la versión pública)
scripts/seed-from-excel.ts    convierte un Excel de catálogo en data/catalog.full.json;
                              si ese archivo existe, los builds locales lo precargan en lugar del ejemplo
public/brand/                 aquí va el logotipo
tests/run.ts                  pruebas
```

## Cambios respecto al prototipo de AI Studio

- Ya no usa servidor Express: el Excel se procesa en el navegador. Se quitaron Gemini, axios y multer, que no se usaban.
- **PDF corregido**: antes nunca se descargaba si las imágenes remotas fallaban, porque la imagen de respaldo se reintentaba sin fin.
  Ahora la ilustración es un SVG local.
- **Búsqueda corregida**: antes, si nada se acercaba al amperaje, todos los productos quedaban empatados en 0 puntos
  y salía el primero de la lista (por ejemplo, 50 A al pedir 250 A). Ahora se aplica la regla `In ≥ corriente`.
- La importación puede agregar o reemplazar el catálogo (antes siempre reemplazaba), y muestra un resumen por hoja.
- El historial mostraba `Model: undefined`; ahora muestra los filtros reales y el código resultante.
- Interfaz en español, calculadora de corriente, tabla de catálogo con filtro y borrado,
  plantilla Excel descargable y PDF con tabla completa de especificaciones.
- Se quitaron los textos de relleno ("AES-256", "Nagoya Mainframe", "Server NGY-01") y el logo remoto, que ya no cargaba; ahora el logo va en `public/brand/`.

Los datos del catálogo son de ejemplo. Verifica siempre contra el catálogo oficial del fabricante.
