import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import type { Plugin } from 'vite'

// Local dev middleware that mirrors api/fetch-recipe.ts for testing URL import without Vercel.
// Only used when VITE_API_BASE is not set in .env.
const devFetchProxy: Plugin = {
  name: 'dev-fetch-proxy',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (!req.url?.startsWith('/api/fetch-recipe')) return next()
      const rawUrl = new URL(req.url, 'http://localhost').searchParams.get('url')
      if (!rawUrl) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Missing url param' }))
        return
      }
      try {
        const upstream = await fetch(rawUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
          },
        })
        if (!upstream.ok) {
          res.writeHead(502, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: `Failed to fetch URL: ${upstream.status} ${upstream.statusText}` }))
          return
        }
        const html = await upstream.text()
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end(html)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: message }))
      }
    })
  },
}

export default defineConfig({
  plugins: [
    react(),
    devFetchProxy,
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Simmer',
        short_name: 'Simmer',
        description: 'Accessible recipe recommendations for your current abilities',
        theme_color: '#ffffff',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
