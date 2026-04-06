# Phase 1: Tailwind Preset Audit

Audit of `packages/core/src/tailwind/preset.ts` against `packages/core/src/tokens/semantic.css`.

## Token-to-Utility Coverage

### Complete Mappings

The following token categories have **full** coverage in the preset:

| Category | Token Count | Utility Prefix | Status |
|---|---|---|---|
| Accent scale (1-12 + fg) | 13 | `accent-*` (colors) | COMPLETE |
| Secondary scale (1-12 + fg) | 13 | `secondary-*` (colors) | COMPLETE |
| Surface semantic | 16 | `surface-*` (colors) | COMPLETE |
| Error status (2-5,7,9-11 + fg) | 9 | `error-*` (colors) | COMPLETE |
| Success status | 9 | `success-*` (colors) | COMPLETE |
| Warning status | 9 | `warning-*` (colors) | COMPLETE |
| Info status | 9 | `info-*` (colors) | COMPLETE |
| Category colors (7 hues x 4 steps) | 28 | `category-*` (colors) | COMPLETE |
| Skeleton | 2 | `skeleton-*` (colors) | COMPLETE |
| Overlay / disabled | 2 | `overlay`, `disabled` (colors) | COMPLETE |
| Inset glow (3 levels) | 3 | `inset-glow-*` (colors) | COMPLETE |
| Surface overlay light/dark | 2 | `surface-overlay-*` (colors) | COMPLETE |
| Text shadow color | 1 | `text-shadow` (colors) | COMPLETE |
| Chart palette (1-8) | 8 | `chart-*` (colors) | COMPLETE |
| Font families (5) | 5 | `font-*` (fontFamily) | COMPLETE |
| Font weights (5) | 5 | `font-*` (fontWeight) | COMPLETE |
| Font sizes (11) | 11 | `text-ds-*` (fontSize) | COMPLETE |
| Line heights (6) | 6 | `leading-ds-*` (lineHeight) | COMPLETE |
| Letter spacing (6) | 6 | `tracking-ds-*` (letterSpacing) | COMPLETE |
| Spacing (16) | 16 | `*-ds-*` (spacing) | COMPLETE |
| Border radius (8) | 8 | `rounded-ds-*` (borderRadius) | COMPLETE |
| Border widths (3 + focus) | 4 | `border-ds-*` / `border-focus` | COMPLETE |
| Shadows (semantic: 12) | 12 | `shadow-*` (boxShadow) | COMPLETE |
| Durations (7) | 7 | `duration-*` (transitionDuration) | COMPLETE |
| Easings (8) | 8 | `ease-*` (transitionTimingFunction) | COMPLETE |
| Z-index (9) | 9 | `z-*` (zIndex) | COMPLETE |
| Component sizes (7 + 4 icon) | 11 | `w-ds-*` / `h-ds-*` / `w-ico-*` / `h-ico-*` | COMPLETE |
| Max widths (layout) | 2 | `max-w-layout*` (maxWidth) | COMPLETE |
| Action opacities (5) | 5 | `opacity-action-*` | COMPLETE |
| Gradients (2) | 2 | `bg-gradient-brand*` (backgroundImage) | COMPLETE |

### Missing Utilities (GAPS)

| Token | Expected Utility | Status | Severity |
|---|---|---|---|
| `--color-backdrop` | `bg-backdrop`, `text-backdrop` etc. | MAPPED as `backdrop` color | OK |
| `--shadow-color` | No direct utility | Not needed -- internal primitive | INFO |
| `--shadow-strength` | No direct utility | Not needed -- internal primitive | INFO |
| `--shadow-transition` | No direct utility (shorthand) | GAP -- but niche, transition shorthand isn't a standard TW utility | LOW |
| `--border-focus-offset` | `outline-offset-focus` or similar | **GAP** -- no Tailwind mapping | MEDIUM |
| `--gradient-brand-light` | Mapped via `bg-gradient-brand` | OK |
| `--gradient-brand-dark` | Mapped via `bg-gradient-brand-dark` | OK |
| `--breakpoint-sm/md/lg/xl/2xl` | `screens.sm/md/lg/xl/2xl` | Hardcoded (see below) | INFO |
| `--color-surface-0` (primitives.css) | Referenced by `--color-surface-sunken` | Indirectly mapped via `surface-sunken` color | OK |
| `--shadow-xs` through `--shadow-lg` | No direct utility | Not needed -- internal primitives mapped through semantic aliases (`raised`, `floating`, etc.) | INFO |
| `fontVariantNumeric.tabular` | Custom extend key | **ISSUE** -- `fontVariantNumeric` is not a valid Tailwind theme key; this does nothing | MEDIUM |

