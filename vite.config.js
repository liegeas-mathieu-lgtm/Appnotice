import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Gemini 3 nécessite un moteur JS moderne pour les fonctions de hashage
    target: 'esnext' 
  },
  optimizeDeps: {
    // Force l'inclusion du SDK pour éviter les erreurs de modules
    include: ['@google/genai']
  }
})