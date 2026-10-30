import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Catálogo precargado: si existe data/catalog.full.json (interno, no va al repositorio)
// se usa ese; si no, o con VITE_PUBLIC=1, se usa el ejemplo product_db.json.
const full = path.resolve(__dirname, 'data/catalog.full.json');
const seed = fs.existsSync(full) && process.env.VITE_PUBLIC !== '1' ? full : path.resolve(__dirname, 'product_db.json');

// `npm run build`        → dist/ normal (GitHub Pages, cualquier hosting estático)
// `npm run build:single` → dist-single/index.html, todo en un solo archivo
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react(), tailwindcss(), ...(mode === 'single' ? [viteSingleFile()] : [])],
  resolve: { alias: { '@seed': seed, '@': path.resolve(__dirname, '.') } },
  build: mode === 'single' ? { outDir: 'dist-single' } : {},
}));