### Phantom Utilities (no backing token)

| Utility | Defined In | Backing Token | Status |
|---|---|---|---|
| `rounded-ds-none: '0'` | borderRadius | `--radius-none: 0` | OK (literal, matches token) |
| `screens.sm-2xl` | screens | Hardcoded values | OK -- CSS custom properties cannot be used in `@media` queries. Values are documented as mirroring `--breakpoint-*` tokens. **Risk**: if tokens change, screens must be updated manually. |

No true phantom utilities found. All utilities map to documented tokens.

### Partial Coverage Notes

Colors defined in `extend.colors` are automatically available for `bg-*`, `text-*`, `border-*`, `ring-*`, `outline-*`, `fill-*`, `stroke-*`, `shadow-*`, `accent-*`, `caret-*`, `decoration-*`, `divide-*`, `placeholder-*` -- this is how Tailwind works. So a single color entry provides full bg/text/border coverage. **No partial coverage issues.**

## Hardcoded Values in Components

### Hardcoded Hex Colors (non-story, non-test, non-comment source files)

| File | Line(s) | Value | Assessment |
|---|---|---|---|
| `ui/color-input.tsx` | 57-66 | `#EF4444`, `#F59E0B`, `#10B981`, etc. | **ACCEPTABLE** -- Default preset colors for a color picker component. These are user-facing color choices, not theming values. |
| `ui/color-input.tsx` | 166 | `'#000000'` (default value) | **ACCEPTABLE** -- Default prop value for a color picker. |
| `ui/color-input.tsx` | 306 | `rgba(0,0,0,0.8)`, `rgba(255,255,255,0.95)` | **MINOR** -- Dynamic text color for swatch overlay based on lightness calculation. Inline style for computed values. |
| `ui/color-input.tsx` | 308 | `rgba(0,0,0,0.12)` in whileHover boxShadow | **MINOR** -- Framer Motion animation value. Could use `var(--shadow-raised)` instead. |
| `ui/badge.tsx` | 162 | `#8b5cf6` | **OK** -- In a JSDoc comment/example only. |
| `ui/color-swatch.tsx` | 22, 24 | `#FF5733`, `rgba(...)` | **OK** -- JSDoc examples. |
| `ui/devalok-grain.tsx` | 115, 118 | `oklch(0 0 0 / ...)`, `oklch(1 0 0 / ...)` | **ACCEPTABLE** -- Procedural grain overlay effect generating dynamic gradients. Not themeable colors. |
| `ai/devadoot-icon.tsx` | 33-38, 90 | `#D33163`, `#E8457A`, `#9B5DE5`, `#C850C0`, `#FF6B9D`, `#E5383B`, `#FF6B6B` | **ISSUE** -- Brand colors hardcoded as constants in SVG icon component. Should reference accent tokens or CSS vars for rebrandability. |
| `ai/command-bar.tsx` | 78, 98 | `#D33163`, `#9B5DE5`, `#C850C0` | **ISSUE** -- Hardcoded brand colors in gradient CSS. Should use `var(--color-accent-9)` and `var(--color-secondary-9)` or similar tokens. |

### Hardcoded rgba() in Tailwind Arbitrary Values

