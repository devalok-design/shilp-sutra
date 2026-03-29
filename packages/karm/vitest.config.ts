import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@primitives': resolve(__dirname, '../core/src/primitives'),
      '@/': resolve(__dirname, '../core/src') + '/',
      // Vite-level stubs — prevent Vite from ever resolving the real module graphs.
      // framer-motion v12 pulls motion-dom + motion-utils (~200 ESM modules).
      // react-markdown v10 pulls unified/remark/rehype/micromark (~285 ESM packages).
      // Unlike vi.mock() (runtime), aliases intercept at module resolution time,
      // so Vite never walks, parses, or transforms the real dependency trees.
      'framer-motion': resolve(__dirname, 'src/__stubs__/framer-motion.ts'),
      'react-markdown': resolve(__dirname, 'src/__stubs__/react-markdown.ts'),
      '@tabler/icons-react': resolve(__dirname, 'src/__stubs__/tabler-icons-react.ts'),
      '@dnd-kit/core': resolve(__dirname, 'src/__stubs__/dnd-kit-core.ts'),
      '@dnd-kit/sortable': resolve(__dirname, 'src/__stubs__/dnd-kit-sortable.ts'),
      '@dnd-kit/utilities': resolve(__dirname, 'src/__stubs__/dnd-kit-utilities.ts'),
      'date-fns': resolve(__dirname, 'src/__stubs__/date-fns.ts'),
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
    // Match core's timeout — axe-core + heavy module loading needs headroom.
    testTimeout: 15_000,
  },
})
