import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    dts({
      outDir: 'dist',
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.stories.tsx', 'src/**/*.test.tsx', 'src/**/*.test.ts'],
    }),
  ],
  resolve: {
    alias: {
      '@primitives': resolve(__dirname, 'src/primitives'),
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: {
        'ui/index': resolve(__dirname, 'src/ui/index.ts'),
        'composed/index': resolve(__dirname, 'src/composed/index.ts'),
        'shell/index': resolve(__dirname, 'src/shell/index.ts'),
        'karm/index': resolve(__dirname, 'src/karm/index.ts'),
        'karm/board/index': resolve(__dirname, 'src/karm/board/index.ts'),
        'karm/tasks/index': resolve(__dirname, 'src/karm/tasks/index.ts'),
        'karm/chat/index': resolve(__dirname, 'src/karm/chat/index.ts'),
        'karm/dashboard/index': resolve(__dirname, 'src/karm/dashboard/index.ts'),
        'karm/client/index': resolve(__dirname, 'src/karm/client/index.ts'),
        'karm/admin/index': resolve(__dirname, 'src/karm/admin/index.ts'),
        'brand/index': resolve(__dirname, 'src/brand/index.ts'),
        'brand/devalok/index': resolve(__dirname, 'src/brand/devalok/index.ts'),
        'brand/karm/index': resolve(__dirname, 'src/brand/karm/index.ts'),
        'tailwind/index': resolve(__dirname, 'src/tailwind/index.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        /^next(\/.*)?$/,
        /^@floating-ui\/.*/,
        'aria-hidden',
        'react-remove-scroll',
        /^@tanstack\/.*/,
        /^@tiptap\/.*/,
        /^@dnd-kit\/.*/,
        /^d3-.*/,
        '@tabler/icons-react',
        'date-fns',
        'react-markdown',
        'clsx',
        'tailwind-merge',
        'class-variance-authority',
        'input-otp',
        'server-only',
      ],
      output: {
        preserveModules: true,
      },
    },
    cssCodeSplit: true,
    outDir: 'dist',
    sourcemap: false,
  },
})
