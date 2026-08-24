import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 12001,
    proxy: {
      '/api': 'http://localhost:12000',
      '/uploads': 'http://localhost:12000',
    },
  },
});
