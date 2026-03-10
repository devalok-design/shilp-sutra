import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'
import { readdirSync, statSync } from 'fs'

/**
 * Collect all .ts/.tsx files from the given directories as Rollup entry points.
 * Excludes tests, stories, and .mdx files.
 */
function collectEntries(dirs: string[]): Record<string, string> {
  const entries: Record<string, string> = {}
  const exclude = /\.(test|stories|spec)\.(ts|tsx)$|\.mdx$/

  for (const dir of dirs) {
    const absDir = resolve(__dirname, 'src', dir)
    let files: string[]
    try {
      files = readdirSync(absDir)
    } catch {
      continue
    }
    for (const file of files) {
      const fullPath = resolve(absDir, file)
      if (!statSync(fullPath).isFile()) continue
      if (exclude.test(file)) continue
      if (!/\.(ts|tsx)$/.test(file)) continue
      const name = file.replace(/\.(ts|tsx)$/, '')
      entries[`${dir}/${name}`] = fullPath
    }
  }

  return entries
}

const autoEntries = collectEntries([
  'ui',
  'composed',
  'shell',
  'hooks',
  'tailwind',
])

// Subdirectory entries that aren't picked up by the top-level scan
const explicitEntries: Record<string, string> = {
  'ui/charts/index': resolve(__dirname, 'src/ui/charts/index.ts'),
  'ui/tree-view/index': resolve(__dirname, 'src/ui/tree-view/index.ts'),
  'ui/lib/utils': resolve(__dirname, 'src/ui/lib/utils.ts'),
  'composed/date-picker/index': resolve(__dirname, 'src/composed/date-picker/index.ts'),
  'composed/lib/string-utils': resolve(__dirname, 'src/composed/lib/string-utils.ts'),
}

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
        ...autoEntries,
        ...explicitEntries,
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        /^react($|\/)/,
        /^react-dom($|\/)/,
        /^next($|\/)/,
        /^@tanstack\//,
        /^@emoji-mart\//,
        /^d3-/,
        /^@tabler\/icons-react($|\/)/,
        /^date-fns($|\/)/,
        /^react-markdown($|\/)/,
        /^input-otp($|\/)/,
        /^server-only$/,
      ],
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '_chunks/[name].js',
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@tiptap/') || id.includes('prosemirror'))
              return 'tiptap'
            return 'vendor'
          }
          if (id.includes('primitives/')) return 'primitives'
        },
      },
    },
    cssCodeSplit: true,
    outDir: 'dist',
    sourcemap: false,
  },
})
