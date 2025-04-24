import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  // Statische Dateien aus dem AFMlog_OLD-Verzeichnis bereitstellen
  publicDir: 'public',
  build: {
    outDir: 'dist',
  },
})
