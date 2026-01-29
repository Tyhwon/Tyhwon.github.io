
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Sangat penting untuk GitHub Pages agar path file relatif
  server: {
    port: 5173,
    strictPort: true,
  },
  define: {
    // Memastikan process.env tersedia di sisi client saat build
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});
