# Sapta Varna — Categorical Color System

*Design Document — 2026-03-03*

## Problem

The design system has two brand colors (pink, purple) and four status colors (success/warning/error/info), but no dedicated **categorical color system**. Components needing decorative or categorical colors (board columns, timeline dots, priority badges, chart segments) misuse `info` tokens or reach for hardcoded hex values.

Additionally:
- `chart-7` and `chart-8` use hardcoded hex values not from any primitive
- `tag-*` tokens share primitives with status tokens, conflating two concerns
- Stories use dozens of hardcoded hex colors instead of design system tokens

## Solution

Introduce **7 new primitive color scales** (Sapta Varna / सप्त वर्ण) with full light/dark semantic tokens, and migrate all categorical color usage to the new system.

## The Seven Colors

| Token     | Cultural Name      | Meaning                                       |
|-----------|--------------------|-----------------------------------------------|
| `teal`    | Mayur (मयूर)       | Peacock — divine vehicle, iridescent plumage  |
| `amber`   | Kesar (केसर)       | Saffron — sacred, ceremonial, auspicious      |
| `slate`   | Megha (मेघ)        | Monsoon cloud — stillness before rain         |
| `indigo`  | Neel (नील)         | Sacred indigo dye — Krishna's color, depth    |
| `cyan`    | Samudra (समुद्र)    | The ocean — vast, primordial, infinite        |
| `orange`  | Agni (अग्नि)       | Sacred fire — transformation, eternal witness |
| `emerald` | Panna (पन्ना)      | Emerald gem — prosperity, renewal             |

## Layer 1 — Primitives (`primitives.css`)

7 new 11-step scales (50–950) added to `:root`. Values from the approved preview:

```css
/* ── Teal scale — Mayur (मयूर) ──────────────────────── */
--teal-50:  #f0fdfa;  --teal-100: #ccfbf1;  --teal-200: #99f6e4;
--teal-300: #5eead4;  --teal-400: #2dd4bf;  --teal-500: #14b8a6;
--teal-600: #0d9488;  --teal-700: #0f766e;  --teal-800: #115e59;
--teal-900: #134e4a;  --teal-950: #042f2e;
/* … same pattern for amber, slate, indigo, cyan, orange, emerald */
```

## Layer 2 — Semantic Tokens (`semantic.css`)

### New `--color-category-*` family

Each color gets 4 semantic roles (matching the status pattern):

**Light mode (`:root`)**:
```css
--color-category-{name}:          var(--{name}-600);
--color-category-{name}-surface:  var(--{name}-50);
--color-category-{name}-border:   var(--{name}-200);
--color-category-{name}-text:     var(--{name}-700);
```

**Dark mode (`.dark`)**:
```css
--color-category-{name}:          var(--{name}-500);
--color-category-{name}-surface:  var(--{name}-950);
--color-category-{name}-border:   var(--{name}-400);
--color-category-{name}-text:     var(--{name}-200);
```

### Tag token removal

The `--color-tag-*` intermediate token layer is **removed**. Tags/Badges communicate status and categories visually — they should reference the system's semantic tokens directly, not have their own parallel color layer.

**Badge component migration** — variant names become semantic:

| Old Variant  | New Variant   | Token Source                                  |
|-------------|---------------|-----------------------------------------------|
| `neutral`   | `neutral`     | Unchanged — `neutral-*` primitives            |
| `blue`      | `info`        | `--color-info-surface/text/border` (status)   |
| `green`     | `success`     | `--color-success-surface/text/border` (status)|
| `red`       | `error`       | `--color-error-surface/text/border` (status)  |
| `yellow`    | `warning`     | `--color-warning-surface/text/border` (status)|
| `magenta`   | `brand`       | Pink primitives (brand)                       |
| `purple`    | `accent`      | Purple primitives (brand)                     |
| *(new)*     | `teal`        | `--color-category-teal-surface/text/border`   |
| *(new)*     | `amber`       | `--color-category-amber-surface/text/border`  |
| *(new)*     | `slate`       | `--color-category-slate-surface/text/border`  |
| *(new)*     | `indigo`      | `--color-category-indigo-surface/text/border` |
| *(new)*     | `cyan`        | `--color-category-cyan-surface/text/border`   |
| *(new)*     | `orange`      | `--color-category-orange-surface/text/border` |
| *(new)*     | `emerald`     | `--color-category-emerald-surface/text/border`|

