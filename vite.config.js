// File: vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000
  },
  build: {
    outDir: 'dist'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // para importar desde "@/components/..."
    }
  },
  base: '/', // 🔥 importante para evitar rutas absolutas rotas en deploy
});