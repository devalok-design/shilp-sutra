# Migration Guide

This page indexes all breaking changes across `@devalok/shilp-sutra` versions. For the full changelog, see [CHANGELOG.md](./CHANGELOG.md).

> **Upgrading from &lt; 0.36?** Start here, then read each intermediate version section. Breaking changes stack — skipping versions means stacking migrations.

## v0.38.0 — Deprecation sweep

0.38 removes 8 deprecated APIs that were soft-deprecated in earlier minor releases. All were available as aliases alongside their replacements; this release drops the aliases.

### Removed APIs and replacements

| Package | Removed | Use instead |
|---------|---------|-------------|
| `@devalok/shilp-sutra/ui/alert` | `variant="filled"` | `variant="solid"` |
| `@devalok/shilp-sutra/ui/banner` | `action` prop | `actions` prop |
| `@devalok/shilp-sutra/ui/input` | `startIcon` / `endIcon` props | `startSection` / `endSection` |
| `@devalok/shilp-sutra/ui/input` | `inputVariants` export | `inputWrapperVariants` |
| `@devalok/shilp-sutra/ui/segmented-control` | `variant="accent"` | `variant="solid"` |
| `@devalok/shilp-sutra/composed` | `ResponsiveOverlay` component | `Dialog` or `Sheet` directly |
| `@devalok/shilp-sutra/tailwind` | entire `./tailwind` export | CSS import (see v0.37 guide) |
| `@devalok/shilp-sutra/hooks/use-toast` | entire `./hooks/use-toast` export | `toast` from `@devalok/shilp-sutra` |

### Quick migration checklist

**Alert `variant="filled"` → `variant="solid"`:**
```diff
- <Alert variant="filled" color="error">Error occurred</Alert>
+ <Alert variant="solid" color="error">Error occurred</Alert>
```

**Banner `action` → `actions`:**
```diff
- <Banner action={<Button>Dismiss</Button>}>Update available</Banner>
+ <Banner actions={<Button>Dismiss</Button>}>Update available</Banner>
```

**Input `startIcon`/`endIcon` → `startSection`/`endSection`:**
```diff
- <Input startIcon={<Icon icon={IconSearch} />} />
+ <Input startSection={<Icon icon={IconSearch} />} />
```

**Input `inputVariants` → `inputWrapperVariants`:**
```diff
- import { inputVariants } from '@devalok/shilp-sutra'
+ import { inputWrapperVariants } from '@devalok/shilp-sutra'
```

**SegmentedControl `variant="accent"` → `variant="solid"`:**
```diff
- <SegmentedControl variant="accent" ... />
+ <SegmentedControl variant="solid" ... />
```

**ResponsiveOverlay → Dialog or Sheet:**
```diff
- import { ResponsiveOverlay } from '@devalok/shilp-sutra/composed'
- <ResponsiveOverlay open={open} onOpenChange={setOpen} title="Details">...</ResponsiveOverlay>
+ import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@devalok/shilp-sutra'
+ <Dialog open={open} onOpenChange={setOpen}>
+   <DialogContent><DialogHeader><DialogTitle>Details</DialogTitle></DialogHeader>...</DialogContent>
+ </Dialog>
```

