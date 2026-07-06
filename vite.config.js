import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/presupuestoeuropa2027/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Europa 2027 — Presupuesto',
        short_name: 'Europa 2027',
        description: 'Presupuesto de viaje Agus & Ivan — Europa marzo-abril 2027',
        start_url: '/presupuestoeuropa2027/',
        scope: '/presupuestoeuropa2027/',
        display: 'standalone',
        background_color: '#0b1f3a',
        theme_color: '#0b1f3a',
        icons: [
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg}'],
        navigateFallback: '/presupuestoeuropa2027/index.html',
      },
    }),
  ],
})
