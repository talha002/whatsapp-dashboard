import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            echarts: ['echarts', 'echarts-wordcloud'],
            react: ['react', 'react-dom']
          }
        }
      }
    },
    server: {
      host: true,
      port: Number(env.VITE_PORT || 5173)
    },
    preview: {
      host: true,
      port: Number(env.VITE_PREVIEW_PORT || 4173)
    }
  }
})
