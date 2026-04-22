# @devalok/shilp-sutra

## 0.37.1

### Patch Changes

- [`b9103ec`](https://github.com/devalok-design/shilp-sutra/commit/b9103ec07f7733060265280517fd52e8c93f3e53) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - **docs:** comprehensive sweep of every component doc — Composability sections, prop accuracy, and a new publish gate that prevents drift.

  Most of the work is in `docs/components/**/*.md` (which ships in the npm bundle via the `files` array) and `llms-full.txt` (the compiled AI-agent reference, also shipped). No component APIs change.

  **What changed for consumers:**
  - **Every one of the 119 component docs now has a `## Composability` section** — covers required providers, context cascade, sibling/companion components, alternatives, router/framework integration. AI agents reading `llms-full.txt` get richer guidance on how pieces fit together, not just props + defaults.
  - **Prop accuracy fixes on 11 components:** Alert (added `size`, documented `solid` variant), Card (added `color` / `size` / `accent` / `accentColor`), Combobox (`size`), NumberInput (`size` + `state`), Select (`variant` + `color`, size expanded to `xs`), Sidebar (SidebarMenuButton's `variant` / `size` / `isActive` / `tooltip` / `asChild`), Slider (`size` + `color`), Tabs (TabsList `size` + `orientation`), Text (full variant list enumerated), Textarea (`xs` size), Toggle (`color`). These props existed in source but weren't documented — consumers had to read the `.tsx` to find them.
  - **Composability deepening** on 26 context-heavy components — Card (size cascade), ButtonGroup (position-aware radius, focus isolation), Form (FormField auto-consumption by Input/Textarea/NumberInput/InputOTP; explicit for Checkbox/Radio/Switch/Slider), Icon (IconProvider cascade), Sidebar (SidebarProvider state model + three-provider setup), DataTable (server vs client mode switching), etc.
  - **InputOTP** — Props section finally lists `maxLength`, `value`, `onChange`, `onComplete`, `pattern`, `state`, `size` (was "standard input-otp props"). Documented the InputOTPSizeContext cascade.

  **New publish gate:** `scripts/audit-component-docs.mjs --check` runs in `pre-publish-audit.mjs`. Fails the publish on any HIGH drift between a component's CVA source and its Props-section axes. Medium flags (TS-only props the script can't see) stay advisory.

- [`b9103ec`](https://github.com/devalok-design/shilp-sutra/commit/b9103ec07f7733060265280517fd52e8c93f3e53) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - **fix(InlineEdit):** forward `aria-label` / `aria-labelledby` to the `role="textbox"` span.

  InlineEdit renders `role="textbox"` on an inner span but previously spread all props to the outer wrapper `<div>` — so any `aria-label` consumers passed never reached the element that actually needed the accessible name. axe flagged it as "ARIA input fields must have an accessible name"; the existing a11y test even had a rule-disable workaround for this.

  **Fix:**
  - Intercept `aria-label` and `aria-labelledby` from props before spreading to the wrapper; apply them to the textbox span.
  - Fall back to `placeholder` as the aria-label when neither is provided — screen readers always get a meaningful name.
  - Skip entirely in `readOnly` mode (no `role="textbox"` to label).

  **Migration:** no breaking changes. Consumers already passing `aria-label` will now see it on the correct element; consumers relying on the previous (broken) behavior had nothing to rely on — the label was silently dropped.

  Discovered during the `describeConformance` adoption audit (2026-04-21).

## 0.37.0

### Minor Changes

- [`bb1b680`](https://github.com/devalok-design/shilp-sutra/commit/bb1b680c6daf90e7a53c2be78a0cdff2d1fad8e1) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Restore every utility-class mapping dropped in the TW3 JS-preset → TW4 @theme migration. This fixes visible regressions in Avatar (collapsed to text), StatusDot, Badge, Alert, SplitButton, Accordion, Collapsible, Progress, Spinner, Stepper, and any component using `w-ds-*` / `h-ds-*` sizing, `bg-neutral-*`, `bg-surface-1..4`, step-6 status colors, `animate-accordion-*` / `animate-collapsible-*` / `animate-popover-*` / `animate-timer-bar` / `animate-shake`, `border-focus`, `opacity-action-*`, `max-w-layout*`, or `bg-gradient-brand*`.

  **Root cause:** the old TW3 preset (514 lines of `theme.extend` mapping) was deleted during the TW4 migration. Its replacement — TW4 `@theme` CSS variables — only emits utilities for tokens in namespaces TW4 knows about (`--color-*`, `--spacing-*`, `--text-*`, etc.). Any preset entry whose mapping didn't fit a TW4 namespace was silently lost; the `var()` still exists in `:root` but no utility class is generated. TW4 silently drops unknown utilities, so typecheck/lint/tests/build/smoke all pass while visual output is broken.

  **What's restored:**
  - `--color-neutral-{1..12}` aliased into @theme (enables `bg-neutral-*`, `border-neutral-*`)
  - `--color-surface-{1,2,3,4}` aliased for CLAUDE.md surface-layering rule (`bg-surface-1..4`)
  - `--color-{error,success,warning,info}-6` added (SplitButton soft, StatusDot)
  - `--amber-bright-6` primitive added (was missing entirely — warning step-6 would resolve to empty)
  - `--color-overlay` + `--color-disabled` promoted from internal :root into @theme (`bg-overlay`, `bg-disabled`, `text-disabled`)
  - `--spacing-ds-{xs,xs-plus,sm,sm-plus,md,lg,xl}` added — named component sizes driving `w-ds-*` / `h-ds-*` / `min-w-ds-*` / `min-h-ds-*` (fixes Avatar, Button, Input collapse)
  - `--spacing-ico-{sm,md,lg,xl}` added — icon sizes
  - Responsive layout spacing `--spacing-{page-x,page-y,section-gap,card-gap,stack-gap}` corrected (media overrides had `-ds-` prefix but @theme had bare)
  - `@utility` blocks for `border-ds-{sm,md,lg}`, `border-focus`, `opacity-action-{hover,selected,disabled,focus,active}`, `max-w-layout`, `max-w-layout-body`, `bg-gradient-brand`, `bg-gradient-brand-dark`
  - 12 custom `--animate-*` keyframes + timings ported from old preset to tokens/animations.css (accordion-down/up, collapsible-down/up, progress-indeterminate, skeleton-shimmer, caret-blink, timer-bar, popover-in/out, processing-ants-ambient/working/urgent/march/svg, shake)
  - `tw-animate-css ^1.4.0` added to `dependencies` and `@import`ed in shilp-sutra.css (provides `animate-in`, `fade-in-*`, `zoom-*`, `slide-*-from-*` for Radix enter/exit animations)
  - Missing `./ui/split-button` subpath export added to package.json

  **Regression gate:** new `scripts/audit-compiled-css.mjs` runs AFTER the consumer smoke and verifies every DS utility-class pattern referenced in `packages/core/src/**` emits a rule in the compiled consumer CSS. The expanded smoke-consumer page now renders every primitive (Avatar, StatusDot, Badge, Alert, Accordion, Collapsible, Progress, Spinner, SplitButton, Stepper, form controls), so the audit exercises the full class surface. Wired into `release.yml` as a publish-blocking step for both Turbopack and Webpack variants. If a future refactor drops another token mapping, this gate fails the publish.

  Full audit log: `docs/audits/2026-04-20-0.37-token-gap.md`.

  **Consumer impact:** no-code upgrade from 0.37.0-next.1 to 0.37.0-next.2. Visual regressions in Avatar, animations, and any other affected component are fixed on upgrade.

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

### Patch Changes

- [`d4dbbee`](https://github.com/devalok-design/shilp-sutra/commit/d4dbbeecfe57ec20d75d0b082265831af3cd9050) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Restore the full animation utility surface that was silently dropped in 0.37.0-next.0.

  **The bug:** when the JS preset was removed during the TW4 migration, two things went missing:
  1. **`tailwindcss-animate` utilities** (`animate-in`, `animate-out`, `fade-in-0`, `zoom-in-75/95`, `slide-in-from-top/bottom/left`, `slide-out-to-*`, etc.) — used by every Radix primitive (Dialog, Popover, Tooltip, HoverCard, Select, DropdownMenu, ContextMenu, AlertDialog, Sheet, Toast, etc.) for enter/exit animations. Without them, overlays snap in/out with no motion. Avatar's fade-in on image load also goes silent.
  2. **Custom DS animations** (`animate-accordion-down`/`-up`, `animate-collapsible-down`/`-up`, `animate-progress-indeterminate`, `animate-skeleton-shimmer`, `animate-caret-blink`, `animate-timer-bar`, `animate-popover-in`/`-out`, `animate-processing-ants-*`) — their `@keyframes` + `@theme --animate-*` entries existed in the old preset but weren't ported to `tokens/animations.css` during the migration.

  **The fix:**
  - Added `tw-animate-css ^1.4.0` to core `dependencies` (TW4-native rewrite of tailwindcss-animate by the same author).
  - `@import "tw-animate-css"` in `tokens/shilp-sutra.css` so consumers get the full `animate-in`/`fade-*`/`slide-*`/`zoom-*` surface automatically.
  - Ported all 11 custom DS keyframes + `@theme --animate-*` entries from the deleted preset to `tokens/animations.css`. Each references the same timing + easing the preset used (`var(--duration-slow-02)`, `var(--ease-productive-standard)`, etc.), so the motion character is identical to 0.36.

  **Verification:** consumer smoke test (Next 16 + Turbopack) now compiles `animate-in`, `animate-skeleton-shimmer`, `animate-progress-indeterminate`, `animate-caret-blink`, `slide-in-from-bottom`, `zoom-in-75`, and peers into the generated CSS. Previously all of these emitted zero rules.

  **Consumer impact:** existing `animate-*` class names work again without any code change. If you're on `0.37.0-next.0` and seeing broken avatars / motion, upgrading to `0.37.0-next.1` is a no-code fix.

## 0.37.0-next.1

### Minor Changes

- [`bb1b680`](https://github.com/devalok-design/shilp-sutra/commit/bb1b680c6daf90e7a53c2be78a0cdff2d1fad8e1) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Restore every utility-class mapping dropped in the TW3 JS-preset → TW4 @theme migration. This fixes visible regressions in Avatar (collapsed to text), StatusDot, Badge, Alert, SplitButton, Accordion, Collapsible, Progress, Spinner, Stepper, and any component using `w-ds-*` / `h-ds-*` sizing, `bg-neutral-*`, `bg-surface-1..4`, step-6 status colors, `animate-accordion-*` / `animate-collapsible-*` / `animate-popover-*` / `animate-timer-bar` / `animate-shake`, `border-focus`, `opacity-action-*`, `max-w-layout*`, or `bg-gradient-brand*`.

  **Root cause:** the old TW3 preset (514 lines of `theme.extend` mapping) was deleted during the TW4 migration. Its replacement — TW4 `@theme` CSS variables — only emits utilities for tokens in namespaces TW4 knows about (`--color-*`, `--spacing-*`, `--text-*`, etc.). Any preset entry whose mapping didn't fit a TW4 namespace was silently lost; the `var()` still exists in `:root` but no utility class is generated. TW4 silently drops unknown utilities, so typecheck/lint/tests/build/smoke all pass while visual output is broken.

  **What's restored:**
  - `--color-neutral-{1..12}` aliased into @theme (enables `bg-neutral-*`, `border-neutral-*`)
  - `--color-surface-{1,2,3,4}` aliased for CLAUDE.md surface-layering rule (`bg-surface-1..4`)
  - `--color-{error,success,warning,info}-6` added (SplitButton soft, StatusDot)
  - `--amber-bright-6` primitive added (was missing entirely — warning step-6 would resolve to empty)
  - `--color-overlay` + `--color-disabled` promoted from internal :root into @theme (`bg-overlay`, `bg-disabled`, `text-disabled`)
  - `--spacing-ds-{xs,xs-plus,sm,sm-plus,md,lg,xl}` added — named component sizes driving `w-ds-*` / `h-ds-*` / `min-w-ds-*` / `min-h-ds-*` (fixes Avatar, Button, Input collapse)
  - `--spacing-ico-{sm,md,lg,xl}` added — icon sizes
  - Responsive layout spacing `--spacing-{page-x,page-y,section-gap,card-gap,stack-gap}` corrected (media overrides had `-ds-` prefix but @theme had bare)
  - `@utility` blocks for `border-ds-{sm,md,lg}`, `border-focus`, `opacity-action-{hover,selected,disabled,focus,active}`, `max-w-layout`, `max-w-layout-body`, `bg-gradient-brand`, `bg-gradient-brand-dark`
  - 12 custom `--animate-*` keyframes + timings ported from old preset to tokens/animations.css (accordion-down/up, collapsible-down/up, progress-indeterminate, skeleton-shimmer, caret-blink, timer-bar, popover-in/out, processing-ants-ambient/working/urgent/march/svg, shake)
  - `tw-animate-css ^1.4.0` added to `dependencies` and `@import`ed in shilp-sutra.css (provides `animate-in`, `fade-in-*`, `zoom-*`, `slide-*-from-*` for Radix enter/exit animations)
  - Missing `./ui/split-button` subpath export added to package.json

  **Regression gate:** new `scripts/audit-compiled-css.mjs` runs AFTER the consumer smoke and verifies every DS utility-class pattern referenced in `packages/core/src/**` emits a rule in the compiled consumer CSS. The expanded smoke-consumer page now renders every primitive (Avatar, StatusDot, Badge, Alert, Accordion, Collapsible, Progress, Spinner, SplitButton, Stepper, form controls), so the audit exercises the full class surface. Wired into `release.yml` as a publish-blocking step for both Turbopack and Webpack variants. If a future refactor drops another token mapping, this gate fails the publish.

  Full audit log: `docs/audits/2026-04-20-0.37-token-gap.md`.

  **Consumer impact:** no-code upgrade from 0.37.0-next.1 to 0.37.0-next.2. Visual regressions in Avatar, animations, and any other affected component are fixed on upgrade.

### Patch Changes

- [`d4dbbee`](https://github.com/devalok-design/shilp-sutra/commit/d4dbbeecfe57ec20d75d0b082265831af3cd9050) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Restore the full animation utility surface that was silently dropped in 0.37.0-next.0.

  **The bug:** when the JS preset was removed during the TW4 migration, two things went missing:
  1. **`tailwindcss-animate` utilities** (`animate-in`, `animate-out`, `fade-in-0`, `zoom-in-75/95`, `slide-in-from-top/bottom/left`, `slide-out-to-*`, etc.) — used by every Radix primitive (Dialog, Popover, Tooltip, HoverCard, Select, DropdownMenu, ContextMenu, AlertDialog, Sheet, Toast, etc.) for enter/exit animations. Without them, overlays snap in/out with no motion. Avatar's fade-in on image load also goes silent.
  2. **Custom DS animations** (`animate-accordion-down`/`-up`, `animate-collapsible-down`/`-up`, `animate-progress-indeterminate`, `animate-skeleton-shimmer`, `animate-caret-blink`, `animate-timer-bar`, `animate-popover-in`/`-out`, `animate-processing-ants-*`) — their `@keyframes` + `@theme --animate-*` entries existed in the old preset but weren't ported to `tokens/animations.css` during the migration.

  **The fix:**
  - Added `tw-animate-css ^1.4.0` to core `dependencies` (TW4-native rewrite of tailwindcss-animate by the same author).
  - `@import "tw-animate-css"` in `tokens/shilp-sutra.css` so consumers get the full `animate-in`/`fade-*`/`slide-*`/`zoom-*` surface automatically.
  - Ported all 11 custom DS keyframes + `@theme --animate-*` entries from the deleted preset to `tokens/animations.css`. Each references the same timing + easing the preset used (`var(--duration-slow-02)`, `var(--ease-productive-standard)`, etc.), so the motion character is identical to 0.36.

  **Verification:** consumer smoke test (Next 16 + Turbopack) now compiles `animate-in`, `animate-skeleton-shimmer`, `animate-progress-indeterminate`, `animate-caret-blink`, `slide-in-from-bottom`, `zoom-in-75`, and peers into the generated CSS. Previously all of these emitted zero rules.

  **Consumer impact:** existing `animate-*` class names work again without any code change. If you're on `0.37.0-next.0` and seeing broken avatars / motion, upgrading to `0.37.0-next.1` is a no-code fix.

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