| File | Line(s) | Pattern | Assessment |
|---|---|---|---|
| `ai/command-bar.tsx` | 580, 845, 848, 858, 866 | `shadow-[inset_0_-1px_0_rgba(0,0,0,0.1)]` | **ISSUE** -- Hardcoded kbd inset shadow. Should be a design token (`--shadow-kbd` or similar). Used 5x in command-bar, repeated in command-palette. |
| `composed/command-palette.tsx` | 365, 461, 504, 507, 512, 516 | `shadow-[inset_0_-1px_0_rgba(0,0,0,0.1)]` | **ISSUE** -- Same kbd inset shadow duplicated 6x. Dark mode will look wrong (too subtle). |

### Hardcoded Pixel Values in Tailwind Arbitrary Classes

These are in source components (not stories/tests):

**Acceptable -- cosmetic one-offs with no token equivalent:**

| File | Value | Reason OK |
|---|---|---|
| `ui/separator.tsx:40` | `h-[1px]`, `w-[1px]` | 1px separator -- `border-ds-sm` wouldn't work here (it's a background, not border). |
| `ui/button.tsx:50-51` | `py-[3px]`, `py-[5px]` | Compact button sizes -- fractional spacing between tokens. |
| `ui/avatar.tsx:62,64,225,234` | `h-[8px]`, `w-[8px]`, `h-[12px]`, `w-[12px]`, `min-w-[16px]`, `text-[9px]`, `text-[10px]`, `leading-[16px]` | Status dot, badge count -- sub-token sizes. |
| `ui/checkbox.tsx:49-50` | `h-[14px]`, `w-[14px]`, `h-[18px]`, `w-[18px]` | Checkbox sizing -- between token sizes. |
| `ui/badge.tsx:40` | `text-[10px]` | XS badge -- below smallest font token. |
| `ui/badge-indicator.tsx:67` | `min-w-[18px]`, `h-[18px]`, `text-[11px]` | Badge indicator sizing. |
| `ui/input.tsx:36-39` | `w-[26px]`, `w-[30px]`, `w-[38px]`, `w-[46px]` | Input icon area widths per size. |
| `ui/input-otp.tsx:54` | `h-[16px]` | OTP caret height. |
| `ui/card.tsx:115-118` | `w-[2px]`..`w-[6px]`, `h-[2px]`..`h-[6px]` | Card accent line widths. |
| `ui/combobox.tsx:302` | `py-[1px]` | Multi-select tag pill -- sub-token size. |
| `ui/segmented-control.tsx:26` | `h-[56px]` | Large segmented control height. |
| `ui/navigation-menu.tsx:60` | `top-[1px]` | Chevron visual alignment. |
| `ui/color-input.tsx:352` | `w-[272px]` | Color picker popover width. |
| Various `ui/color-input.tsx` | `text-[10px]` | Small labels in color picker. |
| Various `ui/chat/message.tsx` | `text-[13px]`, `text-[11px]` | Chat message typography -- between tokens. |
| `composed/activity-feed.tsx` | `left-[3px]`, `text-[9px]` | Timeline line position, small avatar text. |
| `composed/command-palette.tsx` | `top-[20%]`, `max-w-[560px]`, `min-w-[20px]`, `h-[20px]` | Command palette positioning and kbd sizing. |
| `composed/schedule-view.tsx` | `w-[60px]`, `min-w-[80px]`, `h-[2px]`, `h-[10px]`, `w-[10px]`, etc. | Schedule layout -- bespoke grid dimensions. |
| `composed/page-skeletons.tsx` | Multiple `h-[12px]`, `w-[128px]` etc. | Skeleton placeholders -- mimicking content dimensions. |
| `composed/loading-skeleton.tsx` | Similar skeleton dimensions | Same rationale. |
| `composed/rich-text-editor.tsx` | `min-h-[120px]`, `h-[16px]`, `w-[240px]`, etc. | Editor layout dimensions. |
| `composed/empty-state.tsx:88` | `max-w-[280px]` | Empty state text width cap. |
| `shell/top-bar.tsx` | `w-[200px]`, `h-[18px]`, `min-w-[18px]`, `h-[8px]`, `w-[8px]` | Popover width, notification badge sizes. |
| `shell/bottom-navbar.tsx` | `max-w-[70px]`, `h-[3px]`, `bottom-[72px]` | Navbar item widths, active indicator. |
| `shell/notification-center.tsx` | `w-[380px]`, `max-h-[420px]`, `h-[8px]`, `w-[8px]` | Notification popover dimensions. |
| `ai/command-bar.tsx` | `top-[20%]`, `max-w-[560px]`, `h-[20px]` | Command bar positioning. |

