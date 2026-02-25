import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    minify: false, // C'est l'option clé pour corriger l'erreur de hachage sur mobile
  }
})