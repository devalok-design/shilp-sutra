import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'
import { readFileSync, readdirSync, statSync } from 'fs'

/**
 * Vite/Rolldown strips the `'use client'` directive when bundling, which turns
 * client components (logos, aurora) into server components at the consumer —
 * `useState` then throws in Next.js RSC. This plugin re-prepends `'use client'`
 * to any OUTPUT chunk that contains a source module which declared the
 * directive, and leaves pure re-export barrels / server-safe data (brandConfig)
 * untouched. Mirrors core's `inject-use-client.mjs`, scoped to this package.
 */
function preserveUseClient(): Plugin {
  const clientSources = new Set<string>()
  const srcRoot = resolve(__dirname, 'src')
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = resolve(dir, entry)
      if (statSync(full).isDirectory()) walk(full)
      else if (/\.(ts|tsx)$/.test(full)) {
        const first = readFileSync(full, 'utf8').split('\n')[0].trim()
        if (first === "'use client'" || first === '"use client"') {
          clientSources.add(full.split('\\').join('/'))
        }
      }
    }
  }
  walk(srcRoot)

  return {
    name: 'preserve-use-client',
    renderChunk(code, chunk) {
      const isClient = chunk.moduleIds?.some((id) =>
        clientSources.has(id.split('\\').join('/')),
      )
      if (!isClient) return null
      if (/^\s*['"]use client['"]/.test(code)) return null
      return { code: `'use client';\n${code}`, map: null }
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    dts({
      outDir: 'dist',
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.stories.tsx', 'src/**/*.test.tsx', 'src/**/*.test.ts'],
    }),
    preserveUseClient(),
  ],
  build: {
    lib: {
      entry: {
        'index': resolve(__dirname, 'src/index.ts'),
        'devalok/index': resolve(__dirname, 'src/devalok/index.ts'),
        'karm/index': resolve(__dirname, 'src/karm/index.ts'),
        'aurora/index': resolve(__dirname, 'src/aurora/index.ts'),
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
        // WebGL shader lib — optional peer of the /aurora subpath. Never
        // bundle it: logo-only consumers must not pull the WebGL payload.
        if (/^@paper-design\/shaders-react($|\/)/.test(id)) return true
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