**`./tailwind` preset:** Already removed in 0.37 — follow the [v0.37 migration guide](#v0370--tailwind-4-css-first-migration) if you haven't already.

**`hooks/use-toast`:**
```diff
- import { toast } from '@devalok/shilp-sutra/hooks/use-toast'
+ import { toast } from '@devalok/shilp-sutra'
```

## v0.37.0 — Tailwind 4 CSS-first migration

0.37 completes the Tailwind 3 → 4 migration that started in 0.34. The JS preset is gone. Tokens now ship as `@theme` CSS variables that TW4 consumes directly. **This is a breaking setup change; component APIs are unchanged.**

> **During the RC window, 0.37 lives on the `@next` dist-tag.** Use `@devalok/shilp-sutra@next` in the commands below. Once stable promotes to `@latest`, plain `@devalok/shilp-sutra` or `@latest` resolves to 0.37.x too. Pin via `@0.37.0` only after the stable release announcement.

### Before you start — two constraints inherited from Tailwind 4 itself

- **Browser support.** Tailwind 4 requires **Safari 16.4+, Chrome 111+, Firefox 128+**. Consumer apps that must support older browsers should stay on 0.36 (via the `latest-0.36` dist-tag) until they can drop those targets.
- **PostCSS plugin rename.** If your app had a TW3-style `postcss.config.js` like this:
  ```js
  // TW3 — no longer works in v4
  module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }
  ```
  update to the v4 plugin:
  ```js
  // TW4 — required
  module.exports = { plugins: { '@tailwindcss/postcss': {} } }
  ```
  Install: `pnpm add -D @tailwindcss/postcss`. Next.js 15+ / Vite users whose build already handles this transparently can skip this step.

### Quick migration checklist

1. Install the new required peers:
   ```sh
   pnpm add framer-motion @devalok/shilp-sutra@next
   # if you use toasts:
   pnpm add sonner
   ```
2. Rewrite `app/globals.css`:
   ```diff
   - @import "tailwindcss";
   - @config "./tailwind.config.ts";
   + @import "tailwindcss";
   + @import "@devalok/shilp-sutra/css";
   ```
3. **Delete `tailwind.config.ts`** — unless you have your own plugins (see "Keeping your own plugins" below).
4. Verify `next.config.ts` transpiles BOTH packages:
   ```ts
   transpilePackages: ['@devalok/shilp-sutra', '@devalok/shilp-sutra-brand'],
   ```
5. Run `pnpm why framer-motion` and confirm **a single version** (see "Framer-motion single-copy check").
6. Run a dark-mode sanity check (see below).
7. `pnpm build` — should succeed with no warnings mentioning shilp-sutra.

### Before / after: globals.css

**Before (0.36.x):**
```css
@import "tailwindcss";
@config "./tailwind.config.ts";
```

**After (0.37.0):**
```css
@import "tailwindcss";
@import "@devalok/shilp-sutra/css";

/* Optional — your own plugins or content globs go here */
@plugin "@tailwindcss/typography";
@source "./app/**/*.{ts,tsx}";
```

`@import "@devalok/shilp-sutra/css"` pulls in our full token set (`@theme` blocks for color, spacing-ds, text-ds, leading-ds, radius, shadow, ease, duration, breakpoints, z-layers, animate), custom utilities (typography composites, focus-ring, touch-target, safe-area insets, z-layer utilities), the dark-mode `@custom-variant`, and a `@source` directive that scans our compiled classes.

### Delete tailwind.config.ts

You **no longer need** `tailwind.config.ts` for shilp-sutra. TW4 config is CSS-first via `@theme`. Delete it if that was its only purpose.

### Keeping your own plugins

If you had TW plugins of your own (e.g., `@tailwindcss/typography`, `@tailwindcss/forms`), keep them with the TW4 CSS directive:

```css
@plugin "@tailwindcss/typography";
@plugin "@tailwindcss/forms";
```

No JS config file required. If you had custom theme extensions, translate them to `@theme` blocks inside your `globals.css`.

### Legacy TW3 config APIs removed in v4

If your old `tailwind.config.ts` used any of these, they no longer exist:

| Removed API | Replacement |
|---|---|
| `corePlugins: { … }` | Omit utilities you don't want by not including them; use `@source not "..."` or custom variants to exclude patterns |
| `safelist: [...]` | `@source inline("bg-red-500 text-lg")` in globals.css |
| `separator: ':'` | Not configurable; always `:` |
| `prefix: 'tw-'` | `@import "tailwindcss" prefix(tw);` at top of globals.css |
| `resolveConfig()` / `defaultTheme` helpers | Read `@theme` CSS vars at runtime via `getComputedStyle(document.documentElement)` |
| `content: [...]` | `@source "./app/**/*.{ts,tsx}"` in globals.css |
| `darkMode: 'class'` | `@custom-variant dark (&:where(.dark, .dark *));` (already included in our `/css` bundle) |

If you relied on `resolveConfig()` for runtime theme access in TypeScript (e.g., to pull brand colors into framer-motion variants), migrate to reading CSS custom properties directly — they're all declared on `:root` / `.dark` by the `/css` import.

### Peer dependency changes

| Dep | 0.36.x | 0.37.0 |
|---|---|---|
| `framer-motion` | bundled | **required peer** (`^12.0.0`) |
| `sonner` | bundled | **optional peer** (`^2.0.0`) — only if you render a `<Toaster />` |
| `tailwindcss` | `^3.4.0 \|\| ^4.0.0` | **`^4.0.0` only** |
| `use-sync-external-store` | optional peer | now in `dependencies` (auto-installed) |

**Why framer-motion moved to peer:** module-scoped React contexts (`MotionConfig`, `AnimatePresence`, `LayoutGroup`) fail silently if two copies resolve. Making it a peer means *you* pin the version and pnpm dedupes it.

### Framer-motion single-copy check

Run:
```sh
pnpm why framer-motion
```

**Expected:** one version, one instance. If you see two different versions, run:
```sh
pnpm dedupe
```
If dedupe doesn't collapse them (version ranges don't overlap), pin `framer-motion` at the top of your app's `package.json` `dependencies`, then `pnpm install`.

