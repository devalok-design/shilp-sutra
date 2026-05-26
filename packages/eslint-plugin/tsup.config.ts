import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'es2022',
  // Don't bundle peer deps — consumer brings their own eslint.
  external: ['eslint'],
  // Keep @typescript-eslint/utils external too — it's a heavy dep and bundled
  // separately by consumers' eslint configs.
  noExternal: [],
})
