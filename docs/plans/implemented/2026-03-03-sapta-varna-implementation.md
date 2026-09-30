# Sapta Varna — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 7 categorical color primitives (teal, amber, slate, indigo, cyan, orange, emerald) with semantic tokens, remove the `tag-*` intermediate layer, migrate Badge to semantic variants, and fix all misused `info` token usage.

**Architecture:** Primitives (raw scales) → Semantic tokens (light/dark `--color-category-*`) → Tailwind preset (utility classes) → Component migration. Tag tokens are removed; Badge gets semantic variant names (success, warning, error, info, brand, accent) + 7 categorical variants.

**Tech Stack:** CSS custom properties, Tailwind CSS preset, CVA (class-variance-authority), React/TypeScript

---

### Task 1: Add 7 primitive color scales

**Files:**
- Modify: `src/tokens/primitives.css:86-98` (after Blue scale, before closing `}`)

**Step 1: Add the 7 new scales to primitives.css**

Insert after the Blue scale comment block (after line 97 `--blue-950: #02131f;`), before the closing `}` on line 98:

```css
  /* ── Teal scale — Mayur (मयूर) ────────────────────────────── */
  --teal-50:  #f0fdfa;
  --teal-100: #ccfbf1;
  --teal-200: #99f6e4;
  --teal-300: #5eead4;
  --teal-400: #2dd4bf;
  --teal-500: #14b8a6;
  --teal-600: #0d9488;
  --teal-700: #0f766e;
  --teal-800: #115e59;
  --teal-900: #134e4a;
  --teal-950: #042f2e;

  /* ── Amber scale — Kesar (केसर) ───────────────────────────── */
  --amber-50:  #fffbeb;
  --amber-100: #fef3c7;
  --amber-200: #fde68a;
  --amber-300: #fcd34d;
  --amber-400: #fbbf24;
  --amber-500: #f59e0b;
  --amber-600: #d97706;
  --amber-700: #b45309;
  --amber-800: #92400e;
  --amber-900: #78350f;
  --amber-950: #451a03;

  /* ── Slate scale — Megha (मेघ) ────────────────────────────── */
  --slate-50:  #f8fafc;
  --slate-100: #f1f5f9;
  --slate-200: #e2e8f0;
  --slate-300: #cbd5e1;
  --slate-400: #94a3b8;
  --slate-500: #64748b;
  --slate-600: #475569;
  --slate-700: #334155;
  --slate-800: #1e293b;
  --slate-900: #0f172a;
  --slate-950: #020617;

  /* ── Indigo scale — Neel (नील) ────────────────────────────── */
  --indigo-50:  #eef2ff;
  --indigo-100: #e0e7ff;
  --indigo-200: #c7d2fe;
  --indigo-300: #a5b4fc;
  --indigo-400: #818cf8;
  --indigo-500: #6366f1;
  --indigo-600: #4f46e5;
  --indigo-700: #4338ca;
  --indigo-800: #3730a3;
  --indigo-900: #312e81;
  --indigo-950: #1e1b4b;

  /* ── Cyan scale — Samudra (समुद्र) ─────────────────────────── */
  --cyan-50:  #ecfeff;
  --cyan-100: #cffafe;
  --cyan-200: #a5f3fc;
  --cyan-300: #67e8f9;
  --cyan-400: #22d3ee;
  --cyan-500: #06b6d4;
  --cyan-600: #0891b2;
  --cyan-700: #0e7490;
  --cyan-800: #155e75;
  --cyan-900: #164e63;
  --cyan-950: #083344;

  /* ── Orange scale — Agni (अग्नि) ──────────────────────────── */
  --orange-50:  #fff7ed;
  --orange-100: #ffedd5;
  --orange-200: #fed7aa;
  --orange-300: #fdba74;
  --orange-400: #fb923c;
  --orange-500: #f97316;
  --orange-600: #ea580c;
  --orange-700: #c2410c;
  --orange-800: #9a3412;
  --orange-900: #7c2d12;
  --orange-950: #431407;

  /* ── Emerald scale — Panna (पन्ना) ─────────────────────────── */
  --emerald-50:  #ecfdf5;
  --emerald-100: #d1fae5;
  --emerald-200: #a7f3d0;
  --emerald-300: #6ee7b7;
  --emerald-400: #34d399;
  --emerald-500: #10b981;
  --emerald-600: #059669;
  --emerald-700: #047857;
  --emerald-800: #065f46;
  --emerald-900: #064e3b;
  --emerald-950: #022c22;
```

**Step 2: Run typecheck to verify no syntax issues**

