/**
 * Identidad de la app. Se puede cambiar sin tocar el código con variables de entorno
 * al compilar, p. ej.  VITE_COMPANY="" npm run build  para una versión sin marca.
 *
 * El logotipo se toma de public/brand/logo.svg (o .png). Ver public/brand/README.md.
 */
const env = (import.meta as any).env ?? {};

export const BRAND = {
  /** Nombre de la empresa que aparece junto al logo y en el PDF. Vacío = sin marca. */
  company: env.VITE_COMPANY ?? 'Mitsubishi Electric',
  /** Nombre de la herramienta */
  app: 'M-Protect',
  /** Archivos de logo que se intentan cargar, en orden */
  logos: ['brand/logo.svg', 'brand/logo.png'],
  logosDark: ['brand/logo-dark.svg', 'brand/logo-dark.png'],
};
