# Tailwind CSS v3 → v4 Migration Plan

**Goal:** Upgrade from Tailwind CSS 3.4 to 4.x while preserving 100% of our design token system, dark mode, and component styling.

**Architecture decision:** Use the `@config` bridge to load our existing JS preset rather than rewriting to CSS-first `@theme`. Our preset is 477 lines of carefully tuned tokens — migrating it to CSS `@theme` directives is high-risk for zero functional benefit. The `@config` bridge is officially supported and recommended for complex presets.

## Why @config bridge, not full CSS-first migration

1. Our preset maps 200+ CSS custom properties to Tailwind utilities — this mapping is verbose but well-tested in JS
2. CSS `@theme` doesn't support tuple values like `fontSize` with `lineHeight` pairings
3. Our plugin (`addBase`, `addUtilities`) has no CSS-first equivalent for `@property` declarations
4. Industry leaders (shadcn, Radix Themes) also use the JS bridge approach for complex token systems
5. We can incrementally migrate individual sections to `@theme` in future minors

## Execution Steps

### Step 1: Install TW4 + @tailwindcss/vite

```bash
pnpm add -Dw tailwindcss@4 @tailwindcss/postcss@4
pnpm add -Dw @tailwindcss/vite@4  # for Storybook
```

### Step 2: Update CSS entry point

Replace `@tailwind` directives with `@import "tailwindcss"` + `@config`:

```css
/* packages/core/src/tokens/index.css */
@import "tailwindcss";
@config "../../tailwind/preset.ts";

@import './primitives.css';
@import './semantic.css';
@import './typography.css';
@import './typography-semantic.css';
```

### Step 3: Update PostCSS config

```js
// postcss.config.js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
```

### Step 4: Dark mode variant

Add to CSS (TW4 no longer reads `darkMode: 'class'` from JS config):

```css
@variant dark (&:is(.dark *));
```

### Step 5: Preset adjustments

- Remove `darkMode: 'class'` from preset (handled in CSS now)
- Remove `safelist` (TW4 dropped it — use `@source inline()` if needed)
- Keep all `theme.extend` mappings as-is (they work via `@config`)
- Update plugin to TW4 plugin API if needed

### Step 6: Class renames (automated via codemod + manual)

| v3 Class | v4 Class | Occurrences | Notes |
|----------|----------|-------------|-------|
| `outline-none` | `outline-hidden` | 100+ | Global find/replace |
| `rounded-sm` | `rounded-xs` | 2 | Only in `[&_mark]:rounded-sm` |
| `backdrop-blur-sm` | `backdrop-blur-xs` | 2 | image-preview, shared |
| `!important` prefix `!flex` | suffix `flex!` | Check | Scan for `!` prefix usage |

### Step 7: Update tailwind-merge

Already on 3.0.1 — bump to 3.5.0 for full TW4 class recognition.

### Step 8: Verification gates

1. `pnpm typecheck` — passes
2. `pnpm lint` — 0 errors
3. `pnpm test` — all pass
4. `pnpm build` — succeeds + SSR smoke test
5. `pnpm dev` — Storybook renders correctly
6. Visual spot-check: dark mode, focus rings, shadows, animations
