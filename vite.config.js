import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022' // Supporte les fonctions modernes nécessaires à Gemini
  },
  optimizeDeps: {
    // Supprime @google/genai d'ici s'il y était
    include: ['@google/generative-ai']
  }
})