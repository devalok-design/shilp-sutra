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
])

// Subdirectory entries that aren't picked up by the top-level scan
const explicitEntries: Record<string, string> = {
  'ui/chat/index': resolve(__dirname, 'src/ui/chat/index.ts'),
  'ui/charts/index': resolve(__dirname, 'src/ui/charts/index.ts'),
  'ui/tree-view/index': resolve(__dirname, 'src/ui/tree-view/index.ts'),
  'ui/oauth-button/index': resolve(__dirname, 'src/ui/oauth-button/index.ts'),
  'ui/lib/utils': resolve(__dirname, 'src/ui/lib/utils.ts'),
  'ui/lib/motion': resolve(__dirname, 'src/ui/lib/motion.ts'),
  'ui/lib/date-utils': resolve(__dirname, 'src/ui/lib/date-utils.ts'),
  'composed/date-picker/index': resolve(__dirname, 'src/composed/date-picker/index.ts'),
  'composed/lib/string-utils': resolve(__dirname, 'src/composed/lib/string-utils.ts'),
  'motion/index': resolve(__dirname, 'src/motion/index.ts'),
  'motion/primitives-index': resolve(__dirname, 'src/motion/primitives-index.ts'),
  // AI command system
  'ai/index': resolve(__dirname, 'src/ai/index.ts'),
  'ai/command-bar': resolve(__dirname, 'src/ai/command-bar.tsx'),
  'ai/conversation': resolve(__dirname, 'src/ai/conversation.tsx'),
  'ai/block-renderer': resolve(__dirname, 'src/ai/block-renderer.tsx'),
  'ai/ai-command-provider': resolve(__dirname, 'src/ai/ai-command-provider.tsx'),
  'ai/blocks/index': resolve(__dirname, 'src/ai/blocks/index.ts'),
  'ai/types': resolve(__dirname, 'src/ai/types.ts'),
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
        /^remark-gfm($|\/)/,
        /^input-otp($|\/)/,
        /^server-only$/,
        // SSR-safety: consumer-provided deps that must not be bundled
        /^tailwindcss($|\/)/,       // already a peer dep — preset uses consumer's copy
        /^react-pdf($|\/)/,         // lazy-loaded by FilePreview, 3MB with DOMMatrix
        /^react-zoom-pan-pinch($|\/)/, // browser-only transforms, used by FilePreview
        /^react-syntax-highlighter($|\/)/, // used by MarkdownViewer code blocks
        // Externalized in 0.37 to eliminate the rolldown CJS require() bridge.
        // use-sync-external-store's shim calls `require("react")`, which forced
        // us to inject `import { createRequire } from 'module'` into our
        // rolldown-runtime chunk — breaking Turbopack consumers (Karm #30).
        // Now declared in our `dependencies` so consumers get it transitively.
        /^use-sync-external-store($|\/)/,
        // Externalized in 0.37: framer-motion and sonner carry module-scoped
        // React contexts (MotionConfig, LayoutGroup, AnimatePresence, Toaster).
        // Bundling them into our dist while consumers also install their own
        // splits the context tree — animations stop mid-flight, toasts mount
        // to the wrong provider. Declaring as peerDependencies forces a single
        // consumer-controlled copy; externalizing here ensures we never ship
        // a duplicate.
        /^framer-motion($|\/)/,
        /^sonner($|\/)/,
      ],
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '_chunks/[name].js',
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@tiptap/') || id.includes('prosemirror'))
              return 'tiptap'
            // framer-motion — imported by 80+ components system-wide for enter/exit/layout animations
            if (id.includes('framer-motion'))
              return 'framer'
            // Client-only deps that use React hooks/DOM — includes transitive deps
            if (
              id.includes('@floating-ui/') ||
              id.includes('aria-hidden') ||
              id.includes('react-colorful') ||
              id.includes('react-remove-scroll') ||
              id.includes('react-style-singleton') ||
              id.includes('use-callback-ref') ||
              id.includes('use-sidecar') ||
              id.includes('react-clientside-effect') ||
              id.includes('get-nonce')
            )
              return 'vendor-client'
            // Sonner — only loaded by Toaster/Toast, not needed by Popover/Dialog consumers
            if (id.includes('sonner'))
              return 'sonner'
            // Pure utilities — ALLOWLIST, not catch-all.
            // Unknown deps get their own isolated chunk (safe by default).
            // The SSR smoke test catches module-scope browser API usage.
            if (
              id.includes('/clsx/') ||
              id.includes('/class-variance-authority/') ||
              id.includes('/tailwind-merge/')
            )
              return 'vendor-utils'
          }
          if (id.includes('primitives/')) return 'primitives'
        },
      },
    },
    cssCodeSplit: true,
    outDir: 'dist',
    sourcemap: 'hidden',  // generates .map files for debugging but omits //# sourceMappingURL comment
  },
})
