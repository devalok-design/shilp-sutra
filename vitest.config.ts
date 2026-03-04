import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@primitives': resolve(__dirname, 'packages/core/src/primitives'),
      '@': resolve(__dirname, 'packages/core/src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./packages/core/src/test-setup.ts'],
    include: ['packages/*/src/**/*.test.{ts,tsx}'],
    css: true,
  },
})
