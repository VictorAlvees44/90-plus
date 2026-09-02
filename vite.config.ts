import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/90-plus/' : '/',
  define: { __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? '0.1.0') },
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'prompt',
      manifest: {
        name: '90+',
        short_name: '90+',
        description: 'Painel pessoal de futebol',
        theme_color: '#0F2E22',
        background_color: '#0F2E22',
        display: 'standalone',
        lang: 'pt-BR',
        icons: [
          { src: 'assets/icons/pwa-icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'assets/icons/pwa-icon-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'assets/icons/pwa-icon-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        navigateFallback: 'index.html',
        runtimeCaching: [{
          urlPattern: /\/data\/.*\.json$/,
          handler: 'StaleWhileRevalidate',
          options: { cacheName: 'football-data', expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 2 } }
        }]
      }
    })
  ]
})