Run: `pnpm tsc --noEmit`
Expected: PASS (CSS changes don't affect TS)

**Step 3: Commit**

```bash
git add src/tokens/primitives.css
git commit -m "feat(tokens): add 7 Sapta Varna categorical color primitives

Add teal (Mayur), amber (Kesar), slate (Megha), indigo (Neel),
cyan (Samudra), orange (Agni), emerald (Panna) scales (50–950)."
```

---

### Task 2: Add category semantic tokens (light + dark)

**Files:**
- Modify: `src/tokens/semantic.css`

**Step 1: Add light-mode category tokens**

In the `:root` block, after the `--color-error-text` line (line 122) and before `--color-skeleton-base` (line 123), add:

```css
  /* ── Category Colors (Sapta Varna) ───────────────────── */
  --color-category-teal:            var(--teal-600);
  --color-category-teal-surface:    var(--teal-50);
  --color-category-teal-border:     var(--teal-200);
  --color-category-teal-text:       var(--teal-700);
  --color-category-amber:           var(--amber-600);
  --color-category-amber-surface:   var(--amber-50);
  --color-category-amber-border:    var(--amber-200);
  --color-category-amber-text:      var(--amber-700);
  --color-category-slate:           var(--slate-600);
  --color-category-slate-surface:   var(--slate-50);
  --color-category-slate-border:    var(--slate-200);
  --color-category-slate-text:      var(--slate-700);
  --color-category-indigo:          var(--indigo-600);
  --color-category-indigo-surface:  var(--indigo-50);
  --color-category-indigo-border:   var(--indigo-200);
  --color-category-indigo-text:     var(--indigo-700);
  --color-category-cyan:            var(--cyan-600);
  --color-category-cyan-surface:    var(--cyan-50);
  --color-category-cyan-border:     var(--cyan-200);
  --color-category-cyan-text:       var(--cyan-700);
  --color-category-orange:          var(--orange-600);
  --color-category-orange-surface:  var(--orange-50);
  --color-category-orange-border:   var(--orange-200);
  --color-category-orange-text:     var(--orange-700);
  --color-category-emerald:         var(--emerald-600);
  --color-category-emerald-surface: var(--emerald-50);
  --color-category-emerald-border:  var(--emerald-200);
  --color-category-emerald-text:    var(--emerald-700);
```

**Step 2: Add dark-mode category tokens**

In the `.dark` block, after `--color-info-text` (line 330) and before `/* Skeleton */` (line 331), add:

```css
  /* ── Category Colors (Sapta Varna) ───────────────────── */
  --color-category-teal:            var(--teal-500);
  --color-category-teal-surface:    var(--teal-950);
  --color-category-teal-border:     var(--teal-400);
  --color-category-teal-text:       var(--teal-200);
  --color-category-amber:           var(--amber-500);
  --color-category-amber-surface:   var(--amber-950);
  --color-category-amber-border:    var(--amber-400);
  --color-category-amber-text:      var(--amber-200);
  --color-category-slate:           var(--slate-500);
  --color-category-slate-surface:   var(--slate-950);
  --color-category-slate-border:    var(--slate-400);
  --color-category-slate-text:      var(--slate-200);
  --color-category-indigo:          var(--indigo-500);
  --color-category-indigo-surface:  var(--indigo-950);
  --color-category-indigo-border:   var(--indigo-400);
  --color-category-indigo-text:     var(--indigo-200);
  --color-category-cyan:            var(--cyan-500);
  --color-category-cyan-surface:    var(--cyan-950);
  --color-category-cyan-border:     var(--cyan-400);
  --color-category-cyan-text:       var(--cyan-200);
  --color-category-orange:          var(--orange-500);
  --color-category-orange-surface:  var(--orange-950);
  --color-category-orange-border:   var(--orange-400);
  --color-category-orange-text:     var(--orange-200);
  --color-category-emerald:         var(--emerald-500);
  --color-category-emerald-surface: var(--emerald-950);
  --color-category-emerald-border:  var(--emerald-400);
  --color-category-emerald-text:    var(--emerald-200);
```

**Step 3: Remove tag-* tokens from light mode**

Delete lines 125–145 in `:root` (all `--color-tag-*` variables — 21 lines covering neutral, blue, green, red, yellow, magenta, purple bg/text/border).

**Step 4: Remove tag-* tokens from dark mode**

Delete lines 334–355 in `.dark` (all `--color-tag-*` variables — 21 lines).

**Step 5: Fix chart-7 and chart-8 hardcoded hex**

In `:root`, replace:
```css
--chart-7: #06b6d4;
--chart-8: #f97316;
```
with:
```css
--chart-7: var(--cyan-500);
--chart-8: var(--orange-500);
```

In `.dark`, replace:
```css
--chart-7: #22d3ee;
--chart-8: #fb923c;
```
with:
```css
--chart-7: var(--cyan-400);
--chart-8: var(--orange-400);
```

**Step 6: Commit**

```bash
git add src/tokens/semantic.css
git commit -m "feat(tokens): add category semantic tokens, remove tag-* layer, fix chart hex

Add --color-category-{teal,amber,slate,indigo,cyan,orange,emerald}
with surface/border/text roles for light and dark modes.
Remove 42 --color-tag-* intermediate tokens.
Fix chart-7/chart-8 to reference cyan/orange primitives."
```

---

### Task 3: Update Tailwind preset

**Files:**
- Modify: `src/tailwind/preset.ts:108-204` (colors object)

**Step 1: Remove all tag-* entries**

Remove these 21 entries from the `colors` object (lines 162–195):
```
'tag-neutral-bg', 'tag-neutral-text', 'tag-blue-bg', 'tag-blue-text',
'tag-green-bg', 'tag-green-text', 'tag-red-bg', 'tag-red-text',
'tag-yellow-bg', 'tag-yellow-text', 'tag-magenta-bg', 'tag-magenta-text',
'tag-purple-bg', 'tag-purple-text', 'tag-neutral-border', 'tag-blue-border',
'tag-green-border', 'tag-red-border', 'tag-yellow-border',
'tag-magenta-border', 'tag-purple-border'
```

**Step 2: Add category-* entries**

Add 28 new entries to the `colors` object:

```typescript
'category-teal':            'var(--color-category-teal)',
'category-teal-surface':    'var(--color-category-teal-surface)',
'category-teal-border':     'var(--color-category-teal-border)',
'category-teal-text':       'var(--color-category-teal-text)',
'category-amber':           'var(--color-category-amber)',
'category-amber-surface':   'var(--color-category-amber-surface)',
'category-amber-border':    'var(--color-category-amber-border)',
'category-amber-text':      'var(--color-category-amber-text)',
'category-slate':           'var(--color-category-slate)',
'category-slate-surface':   'var(--color-category-slate-surface)',
'category-slate-border':    'var(--color-category-slate-border)',
'category-slate-text':      'var(--color-category-slate-text)',
'category-indigo':          'var(--color-category-indigo)',
'category-indigo-surface':  'var(--color-category-indigo-surface)',
'category-indigo-border':   'var(--color-category-indigo-border)',
'category-indigo-text':     'var(--color-category-indigo-text)',
'category-cyan':            'var(--color-category-cyan)',
'category-cyan-surface':    'var(--color-category-cyan-surface)',
'category-cyan-border':     'var(--color-category-cyan-border)',
'category-cyan-text':       'var(--color-category-cyan-text)',
'category-orange':          'var(--color-category-orange)',
'category-orange-surface':  'var(--color-category-orange-surface)',
'category-orange-border':   'var(--color-category-orange-border)',
'category-orange-text':     'var(--color-category-orange-text)',
'category-emerald':         'var(--color-category-emerald)',
'category-emerald-surface': 'var(--color-category-emerald-surface)',
'category-emerald-border':  'var(--color-category-emerald-border)',
'category-emerald-text':    'var(--color-category-emerald-text)',
```

**Step 3: Commit**

```bash
git add src/tailwind/preset.ts
git commit -m "feat(preset): expose category-* tokens, remove tag-* entries"
```

---

### Task 4: Migrate Badge component to semantic variants

**Files:**
- Modify: `src/ui/badge.tsx:10-24` (variant definitions)
- Modify: `src/ui/badge.test.tsx:13` (variant name in test)

**Step 1: Replace Badge variant definitions**

Replace the entire `variant` object in `badgeVariants` (lines 10–24) with:

```typescript
      variant: {
        neutral:
          'bg-field text-text-secondary border-border',
        info:
          'bg-info-surface text-info-text border-info-border',
        success:
          'bg-success-surface text-success-text border-success-border',
        error:
          'bg-error-surface text-error-text border-error-border',
        warning:
          'bg-warning-surface text-warning-text border-warning-border',
        brand:
          'bg-interactive-subtle text-text-brand border-[var(--pink-200)]',
        accent:
          'bg-accent-subtle text-[var(--color-accent)] border-[var(--purple-200)]',
        teal:
          'bg-category-teal-surface text-category-teal-text border-category-teal-border',
        amber:
          'bg-category-amber-surface text-category-amber-text border-category-amber-border',
        slate:
          'bg-category-slate-surface text-category-slate-text border-category-slate-border',
        indigo:
          'bg-category-indigo-surface text-category-indigo-text border-category-indigo-border',
        cyan:
          'bg-category-cyan-surface text-category-cyan-text border-category-cyan-border',
        orange:
          'bg-category-orange-surface text-category-orange-text border-category-orange-border',
        emerald:
          'bg-category-emerald-surface text-category-emerald-text border-category-emerald-border',
      },
```

**Step 2: Update the badge test**

In `src/ui/badge.test.tsx:13`, change `variant="red"` to `variant="error"`:

```typescript
const { container } = render(<Badge variant="error">Error</Badge>)
```

**Step 3: Run badge test**

Run: `pnpm vitest run src/ui/badge.test.tsx`
Expected: PASS (all 5 tests)

**Step 4: Commit**

```bash
git add src/ui/badge.tsx src/ui/badge.test.tsx
git commit -m "feat(badge): migrate to semantic + category variants, remove tag-* dependency

Variants: neutral, info, success, error, warning, brand, accent,
teal, amber, slate, indigo, cyan, orange, emerald (14 total)."
```

---

### Task 5: Update Badge consumers

**Files:**
- Modify: `src/ui/data-table.stories.tsx:29,38` (Badge variant usage)
- Modify: `src/ui/badge.stories.tsx` (variant names in all examples)
- Modify: `src/ui/avatar-stack.tsx:32-37` (tag-* CSS variable references)

**Step 1: Update data-table.stories.tsx**

Line 29 — change:
```typescript
const variant = status === 'done' ? 'green' : status === 'in-progress' ? 'blue' : 'neutral'
```
to:
```typescript
const variant = status === 'done' ? 'success' : status === 'in-progress' ? 'info' : 'neutral'
```

Line 38 — change:
```typescript
const variant = priority === 'high' ? 'red' : priority === 'medium' ? 'yellow' : 'neutral'
```
to:
```typescript
const variant = priority === 'high' ? 'error' : priority === 'medium' ? 'warning' : 'neutral'
```

**Step 2: Update badge.stories.tsx**

Update all variant references:
- `variant="blue"` → `variant="info"`
- `variant="green"` → `variant="success"`
- `variant="red"` → `variant="error"`
- `variant="yellow"` → `variant="warning"`
- `variant="magenta"` → `variant="brand"`
- `variant="purple"` → `variant="accent"`

Also add the 7 new categorical variants to the AllVariants story:
```typescript
<Badge variant="teal">Teal</Badge>
<Badge variant="amber">Amber</Badge>
<Badge variant="slate">Slate</Badge>
<Badge variant="indigo">Indigo</Badge>
<Badge variant="cyan">Cyan</Badge>
<Badge variant="orange">Orange</Badge>
<Badge variant="emerald">Emerald</Badge>
```

Update the argTypes options to the new variant names.

**Step 3: Update avatar-stack.tsx**

Replace the AVATAR_COLORS array (lines 32–37) — change `tag-*` CSS vars to category tokens:
```typescript
const AVATAR_COLORS = [
  { bg: 'var(--color-category-cyan-surface)', text: 'var(--color-category-cyan-text)' },
  { bg: 'var(--color-category-emerald-surface)', text: 'var(--color-category-emerald-text)' },
  { bg: 'var(--color-interactive-subtle)', text: 'var(--color-text-brand)' },
  { bg: 'var(--color-accent-subtle)', text: 'var(--color-accent)' },
  { bg: 'var(--color-category-orange-surface)', text: 'var(--color-category-orange-text)' },
  { bg: 'var(--color-category-amber-surface)', text: 'var(--color-category-amber-text)' },
]
```

**Step 4: Run typecheck**

Run: `pnpm tsc --noEmit`
Expected: PASS

**Step 5: Commit**

```bash
git add src/ui/data-table.stories.tsx src/ui/badge.stories.tsx src/ui/avatar-stack.tsx
git commit -m "refactor(ui): update Badge consumers to semantic variant names

Migrate data-table stories, badge stories, and avatar-stack
from tag-* tokens to semantic + category tokens."
```

---

### Task 6: Migrate misused info tokens in components

**Files:**
- Modify: `src/karm/board/board-column.tsx:35-44`
- Modify: `src/karm/tasks/activity-tab.tsx:65-66,91-92,115-116,160-161`
- Modify: `src/karm/dashboard/daily-brief.tsx:27-33`
- Modify: `src/shared/priority-indicator.tsx:20-21`

**Step 1: Fix board-column.tsx**

Replace COLUMN_ACCENTS (lines 35–44):
```typescript
const COLUMN_ACCENTS = [
  'border-l-category-cyan',
  'border-l-category-amber',
  'border-l-category-teal',
  'border-l-category-indigo',
  'border-l-category-orange',
  'border-l-category-emerald',
  'border-l-category-slate',
  'border-l-accent',
]
```

**Step 2: Fix activity-tab.tsx**

Replace 4 `info` usages with `category-slate` (neutral default for generic actions):

Line 65–66 (`task.updated`):
```typescript
    color: 'text-category-slate-text',
    dotColor: 'bg-category-slate',
```

Line 91–92 (`task.assigned`):
```typescript
    color: 'text-category-cyan-text',
    dotColor: 'bg-category-cyan',
```

Line 115–116 (`task.file_uploaded`):
```typescript
    color: 'text-category-indigo-text',
    dotColor: 'bg-category-indigo',
```

Line 160–161 (`task.labels_changed`):
```typescript
    color: 'text-category-amber-text',
    dotColor: 'bg-category-amber',
```

**Step 3: Fix daily-brief.tsx**

Replace DOT_COLORS (lines 27–33):
```typescript
const DOT_COLORS = [
  'bg-category-amber',
  'bg-category-teal',
  'bg-category-cyan',
  'bg-interactive',
  'bg-accent',
]
```

**Step 4: Fix priority-indicator.tsx**

Replace LOW priority colors (lines 20–21):
```typescript
  LOW: {
    icon: IconArrowDown,
    color: 'text-category-slate-text',
    bgColor: 'bg-category-slate-surface',
    label: 'Low',
  },
```

**Step 5: Run full test suite**

Run: `pnpm vitest run`
Expected: All tests PASS

**Step 6: Commit**

```bash
git add src/karm/board/board-column.tsx src/karm/tasks/activity-tab.tsx src/karm/dashboard/daily-brief.tsx src/shared/priority-indicator.tsx
git commit -m "refactor(components): replace misused info tokens with category tokens

- board-column: use category-* for column accent cycle
- activity-tab: differentiate action types with distinct category colors
- daily-brief: use category colors for decorative dots
- priority-indicator: LOW uses category-slate instead of info"
```

---

### Task 7: Update FoundationsShowcase

**Files:**
- Modify: `src/tokens/FoundationsShowcase.tsx:43-51` (palettes array)
- Modify: `src/tokens/FoundationsShowcase.tsx:87-163` (semantic groups)

**Step 1: Add 7 new palettes to the showcase**

In the `palettes` array (line 43–51), add after the Blue entry:
```typescript
  { name: 'Teal (Mayur)', prefix: '--teal', steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  { name: 'Amber (Kesar)', prefix: '--amber', steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  { name: 'Slate (Megha)', prefix: '--slate', steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  { name: 'Indigo (Neel)', prefix: '--indigo', steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  { name: 'Cyan (Samudra)', prefix: '--cyan', steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  { name: 'Orange (Agni)', prefix: '--orange', steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  { name: 'Emerald (Panna)', prefix: '--emerald', steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
```

**Step 2: Replace Tags group with Category group**

Replace the `Tags` entry in `semanticGroups` (lines 152–162):
```typescript
  {
    name: 'Category (Sapta Varna)',
    tokens: [
      '--color-category-teal',
      '--color-category-teal-surface',
      '--color-category-amber',
      '--color-category-amber-surface',
      '--color-category-slate',
      '--color-category-slate-surface',
      '--color-category-indigo',
      '--color-category-indigo-surface',
      '--color-category-cyan',
      '--color-category-cyan-surface',
      '--color-category-orange',
      '--color-category-orange-surface',
      '--color-category-emerald',
      '--color-category-emerald-surface',
    ],
  },
```

**Step 3: Commit**

```bash
git add src/tokens/FoundationsShowcase.tsx
git commit -m "docs(showcase): add Sapta Varna palettes, replace Tags with Category group"
```

---

### Task 8: Typecheck, test, build verification

**Step 1: Run typecheck**

Run: `pnpm tsc --noEmit`
Expected: PASS (no new errors beyond pre-existing primitives @ts-nocheck)

**Step 2: Run full test suite**

Run: `pnpm vitest run`
Expected: All tests PASS

**Step 3: Run build**

Run: `pnpm build`
Expected: PASS — library builds successfully

**Step 4: Run Storybook build (if available)**

Run: `pnpm build-storybook`
Expected: PASS — all stories compile

**Step 5: Clean up preview file**

Delete the temporary color preview:
```bash
rm color-preview.html
```

**Step 6: Commit cleanup**

```bash
git add -A
git commit -m "chore: remove color preview, verify build passes"
```
