import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/app',
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:8080'
    }
  }
})
