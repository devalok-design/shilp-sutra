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
  'ui/charts/area-chart': resolve(__dirname, 'src/ui/charts/area-chart.tsx'),
  'ui/charts/bar-chart': resolve(__dirname, 'src/ui/charts/bar-chart.tsx'),
  'ui/charts/chart-container': resolve(__dirname, 'src/ui/charts/chart-container.tsx'),
  'ui/charts/gauge-chart': resolve(__dirname, 'src/ui/charts/gauge-chart.tsx'),
  'ui/charts/line-chart': resolve(__dirname, 'src/ui/charts/line-chart.tsx'),
  'ui/charts/pie-chart': resolve(__dirname, 'src/ui/charts/pie-chart.tsx'),
  'ui/charts/radar-chart': resolve(__dirname, 'src/ui/charts/radar-chart.tsx'),
  'ui/charts/sparkline': resolve(__dirname, 'src/ui/charts/sparkline.tsx'),
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
  'ai/blocks/text': resolve(__dirname, 'src/ai/blocks/text.tsx'),
  'ai/blocks/error': resolve(__dirname, 'src/ai/blocks/error.tsx'),
  'ai/types': resolve(__dirname, 'src/ai/types.ts'),
  'composed/extensions/emoji-node': resolve(__dirname, 'src/composed/extensions/emoji-node.tsx'),
  'composed/extensions/emoji-suggestion': resolve(__dirname, 'src/composed/extensions/emoji-suggestion.tsx'),
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
        // Externalized because they leak into our PUBLIC type surface: 25
        // `.d.ts` files reference `VariantProps`, cva's inferred return type
        // embeds `import('class-variance-authority/types').ClassProp`, and
        // `utils.d.ts` imports `ClassValue` from clsx. A dep that consumers
        // must resolve for `tsc` to pass is a real dependency — bundling a
        // second copy on top of that shipped the same code twice and left
        // consumers' own copies (near-universal in shadcn-style projects)
        // unable to dedupe with ours. Declared in `dependencies`; not bundled.
        /^clsx($|\/)/,
        /^class-variance-authority($|\/)/,
        /^tailwind-merge($|\/)/,
        // Externalized: @tiptap/* and prosemirror-* were declared as optional
        // peerDependencies AND bundled (a 641 KB `_chunks/tiptap.js`). A
        // consumer who followed our own peer instructions ended up running two
        // ProseMirror instances — plugin keys are module-scoped, so the copies
        // don't recognise each other's plugins and the editor misbehaves.
        // Same failure class as the framer-motion/sonner note below.
        // Dropping the bundle also drops `use-sync-external-store`, which
        // NOTHING in our own source used — React 18+ has useSyncExternalStore
        // built in (see primitives/_internal/react-use-is-hydrated.ts); the dep
        // existed solely to feed the bundled tiptap copy.
        /^@tiptap($|\/)/,
        /^prosemirror-/,
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
        // Keep readable internal cross-chunk export names. When minified, the
        // bundler mangles internal export aliases to short base-N names whose
        // pool includes JS reserved words — 0.49.0 shipped `export { Mo as in }`
        // in _chunks/primitives.js. That's legal ESM, but Next.js/Turbopack
        // turns every export of a "use client" module into a `const` binding
        // for its RSC client-reference proxy, emitting the illegal
        // `export const in = …` and failing consumers' `next build`
        // ("Expected ident"). Disabling this keeps aliases as valid identifiers.
        // See devalok-design/shilp-sutra#139.
        minifyInternalExports: false,
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Emoji picker (frimousse) + dataset (@emoji-mart/data, ~450KB) —
            // bundled but lazy-loaded, so isolate into their own chunk that only
            // downloads when the emoji picker / `:` search is opened.
            if (id.includes('frimousse') || id.includes('@emoji-mart/'))
              return 'emoji'
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
            // NOTE: clsx / class-variance-authority / tailwind-merge used to be
            // grouped here as `vendor-utils`. They are now externalized (see
            // rollupOptions.external) so there is nothing left to group —
            // unknown deps still get their own isolated chunk (safe by default),
            // and the SSR smoke test catches module-scope browser API usage.
          }
          // Vendored Radix primitives: one chunk PER primitive, with the
          // shared internals kept together in a single chunk.
          //
          // History, because both extremes are wrong and the middle is not
          // obvious:
          //
          //   `return 'primitives'` (before 0.55.0) put all 25 primitives in
          //   one 231 KB chunk. A consumer importing only <Button> — which
          //   needs nothing but `Slot`/`Slottable` from react-slot (~3 KB) —
          //   still shipped Select, Dialog, Menu, Tooltip and Slider. Measured:
          //   209 KB of our code for the FIRST component, ~43 KB for the next
          //   eleven. A fixed floor everyone paid.
          //
          //   Removing the rule entirely (letting Rollup chunk freely) fixed
          //   the floor — Button fell to 56 KB — but Rollup then DUPLICATED
          //   the shared internals into every primitive chunk, and a realistic
          //   12-component app went 252 KB → 586 KB. Strictly worse for the
          //   common case.
          //
          // Splitting per primitive while pinning `_internal/` to one shared
          // chunk gets both: a primitive is only pulled in by components that
          // reference it, and the internals every primitive depends on
          // (compose-refs, context, presence, portal, dismissable-layer, …)
          // exist exactly once.
          if (id.includes('primitives/')) {
            if (id.includes('primitives/_internal/')) return 'primitives-internal'
            const m = id.replace(/\\/g, '/').match(/primitives\/([^/]+?)\.[jt]sx?$/)
            return m ? `primitives/${m[1]}` : 'primitives'
          }
        },
      },
    },
    cssCodeSplit: true,
    outDir: 'dist',
    sourcemap: 'hidden',  // generates .map files for debugging but omits //# sourceMappingURL comment
  },
})
