import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
  base: './',   // ← Critical: use relative paths for file:// protocol
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
  },
});
