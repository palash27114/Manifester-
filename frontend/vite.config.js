import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')

  return {
    plugins: [react()],
    server: {
      // In dev, forward /api to the backend so the browser stays same-origin.
      proxy: {
        '/api': env.VITE_PROXY_TARGET || 'http://127.0.0.1:7000',
      },
    },
  }
})
