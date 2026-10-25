import process from 'node:process'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Serve the installed HLS version from our own origin in development and production.
const require = createRequire(import.meta.url)
const hlsAsset = () => ({
  name: 'local-hls-player',
  configureServer(server) {
    server.middlewares.use('/vendor/hls.min.js', (_req, res) => {
      res.setHeader('Content-Type', 'application/javascript')
      res.end(readFileSync(require.resolve('hls.js/dist/hls.min.js')))
    })
  },
  generateBundle() {
    this.emitFile({ type: 'asset', fileName: 'vendor/hls.min.js', source: readFileSync(require.resolve('hls.js/dist/hls.min.js')) })
  },
})

// Run the resolver locally as well; plain Vite does not execute Vercel functions.
const localStreamApi = () => ({
  name: 'local-stream-api',
  configureServer(server) {
    for (const name of ['resolvePlayer', 'segment']) {
      server.middlewares.use('/api/' + name, async (req, res, next) => {
        if (req.method !== 'GET') return next()
        try {
          const { default: handler } = await server.ssrLoadModule('/api/' + name + '.js')
          req.query = Object.fromEntries(new URL(req.url, 'http://localhost').searchParams)
          res.status = (code) => { res.statusCode = code; return res }
          res.json = (body) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(body)) }
          await handler(req, res)
        } catch (error) { next(error) }
      })
    }
  },
})

// https://vite.dev/config/
// Yerelde Vercel API ile aynı davranış: .env.local → VITE_DEV_API_ORIGIN=https://<proje>.vercel.app
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const devApi = (env.VITE_DEV_API_ORIGIN || '').trim()
  return {
  plugins: [
    react(),
    hlsAsset(),
    ...(!devApi ? [localStreamApi()] : []),
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
        navigateFallbackDenylist: [/^\/player\.html/, /^\/api\//, /^\/_vercel\//],
        // Hatırlatıcı bildirimine tıklanınca maçı açan küçük ek.
        importScripts: ['/sw-notify.js'],
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

