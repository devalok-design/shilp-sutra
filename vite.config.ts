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
      exclude: ['src/**/*.stories.tsx'],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: {
        'ui/index': resolve(__dirname, 'src/ui/index.ts'),
        'shared/index': resolve(__dirname, 'src/shared/index.ts'),
        'layout/index': resolve(__dirname, 'src/layout/index.ts'),
        'karm/index': resolve(__dirname, 'src/karm/index.ts'),
        'karm/board/index': resolve(__dirname, 'src/karm/board/index.ts'),
        'karm/tasks/index': resolve(__dirname, 'src/karm/tasks/index.ts'),
        'karm/chat/index': resolve(__dirname, 'src/karm/chat/index.ts'),
        'karm/dashboard/index': resolve(__dirname, 'src/karm/dashboard/index.ts'),
        'karm/client/index': resolve(__dirname, 'src/karm/client/index.ts'),
        'tailwind/index': resolve(__dirname, 'src/tailwind/index.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'next',
        'next/image',
        'next/link',
        'next/navigation',
        'next/font',
        'server-only',
      ],
      output: {
        preserveModules: false,
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    cssCodeSplit: true,
    outDir: 'dist',
    sourcemap: true,
  },
})
