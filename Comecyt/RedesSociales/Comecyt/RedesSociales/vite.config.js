import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const apiProxy = Object.fromEntries(
  ["/api", "/avatars", "/certificados"].map(route => [route, "http://localhost:4000"])
)
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: false,
    open: '/login',
    proxy: apiProxy,
  },
  preview: { proxy: apiProxy },
  resolve: {
    dedupe: ['react', 'react-dom'], // 👈 Evita duplicar React
    alias: {
      '@': path.resolve(__dirname, './src'), // 👈 Agrega esta línea
    },
  }
})
