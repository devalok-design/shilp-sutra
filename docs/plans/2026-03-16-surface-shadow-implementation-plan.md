# Surface & Shadow Token Consistency — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace numeric surface/shadow tokens with semantic names, upgrade shadow quality with tinted multi-layer technique, and add missing tokens (sunken, overlay, inverted, disabled, glow, inset, ring, backdrop, border-subtle).

**Architecture:** Two-layer token system — primitives (raw values in primitives.css) aliased by semantic tokens (role-based names in semantic.css), mapped to Tailwind utilities via preset.ts. Single breaking release covering core + karm with transition guide.

**Tech Stack:** CSS custom properties, Tailwind 3.4, oklch color space, CVA variants

**Design doc:** `docs/plans/2026-03-16-surface-shadow-consistency-design.md`

---

### Task 1: Add surface-0 primitive to primitives.css

**Files:**
- Modify: `packages/core/src/tokens/primitives.css:51` (light mode) and `:251` (dark mode)

**Step 1: Add light-mode surface-0 primitive**

In `primitives.css`, after line 51 (`--neutral-0: #ffffff;`), before line 52 (`--neutral-1`), add:

```css
--color-surface-0: oklch(0.945 0.008 360);
```

**Step 2: Add dark-mode surface-0 primitive**

In the `.dark` section (after line ~251 area, before `--neutral-1` dark definition), add:

```css
--color-surface-0: oklch(0.07 0.008 360);
```

**Step 3: Verify build**

Run: `cd packages/core && pnpm build`
Expected: Build succeeds, no errors.

**Step 4: Commit**

```bash
git add packages/core/src/tokens/primitives.css
git commit -m "feat(tokens): add surface-0 primitive for sunken surfaces"
```

---

### Task 2: Add semantic surface tokens to semantic.css

**Files:**
- Modify: `packages/core/src/tokens/semantic.css:100-108` (light surface block) and `:355-358` (dark overrides)

**Step 1: Replace light-mode surface definitions**

Replace lines 100-103:

```css
--color-surface-1: var(--neutral-1);
--color-surface-2: var(--neutral-2);
--color-surface-3: var(--neutral-3);
--color-surface-4: var(--neutral-4);
```

With:

```css
/* Semantic surface tokens */
--color-surface-base: var(--neutral-1);
--color-surface-sunken: var(--color-surface-0);
--color-surface-raised: var(--neutral-2);
--color-surface-overlay: var(--neutral-1);
--color-surface-raised-hover: var(--neutral-3);
--color-surface-raised-active: var(--neutral-4);
--color-surface-inverted: var(--neutral-12);
--color-surface-inverted-fg: var(--neutral-1);
--color-surface-disabled: var(--neutral-2);
--color-surface-fg-disabled: oklch(from var(--neutral-12) l c h / 0.35);

/* Deprecated aliases (remove in next major) */
--color-surface-1: var(--color-surface-base);
--color-surface-2: var(--color-surface-raised);
--color-surface-3: var(--color-surface-raised-hover);
--color-surface-4: var(--color-surface-raised-active);
```

**Step 2: Add border-subtle token**

After the existing `--color-surface-border-strong: var(--neutral-6);` (line ~108), add:

```css
--color-surface-border-subtle: var(--neutral-4);
```

**Step 3: Add backdrop token**

In the same block, add:

```css
--color-backdrop: oklch(0 0 0 / 0.4);
```

**Step 4: Update dark-mode overrides**

In the `.dark` section (lines ~355-358), add after the existing border overrides:

```css
--color-surface-overlay: oklch(0.13 0.0002 350);
--color-surface-inverted: var(--neutral-12);
--color-surface-inverted-fg: var(--neutral-1);
--color-surface-disabled: var(--neutral-2);
--color-surface-fg-disabled: oklch(from var(--neutral-12) l c h / 0.35);
--color-surface-border-subtle: var(--neutral-2);
--color-backdrop: oklch(0 0 0 / 0.6);
```

**Step 5: Verify build**

Run: `cd packages/core && pnpm build`

**Step 6: Commit**

```bash
git add packages/core/src/tokens/semantic.css
git commit -m "feat(tokens): add semantic surface tokens with sunken, overlay, inverted, disabled"
```

