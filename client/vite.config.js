/**
 * @file frontend/vite.config.js
 * @description Vite configuration for the SHOPEZ React frontend.
 *
 * Features:
 * - React plugin with Fast Refresh (HMR)
 * - Dev server proxy to backend (avoids CORS issues during development)
 * - Build output to 'dist' directory
 * - Port 5173 for dev server
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // Development server configuration
  server: {
    port: 5173,
    open: true, // Auto-open browser on start

    // Proxy API requests to the Express backend during development
    // This avoids CORS issues — requests to /api/* are forwarded to localhost:5000
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable source maps in production
  },
});
