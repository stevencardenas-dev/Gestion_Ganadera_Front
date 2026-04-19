import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/Gestion_Ganadera_Front/',
  plugins: [react()],
  server: {
    port: 5173,
  },
})