> **Note:** `pnpm why` reports what the lockfile resolved. Under strict-hoist, two copies can still coexist if they satisfy different peer ranges. If animations feel "stuck" or `AnimatePresence` exits don't fire, check `pnpm list framer-motion --depth=Infinity` as a second-level verification.

### Dark mode sanity check

Our `.dark` variant now uses `@custom-variant dark (&:where(.dark *))`. After upgrading, render a representative screen with `.dark` toggled on `<html>` (or your usual ancestor) and verify:

- Card backgrounds re-theme (not stuck on light)
- Solid buttons keep contrast
- Input borders are visible in dark
- Toast colors invert correctly
- Any surface shadows still appear (check `shadow-raised`, `shadow-overlay`)

If any of these is stuck on light, the `.dark` class isn't on an ancestor — add it to `<html>` (recommended) or `<body>`.

### Token collisions

Our spacing scale is namespaced `--spacing-ds-*` (→ `p-ds-03`, `gap-ds-04` etc.) to avoid colliding with TW4's default numeric spacing (`p-4`, `gap-6`). **If you define your own `--spacing-4` in `@theme`, it wins** — our utilities are `p-ds-04` not `p-4`. Typography uses `--text-ds-*`, `--leading-ds-*`. Radius is unprefixed (`--radius`, `--radius-ds-*`) because bare `rounded` / `rounded-ds-md` are the common idiom.

### Source class changes (in consumer code too)

If your own app code used any of these TW3-era patterns, update:

| TW3 (dead in TW4) | TW4 |
|---|---|
| `w-[--my-var]` | `w-(--my-var)` |
| `theme(spacing.4)` inside `w-[…]` | literal value (e.g., `1rem`) |
| `bg-gradient-to-r` | `bg-linear-to-r` |
| bare `shadow` | `shadow-sm`, `shadow-raised`, etc. |
| `outline-none` | `outline-hidden` |
| `rounded-sm` | `rounded-xs` |
| `!prefix` | `suffix!` |

Quick grep in your repo:
```sh
grep -rn 'w-\[--\|bg-gradient-to-\|theme(spacing' src/
```

### Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `Module not found: Can't resolve 'framer-motion'` on `next build` | framer-motion moved to peer, not installed | `pnpm add framer-motion` |
| `Module not found: Can't resolve 'sonner'` on `next build` | You import `Toaster`/`toast` from shilp-sutra but sonner isn't installed (optional peer) | `pnpm add sonner` |
| Toasts render without styling / `toast()` no-ops in dev | Same as above, but you didn't notice the build warning | `pnpm add sonner` |
| Classes like `p-ds-03` produce no CSS | missing `@import "@devalok/shilp-sutra/css"` in globals.css | add it |
| Classes like `p-ds-03` produce no CSS (import present) | pnpm strict-hoist hiding our dist from `@source` | verify `node_modules/.pnpm/@devalok+shilp-sutra@0.37.0/node_modules/@devalok/shilp-sutra/dist/` exists |
| Dark mode not switching | `.dark` not on an ancestor of the component | add `.dark` to `<html>` via `next-themes` or your color-mode hook |
| Animations feel broken / exits don't fire | two framer-motion copies | see "Framer-motion single-copy check" |
| `@config` warning on build | legacy config import in your CSS | remove `@config "..."` and use `@import "@devalok/shilp-sutra/css"` |
| `Unknown at-rule @theme` / `Unknown at-rule @utility` | PostCSS config still references `tailwindcss` + `autoprefixer` (TW3 style). TW4 uses a single plugin. | Install `@tailwindcss/postcss` and replace both plugins with `'@tailwindcss/postcss': {}` in `postcss.config.js`. See "Before you start" above. |
| `[@devalok/shilp-sutra] DEPRECATION: The JS preset at "./tailwind"...` notice on build | your `tailwind.config.ts` still has `presets: [shilpSutra]`, or a dependency's does | delete that line AND add `@import "@devalok/shilp-sutra/css"` to globals.css (both steps — the preset is a no-op stub in 0.37, removed in 0.38) |
| **App renders unstyled after upgrade; no build error** | You upgraded the package but did not add `@import "@devalok/shilp-sutra/css"` to `globals.css`. TW4 silently drops unknown utilities, so every `bg-surface-raised`/`p-ds-*`/`shadow-raised` class is emitting zero CSS. | Add the `@import` per step 2 above. If you see the DEPRECATION notice in your build output, heed it — that's the signal for exactly this scenario. |
| Dark mode no longer switches (worked on 0.36) | Same as above — the `@custom-variant dark` declaration lives in the DS `/css` bundle. Without the import, `dark:*` utilities also silently no-op. | Add `@import "@devalok/shilp-sutra/css"` to globals.css. |

### Upgrading from &lt; 0.36

Read the intermediate sections below (0.34, 0.33, 0.32, 0.30, 0.29, 0.23, 0.9) in order. Each has component-level breakage you'll need to resolve before 0.37's setup-level breakage matters.

### Need to pin 0.36 temporarily?

Use the `latest-0.36` dist-tag:
```sh
pnpm add @devalok/shilp-sutra@latest-0.36
```
This keeps you on the last TW3-compatible minor. We will backport critical security fixes to the `latest-0.36` line through at least 2026-10-01.

### Rollback recipe (for maintainers)

See [`docs/rollback.md`](./docs/rollback.md) for the executable playbook.

## v0.34.0 (Tailwind 4 + Toolchain)

**Tailwind CSS 3 → 4:**
- `outline-none` → `outline-hidden`
- `rounded-sm` → `rounded-xs`
- `backdrop-blur-sm` → `backdrop-blur-xs`
- `!prefix` → `suffix!` important syntax
- Replace `darkMode: 'class'` with `@variant dark (&:is(.dark *))` in CSS
- Add `@import "tailwindcss"` + `@config` to your CSS entry point
- Peer dep accepts both `^3.4.0 || ^4.0.0`

**Other toolchain:**
- `tailwind-merge` 3.0 → 3.5 (required for TW4 class recognition)
- TypeScript 5.7 → 6.0.2 (`types` defaults to `[]` — add `"types": ["node"]` to tsconfig if needed)
- ESLint 9 → 10 (config lookup starts from linted file directory, not CWD)
- `react-zoom-pan-pinch` 3 → 4 (`onTransformed` → `onTransform`)

## v0.33.0

**2 breaking changes:**

### EmojiSuggestion factory pattern

```diff
- import { EmojiSuggestion } from '@devalok/shilp-sutra/composed'
+ import { createEmojiSuggestion } from '@devalok/shilp-sutra/composed'
+ const EmojiSuggestion = createEmojiSuggestion()  // or createEmojiSuggestion('apple')
```