---

### Task 3: Add shadow-color, shadow primitives, and semantic shadows

**Files:**
- Modify: `packages/core/src/tokens/semantic.css:261-266` (light shadows) and `:375-380` (dark shadows)

**Step 1: Add shadow-color and shadow-transition**

Before the shadow definitions (line ~260), add:

```css
/* Shadow color: cool blue tint for natural depth */
--shadow-color: 0.15 0.015 260;
--shadow-strength: 1;

/* Shadow transition */
--shadow-transition: box-shadow var(--duration-fast-02) var(--ease-productive-standard);
```

**Step 2: Replace light-mode shadow definitions**

Replace lines 261-266 with:

```css
/* Shadow primitives (internal — use semantic aliases below) */
--shadow-xs:
  0 0 0 1px oklch(var(--shadow-color) / calc(0.035 * var(--shadow-strength))),
  0 0.5px 1px -0.5px oklch(var(--shadow-color) / calc(0.045 * var(--shadow-strength))),
  0 1.5px 3px -1px oklch(var(--shadow-color) / calc(0.04 * var(--shadow-strength))),
  0 3px 7px -2px oklch(var(--shadow-color) / calc(0.03 * var(--shadow-strength)));
--shadow-sm:
  0 0 0 1px oklch(var(--shadow-color) / calc(0.035 * var(--shadow-strength))),
  0 0.5px 1px -0.5px oklch(var(--shadow-color) / calc(0.04 * var(--shadow-strength))),
  0 2px 4px -1.5px oklch(var(--shadow-color) / calc(0.045 * var(--shadow-strength))),
  0 6px 12px -3px oklch(var(--shadow-color) / calc(0.035 * var(--shadow-strength))),
  0 14px 28px -8px oklch(var(--shadow-color) / calc(0.025 * var(--shadow-strength)));
--shadow-md:
  0 0 0 1px oklch(var(--shadow-color) / calc(0.04 * var(--shadow-strength))),
  0 1px 2px -1px oklch(var(--shadow-color) / calc(0.05 * var(--shadow-strength))),
  0 4px 8px -2px oklch(var(--shadow-color) / calc(0.04 * var(--shadow-strength))),
  0 10px 20px -5px oklch(var(--shadow-color) / calc(0.035 * var(--shadow-strength))),
  0 24px 44px -12px oklch(var(--shadow-color) / calc(0.025 * var(--shadow-strength)));
--shadow-lg:
  0 0 0 1px oklch(var(--shadow-color) / calc(0.04 * var(--shadow-strength))),
  0 1px 2px -1px oklch(var(--shadow-color) / calc(0.05 * var(--shadow-strength))),
  0 3px 6px -2px oklch(var(--shadow-color) / calc(0.045 * var(--shadow-strength))),
  0 8px 16px -4px oklch(var(--shadow-color) / calc(0.04 * var(--shadow-strength))),
  0 18px 34px -8px oklch(var(--shadow-color) / calc(0.03 * var(--shadow-strength))),
  0 40px 64px -16px oklch(var(--shadow-color) / calc(0.025 * var(--shadow-strength)));

/* Semantic elevation shadows (public API) */
--shadow-raised: var(--shadow-xs);
--shadow-raised-hover: var(--shadow-sm);
--shadow-floating: var(--shadow-md);
--shadow-overlay: var(--shadow-lg);

/* Effect shadows */
--shadow-brand: 0 2px 8px oklch(0.55 0.19 360 / 0.20), 0 6px 20px oklch(0.55 0.19 360 / 0.15);
--shadow-glow: 0 0 0 1.5px oklch(0.55 0.19 360 / 0.20), 0 0 7px oklch(0.55 0.19 360 / 0.12);
--shadow-inset: inset 0 1px 2px oklch(var(--shadow-color) / calc(0.08 * var(--shadow-strength))), inset 0 2px 5px oklch(var(--shadow-color) / calc(0.06 * var(--shadow-strength)));
--shadow-ring-sm: 0 0 0 1px var(--color-surface-border);
--shadow-ring: 0 0 0 2px oklch(0.55 0.19 360 / 0.30);

/* Deprecated aliases */
--shadow-01: var(--shadow-raised);
--shadow-02: var(--shadow-raised-hover);
--shadow-03: var(--shadow-floating);
--shadow-04: var(--shadow-overlay);
```

