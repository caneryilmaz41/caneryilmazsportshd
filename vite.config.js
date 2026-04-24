import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
// Yerelde Vercel API ile aynı davranış: .env.local → VITE_DEV_API_ORIGIN=https://<proje>.vercel.app
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const devApi = (env.VITE_DEV_API_ORIGIN || '').trim()
  return {
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['cy.jpg', 'logom.png'],
      manifest: {
        name: 'caneryılmazsports',
        short_name: 'caneryılmazsports',
        description: 'caneryılmazsports canli mac ve spor yayin platformu',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/cy.jpg',
            sizes: '192x192',
            type: 'image/jpeg',
            purpose: 'any'
          },
          {
            src: '/cy.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,webp,json}'],
        // player.html?src=... istekleri app-shell fallback'e dusmemeli.
        navigateFallbackDenylist: [/^\/player\.html/],
        // Query param ile gelen player URL'lerinde precache eslesmesini bozma.
        ignoreURLParametersMatching: [/^src$/, /^utm_/, /^fbclid$/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.aladhan\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'prayer-api-cache',
              expiration: { maxEntries: 20, maxAgeSeconds: 24 * 60 * 60 }
            }
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
    ...(devApi
      ? {
          proxy: {
            '/api': { target: devApi, changeOrigin: true, secure: true }
          }
        }
      : {})
  }
  }
})

