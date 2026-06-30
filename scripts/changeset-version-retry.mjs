#!/usr/bin/env node
/**
 * Runs `changeset version` with retry + backoff.
 *
 * Why: our changelog generator (`@changesets/changelog-github`) calls
 * `@changesets/get-github-info`, which fetches the GitHub GraphQL API to enrich
 * each entry with PR/author links. That fetch intermittently dies with
 * `Invalid response body ... api.github.com/graphql: Premature close` (an undici
 * stream drop on the runner→GitHub path) — it killed the 0.43.0 release 3× while
 * succeeding locally. `get-github-info@0.8.0` is already the latest, so there's
 * no upstream fix to upgrade into; retrying is the robust mitigation.
 *
 * `changeset version` is atomic on failure ("no files should have been affected"),
 * so re-running from a clean state is safe. If every attempt fails we exit
 * non-zero so the release fails loudly rather than shipping a stale changelog.
 *
 * Override attempts with CHANGESET_VERSION_RETRIES (default 4).
 */
import { spawnSync } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'

const MAX = Math.max(1, Number(process.env.CHANGESET_VERSION_RETRIES) || 4)
const BASE_DELAY_MS = 5000

for (let attempt = 1; attempt <= MAX; attempt++) {
  // `pnpm exec` resolves the local `changeset` bin cross-platform (Windows + CI).
  const result = spawnSync('pnpm', ['exec', 'changeset', 'version'], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })

  if (result.status === 0) {
    if (attempt > 1) console.log(`[changeset-version] succeeded on attempt ${attempt}/${MAX}.`)
    process.exit(0)
  }

  if (attempt === MAX) {
    console.error(
      `\n[changeset-version] failed after ${MAX} attempts. If this is the recurring ` +
        `@changesets/get-github-info "Premature close", run \`pnpm version-packages\` locally ` +
        `and push the result as the Version Packages PR (see MIGRATION/release runbook).`,
    )
    process.exit(result.status ?? 1)
  }

  const delayMs = BASE_DELAY_MS * attempt
  console.warn(
    `\n[changeset-version] attempt ${attempt}/${MAX} failed ` +
      `(likely a transient GitHub API "Premature close"). Retrying in ${delayMs / 1000}s…`,
  )
  await sleep(delayMs)
}
