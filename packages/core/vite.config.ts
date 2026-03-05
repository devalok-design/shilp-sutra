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
      exclude: ['src/**/*.stories.tsx', 'src/**/*.test.tsx', 'src/**/*.test.ts', 'src/**/*.mdx', 'src/test-setup.ts', 'src/tokens/**/*.tsx'],
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
        'hooks/index': resolve(__dirname, 'src/hooks/index.ts'),
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
        preserveModulesRoot: 'src',
      },
    },
    cssCodeSplit: true,
    outDir: 'dist',
    sourcemap: false,
  },
})
