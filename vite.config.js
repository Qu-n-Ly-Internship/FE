import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // Quan trọng! Dùng './' cho relative paths
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
