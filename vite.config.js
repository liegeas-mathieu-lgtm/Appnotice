import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // es2020 est le meilleur compromis pour la compatibilité mobile (iOS/Android)
    target: 'es2020', 
    minify: 'esbuild',
    // On empêche esbuild de transformer les gros entiers (BigInt) qui causent souvent l'erreur toHex
    esbuild: {
      supported: {
        'bigint': true
      }
    }
  },
  optimizeDeps: {
    include: ['@google/generative-ai']
  }
})