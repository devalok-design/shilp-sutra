---
"@devalok/shilp-sutra": minor
---

Tailwind 4 CSS-first migration. Setup-only breaking release — component APIs are unchanged. See [MIGRATION.md](./MIGRATION.md#v0370--tailwind-4-css-first-migration) for the full guide.

### BREAKING

- **JS preset removed.** `tailwind.config.ts` with `presets: [shilpSutra]` no longer works. Tokens ship as TW4 `@theme` CSS via a single import:

  ```css
  @import "tailwindcss";
  @import "@devalok/shilp-sutra/css";
  ```

  The old `./tailwind` export is a deprecated no-op stub that logs a dev-mode `console.warn`; scheduled for removal in 0.38.

- **`framer-motion` is now a required peerDependency** (`^12.0.0`). Module-scoped React contexts (`MotionConfig`, `LayoutGroup`, `AnimatePresence`) break silently when two copies resolve — making framer-motion a peer forces the consumer to control the version and pnpm to dedupe. Install: `pnpm add framer-motion`.
- **`sonner` is now an optional peerDependency** (`^2.0.0`). Install only if you render `<Toaster />`: `pnpm add sonner`.
- **`tailwindcss` peer tightened to `^4.0.0`** (was `^3.4.0 || ^4.0.0`). 0.37 is TW4-only.
- **`use-sync-external-store` moved to `dependencies`** (from optional peer). Auto-installed transitively; no consumer action needed.
- **Source class modernization** — our source migrated; consumers whose own code uses TW3-era patterns should update:
  - `w-[--var]` → `w-(--var)`
  - `theme(spacing.N)` → literal value
  - `bg-gradient-to-*` → `bg-linear-to-*`
  - bare `shadow` → explicit (e.g., `shadow-raised`)
- **Token namespaces:** spacing is `--spacing-ds-*` (generates `p-ds-03`), typography is `--text-ds-*` / `--leading-ds-*`. Z-layers (`z-popover`, etc.) and named durations (`duration-fast-01`) are generated via `@utility` blocks since TW4 has no `--z-*` / `--duration-*` auto-namespaces.
- **Dark mode:** `@custom-variant dark (&:where(.dark *));` — identical behavior to TW3's `darkMode: 'class'`.

### Added

- New export `@devalok/shilp-sutra/css` — the single consumer entry for TW4 setup.
- New token files at `packages/core/src/tokens/`: `shilp-sutra.css`, `utilities.css`, `variants.css`, `base.css`, `animations.css`.
- Next 15 + Webpack smoke consumer at `tests/smoke-consumer-next15/` — complements the existing Next 16 + Turbopack variant. Both wired into the release workflow.
- MIGRATION.md at repo root — new v0.37 section with before/after globals, collision examples, dark-mode sanity check, framer-motion single-copy verification, troubleshooting table.
- 10 council-gated pre-publish audit checks: peer-vs-dep correctness, tailwindcss peer range, `exports` types-first ordering, bare `shadow` detection, MIGRATION.md presence + 0.37 section, README TW3 residue, dist Node-builtin leak, Next 15 smoke fixture presence.
- Chromatic visual-regression gate in release.yml (runs pre-RC, blocks on undiffed visual changes).
- Rollback drill procedure in `docs/rollback.md`.

### Changed

- Build externalization: `framer-motion` and `sonner` are now external (were chunked). Eliminates duplicate-copy risk.
- `engines.node` floor dropped. Phase 0 spike made the `process.getBuiltinModule` bridge unnecessary.
- `publishConfig.provenance: true` — every 0.37 publish carries an SLSA attestation visible on npmjs.com.
- `.github/workflows/release.yml` wired to OIDC trusted publishing and gated on `pre-publish-audit.mjs` + `consumer-smoke-test.mjs` + Chromatic.

### Removed

- Repo-root `tailwind.config.ts`.
- `docs/MIGRATION.md` (moved to repo root).
- `rolldown-runtime` CJS bridge patch in `inject-use-client.mjs` (Phase 0 eliminated the need).
