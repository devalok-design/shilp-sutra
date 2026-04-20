# @devalok/shilp-sutra

## 0.37.0-next.0

### Minor Changes

- [#33](https://github.com/devalok-design/shilp-sutra/pull/33) [`e1f24dd`](https://github.com/devalok-design/shilp-sutra/commit/e1f24ddd285db13bbe275dc2ebef04a773a2152d) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Tailwind 4 CSS-first migration. Setup-only breaking release — component APIs are unchanged. See [MIGRATION.md](./MIGRATION.md#v0370--tailwind-4-css-first-migration) for the full guide.

  ### BREAKING
  - **JS preset removed.** `tailwind.config.ts` with `presets: [shilpSutra]` no longer works. Tokens ship as TW4 `@theme` CSS via a single import:

    ```css
    @import 'tailwindcss';
    @import '@devalok/shilp-sutra/css';
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

## 0.36.1

### Patch Changes

- [#31](https://github.com/devalok-design/shilp-sutra/pull/31) [`daad9c4`](https://github.com/devalok-design/shilp-sutra/commit/daad9c4d89afdc9165edb05d3caf9c59116e2207) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - **Fix TW4 codemod regressions (resolves [#30](https://github.com/devalok-design/shilp-sutra/issues/30)).**

  The TW 3→4 migration in 0.34.0 left several class-name artifacts that slipped past our gates. 0.36.1 repairs all of them and adds pre-publish-audit coverage so the same class of bug can't ship again.
  - **RichChatInput + RichTextEditor (`[#30](https://github.com/devalok-design/shilp-sutra/issues/30)`, runtime-breaking):** `[[&_mark]:rounded-sm_mark]:rounded-xs` — a garbled nested arbitrary variant — was emitted as invalid CSS by the codemod and crashed Turbopack on every page load for TW4 consumers. Replaced with the intended `[&_mark]:rounded-xs`.
  - **BarChart, LineChart, Stepper (silent a11y regression):** `focus-visible:outline-none` escaped the rename to `outline-hidden`. In TW4, `outline-none` also strips the outline under `forced-colors: active`, which meant the 0.36.0 forced-colors feature had **no focus indicator** on these components in Windows high-contrast mode. Now all three use `outline-hidden` and focus renders correctly under forced-colors.
  - **SegmentedControl (silent visual shift):** `shadow-sm` in TW4 renders as TW3's bare `shadow` (one step larger). Migrated to `shadow-raised` for semantic consistency.
  - **Stepper:** `flex-shrink-0` → `shrink-0` (TW4 spelling).
  - **Sidebar menu button:** three `:!size-8` / `:!p-ds-03` / `:!p-0` used TW3's leading-`!` important prefix; now use TW4's trailing `class!` form.

  **Process hardening** — the `pre-publish-audit.mjs` script now includes a **Tailwind 4 Migration Hygiene** section:
  - **HARD GATES**: fails publish on doubled-bracket arbitrary variants (`[[&_x]:class_x]:class` — the exact pattern from [#30](https://github.com/devalok-design/shilp-sutra/issues/30)) or any stray `outline-none`.
  - **ADVISORIES**: warns on `rounded-sm` / `shadow-sm` / `blur-sm` / `backdrop-blur-sm` (silently-shifted meaning in TW4), TW3 `flex-shrink-*` / `flex-grow-*`, and TW3 `:!prefix` important syntax.

  `.github/workflows/release.yml` also gains `workflow_dispatch` so future publish re-runs don't require a throwaway commit.

## 0.36.0

### Minor Changes

- [#26](https://github.com/devalok-design/shilp-sutra/pull/26) [`e61fd3c`](https://github.com/devalok-design/shilp-sutra/commit/e61fd3c0118714d5424379eaf7af733731d3fcc6) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - **Forced-colors (Windows high-contrast) support.** Added `@media (forced-colors: active)` block in `semantic.css` that maps every semantic color token to system keywords (Canvas, CanvasText, Highlight, HighlightText, LinkText, GrayText, Mark, ButtonText, VisitedText). Applies to both light and dark themes — forced-colors is orthogonal to theme. Also adds belt-and-suspenders focus-ring outline (Highlight) and forced visible borders on interactive elements so ghost/link buttons remain perceivable. Decorative grain (`[data-grain]`) is hidden, skeleton shimmer freezes. Zero runtime impact when forced-colors is inactive.

  **FormField auto-wires Label + Input ids.** `FormField` now publishes an `inputId` via context. `Label` reads `htmlFor` from it, `Input` reads `id` from it, unless either is explicitly set on the child. Eliminates manual id-juggling and a whole class of Label-input mismatch bugs.

  **Toast error variants announce assertively.** `toast.error()` now renders `role="alert"` + `aria-live="assertive"` + `aria-atomic="true"` so screen readers interrupt speech on errors. Other toast types remain `role="status"` + `aria-live="polite"`. Upload toasts go assertive only when a file fails.

  **Dev-mode warning for missing `<Toaster />`.** `toast()` called without a mounted `Toaster` now logs a one-time console warning pointing to the fix. Production-silent.

  **Button processing ants no longer drift outside the button.** The marching-ant overlay was sizing its SVG + rect against the wrapper via `calc(100% - 2px)`, which could diverge from the button's actual rendered size during width transitions and async-feedback icon swaps — producing a visible gap between the button edge and the ants' outline. Now measured directly from `btnEl.offsetWidth/offsetHeight` with a ResizeObserver keeping it locked.

  **Alert solid-variant body-text legibility.** Fixed two compounding bugs: body text was hardcoded to `text-surface-fg-muted` (grey), overriding the CVA's foreground on solid variants; and solid compound variants all used `text-accent-fg` instead of the matching per-color `-fg` token. Warning in particular was silently broken — white-on-amber fails contrast, dark-text-on-amber is the right pairing. Now uses per-color `text-{info|success|warning|error}-fg` on solid/filled variants, and skips the muted body override there.

  **Per-color `-fg` tokens on non-accent status backgrounds.** Button async success/error states, BottomNavbar notification badge, and TopBar item badge now use `text-error-fg` / `text-success-fg` instead of `text-accent-fg`. No visible change today (all `-fg` tokens resolve to the same near-white), but brand-swap-safe — an override of `--color-accent-fg` won't silently mis-color error badges.

  **vitest testTimeout 15s → 30s.** Sequential-file execution plus accumulated jsdom pressure on tiptap + axe tests at the tail of a full run was grazing the 15s wall. Isolated runs finish under 1s; real regressions still hit the new ceiling.

  **Documentation cleanup.** Fixed six `data-table-*.md` stub files that shipped literal bash template headers to `llms-full.txt` (`# $(echo $f | sed ...)`). Reconstructed `packages/core/CHANGELOG.md` entries for 0.33.x–0.35.0 (was frozen at 0.33.0). Removed fake Button `variant="default"` / `"destructive"` aliases from the llms Props block (removed in 0.32.0). Updated README component counts (60+/14/7 → 78/29/8 + AI tier) and tech stack. Added Badge `truncate` prop to docs.

  **Design preference codified.** `variant="soft"` is now the Devalok default over `variant="outline"` for non-primary Button actions. Captured in CLAUDE.md, llms.txt, and llms-full.txt.

  **Forced-colors verification story.** New `Foundations → Forced Colors → Component Matrix` in Storybook with a solid-bg legibility sub-section showing every status color × every component (Button, Badge, BadgeIndicator, counter pills, checkables) side-by-side.

  **CI: bundle budget excludes sourcemaps.** The 5MB bundle-size gate was measuring `dist` including `.map` files (~5.4MB of sourcemaps alone). Now measures runtime JS + CSS + types only, reporting sourcemaps separately for transparency.

> See the root [CHANGELOG.md](../../CHANGELOG.md) for detailed per-release notes.
> This file is the Changesets-generated summary shipped alongside releases.

## 0.35.0

### Minor Changes

- World-Class Audit wave 1–5: dark-mode contrast fix, responsive clamp() typography, letter spacing, surface-fg-subtle darkening, size/color axes on Combobox/NumberInput/Slider/InputOTP/Toggle, Tabs `orientation="vertical"`, Stepper `onStepClick`, AlertDialog `responsive`, Chart keyboard a11y + `ariaDescription`, typography composite utilities (text-heading-xl/text-body-md/etc.), layout/link/duration tokens, `useFormField` wired into 8 components, Autocomplete portal, NotificationCenter mobile Sheet, 136+ new tests + coverage thresholds.

### Breaking

- `MessageList` prop `isLoadingMore` → `loadingMore`.
- `AppCommandPalette` Karm defaults removed — use `CommandRegistryProvider`.
- `NumberInput` shape: pill → rounded rectangle.
- `Alert.variant="filled"` deprecated → use `"solid"` (alias still works).
- `SegmentedControl.variant="accent"` deprecated → use `"solid"` (alias still works).
- `@floating-ui/dom`, `@tiptap/*`, `prosemirror-state` now bundled (moved to devDeps).

## 0.34.1

### Patch Changes

- Upgrade Vite 7 → 8 (Rolldown bundler) + @vitejs/plugin-react 6 (Oxc). SSR safety patch for Rolldown CJS interop.

## 0.34.0

### Minor Changes

- Tailwind CSS 4, TypeScript 6, ESLint 10, tailwind-merge 3.5, react-zoom-pan-pinch 4 — full toolchain upgrade

## 0.33.2

### Patch Changes

- Upgrade TypeScript 6.0.2, ESLint 10, typescript-eslint 8.58.1, react-zoom-pan-pinch 4 (peer dep)

## 0.33.1

### Patch Changes

- Bump all safe patch/minor dependencies: React 19.2.5, Storybook 10.3.5, Vitest 4.1.4, framer-motion 12.38, @floating-ui/dom 1.7.6, @tabler/icons-react 3.41.1, esbuild 0.28, jsdom 29, and more

## 0.33.0

### Minor Changes

- Custom EmojiNode with spritesheet rendering, SplitButton component, schedule send, ButtonGroup rebuild, RichChatInput v2 enhancements, TipTap v3 upgrade
