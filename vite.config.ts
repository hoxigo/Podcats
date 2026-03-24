import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

const isElectron = process.env.ELECTRON === 'true';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
  base: isElectron ? './' : '/',
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
  },
});
