import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/playground/',
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      '@primitives': resolve(__dirname, '..', '..', 'packages', 'core', 'src', 'primitives'),
      '@': resolve(__dirname, '..', '..', 'packages', 'core', 'src'),
    },
  },
})
