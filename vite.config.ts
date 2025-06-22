import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5721,
    host: true,
    allowedHosts: ['cloud.maelrabot.com'],
    hmr: {
      clientPort: 80,
      protocol: 'ws'
    },
  },
})
