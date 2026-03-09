import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  base: '/playground/',
  plugins: [react()],
  resolve: {
    alias: {
      '@primitives': resolve(__dirname, '..', '..', 'packages', 'core', 'src', 'primitives'),
      '@': resolve(__dirname, '..', '..', 'packages', 'core', 'src'),
    },
  },
})
