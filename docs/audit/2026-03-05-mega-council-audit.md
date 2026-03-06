# Mega-Council Audit: @devalok/shilp-sutra v0.2.1

**Date:** 2026-03-05
**Method:** Triple Council (9 experts), 2 rounds + cross-pollination, all claims verified against codebase
**Councils:** Design System (DS Architect, A11y Expert, API Designer) · Architecture (System Architect, Performance Engineer, Devil's Advocate) · DX (npm Consumer, Next.js Specialist, Docs Expert)

---

## Executive Summary

The design system has a strong foundation — vendored Radix primitives, per-component exports, good Storybook coverage, and a clean token architecture. However, **the system was built from the inside out**. It works for the maintainer but presents serious friction, silent failures, and outright blockers for external deployers. This audit identifies **38 issues** across 5 severity tiers.

---

## P0 — Blockers (Ship-stopping, must fix before any external adoption)

### 1. Karm hooks→ui path rewrite bug (Runtime crash)
**File:** `packages/karm/vite.config.ts:65`
```ts
if (subpath.startsWith('hooks/')) return `@devalok/shilp-sutra/ui`
// Should be: return `@devalok/shilp-sutra/hooks`
```
Every karm component that imports `useIsMobile` or `useToast` resolves to the wrong barrel. Consumers of `@devalok/shilp-sutra-karm` get a **runtime import failure**. The built artifacts in `packages/karm/dist/` contain the broken paths.

### 2. Google Sans font licensing violation
**File:** `packages/core/fonts/GoogleSans-Variable.ttf` (4.8MB), `GoogleSans-Italic-Variable.ttf` (5.1MB)
Google Sans is a **proprietary font** — not available on Google Fonts, not open-source, requires a license from Google. Shipping it in an MIT-licensed npm package is a licensing violation. Every deployer who serves these files inherits legal exposure.
**Fix:** Remove Google Sans, replace with an open-source alternative (Inter, Plus Jakarta Sans), or obtain and document a license.

### 3. No "use client" in karm package (Next.js App Router crash)
**Files:** All 48 files in `packages/karm/src/` — zero contain `"use client"`
Every karm component uses React hooks (`useState`, `useRef`, `useCallback`). In Next.js App Router, importing any karm component into a Server Component layout produces a build error. Core has `inject-use-client.mjs`; karm has no equivalent.
**Fix:** Create equivalent post-build injection script for karm, or add `"use client"` to source files.

### 4. Phantom token `text-text-on-interactive` (Silent rendering bug)
**File:** `packages/core/src/ui/badge.tsx:16`
```ts
'bg-interactive text-text-on-interactive border-transparent'  // solid variant
```
No `--color-text-on-interactive` CSS variable exists anywhere. No `text-on-interactive` in the Tailwind preset. The solid badge variant has **no text color** in production — text inherits whatever the parent sets, or falls back to black on a colored background (contrast failure).
**Fix:** Add token `text-on-interactive` to preset, or replace with existing `text-on-color`.

---

## P1 — Critical DX Issues (Will cause abandonment or hours of debugging)

### 5. No root `"."` export
**File:** `packages/core/package.json` — exports map has no `"."` entry
`import { Button } from '@devalok/shilp-sutra'` produces `ERR_PACKAGE_PATH_NOT_EXPORTED`. This is the first thing every deployer tries. Some internal docs/JSDoc comments even show this broken pattern.
**Fix:** Add `"."` export pointing to `./ui` barrel (or a curated root barrel).

### 6. Hard dependencies bloat (D3, TipTap, TanStack, icons)
**File:** `packages/core/package.json` — `dependencies`
A deployer wanting `<Button>` and `<Input>` is forced to install D3 (7 sub-packages), TipTap (3 packages), TanStack Table, TanStack Virtual, react-markdown, @tabler/icons-react, and input-otp. This is ~4.9MB installed. These should be:
- **Peer dependencies** (deployer controls version), or
- **Isolated behind separate entry points** with optional peer deps, or
- **Split into a separate package** (e.g., `@devalok/shilp-sutra-charts`)

### 7. 9.5MB TTF fonts (should be WOFF2 or removed)
**File:** `packages/core/fonts/` — 4 TTF files totaling 9.5MB
TTF is 3× larger than WOFF2. These fonts account for ~66% of the package install size. Most Next.js deployers use `next/font` and will never reference these files.
**Fix:** Convert to WOFF2 (saves ~7MB), or remove from package and document self-hosting.

### 8. 34MB unoptimized PNGs in brand package
**File:** `packages/brand/dist/assets/` — 37 PNG files averaging 920KB each
WebP/AVIF would yield 70-80% savings. This adds 15-30 seconds to CI npm install when uncached.

### 9. Missing per-component exports (charts, tree-view, date-picker)
**File:** `packages/core/package.json` — exports map
No `"./ui/charts"`, `"./ui/tree-view"`, or `"./composed/date-picker"` entries. These components are only accessible via barrel imports, defeating the granular server-safe import strategy.
**Fix:** Add exports map entries for all component directories.

### 10. NumberInput/Combobox don't extend HTMLAttributes
**Files:** `packages/core/src/ui/number-input.tsx:34-42`, `packages/core/src/ui/combobox.tsx:66-80`
Neither interface extends `React.InputHTMLAttributes` or `React.HTMLAttributes`. Deployers cannot pass `id`, `name`, `aria-label`, `onBlur`, `data-testid`, or any standard HTML attribute. This **blocks integration with React Hook Form, Formik, and any form library**.
**Fix:** Extend `Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>`.

### 11. onChange signature inconsistency (4 different shapes)
| Component | onChange signature |
|-----------|------------------|
| Input/Textarea | `React.ChangeEvent<HTMLInputElement>` |
| Combobox | `(value: string \| string[]) => void` |
| Autocomplete | `(option: AutocompleteOption) => void` |
| NumberInput | `(value: number) => void` |

A deployer cannot predict the signature. Combobox forces `as string` casts at every call site.
**Consider:** Standardize on `onValueChange(value: T)` (Radix convention) for custom inputs, keeping native `onChange` for HTML-extending components.

### 12. No per-package README (npmjs.com pages blank)
**Files:** `packages/core/README.md`, `packages/brand/README.md`, `packages/karm/README.md` — all missing
The npmjs.com landing page for each package shows nothing. This is the #1 place potential adopters look.

---

## P2 — Significant Issues (Cause confusion, workarounds, or degraded experience)

### 13. FormField doesn't auto-wire aria-describedby
**File:** `packages/core/src/ui/form.tsx:14-16`
Consumers must manually call `getFormFieldA11y()` and spread the result. If they forget, error messages are invisible to screen readers. Most design systems (Chakra, MUI, Radix Form) auto-wire this via context.

### 14. Touch targets below WCAG 2.1 AA minimum (24×24px)
**Files:** `alert.tsx:92-98`, `banner.tsx:85-92`, `badge.tsx:106-114`, `chip.tsx:140-151`, `dialog.tsx:94`, `sheet.tsx:149`
Dismiss/close buttons render 16px icons with zero or minimal padding.
**Fix:** Add `min-h-6 min-w-6` (24px) or `min-h-11 min-w-11` (44px preferred) to all icon-only action buttons.

### 15. Spinner/SearchInput/FileUpload missing `motion-reduce:animate-none`
**Files:** `spinner.tsx:51`, `search-input.tsx:85`, `file-upload.tsx:250,319`
`animate-spin` without `motion-reduce:animate-none`. The global `prefers-reduced-motion` rule in `semantic.css` sets duration to `0.01ms` but doesn't truly stop continuous rotation.

### 16. Variant/color axis naming inconsistency
| Component | Semantic intent prop | Style variation prop |
|-----------|---------------------|---------------------|
| Button | `variant="error"` | `variant="ghost"` |
| Badge | `variant="error"` | `variant="teal"` |
| Chip | `color="error"` | `variant="outlined"` |
| Alert | `variant="error"` | — |
| Progress | `color="error"` | — |

Deployers cannot predict whether to use `variant`, `color`, or `state`. The Chip model (separate axes) is correct; others should follow it.

### 17. DialogHeader/Footer, SheetHeader/Footer missing forwardRef
**Files:** `dialog.tsx:121-147`, `sheet.tsx:159-179`
Plain arrow functions, not `forwardRef`. Deployers attaching refs will silently get `null`. Compare to `CardHeader`/`CardFooter` which correctly use `forwardRef`.

### 18. Missing type exports (SwitchProps, SliderProps, ToastProps)
Several components don't export their props type, blocking consumer type composition (`interface MySwitch extends SwitchProps`).

### 19. Tailwind preset `screens` replaces deployer breakpoints
**File:** `packages/core/src/tailwind/preset.ts:5-14`
`screens` is at `theme.screens` (top-level), not `theme.extend.screens`. If a deployer has custom breakpoints, they vanish silently.
**Fix:** Move to `theme.extend.screens`.

### 20. darkMode: 'class' with no SSR handshake (flash of wrong theme)
**File:** `packages/core/src/tailwind/preset.ts:4`
Dark mode requires `.dark` class on `<html>`. No `ThemeScript` component exists to read the cookie/preference and set the class before hydration. Every SSR page flashes the wrong theme on load.

### 21. No `"main"` or `"module"` field in package.json
**File:** `packages/core/package.json`
Older tooling (Webpack 4, React Native Metro, some test runners) that doesn't support `exports` field cannot resolve the package at all.

### 22. CSS @import tokens require a bundler
**File:** `packages/core/dist/tokens/index.css`
Uses `@import './primitives.css'`. This only works if the consumer's bundler handles CSS imports. Plain HTML or CDN-served CSS gets 404s.

### 23. ESM-only (no CJS except tailwind)
All packages set `"type": "module"` and emit only ES modules. Jest with default config, older Node tooling, and Webpack 4 cannot `require()` any export except `./tailwind`.

### 24. Token import doesn't include fonts
**File:** `packages/core/src/tokens/index.css:1-3`
Imports primitives, semantic, and typography-semantic — but NOT `typography.css` (the `@font-face` declarations). Deployers who do `import '@devalok/shilp-sutra/tokens'` get variables but **no fonts**. Either intentional (for next/font users) or a bug — either way, undocumented.

### 25. `sideEffects` may be too narrow
**File:** All `package.json` — `"sideEffects": ["**/*.css"]`
Vendored Radix primitives contain module-level side effects (global event listeners). Consider adding `"**/primitives/**"` to the array.

---

## P3 — Minor Issues (Should fix, low urgency)

### 26. Toast close button invisible on touch devices
**File:** `packages/core/src/ui/toast.tsx:95` — `opacity-0` default, only visible on hover/focus.

### 27. Label required indicator is purely visual
**File:** `packages/core/src/ui/label.tsx:27` — asterisk is `aria-hidden="true"`, no `aria-required` guidance.

### 28. Switch missing `error` state (unlike Checkbox)
**File:** `packages/core/src/ui/switch.tsx` — bare Radix wrapper with no error prop.

### 29. Badge could be server-safe (when onDismiss not used)
**File:** `packages/core/src/ui/badge.tsx:1` — has `"use client"` but is mostly a pure `<span>` with CVA.

### 30. Orphaned `page-skeletons.js` in karm dist
**File:** `packages/karm/dist/page-skeletons.js` — unreachable via exports map.

### 31. README component count is wrong
Claims "52 UI primitives" but actual count differs. Missing: charts, TreeView, Stepper, Transitions, FileUpload, Combobox, Autocomplete, SegmentedControl, IconButton, ButtonGroup.

### 32. next/font/local can't reference node_modules fonts
`next/font/local({ src: '...' })` requires a string literal path — can't point to `node_modules`. Needs documentation or a `createFontConfig()` helper.

### 33. Karm peer dep range `>=0.1.0` is too broad
If core ships a breaking internal change, karm's lockfile may resolve an older core, producing silent runtime breakage.

---

## P4 — Documentation Gaps

### 34. No component API reference outside Storybook
No markdown-based props documentation. If Storybook is down, deployers read `.d.ts` files.

### 35. No dark mode setup guide
README says "toggle via `.dark` class" but never shows how to implement the toggle, read preferences, or avoid FOUC.

### 36. No migration guide for breaking changes
CHANGELOG removes old motion tokens — no guide explaining replacements.

### 37. No TypeScript setup guide
No mention of `tsconfig.json` requirements or module resolution settings.

### 38. ui vs composed vs shell mental model unexplained
Deployers cannot predict which tier a component lives in. Why is DatePicker "composed" but Select is "ui"?

---

## Council Consensus

All 9 experts agreed on these priorities:

1. **Fix P0s immediately** — they are ship-stoppers (karm path bug, Google Sans, karm use-client, phantom token)
2. **Heavy dependencies are the #1 adoption killer** — D3/TipTap/TanStack as hard deps will make 80% of potential users walk away
3. **The system works from the inside but fails from the outside** — silent CSS failures, missing docs, broken bare imports
4. **Per-component exports are the right architecture** — double down on them, deprecate barrel imports as the default
5. **A11y foundation is strong (Radix)** but the custom layer has gaps — touch targets, form wiring, motion reduction

## Council Disagreements

- **DS Architect vs Devil's Advocate:** Whether to add a `"."` root export. DS Architect says yes (convention). Devil's Advocate warns it will become the default import path and pull everything. **Resolution:** Add `"."` but make it re-export only the server-safe subset.
- **Performance vs API Designer:** Whether barrel exports should be removed entirely. Performance says yes (forces tree-shaking). API Designer says no (discoverability). **Resolution:** Keep barrels but document per-component as the recommended pattern.
- **Next.js Specialist flagged:** Need for a `ThemeScript` component for SSR dark mode — this is a new feature, not a bug fix. Defer to post-P0 work.

## Recommended Fix Order

```
Phase 1 (P0 — immediate):
  ├── Fix karm hooks path rewrite
  ├── Remove Google Sans / replace with licensed font
  ├── Add "use client" injection to karm build
  └── Fix phantom text-on-interactive token

Phase 2 (P1 — before external adoption):
  ├── Add "." root export
  ├── Move D3/TipTap/TanStack to peer deps or split packages
  ├── Convert fonts to WOFF2 (or remove)
  ├── Convert brand PNGs to WebP
  ├── Add missing exports (charts, tree-view, date-picker)
  ├── Fix NumberInput/Combobox HTMLAttributes
  ├── Write per-package READMEs
  └── Standardize onChange signatures

Phase 3 (P2 — quality polish):
  ├── Auto-wire FormField aria-describedby
  ├── Fix touch targets on all dismiss buttons
  ├── Add motion-reduce to spinners
  ├── Standardize variant/color axis naming
  ├── Add forwardRef to Dialog/Sheet sub-components
  ├── Export all component prop types
  ├── Move screens to theme.extend.screens
  ├── Add ThemeScript for SSR dark mode
  └── Add "main"/"module" fields

Phase 4 (P3/P4 — docs & polish):
  ├── Component API reference docs
  ├── Dark mode setup guide
  ├── Migration guide
  ├── TypeScript setup guide
  ├── Mental model explainer (ui/composed/shell)
  └── Fix remaining minor issues
```
