import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022', // Très important pour supporter les fonctions Crypto modernes
    commonjsOptions: {
      transformMixedEsModules: true,
    }
  },
  optimizeDeps: {
    // On force Vite à pré-vendre le SDK Gemini pour qu'il ne soit pas altéré
    include: ['@google/generative-ai']
  },
  // On s'assure que global n'est pas redéfini bizarrement
  define: {
    'process.env': {}
  }
})