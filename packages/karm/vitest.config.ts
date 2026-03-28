import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@primitives': resolve(__dirname, '../core/src/primitives'),
      '@/': resolve(__dirname, '../core/src') + '/',
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['../core/src/test-setup.ts', './src/test-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: true,
    // Run test files sequentially — axe-core singleton prevents parallel execution.
    fileParallelism: false,
    // Share module registry across files — framer-motion, react-markdown, and the
    // unified ecosystem are ESM-only and take 10+ seconds to cold-transform per worker.
    // Safe because fileParallelism: false already prevents concurrent axe access.
    isolate: false,
    // Match core's timeout — axe-core + heavy module loading needs headroom.
    testTimeout: 15_000,
  },
})
