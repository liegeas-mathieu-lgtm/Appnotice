import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    // Certains SDK ont besoin que 'global' soit défini en prod
    'global': {},
  },
  build: {
    target: 'es2022', // Cible plus précise que esnext pour la stabilité
    minify: 'esbuild',
  },
  optimizeDeps: {
    include: ['@google/genai']
  }
})