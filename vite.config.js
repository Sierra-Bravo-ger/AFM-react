import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['AFM3.svg', 'favicon.ico', 'robots.txt'],
      manifest: {
        name: 'AnyFileMonitor Dashboard',
        short_name: 'AFM Dashboard',
        description: 'Dashboard zur Überwachung von Dateiverarbeitungsprozessen',
        theme_color: '#1E40AF',
        background_color: '#111827',
        icons: [
          {
            src: 'AFM3.svg',
            sizes: '150x150',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
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