**Observation**: Most hardcoded pixel values are for sub-token sizes (below 16px) or bespoke layout dimensions where design tokens don't make sense. The spacing token scale starts at 2px (`--spacing-01`) but doesn't cover every possible value. This is **normal and acceptable** for a design system.

### `bg-surface-1` / `bg-surface-2` Usage in Stories

Stories reference `bg-surface-1` and `bg-surface-2` classes (e.g., `ai/command-bar.stories.tsx`, `ui/chat/chat.stories.tsx`). These classes are **NOT defined** in the preset. They likely resolve to nothing (transparent) or are dead classes. The correct tokens are `bg-surface-base` (surface-1 concept) and `bg-surface-raised` (surface-2 concept). This is a **stories-only issue**, not a component bug.

## CJS/ESM Dual Export

### Conversion Method

`packages/core/scripts/build-tailwind-cjs.mjs` uses **esbuild** for ESM-to-CJS conversion:

1. `esbuild.buildSync()` converts `dist/tailwind/preset.js` (ESM) to `dist/tailwind/index.cjs` (CJS)
2. `bundle: false` -- does not resolve imports, keeps externals as-is
3. Post-processing appends `module.exports = module.exports.default;` to flatten the esbuild wrapper

### Correctness

The esbuild approach is **robust**. Previous versions used regex-based conversion which missed edge cases. esbuild handles:
- Named exports alongside default exports
- Re-exports
- Dynamic imports
- All ESM syntax patterns

The `module.exports.default = module.exports;` line at the end preserves compatibility for both `require()` (gets the preset directly) and `require().default` (also works).

**One minor concern**: The CJS `require` path for `./tailwind/preset` also points to `./dist/tailwind/index.cjs` (same file as `./tailwind`). This is fine but means the `./tailwind/preset` export is an alias.

### Export Conditions

```json
"./tailwind": {
  "require": "./dist/tailwind/index.cjs",   // CJS
  "import": "./dist/tailwind/index.js",      // ESM  
  "default": "./dist/tailwind/index.js",     // Fallback
  "types": "./dist/tailwind/index.d.ts"      // TypeScript
}
```

| Condition | Present | Path |
|---|---|---|
| `require` (CJS) | YES | `./dist/tailwind/index.cjs` |
| `import` (ESM) | YES | `./dist/tailwind/index.js` |
| `default` (fallback) | YES | `./dist/tailwind/index.js` |
| `types` (TypeScript) | YES | `./dist/tailwind/index.d.ts` |

**All four conditions are present. No issues.**

## Plugin Utilities

The preset defines one plugin via `plugin(({ addBase, addUtilities }) => { ... })`:

### `addBase` -- `@property --border-angle`
Registers the CSS `@property` for the processing ants animation. This is a CSS Houdini registration needed for the `--border-angle` custom property animation. **Correct and necessary.**

### `addUtilities` -- Focus ring utilities

Three utilities defined:

| Utility Class | Behavior | Token Usage |
|---|---|---|
| `.focus-ring` | 2px offset ring on `:focus-visible` | `var(--color-surface-base)` (inner), `var(--color-accent-9)` (outer) |
| `.focus-ring-inset` | 2px inset ring on `:focus-visible` | `var(--color-accent-9)` |
| `.focus-ring-sm` | 2px direct ring on `:focus-visible` | `var(--color-accent-7)` |

