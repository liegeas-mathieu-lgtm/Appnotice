import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext', 
    minify: false, // TEMPORAIRE : On désactive la minification pour vérifier si c'est elle qui casse le code
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
  optimizeDeps: {
    disabled: false,
  }
})