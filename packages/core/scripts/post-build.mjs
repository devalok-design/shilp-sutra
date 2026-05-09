/**
 * Unified post-build pipeline for @devalok/shilp-sutra core.
 *
 * Runs all post-build steps sequentially with error handling.
 * On failure: reports which step failed and exits non-zero.
 *
 * Steps (in order):
 * 1. copy-tokens        — Copy CSS token files to dist/
 * 2. copy-root-docs     — Copy CHANGELOG/MIGRATION/README to dist/
 * 3. fix-dts-primitives — Rewrite @primitives/ import paths in .d.ts files
 * 4. inject-use-client  — Add "use client" directives + SSR safety patches
 * 5. build-docs         — Generate per-component documentation
 */

import { execFileSync } from 'child_process'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const scriptsDir = __dirname

const steps = [
  { name: 'copy-tokens', script: 'copy-tokens.mjs' },
  { name: 'copy-root-docs', script: 'copy-root-docs.mjs' },
  { name: 'fix-dts-primitives', script: 'fix-dts-primitives.mjs' },
  { name: 'inject-use-client', script: 'inject-use-client.mjs' },
  { name: 'build-docs', script: 'build-component-docs.mjs' },
]

const startTime = Date.now()
let completed = 0

for (const step of steps) {
  const stepStart = Date.now()
  console.log(`\n[post-build] Step ${completed + 1}/${steps.length}: ${step.name}`)

  try {
    execFileSync('node', [join(scriptsDir, step.script)], {
      cwd: join(scriptsDir, '..'),
      stdio: 'inherit',
    })
    completed++
    console.log(`[post-build] ${step.name} completed (${Date.now() - stepStart}ms)`)
  } catch (err) {
    console.error(`\n[post-build] FAILED at step ${completed + 1}: ${step.name}`)
    console.error(`[post-build] ${completed}/${steps.length} steps completed before failure`)
    console.error(`[post-build] Fix the issue and re-run: pnpm build`)
    process.exit(1)
  }
}

const totalMs = Date.now() - startTime
console.log(`\n[post-build] All ${steps.length} steps completed (${totalMs}ms)`)
