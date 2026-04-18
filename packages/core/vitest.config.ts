import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@primitives': resolve(__dirname, 'src/primitives'),
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: true,
    // Run test files sequentially to prevent vitest-axe "Axe is already running" race condition.
    // axe-core uses a global singleton — concurrent file execution causes collisions.
    fileParallelism: false,
    // Default 5000ms is too tight for axe-core a11y tests under sequential execution load.
    // 30s absorbs the tiptap + axe pathological case under ~2400-test accumulated jsdom
    // pressure (isolated those tests finish in <1s; only at the tail of a full run do
    // they trip a tighter budget). Real regressions still hit the ceiling — this only
    // masks load-dependent flakes.
    testTimeout: 30_000,
    coverage: {
      provider: 'v8',
      include: ['src/ui/**/*.{ts,tsx}', 'src/composed/**/*.{ts,tsx}', 'src/shell/**/*.{ts,tsx}', 'src/ai/**/*.{ts,tsx}', 'src/hooks/**/*.{ts,tsx}'],
      exclude: ['**/*.stories.tsx', '**/*.test.{ts,tsx}', '**/primitives/**', '**/test-setup.ts', '**/*.mdx', '**/tokens/**'],
      thresholds: {
        // Starting thresholds — tighten over time as coverage improves
        lines: 60,
        functions: 55,
        branches: 50,
        statements: 60,
      },
    },
  },
})