**Step 3: Replace dark-mode shadow overrides**

Replace lines 375-380 with:

```css
--shadow-strength: 2.5;
--shadow-brand: 0 2px 8px oklch(0.55 0.19 360 / 0.30), 0 6px 20px oklch(0.55 0.19 360 / 0.20);
--shadow-glow: 0 0 0 1.5px oklch(0.55 0.19 360 / 0.35), 0 0 10px oklch(0.55 0.19 360 / 0.20);
--shadow-ring: 0 0 0 2px oklch(0.55 0.19 360 / 0.45);
```

Note: Because shadow primitives use `calc(opacity * var(--shadow-strength))`, dark mode only needs to override `--shadow-strength: 2.5` — all shadow levels auto-adjust. Only effect shadows that don't use `--shadow-strength` need explicit dark overrides.

**Step 4: Verify build**

Run: `cd packages/core && pnpm build`

**Step 5: Run tests**

Run: `cd packages/core && pnpm test`
Expected: All 636 tests pass (shadow tokens are CSS-only, no test impact).

**Step 6: Commit**

```bash
git add packages/core/src/tokens/semantic.css
git commit -m "feat(tokens): add tinted multi-layer shadows with semantic elevation names"
```

---

### Task 4: Update Tailwind preset

**Files:**
- Modify: `packages/core/src/tailwind/preset.ts:185-188` (surface colors) and `:321-327` (boxShadow)

**Step 1: Update surface color mappings**

Replace lines 185-188:

```typescript
'surface-base': 'var(--color-surface-base)',
'surface-sunken': 'var(--color-surface-sunken)',
'surface-raised': 'var(--color-surface-raised)',
'surface-overlay': 'var(--color-surface-overlay)',
'surface-raised-hover': 'var(--color-surface-raised-hover)',
'surface-raised-active': 'var(--color-surface-raised-active)',
'surface-inverted': 'var(--color-surface-inverted)',
'surface-inverted-fg': 'var(--color-surface-inverted-fg)',
'surface-disabled': 'var(--color-surface-disabled)',
'surface-fg-disabled': 'var(--color-surface-fg-disabled)',
// Deprecated — remove in next major
'surface-1': 'var(--color-surface-base)',
'surface-2': 'var(--color-surface-raised)',
'surface-3': 'var(--color-surface-raised-hover)',
'surface-4': 'var(--color-surface-raised-active)',
```

Add `'surface-border-subtle': 'var(--color-surface-border-subtle)',` after the existing border color entries.

Add `backdrop: 'var(--color-backdrop)',` in the colors section.

**Step 2: Update boxShadow mappings**

Replace lines 321-327:

```typescript
boxShadow: {
  raised: 'var(--shadow-raised)',
  'raised-hover': 'var(--shadow-raised-hover)',
  floating: 'var(--shadow-floating)',
  overlay: 'var(--shadow-overlay)',
  brand: 'var(--shadow-brand)',
  glow: 'var(--shadow-glow)',
  inset: 'var(--shadow-inset)',
  'ring-sm': 'var(--shadow-ring-sm)',
  ring: 'var(--shadow-ring)',
  // Deprecated — remove in next major
  '01': 'var(--shadow-raised)',
  '02': 'var(--shadow-raised-hover)',
  '03': 'var(--shadow-floating)',
  '04': 'var(--shadow-overlay)',
},
```

**Step 3: Verify build**

Run: `cd packages/core && pnpm build`

**Step 4: Commit**

```bash
git add packages/core/src/tailwind/preset.ts
git commit -m "feat(tokens): update Tailwind preset with semantic surface and shadow utilities"
```

---

### Task 5: Migrate core UI components (surfaces)

**Files:**
- Modify: All `.tsx` files in `packages/core/src/ui/` (~62 files with bg-surface-*)

