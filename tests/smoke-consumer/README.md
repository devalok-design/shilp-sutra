# Consumer smoke test

This is a throwaway Next.js 16 + Tailwind CSS 4 + Turbopack app used to verify
that the compiled `@devalok/shilp-sutra` tarball works end-to-end in a real
consumer build. **Not part of the pnpm workspace** — intentionally outside
`packages/*` and `apps/*` so it installs against a packed tarball (like Karm
does), not a workspace symlink.

## Run

From the repo root:

```sh
node scripts/consumer-smoke-test.mjs
```

This:
1. Builds `packages/core` fresh
2. `pnpm pack`s the core package into `tests/smoke-consumer/shilp-sutra.tgz`
3. Runs `pnpm install --force` inside `tests/smoke-consumer`
4. Runs `next build --turbopack`
5. Fails the build if any stdout/stderr line contains an error/warning
   that references `shilp-sutra` or a known invalid-CSS pattern.

Wired into `scripts/pre-publish-audit.mjs` as a HARD gate — publishing is
blocked if the smoke test fails.

## Why

Historical reality: we shipped TW3-era class syntax, Node-only imports in
client chunks, and TW3 codemod leftovers in 0.34.0, 0.36.0, and 0.36.1.
Each regression was invisible to `typecheck`, `lint`, `vitest`, and the
SSR smoke test — because none of those touch Turbopack + TW4's CSS
generation. The consumer smoke test is the last-mile gate that catches
everything else.