**Assessment**: All three use CSS custom properties correctly. The `2px` and `4px` values in the box-shadow are hardcoded but correspond to `--border-focus-width` and `--border-focus-offset` tokens. These **could** reference the tokens instead:

```typescript
// Current
'box-shadow': '0 0 0 2px var(--color-surface-base), 0 0 0 4px var(--color-accent-9)'
// Could be
'box-shadow': '0 0 0 var(--border-focus-width) var(--color-surface-base), 0 0 0 calc(var(--border-focus-width) + var(--border-focus-offset)) var(--color-accent-9)'
```

This is a **minor** hardcoded value leak -- the focus ring widths should use the `--border-focus-width` and `--border-focus-offset` tokens for consistency.

## Issues Summary

### Priority 1 (Should Fix)

| # | Issue | Location | Impact |
|---|---|---|---|
| 1 | `fontVariantNumeric` is not a valid Tailwind theme extend key -- does nothing | `preset.ts:397-399` | Dead config. The `tabular-nums` variant is not actually available as a utility class. Tailwind has no `fontVariantNumeric` theme key. The correct approach is to add it via the plugin's `addUtilities`. |
| 2 | Hardcoded `rgba(0,0,0,0.1)` in kbd shadow, duplicated 11x | `command-bar.tsx`, `command-palette.tsx` | Doesn't adapt to dark mode. Should be a shadow token. |
| 3 | Hardcoded brand hex colors in `devadoot-icon.tsx` and `command-bar.tsx` | `ai/devadoot-icon.tsx:33-38`, `ai/command-bar.tsx:78,98` | Not rebrandable. Should use CSS custom properties. |

### Priority 2 (Nice to Have)

| # | Issue | Location | Impact |
|---|---|---|---|
| 4 | `--border-focus-offset` has no Tailwind utility | `preset.ts` | Minor -- only used in the focus-ring plugin, but plugin hardcodes `2px`/`4px` instead of referencing the token. |
| 5 | Focus ring plugin hardcodes `2px`/`4px` instead of using `--border-focus-width`/`--border-focus-offset` | `preset.ts:413-416` | Minor inconsistency. If someone changes the token, the plugin won't follow. |
| 6 | `bg-surface-1`/`bg-surface-2` used in stories but not defined | Various `.stories.tsx` | Stories render incorrectly but not a component issue. |

### Priority 3 (Informational)

| # | Issue | Location | Impact |
|---|---|---|---|
| 7 | Breakpoint `screens` values hardcoded (not tokens) | `preset.ts:17-22` | Unavoidable -- CSS custom properties can't be used in `@media`. Well-documented in code comment. |
| 8 | Shadow primitives (`--shadow-xs/sm/md/lg`) have no direct utility | `preset.ts` | By design -- they're internal, mapped through semantic aliases. |
| 9 | `--shadow-transition` has no utility | `semantic.css:293` | Niche -- transition shorthands aren't standard TW utilities. |
| 10 | Hardcoded pixel values throughout components | Various | Normal for sub-token sizes. The token scale can't cover every possible dimension. |

## Recommendations

1. **Fix `fontVariantNumeric` immediately** -- either move it to `addUtilities` in the plugin, or remove it. Currently it's dead config that gives a false sense of coverage.

2. **Create a `--shadow-kbd` token** in `semantic.css` and use it in command-bar and command-palette to eliminate the 11x duplicated `rgba(0,0,0,0.1)` inset shadow. This will also fix dark mode behavior.

3. **Refactor `devadoot-icon.tsx`** to use CSS custom properties for brand colors (`var(--color-accent-9)` etc.) so the AI icon adapts to rebranding.

4. **Wire focus-ring plugin to tokens** -- replace hardcoded `2px`/`4px` with `var(--border-focus-width)` and `calc(var(--border-focus-width) + var(--border-focus-offset))`.

5. **Fix story classes** -- replace `bg-surface-1`/`bg-surface-2` with `bg-surface-base`/`bg-surface-raised` in stories.
