import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020', // On descend d'un cran pour plus de compatibilité mobile
    minify: 'terser', // Terser est plus lent mais plus sûr pour les mobiles que esbuild
    terserOptions: {
      compress: {
        unused: false, // Empêche de supprimer des fonctions de hachage "apparemment" inutilisées
      }
    }
  },
  optimizeDeps: {
    include: ['@google/generative-ai']
  }
})