**Step 1: Find-replace surface classes across core/src/ui/**

Apply these replacements across all files in `packages/core/src/ui/`:

| Find | Replace |
|------|---------|
| `bg-surface-1` | `bg-surface-base` (for overlays) OR `bg-surface-overlay` (for popovers/dialogs) — check decision matrix |
| `bg-surface-2` | `bg-surface-raised` |
| `bg-surface-3` | `bg-surface-raised-hover` |
| `bg-surface-4` | `bg-surface-raised-active` |

**IMPORTANT**: `bg-surface-1` requires manual review per file — it's used for BOTH page background AND overlay. Consult the decision matrix in the design doc:
- Sidebar, TopBar → `bg-surface-sunken`
- Dialog, Sheet, Popover, Select, Combobox → `bg-surface-overlay`
- Tooltip → `bg-surface-inverted`
- Input controls → `bg-surface-overlay`
- Page background → `bg-surface-base`

**Step 2: Verify no old surface classes remain**

Run: `grep -r "bg-surface-[1-4]" packages/core/src/ui/ --include="*.tsx" -l`
Expected: No results (or only deprecated alias references in comments).

**Step 3: Run tests**

Run: `cd packages/core && pnpm test`
Expected: All tests pass.

**Step 4: Commit**

```bash
git add packages/core/src/ui/
git commit -m "refactor(core/ui): migrate surface tokens to semantic names"
```

---

### Task 6: Migrate core UI components (shadows)

**Files:**
- Modify: All `.tsx` files in `packages/core/src/ui/` (~51 files with shadow-0*)

**Step 1: Find-replace shadow classes**

| Find | Replace |
|------|---------|
| `shadow-01` | `shadow-raised` |
| `shadow-02` | `shadow-raised-hover` |
| `shadow-03` | `shadow-floating` |
| `shadow-04` | `shadow-overlay` |
| `shadow-05` | `shadow-overlay` (if any exist — rare) |

Also replace hardcoded decorative shadows with effect tokens where applicable:
- Segmented control inset shadows → `shadow-inset`
- Task card selection glow → `shadow-glow`
- Sidebar ring separator → `shadow-ring-sm` or `shadow-raised`

**Step 2: Add shadow transitions to interactive components**

In components with hover shadow changes (card.tsx, stat-card.tsx, button.tsx), add:
`transition-shadow duration-fast-02 ease-productive-standard`

Or use the CSS custom property approach: `[transition:var(--shadow-transition)]`

**Step 3: Verify no old shadow classes remain**

Run: `grep -r "shadow-0[1-5]" packages/core/src/ui/ --include="*.tsx" -l`
Expected: No results.

**Step 4: Run tests**

Run: `cd packages/core && pnpm test`

**Step 5: Commit**

```bash
git add packages/core/src/ui/
git commit -m "refactor(core/ui): migrate shadow tokens to semantic names + add transitions"
```

---

### Task 7: Migrate core composed + shell components

**Files:**
- Modify: All `.tsx` files in `packages/core/src/composed/` and `packages/core/src/shell/`

**Step 1: Apply same find-replace as Tasks 5 and 6**

Same surface and shadow replacements. Pay special attention to:
- `command-palette.tsx` — hardcoded inset shadows → `shadow-inset`
- `sidebar.tsx` — `bg-surface-1` → `bg-surface-sunken`, shadow → `shadow-raised`
- `top-bar.tsx` — `bg-surface-1` → `bg-surface-sunken`, shadow → `shadow-raised`
- Date picker components — `bg-surface-1` → `bg-surface-overlay`

**Step 2: Verify + test + commit**

```bash
grep -r "bg-surface-[1-4]\|shadow-0[1-5]" packages/core/src/composed/ packages/core/src/shell/ --include="*.tsx" -l
cd packages/core && pnpm test
git add packages/core/src/composed/ packages/core/src/shell/
git commit -m "refactor(core/composed+shell): migrate surface and shadow tokens"
```

---

### Task 8: Migrate karm components

**Files:**
- Modify: All `.tsx` files in `packages/karm/src/`

**Step 1: Apply same find-replace as Tasks 5-7**

Same surface and shadow replacements. Key karm-specific changes:
- `task-card.tsx` — hardcoded glow shadows → `shadow-glow`, dragging → `shadow-overlay`
- `board-column.tsx` — `bg-surface-2` → `bg-surface-sunken` (board columns are wells)
- `task-detail-panel.tsx` — `bg-surface-1` → `bg-surface-overlay` (side panel)
- All picker components — `bg-surface-1` → `bg-surface-overlay`
- Dashboard widgets without shadows — add `shadow-raised`

**Step 2: Verify + test + commit**

```bash
grep -r "bg-surface-[1-4]\|shadow-0[1-5]" packages/karm/src/ --include="*.tsx" -l
cd packages/karm && pnpm build
git add packages/karm/src/
git commit -m "refactor(karm): migrate surface and shadow tokens"
```

---

### Task 9: Update pre-publish audit

**Files:**
- Modify: `scripts/pre-publish-audit.mjs:94-125` (SURFACE1_ALLOWLIST) and `:240-269` (checking logic)

**Step 1: Replace the surface-1 audit with semantic token audit**

Replace the `SURFACE1_ALLOWLIST` and gate logic. New rules:
1. No component file should use `bg-surface-1`, `bg-surface-2`, `bg-surface-3`, `bg-surface-4` (old names)
2. No component file should use `shadow-01` through `shadow-05` (old names)
3. No component should use both explicit `border` and `shadow-` on the same element class (border/shadow mutual exclusion)
4. Shell components (sidebar, top-bar) must use `bg-surface-sunken`
5. Card/widget components must use `bg-surface-raised`

**Step 2: Test the audit**

Run: `node scripts/pre-publish-audit.mjs`
Expected: All gates pass.

**Step 3: Commit**

```bash
git add scripts/pre-publish-audit.mjs
git commit -m "feat(audit): update pre-publish audit for semantic surface/shadow tokens"
```

---

### Task 10: Write transition guide

**Files:**
- Create: `docs/migration/surface-shadow-migration.md`

**Step 1: Write the guide with these sections:**

1. **Overview** — what changed and why
2. **Complete find-replace table** — every old class → new class
3. **Before/after examples** — card, dialog, popover, input, sidebar
4. **Decision matrix** — which token for which component type
5. **Tailwind config** — what consumers need to update if they extend the preset
6. **Edge cases** — custom components, hardcoded shadows, forced-colors mode

**Step 2: Commit**

```bash
git add docs/migration/
git commit -m "docs: add surface/shadow migration guide for consumers"
```

---

### Task 11: Update llms.txt and llms-full.txt

**Files:**
- Modify: `packages/core/llms.txt` (332 lines)
- Modify: `packages/core/llms-full.txt` (4333 lines)

**Step 1: Update llms.txt**

Add a breaking changes section at the top documenting:
- All surface renames (surface-1 → surface-base, etc.)
- All shadow renames (shadow-01 → shadow-raised, etc.)
- New tokens (sunken, overlay, inverted, disabled, glow, inset, ring, backdrop, border-subtle)
- The decision matrix (compact version)
- The border/shadow mutual exclusion rule

**Step 2: Update llms-full.txt**

Update every component entry that references surface or shadow classes to use the new names. Update the token architecture section.

**Step 3: Commit**

```bash
git add packages/core/llms.txt packages/core/llms-full.txt
git commit -m "docs: update llms.txt and llms-full.txt for semantic surface/shadow tokens"
```

---

### Task 12: Full verification and release

**Files:**
- Modify: `packages/core/CHANGELOG.md`, `packages/karm/CHANGELOG.md`
- Modify: `packages/core/package.json`, `packages/karm/package.json` (version bumps)

**Step 1: Run full verification suite**

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
node scripts/pre-publish-audit.mjs
```

All must pass.

**Step 2: Visual review in Storybook**

Run: `pnpm storybook`

Check these stories specifically:
- Card (default, elevated, flat, outline, interactive)
- Dialog, Sheet, AlertDialog
- Select, Combobox, Popover, DropdownMenu
- Sidebar, TopBar
- Button (all variants), Input, Segmented control
- Toast, Tooltip
- Dark mode toggle on all of the above

**Step 3: Update CHANGELOG.md**

Breaking changes section FIRST, then new features, then internal changes.

**Step 4: Version bump**

This is a breaking change. Bump minor (pre-1.0 semver):
- core: 0.22.3 → 0.23.0
- karm: 0.9.0 → 0.10.0 (or match core's minor)

**Step 5: Commit and publish**

Use `/publish-release` skill for the full publishing checklist.
