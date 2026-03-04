import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: './tsconfig.build.json',
      outDir: 'dist',
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.stories.tsx', 'src/**/*.test.tsx', 'src/**/*.test.ts'],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, '../core/src'),
      '@primitives': resolve(__dirname, '../core/src/primitives'),
    },
  },
  build: {
    lib: {
      entry: {
        'index': resolve(__dirname, 'src/index.ts'),
        'board/index': resolve(__dirname, 'src/board/index.ts'),
        'tasks/index': resolve(__dirname, 'src/tasks/index.ts'),
        'chat/index': resolve(__dirname, 'src/chat/index.ts'),
        'dashboard/index': resolve(__dirname, 'src/dashboard/index.ts'),
        'client/index': resolve(__dirname, 'src/client/index.ts'),
        'admin/index': resolve(__dirname, 'src/admin/index.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: (id, parentId, isResolved) => {
        // Externalize anything resolved from core package
        if (id.includes('packages/core/src/')) return true
        if (id.includes('packages\\core\\src\\')) return true
        // Standard externals
        const externals = [
          'react', 'react-dom', 'react/jsx-runtime',
          'clsx', 'tailwind-merge', 'class-variance-authority',
          '@tabler/icons-react', 'react-markdown', 'date-fns',
        ]
        if (externals.includes(id)) return true
        if (/^@devalok\/shilp-sutra(\/.*)?$/.test(id)) return true
        if (/^@dnd-kit\//.test(id)) return true
        if (/^date-fns\//.test(id)) return true
        if (/^next(\/.*)?$/.test(id)) return true
        return false
      },
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        paths: (id) => {
          // Rewrite resolved absolute core paths to @devalok/shilp-sutra imports
          const coreMatch = id.replace(/\\/g, '/').match(/packages\/core\/src\/(.+?)(?:\.\w+)?$/)
          if (coreMatch) {
            const subpath = coreMatch[1]
            // Map core subpaths to the correct package export
            if (subpath.startsWith('ui/')) return `@devalok/shilp-sutra/ui`
            if (subpath.startsWith('composed/')) return `@devalok/shilp-sutra/composed`
            if (subpath.startsWith('shell/')) return `@devalok/shilp-sutra/shell`
            if (subpath.startsWith('hooks/')) return `@devalok/shilp-sutra/ui`
            if (subpath.startsWith('tailwind/')) return `@devalok/shilp-sutra/tailwind`
            return `@devalok/shilp-sutra/ui`
          }
          return id
        },
      },
    },
    cssCodeSplit: true,
    outDir: 'dist',
    sourcemap: false,
  },
})