This gives Badge **14 variants**: 1 neutral + 4 status + 2 brand + 7 categorical.

**Removed from `semantic.css`**: All 21 `--color-tag-*` variables (7 colors x 3 roles).
**Removed from `preset.ts`**: All 21 `tag-*` Tailwind color entries.
**Removed from `FoundationsShowcase.tsx`**: tag token references.

### Chart palette fix

Replace hardcoded hex values with proper primitive references:

```css
/* Light */
--chart-7: var(--cyan-500);    /* was #06b6d4 */
--chart-8: var(--orange-500);  /* was #f97316 */

/* Dark */
--chart-7: var(--cyan-400);    /* was #22d3ee */
--chart-8: var(--orange-400);  /* was #fb923c */
```

## Layer 3 — Tailwind Preset (`preset.ts`)

**Add** category tokens (7 colors x 4 roles = 28 entries):
```typescript
'category-teal':         'var(--color-category-teal)',
'category-teal-surface': 'var(--color-category-teal-surface)',
'category-teal-border':  'var(--color-category-teal-border)',
'category-teal-text':    'var(--color-category-teal-text)',
// … same for all 7
```

**Remove** all 21 `tag-*` entries (`tag-neutral-bg`, `tag-blue-text`, etc.).

## Layer 4 — Component Migration

### Misused `info` replacements

| Component | Current | New |
|-----------|---------|-----|
| `board-column.tsx:41` | `border-l-info`, `border-l-info-border` | Use `category-*` tokens for the column accent cycle |
| `activity-tab.tsx:65,91,115,160` | `text-info-text`, `bg-info` | `text-category-slate-text`, `bg-category-slate` |
| `daily-brief.tsx:30` | `bg-info` in dot cycle | `bg-category-cyan` (replace full cycle with category tokens) |
| `priority-indicator.tsx:20-21` | `text-info-text`, `bg-info-surface` | `text-category-slate-text`, `bg-category-slate-surface` |

### What stays unchanged

- `info` tokens remain for **genuine informational status** (alert, banner, notification-center INFO tier)
- `info` semantic tokens continue referencing `--blue-*` primitives (status blue)

## Out of Scope

- **Story files** (`.stories.tsx`) — Hardcoded hex values in stories are Storybook demo scaffolding (layout wrappers, demo buttons), not design system output. Not part of this work.

## Color Theory Notes

These 7 complement pink (#D33163) without clashing:
- **Cool complements** (teal, cyan, emerald): visual tension with warm pink
- **Warm analogous** (amber, orange): cohesive warmth
- **Neutral anchor** (slate): goes with everything
- **Bridge** (indigo): connects purple accent to blue spectrum, distinctly deeper than status blue

## Cultural Heritage

All names rooted in Bharatiya and Sanatani culture:
- **Mayur** — The peacock, Saraswati's mount, India's national bird
- **Kesar** — Saffron, central to puja and ceremony
- **Megha** — Kalidasa's Meghaduta, the monsoon messenger
- **Neel** — The sacred dye, Krishna's complexion (Neelkanth)
- **Samudra** — The cosmic ocean of Samudra Manthan
- **Agni** — The fire god, witness to vows, first hymn of Rigveda
- **Panna** — The emerald of Mughal heritage, Panna National Park

Cultural names appear in documentation and design-philosophy.md only.
Code uses functional token names (`--teal-500`, `--color-category-teal`).
