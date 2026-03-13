# Dark/Light Mode Token Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate the shilp-sutra token system from hex-based 50-950 scales to OKLCH 12-step functional palettes with systematic dark mode and accent swappability.

**Architecture:** Three-tier tokens (primitives → semantic → Tailwind) stay the same structurally. Internals change: primitives become OKLCH 12-step scales (1-12), semantic layer gains functional aliases with bg/fg pairing, backward-compat aliases preserve old names during migration. See `docs/plans/2026-03-13-dark-light-mode-token-redesign-design.md` for full design.

**Tech Stack:** CSS custom properties (OKLCH color space), TypeScript, Tailwind CSS 3.4 preset, Vitest

**Design reference:** `docs/previews/token-preview.html` — the approved visual target for light/dark mode

---

## Phase 1: OKLCH Scale Generator

Build the core utility that generates 12-step light+dark palettes from a seed color. This is the foundation everything else depends on.

### Task 1: Create the 12-step OKLCH scale generator

**Files:**
- Create: `packages/core/src/tokens/generate-scale.ts`
- Test: `packages/core/src/tokens/__tests__/generate-scale.test.ts`

**Context:** The playground already has an OKLCH generator at `apps/playground/src/lib/color-scale.ts` that produces 50-950 scales. We're building a new one that produces 12-step functional scales with separate light and dark curves. The generator lives in core (not playground) because it's now an official theming utility.

**Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest'
import { generateScale } from '../generate-scale'

