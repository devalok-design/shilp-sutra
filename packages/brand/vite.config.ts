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
  build: {
    lib: {
      entry: {
        'index': resolve(__dirname, 'src/index.ts'),
        'devalok/index': resolve(__dirname, 'src/devalok/index.ts'),
        'karm/index': resolve(__dirname, 'src/karm/index.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: (id) => {
        // Externalize PNG imports — handled as static assets
        if (id.endsWith('.png')) return true
        // React — external
        if (/^react($|\/)/.test(id)) return true
        if (/^react-dom($|\/)/.test(id)) return true
        // Everything else (clsx, tailwind-merge) gets bundled
        return false
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '_chunks/[name].js',
        manualChunks(id) {
          if (id.includes('node_modules')) return 'vendor'
        },
      },
    },
    cssCodeSplit: true,
    outDir: 'dist',
    sourcemap: false,
  },
})