### Emoji HTML output changed

Non-native `emojiSet` renders emoji as `<span data-emoji-id="..." role="img">` nodes, not raw Unicode. `plainText` still returns Unicode.

## v0.32.0

**6 breaking changes:**

### Button variant/color rename

```diff
- <Button variant="default">        →  <Button variant="solid">
- <Button variant="destructive">    →  <Button variant="solid" color="error">
- <Button color="default">          →  <Button color="accent">
```

### Chip removed — use Badge

```diff
- import { Chip } from '@devalok/shilp-sutra/ui'
+ import { Badge } from '@devalok/shilp-sutra/ui'
```

### SegmentedControl rewritten

```diff
- <SegmentedControl variant="filled">   →  <SegmentedControl variant="accent">
- <SegmentedControl variant="tonal">    →  <SegmentedControl variant="default">
- <SegmentedControlItem>                →  (no longer exported — use options array)
- size="small|medium|big"               →  size="sm|md|lg"
```

### TopBar renders as `<header>`

Was `<div>`, now `<header>`. If you had a wrapping `<header>`, remove it to avoid nested landmarks.

### Surface token rename

```diff
- bg-surface-1  →  bg-surface-base
- bg-surface-2  →  bg-surface-raised
- bg-surface-3  →  bg-surface-raised-hover
- bg-surface-4  →  bg-surface-raised-active
```

### Shadow token rename

```diff
- shadow-01  →  shadow-raised
- shadow-02  →  shadow-raised-hover
- shadow-03  →  shadow-floating
- shadow-04  →  shadow-overlay
```

## v0.30.0

- **`@devalok/shilp-sutra-karm` removed** — Domain components moved to Karm app repo. The npm package is deprecated at v0.9.0.

No component API breakage. Drop-in upgrade from 0.29.0.

## v0.29.0

**4 breaking changes:**

### Warning color remapped (yellow → amber-bright)

`warning-*` tokens now use warm amber (OKLCH hue 65-70) instead of yellow (hue 85). If you hardcoded any `--yellow-*` primitives for warning states, switch to `--amber-bright-*` or the semantic `warning-*` tokens.

### Button icon API change

```tsx
// Before (0.28.x)
<Button startIcon={<IconPlus />}>Add</Button>

// After (0.29.0)
<Button startIcon={<Icon icon={IconPlus} />}>Add</Button>
```

### Badge rewrite

```tsx
// Before (0.28.x)
<Badge variant="secondary">Tag</Badge>
<Badge variant="destructive">Error</Badge>

// After (0.29.0)
<Badge variant="subtle">Tag</Badge>
<Badge variant="solid" color="error">Error</Badge>
```

Removed: `variant="secondary"`, `variant="destructive"`, `color="brand"`.
Added: `variant="soft"`, `color="custom"`, interactive props, `Badge.Indicator`, `Badge.Group`.

### Chip deprecated

```tsx
// Before
<Chip label="Tag" onDelete={fn} />

// After
<Badge onClick={fn} onDismiss={fn}>Tag</Badge>
```

## v0.23.0

**Surface and shadow token migration.** See the detailed guide: [plans/2026-03-16-surface-shadow-consistency-design.md](plans/2026-03-16-surface-shadow-consistency-design.md).

Key renames:
- `bg-surface-1` → `bg-surface-base`
- `bg-surface-2` → `bg-surface-raised`
- `bg-surface-3` → `bg-surface-raised-hover`
- `bg-surface-4` → `bg-surface-raised-active`
- `shadow-01` through `shadow-05` → `shadow-raised`, `shadow-raised-hover`, `shadow-floating`, `shadow-overlay`

## v0.9.0

**Dependency bundling.** All runtime deps now bundled into dist. Only React + peer deps stay external. Fixes React #527 in Next.js + pnpm. No API changes, but consumers should add to `next.config.js`:

```js
transpilePackages: ["@devalok/shilp-sutra", "@devalok/shilp-sutra-brand"]
```
