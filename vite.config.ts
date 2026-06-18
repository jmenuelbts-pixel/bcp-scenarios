import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// PWA pedagogique BCP - base relative pour deploiement Netlify par drag and drop du dist
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Netlify sert le site depuis la racine ; base '/' garantit le bon
  // chargement des assets sur les routes profondes (avec _redirects pour le
  // fallback SPA de createBrowserRouter).
  base: '/',
})
