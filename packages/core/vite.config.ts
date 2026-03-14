import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'
import { readdirSync, statSync } from 'fs'

/**
 * Scan directories under `src/` for `.ts`/`.tsx` files and return them as
 * Rollup entry points keyed by `"dir/basename"`.
 *
 * **One-level-deep only** — reads immediate children of each directory;
 * files nested in subdirectories (e.g. `ui/charts/index.ts`) are NOT
 * collected. Those must be added manually to {@link explicitEntries}.
 *
 * Excludes `*.test.*`, `*.spec.*`, `*.stories.*`, and `*.mdx` files.
 *
 * @example
 * // Collected:  src/ui/button.tsx  → { "ui/button": "<abs>/src/ui/button.tsx" }
 * // Skipped:    src/ui/charts/index.ts  (subdirectory — add to explicitEntries)
 *
 * @param dirs - Directory names relative to `src/` (e.g. `["ui", "hooks"]`).
 * @returns A `{ [entryName]: absolutePath }` map suitable for `build.lib.entry`.
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
  'ui/lib/motion': resolve(__dirname, 'src/ui/lib/motion.ts'),
  'ui/lib/date-utils': resolve(__dirname, 'src/ui/lib/date-utils.ts'),
  'composed/date-picker/index': resolve(__dirname, 'src/composed/date-picker/index.ts'),
  'composed/lib/string-utils': resolve(__dirname, 'src/composed/lib/string-utils.ts'),
  'motion/index': resolve(__dirname, 'src/motion/index.ts'),
  'motion/primitives-index': resolve(__dirname, 'src/motion/primitives-index.ts'),
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
            // Framer Motion — only loaded by Spinner and future animation components
            if (id.includes('framer-motion'))
              return 'framer'
            // Client-only deps that use React hooks/DOM — includes transitive deps
            if (
              id.includes('@floating-ui/') ||
              id.includes('aria-hidden') ||
              id.includes('react-remove-scroll') ||
              id.includes('react-style-singleton') ||
              id.includes('use-callback-ref') ||
              id.includes('use-sidecar') ||
              id.includes('react-clientside-effect') ||
              id.includes('get-nonce') ||
              id.includes('sonner')
            )
              return 'vendor-client'
            // Pure utilities (clsx, cva, tailwind-merge) — must NOT have "use client"
            return 'vendor-utils'
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
