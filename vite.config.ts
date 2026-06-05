import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // expose on LAN so phones on the same wifi can reach the dev server
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
})
