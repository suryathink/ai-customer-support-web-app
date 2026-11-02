import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // In dev, API calls go through the Vite proxy so the auth cookie stays same-origin
  const apiTarget = env.VITE_DEV_API_PROXY ?? 'http://localhost:5000'

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      // Polling is needed for hot reload inside Docker on Windows/macOS bind mounts
      watch: env.VITE_USE_POLLING === 'true' ? { usePolling: true, interval: 300 } : undefined,
      proxy: {
        '/auth': { target: apiTarget, changeOrigin: true },
        '/chat': { target: apiTarget, changeOrigin: true },
      },
    },
  }
})
