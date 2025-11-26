import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Relative paths
  server: {
    host: '0.0.0.0', // Cho phép truy cập từ bên ngoài
    port: 5173,
    strictPort: false,
    allowedHosts: ['codeft.duckdns.org'], // Thêm domain của bạn
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    cssCodeSplit: false, // TẮT CSS code splitting
    rollupOptions: {
      output: {
        manualChunks: undefined,
        
      }
    }
  }
})