describe('generateScale', () => {
  it('produces 12 light and 12 dark steps from a seed', () => {
    const result = generateScale({ hue: 360, peakChroma: 0.19 })
    expect(result.light).toHaveLength(12)
    expect(result.dark).toHaveLength(12)
  })

  it('each step is a valid oklch string', () => {
    const result = generateScale({ hue: 360, peakChroma: 0.19 })
    const oklchPattern = /^oklch\(\d+\.\d+ \d+\.\d+ \d+(\.\d+)?\)$/
    result.light.forEach((val) => expect(val).toMatch(oklchPattern))
    result.dark.forEach((val) => expect(val).toMatch(oklchPattern))
  })

  it('light step 9 has peak chroma', () => {
    const result = generateScale({ hue: 360, peakChroma: 0.19 })
    // Step 9 (index 8) should have the highest chroma
    const step9Chroma = parseFloat(result.light[8].match(/oklch\(\S+ (\S+)/)?.[1] ?? '0')
    expect(step9Chroma).toBeCloseTo(0.19, 1)
  })

  it('dark mode step 9 lightness is higher than light mode step 9', () => {
    const result = generateScale({ hue: 360, peakChroma: 0.19 })
    const lightL = parseFloat(result.light[8].match(/oklch\((\S+)/)?.[1] ?? '0')
    const darkL = parseFloat(result.dark[8].match(/oklch\((\S+)/)?.[1] ?? '0')
    expect(darkL).toBeGreaterThan(lightL)
  })

  it('light steps go from high L (step 1) to low L (step 12)', () => {
    const result = generateScale({ hue: 360, peakChroma: 0.19 })
    const lightnesses = result.light.map(v => parseFloat(v.match(/oklch\((\S+)/)?.[1] ?? '0'))
    expect(lightnesses[0]).toBeGreaterThan(lightnesses[11])
  })

  it('dark steps go from low L (step 1) to high L (step 12)', () => {
    const result = generateScale({ hue: 360, peakChroma: 0.19 })
    const lightnesses = result.dark.map(v => parseFloat(v.match(/oklch\((\S+)/)?.[1] ?? '0'))
    expect(lightnesses[11]).toBeGreaterThan(lightnesses[0])
  })

  it('generates neutral scale with low chroma', () => {
    const result = generateScale({ hue: 350, peakChroma: 0.01, isNeutral: true })
    const maxChroma = Math.max(
      ...result.light.map(v => parseFloat(v.match(/oklch\(\S+ (\S+)/)?.[1] ?? '0'))
    )
    expect(maxChroma).toBeLessThan(0.02)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd packages/core && pnpm vitest run src/tokens/__tests__/generate-scale.test.ts`
Expected: FAIL — module not found

**Step 3: Write the implementation**

```typescript
// packages/core/src/tokens/generate-scale.ts

export interface ScaleOptions {
  /** OKLCH hue angle (0-360) */
  hue: number
  /** Peak chroma at step 9 (0-0.37 typical) */
  peakChroma: number
  /** If true, keeps chroma very low across all steps (for neutral grays) */
  isNeutral?: boolean
}

export interface Scale {
  light: string[]  // 12 oklch() strings
  dark: string[]   // 12 oklch() strings
}

// Lightness curves — tuned to match approved preview (token-preview.html)
const LIGHT_L = [0.99, 0.97, 0.93, 0.89, 0.84, 0.78, 0.70, 0.62, 0.55, 0.50, 0.43, 0.32]
const DARK_L  = [0.14, 0.17, 0.21, 0.25, 0.30, 0.36, 0.44, 0.53, 0.63, 0.58, 0.76, 0.88]

// Chroma multipliers relative to peakChroma (step 9 = 1.0)
// Steps 1-2 are near-zero, ramps up to step 9, then decreases for text steps
const LIGHT_C_FACTORS = [0.03, 0.08, 0.18, 0.29, 0.42, 0.53, 0.74, 0.89, 1.0, 1.0, 0.74, 0.42]
const DARK_C_FACTORS  = [0.03, 0.08, 0.21, 0.32, 0.42, 0.53, 0.68, 0.86, 1.0, 1.0, 0.62, 0.26]

// Neutral scales use much lower chroma multipliers
const NEUTRAL_C_FACTORS = [0.30, 0.40, 0.50, 0.60, 0.60, 0.70, 0.80, 1.0, 1.0, 1.0, 0.80, 0.60]

function formatOklch(l: number, c: number, h: number): string {
  return `oklch(${l.toFixed(2)} ${c.toFixed(3)} ${h})`
}

export function generateScale(options: ScaleOptions): Scale {
  const { hue, peakChroma, isNeutral = false } = options
  const cFactors = isNeutral ? NEUTRAL_C_FACTORS : undefined

  const light = LIGHT_L.map((l, i) => {
    const cFactor = cFactors ? cFactors[i] : LIGHT_C_FACTORS[i]
    const c = peakChroma * cFactor
    return formatOklch(l, c, hue)
  })

  const dark = DARK_L.map((l, i) => {
    const cFactor = cFactors ? cFactors[i] : DARK_C_FACTORS[i]
    // Dark mode step 9 uses slightly boosted chroma (from preview tuning: 0.21 for pink 0.19 base)
    const darkPeakBoost = isNeutral ? 1.0 : 1.1
    const effectivePeak = i >= 7 && i <= 9 ? peakChroma * darkPeakBoost : peakChroma
    const c = effectivePeak * cFactor
    return formatOklch(l, c, hue)
  })

  return { light, dark }
}

/** Predefined Devalok brand palettes — the approved values from the preview */
export const BRAND_PALETTES = {
  pink:    { hue: 360, peakChroma: 0.19 },
  purple:  { hue: 300, peakChroma: 0.12 },
  neutral: { hue: 350, peakChroma: 0.01, isNeutral: true },
  red:     { hue: 25,  peakChroma: 0.18 },
  green:   { hue: 145, peakChroma: 0.14 },
  yellow:  { hue: 85,  peakChroma: 0.14 },
  blue:    { hue: 240, peakChroma: 0.12 },
  teal:    { hue: 175, peakChroma: 0.10 },
  amber:   { hue: 70,  peakChroma: 0.12 },
  slate:   { hue: 260, peakChroma: 0.04 },
  indigo:  { hue: 275, peakChroma: 0.14 },
  cyan:    { hue: 210, peakChroma: 0.10 },
  orange:  { hue: 50,  peakChroma: 0.14 },
  emerald: { hue: 160, peakChroma: 0.12 },
} as const satisfies Record<string, ScaleOptions>
```

**Step 4: Run tests to verify they pass**

Run: `cd packages/core && pnpm vitest run src/tokens/__tests__/generate-scale.test.ts`
Expected: PASS (all 7 tests)

**Step 5: Commit**

```bash
git add packages/core/src/tokens/generate-scale.ts packages/core/src/tokens/__tests__/generate-scale.test.ts
git commit -m "feat(tokens): add OKLCH 12-step scale generator"
```

---

## Phase 2: Rewrite Token CSS Files

Replace the hex primitives and semantic mappings with the new OKLCH 12-step system.

### Task 2: Rewrite primitives.css to OKLCH 12-step scales

**Files:**
- Modify: `packages/core/src/tokens/primitives.css` (complete rewrite)

**Context:** Currently contains 14 color scales in hex with 50-950 stops. Replace with 12 steps (1-12) in OKLCH format. Both `:root` (light) and `.dark` blocks. Use the exact values from `docs/previews/token-preview.html` for pink, purple, and neutral. Generate remaining scales using the same L/C curves.

**Step 1: Rewrite primitives.css**

Use the generator's `BRAND_PALETTES` + `generateScale()` to produce all 14 palettes. Write them into the file as:

```css
:root {
  /* ── Pink (Blooming Lotus) — H:360, seed: #d33163 ── */
  --pink-1:  oklch(0.99 0.005 360);
  --pink-2:  oklch(0.97 0.015 360);
  /* ... through --pink-12 */

  /* ── Purple — H:300 ── */
  /* ... */

  /* ── Neutral (warm) — H:350 ── */
  /* ... */

  /* ── Red, Green, Yellow, Blue, Teal, Amber, Slate, Indigo, Cyan, Orange, Emerald ── */
  /* ... all 14 scales */
}

.dark {
  /* All 14 scales with dark mode values */
  --pink-1: oklch(0.14 0.005 360);
  /* ... */
}
```

**Important:** Run `node -e "..."` using the generator to produce exact values. Hand-tune pink, purple, and neutral to match the approved preview. Other scales use the generator defaults.

**Step 2: Verify the file parses**

Run: `cd packages/core && pnpm build`
Expected: Build succeeds (CSS is valid)

**Step 3: Commit**

```bash
git add packages/core/src/tokens/primitives.css
git commit -m "feat(tokens): rewrite primitives.css to OKLCH 12-step scales"
```

### Task 3: Rewrite semantic.css with new token structure + backward-compat aliases

**Files:**
- Modify: `packages/core/src/tokens/semantic.css` (major rewrite)

**Context:** The semantic layer needs three things:
1. New tokens: `--color-accent-1..12`, `--color-secondary-1..12`, `--color-surface-1..4`, etc.
2. Status/category colors mapped to their 12-step scales
3. Backward-compat aliases: old names (e.g., `--color-interactive`) pointing to new tokens

**Step 1: Write the new semantic.css**

Structure of `:root` block:

```css
:root {
  color-scheme: light;

  /* ═══ NEW: Accent (swappable) ═══ */
  --color-accent-1: var(--pink-1);
  --color-accent-2: var(--pink-2);
  /* ... through --color-accent-12 */
  --color-accent-fg: var(--neutral-1); /* text ON solid accent */

  /* ═══ NEW: Secondary ═══ */
  --color-secondary-1: var(--purple-1);
  /* ... through --color-secondary-12 */
  --color-secondary-fg: var(--neutral-1);

  /* ═══ NEW: Surface ═══ */
  --color-surface-1: var(--neutral-1);
  --color-surface-2: var(--neutral-2);
  --color-surface-3: var(--neutral-3);
  --color-surface-4: var(--neutral-4);
  --color-surface-fg: var(--neutral-12);
  --color-surface-fg-muted: var(--neutral-11);
  --color-surface-fg-subtle: var(--neutral-8);
  --color-surface-border: var(--neutral-6);
  --color-surface-border-strong: var(--neutral-7);

  /* ═══ NEW: Status (12-step subsets) ═══ */
  --color-error-3: var(--red-3);
  --color-error-7: var(--red-7);
  --color-error-9: var(--red-9);
  --color-error-11: var(--red-11);
  --color-error-fg: var(--neutral-1);
  /* ... success, warning, info same pattern */

  /* ═══ NEW: Category (Sapta Varna) ═══ */
  /* Same 12-step subsets for teal, amber, slate, indigo, cyan, orange, emerald */

  /* ═══ COMPAT ALIASES (deprecated — will be removed in v1.0) ═══ */
  --color-interactive: var(--color-accent-9);
  --color-interactive-hover: var(--color-accent-10);
  --color-interactive-active: var(--color-accent-10); /* closest match */
  --color-interactive-selected: var(--color-accent-3);
  --color-interactive-disabled: var(--neutral-5);
  --color-interactive-subtle: var(--color-accent-2);
  --color-accent: var(--color-secondary-9);
  --color-accent-hover: var(--color-secondary-10);
  --color-accent-subtle: var(--color-secondary-2);
  --color-background: var(--color-surface-1);
  --color-layer-01: var(--color-surface-1);
  --color-layer-02: var(--color-surface-2);
  --color-layer-03: var(--color-surface-3);
  --color-layer-active: var(--color-surface-4);
  --color-layer-accent-subtle: var(--color-accent-2);
  --color-field: var(--color-surface-3);
  --color-field-hover: var(--color-surface-4);
  --color-field-02: var(--color-surface-2);
  --color-field-02-hover: var(--color-surface-3);
  --color-text-primary: var(--color-surface-fg);
  --color-text-secondary: var(--color-surface-fg-muted);
  --color-text-tertiary: var(--color-surface-fg-subtle);
  --color-text-placeholder: var(--neutral-8);
  --color-text-helper: var(--color-surface-fg-subtle);
  --color-text-disabled: var(--neutral-5);
  --color-text-error: var(--color-error-11);
  --color-text-success: var(--color-success-11);
  --color-text-warning: var(--color-warning-11);
  --color-text-link: var(--blue-9);
  --color-text-link-hover: var(--blue-10);
  --color-text-interactive: var(--color-accent-11);
  --color-text-on-color: var(--color-accent-fg);
  --color-text-on-color-dark: var(--color-surface-fg);
  --color-text-inverse: var(--neutral-1);
  --color-text-brand: var(--color-accent-11);
  --color-icon-primary: var(--neutral-11);
  --color-icon-secondary: var(--color-surface-fg-subtle);
  --color-icon-disabled: var(--neutral-5);
  --color-icon-on-color: var(--color-accent-fg);
  --color-icon-interactive: var(--color-accent-9);
  --color-border-subtle: var(--color-surface-border);
  --color-border-default: var(--color-surface-border-strong);
  --color-border-strong: var(--neutral-8);
  --color-border-interactive: var(--color-accent-7);
  --color-border-disabled: var(--neutral-5);
  --color-border-error: var(--color-error-7);
  --color-border-success: var(--color-success-7);
  --color-border-warning: var(--color-warning-7);
  --color-divider: var(--color-surface-border);
  --color-focus: var(--color-accent-9);
  --color-focus-inset: var(--color-surface-1);
  --color-overlay: oklch(0 0 0 / 0.50);
  /* ... remaining compat aliases for status, category, skeleton, chart, shadows, etc. */

  /* ═══ Tokens that DON'T change ═══ */
  /* Typography, spacing, radius, motion, z-index, breakpoints, layout — keep as-is */
}
```

The `.dark` block only needs to override `--color-accent-fg`, `--color-secondary-fg`, `--color-overlay`, and the shadow/glow tokens. All other dark mode values cascade automatically from the primitives.css `.dark` overrides.

**Step 2: Verify build**

Run: `cd packages/core && pnpm build`
Expected: Build succeeds

**Step 3: Verify no visual regressions in Storybook**

Run: `cd packages/core && pnpm storybook` (manual check)
Check: Button, Badge, Card, Input, Dialog, Toast components in both light/dark

**Step 4: Commit**

```bash
git add packages/core/src/tokens/semantic.css
git commit -m "feat(tokens): rewrite semantic.css with 12-step functional aliases and compat layer"
```

### Task 4: Update Tailwind preset with new token mappings

**Files:**
- Modify: `packages/core/src/tailwind/preset.ts` (lines 152-267, colors section)

**Context:** Add new token utilities alongside old ones. Old names stay as aliases so existing component code doesn't break.

**Step 1: Add new color utilities to the preset**

Add these to the `colors` object in preset.ts:

```typescript
// ═══ NEW: 12-step accent scale ═══
'accent-1': 'var(--color-accent-1)',
'accent-2': 'var(--color-accent-2)',
'accent-3': 'var(--color-accent-3)',
'accent-4': 'var(--color-accent-4)',
'accent-5': 'var(--color-accent-5)',
'accent-6': 'var(--color-accent-6)',
'accent-7': 'var(--color-accent-7)',
'accent-8': 'var(--color-accent-8)',
'accent-9': 'var(--color-accent-9)',
'accent-10': 'var(--color-accent-10)',
'accent-11': 'var(--color-accent-11)',
'accent-12': 'var(--color-accent-12)',
'accent-fg': 'var(--color-accent-fg)',
// same for secondary-1..12, secondary-fg

// ═══ NEW: Surface ═══
'surface-1': 'var(--color-surface-1)',
'surface-2': 'var(--color-surface-2)',
'surface-3': 'var(--color-surface-3)',
'surface-4': 'var(--color-surface-4)',
'surface-fg': 'var(--color-surface-fg)',
'surface-fg-muted': 'var(--color-surface-fg-muted)',
'surface-fg-subtle': 'var(--color-surface-fg-subtle)',
'surface-border': 'var(--color-surface-border)',

// ═══ NEW: Status (step subsets) ═══
'error-3': 'var(--color-error-3)',
'error-7': 'var(--color-error-7)',
'error-9': 'var(--color-error-9)',
'error-11': 'var(--color-error-11)',
'error-fg': 'var(--color-error-fg)',
// same for success, warning, info
```

Keep ALL existing color entries — they reference compat aliases in semantic.css and still work.

**Step 2: Verify build + typecheck**

Run: `cd packages/core && pnpm typecheck && pnpm build`
Expected: PASS

**Step 3: Commit**

```bash
git add packages/core/src/tailwind/preset.ts
git commit -m "feat(tokens): add 12-step scale utilities to Tailwind preset"
```

---

## Phase 3: Verify & Fix Components

Ensure existing components work with the new tokens via compat aliases, then fix any direct primitive references.

### Task 5: Run full test suite — identify breakage

**Files:** None modified — this is a verification step

**Step 1: Run typecheck**

Run: `pnpm typecheck`
Expected: PASS (no type changes)

**Step 2: Run full test suite**

Run: `pnpm test`
Expected: PASS (compat aliases should mean zero component breakage)

**Step 3: If any test fails, investigate**

Check if the failure is:
- A snapshot test that captured hex colors (needs snapshot update)
- A test that asserts specific CSS variable names
- A real color regression

Fix each failure before proceeding.

**Step 4: Commit any test fixes**

```bash
git commit -m "fix(tokens): update test snapshots for OKLCH migration"
```

### Task 6: Fix components with direct primitive references

**Files to check:**
- `packages/core/src/tokens/IconographyShowcase.tsx` (uses `--pink-500` etc.)
- `packages/core/src/tokens/FoundationsShowcase.tsx` (uses semantic tokens)
- Any component using hardcoded hex/rgba values

**Step 1: Search for old primitive references**

Run: `grep -rn "\-\-pink-\(50\|100\|200\|300\|400\|500\|600\|700\|800\|900\|950\)" packages/core/src/ --include="*.tsx" --include="*.ts"`

**Step 2: Update each file to use new step numbers or semantic tokens**

Map old → new:
- `--pink-50` → `--pink-1` or `--color-accent-1`
- `--pink-500` → `--pink-9` or `--color-accent-9`
- `--neutral-900` → `--neutral-12` or `--color-surface-fg`

Prefer semantic tokens over direct primitive references.

**Step 3: Search for hardcoded rgba/hex in components**

Run: `grep -rn "rgba\|#[0-9a-fA-F]\{6\}" packages/core/src/ui/ packages/core/src/composed/ packages/core/src/shell/ --include="*.tsx"`

Replace with appropriate semantic tokens.

**Step 4: Run tests**

Run: `pnpm test`
Expected: PASS

**Step 5: Commit**

```bash
git commit -m "refactor(tokens): migrate component primitive refs to semantic tokens"
```

### Task 7: Fix arbitrary Tailwind values

**Files to check (known instances):**
- `packages/core/src/ui/accordion.stories.tsx` (~8 instances)
- `packages/core/src/ui/data-table.tsx`
- `packages/core/src/tokens/IconographyShowcase.tsx`
- `packages/karm/src/tasks/task-constants.ts` (~4 instances)

**Step 1: Search for all arbitrary color values**

Run: `grep -rn "bg-\[var(--color-\|text-\[var(--color-\|border-\[var(--color-" packages/core/src/ packages/karm/src/ --include="*.tsx" --include="*.ts"`

**Step 2: Replace each with the Tailwind preset utility**

Examples:
- `bg-[var(--color-interactive)]` → `bg-interactive` (or `bg-accent-9`)
- `text-[var(--color-text-primary)]` → `text-text-primary` (or `text-surface-fg`)
- `bg-[var(--color-category-slate)]` → `bg-category-slate`

**Step 3: Run tests**

Run: `pnpm test`
Expected: PASS

**Step 4: Commit**

```bash
git commit -m "refactor(tokens): replace arbitrary Tailwind values with preset utilities"
```

---

## Phase 4: Update Playground

### Task 8: Update playground color scale generator to 12-step output

**Files:**
- Modify: `apps/playground/src/lib/color-scale.js` (or .ts)
- Modify: `apps/playground/src/lib/tokens.js` (or .ts)

**Context:** The playground generator currently outputs 50-950 scales. Update it to output 1-12 steps using the same curves as the core generator. Also update the token defaults and semantic group definitions.

**Step 1: Update color-scale.js**

Change `SHADE_STOPS` from `[50, 100, 200, ..., 950]` to `[1, 2, 3, ..., 12]`. Update the T (lightness) and CHROMA_FACTOR maps to match the core generator curves.

**Step 2: Update tokens.js**

Update `PRIMITIVE_DEFAULTS` to use new OKLCH values and 1-12 naming. Update `SEMANTIC_GROUPS` to reference the new step names.

**Step 3: Verify playground runs**

Run: `cd apps/playground && pnpm dev`
Expected: Playground loads, color editor works, scales display 12 steps

**Step 4: Commit**

```bash
git add apps/playground/src/lib/color-scale.js apps/playground/src/lib/tokens.js
git commit -m "feat(playground): update generator to 12-step OKLCH output"
```

---

## Phase 5: Build, Docs & QA

### Task 9: Full build verification

**Step 1: Clean build all packages**

Run: `pnpm build`
Expected: All 3 packages build successfully

**Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: PASS

**Step 3: Full test suite**

Run: `pnpm test`
Expected: All tests pass

**Step 4: Lint**

Run: `pnpm lint`
Expected: PASS (or only pre-existing warnings)

**Step 5: Commit any remaining fixes**

### Task 10: Visual QA in Storybook

**Step 1: Start Storybook**

Run: `cd packages/core && pnpm storybook`

**Step 2: Check critical components in both modes**

Manually verify (toggle dark mode for each):
- [ ] Button — all variants (default, secondary, outline, ghost, destructive)
- [ ] Badge — all variants including neutral "Draft" style
- [ ] Card — text hierarchy, border visibility
- [ ] Input — default, focus ring, error state, disabled
- [ ] Dialog/Modal — backdrop, content, footer actions
- [ ] Toast — success, error, warning, info
- [ ] Alert — all status variants
- [ ] Table/DataTable — hover, selected row, headers
- [ ] Sidebar — active item, hover, text hierarchy
- [ ] Tabs — active indicator, inactive text
- [ ] Select/Dropdown — menu items, active state
- [ ] Avatar — on colored backgrounds
- [ ] Charts — all 8 chart palette colors visible

**Step 3: Note any visual issues and fix**

Each fix gets its own commit with descriptive message.

### Task 11: Update documentation

**Files:**
- Modify: `packages/core/CHANGELOG.md`
- Modify: `packages/core/llms.txt`
- Modify: `packages/core/llms-full.txt`

**Step 1: Update CHANGELOG.md**

Add entry under new version section:

```markdown
## [Unreleased]

### Changed (BREAKING)
- **Token system migrated to OKLCH color space** — All primitive tokens now use `oklch()` values instead of hex. Step names changed from 50-950 to 1-12.
- **Dark mode rewritten** — Systematic lightness/chroma curves instead of hand-mapped hex. Surfaces lighten with elevation.
- **New semantic token structure** — `--color-accent-1..12`, `--color-surface-1..4`, bg/fg pairing convention.

### Added
- OKLCH 12-step scale generator (`generate-scale.ts`) — official theming utility
- Accent swappability — consumers override `--color-accent-*` variables to rebrand
- New Tailwind utilities: `accent-1..12`, `surface-1..4`, `surface-fg`, etc.

### Deprecated
- Old token names (`--color-interactive`, `--color-layer-01`, `--color-text-primary`, etc.) — kept as compat aliases, will be removed in v1.0
- 50-950 primitive scale numbers — replaced by 1-12 functional steps
```

**Step 2: Update llms.txt**

Add breaking changes section and document new token API.

**Step 3: Update llms-full.txt**

Update the token architecture section with new naming, OKLCH format, and consumer rebranding instructions.

**Step 4: Commit**

```bash
git add packages/core/CHANGELOG.md packages/core/llms.txt packages/core/llms-full.txt
git commit -m "docs: update CHANGELOG, llms.txt for OKLCH token migration"
```

### Task 12: Final review

**Step 1: Review full diff since start**

Run: `git diff HEAD~N` (where N = number of commits in this migration)

**Step 2: Verify design doc matches implementation**

Read `docs/plans/2026-03-13-dark-light-mode-token-redesign-design.md` and confirm:
- [ ] All 14 palettes generated
- [ ] 12 steps per palette
- [ ] OKLCH format
- [ ] Semantic aliases match design
- [ ] Compat aliases present
- [ ] Dark mode curves match preview

**Step 3: Version bump (do NOT publish yet)**

Update version in `packages/core/package.json` — this is a minor bump (0.10.0 or similar).

**Step 4: Final commit**

```bash
git commit -m "chore: version bump for OKLCH token migration"
```

---

## Dependency Graph

```
Task 1 (generator)
  ↓
Task 2 (primitives.css) ← depends on generator values
  ↓
Task 3 (semantic.css) ← depends on new primitive names
  ↓
Task 4 (Tailwind preset) ← depends on new semantic names
  ↓
Task 5 (test suite) ← verify nothing broke
  ↓
Task 6 (fix primitive refs) ← found by test failures or grep
Task 7 (fix arbitrary TW) ← independent of Task 6
  ↓
Task 8 (playground) ← can run in parallel with 6-7
  ↓
Task 9 (full build) ← all code changes done
  ↓
Task 10 (visual QA) ← needs working Storybook
  ↓
Task 11 (docs) ← after visual QA confirms correctness
  ↓
Task 12 (final review) ← publish gate
```

Tasks 6, 7, and 8 can run in parallel.
Tasks 1-5 are strictly sequential.
Tasks 9-12 are strictly sequential.
