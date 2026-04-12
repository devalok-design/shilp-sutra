# Migration Guide

This page indexes all breaking changes across `@devalok/shilp-sutra` versions. For the full changelog, see [CHANGELOG.md](../CHANGELOG.md).

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
