import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist/renderer',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/renderer'),
      '@/components': path.resolve(__dirname, './src/renderer/components'),
      '@/services': path.resolve(__dirname, './src/renderer/services'),
      '@/types': path.resolve(__dirname, './src/renderer/types'),
      '@/utils': path.resolve(__dirname, './src/renderer/utils'),
      '@/shared': path.resolve(__dirname, './src/shared')
    }
  },
  server: {
    port: 3000
  }
}) 