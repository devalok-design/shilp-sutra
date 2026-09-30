# Deep Audit Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all 56 findings from the 2026-03-01 deep audit, working bottom-up from tokens to components.

**Architecture:** Six phases — (0) quick text fixes, (1) token foundation, (2) Tailwind preset, (3) typography & fonts, (4) shared/layout components, (5) karm domain consolidation. Each phase produces a clean commit. Foundation phases must complete before component phases.

**Tech Stack:** CSS custom properties, Tailwind 3.4, CVA, React 18, TypeScript 5.7 strict, Vitest + RTL

**Audit reference:** `docs/audit/2026-03-01-design-system-deep-audit.md`

---

## Phase 0: Icon Text Leak Hotfixes

*Fixes: F-55 (icon names in UI text). These are user-visible bugs from the recent icon migration. Fix immediately.*

### Task 0.1: Fix icon name leaks in user-visible text

**Files:**
- Modify: `src/shared/command-palette.tsx:182`
- Modify: `src/layout/top-bar.tsx:142`

**Step 1: Fix command-palette description**

In `src/shared/command-palette.tsx`, find the `<DialogPrimitive.Description>` inside `<VisuallyHidden>`:

```tsx
// BEFORE (line ~182):
IconSearch or jump to pages, projects, tasks, and actions

// AFTER:
Search or jump to pages, projects, tasks, and actions
```

**Step 2: Fix top-bar tooltip**

In `src/layout/top-bar.tsx`, find the `<TooltipContent>` for the search button:

```tsx
// BEFORE (line ~142):
IconSearch (Ctrl+K)

// AFTER:
Search (Ctrl+K)
```

**Step 3: Verify in Storybook**

Run: `pnpm storybook`
Check: Layout > TopBar story, hover the search icon — tooltip should say "Search (Ctrl+K)"

**Step 4: Commit**

```bash
git add src/shared/command-palette.tsx src/layout/top-bar.tsx
git commit -m "fix(a11y): remove icon name leaks from user-visible text

Fixes F-55: migration find-and-replace leaked 'Icon' prefix into
screen-reader description and tooltip content."
```

### Task 0.2: Fix icon name leaks in comments and story names

**Files:**
- Modify: `src/layout/bottom-navbar.tsx:107,163`
- Modify: `src/karm/tasks/conversation-tab.tsx:121`
- Modify: `src/layout/app-command-palette.stories.tsx:176`
- Modify: `src/shared/command-palette.stories.tsx:267`

**Step 1: Fix all comment/story name leaks**

In each file, remove the `Icon` prefix from non-import text:

| File | Line | Before | After |
|------|------|--------|-------|
| bottom-navbar.tsx | ~107 | `// IconCheck if any "more" item is active` | `// Check if any "more" item is active` |
| bottom-navbar.tsx | ~163 | `{/* Bottom IconNavigation Bar */}` | `{/* Bottom Navigation Bar */}` |
| conversation-tab.tsx | ~121 | `// IconCheck that content is not just empty` | `// Check that content is not just empty` |
| app-command-palette.stories.tsx | ~176 | `name: 'Empty IconSearch Results'` | `name: 'Empty Search Results'` |
| command-palette.stories.tsx | ~267 | `IconCheck the browser console` | `Check the browser console` |

**Step 2: Search for any remaining leaks**

Run: `grep -r "Icon[A-Z][a-z]" src/ --include="*.tsx" --include="*.ts" -l` and verify all results are actual icon imports/usage, not leaked text.

**Step 3: Commit**

```bash
git add src/layout/bottom-navbar.tsx src/karm/tasks/conversation-tab.tsx \
  src/layout/app-command-palette.stories.tsx src/shared/command-palette.stories.tsx
git commit -m "fix: clean up icon name leaks in comments and story names

Fixes remaining F-55 items: find-and-replace artifacts from
lucide-react to tabler migration."
```

---

## Phase 1: Token Foundation

*Fixes: F-01, F-03, F-04, F-05, F-06, F-07, F-08, F-09. Tokens are the base — everything else depends on them.*

### Task 1.1: Fix yellow scale inversion

**Files:**
- Modify: `src/tokens/primitives.css:79-80`

**Step 1: Swap yellow-500 and yellow-600 values**

The current values are inverted — 500 is darker than 600. Fix:

```css
/* BEFORE: */
--yellow-500: #9a6b00;
--yellow-600: #a36200;

/* AFTER — 500 should be lighter than 600: */
--yellow-500: #a36200;
--yellow-600: #9a6b00;
```

Verify the full scale now progresses light→dark: 50→100→...→500→600→...→950.

**Step 2: Verify in Storybook**

Check any component using warning/yellow tokens (Alert variant="warning", Badge variant="yellow", StatusBadge status="pending") for visual correctness.

**Step 3: Commit**

```bash
git add src/tokens/primitives.css
git commit -m "fix(tokens): correct yellow-500/600 lightness inversion

Fixes F-01: --yellow-500 was darker than --yellow-600, breaking
the monotonic light-to-dark scale progression."
```

### Task 1.2: Add missing spacing and radius tokens

**Files:**
- Modify: `src/tokens/semantic.css:100-119`
- Modify: `src/tailwind/preset.ts:22-35` (spacing), `14-21` (borderRadius)

**Step 1: Add spacing tokens**

In `src/tokens/semantic.css`, insert between existing spacing values:

```css
/* Add after --spacing-02 (4px): */
--spacing-02b: 6px;

/* Add after --spacing-05 (16px): */
--spacing-05b: 20px;
```

**Step 2: Add border radius DEFAULT token**

In `src/tokens/semantic.css`, insert between `--radius-sm` and `--radius-md`:

```css
--radius-sm:      2px;
--radius-default: 4px;  /* NEW — industry standard base radius */
--radius-md:      6px;
```

**Step 3: Map to Tailwind preset**

In `src/tailwind/preset.ts`, add to `spacing`:

```ts
'ds-02b': 'var(--spacing-02b)',  // 6px
'ds-05b': 'var(--spacing-05b)', // 20px
```

Add to `borderRadius`:

```ts
'ds-default': 'var(--radius-default)', // 4px
```

**Step 4: Commit**

```bash
git add src/tokens/semantic.css src/tailwind/preset.ts
git commit -m "feat(tokens): add missing spacing (6px, 20px) and radius (4px) tokens

Fixes F-05, F-06: adds commonly needed spacing steps and the
industry-standard 4px border-radius that every major system includes."
```

### Task 1.3: Add missing semantic tokens and clean up deprecated ones

**Files:**
- Modify: `src/tokens/semantic.css`

**Step 1: Add undefined layout tokens**

After the gradient section in `:root`, add:

```css
/* ── Layout ─────────────────────────────────── */
--max-width:      1280px;
--max-width-body: 960px;
```

And in `.dark`:

```css
--max-width:      1280px;
--max-width-body: 960px;
```

**Step 2: Add missing animation tokens**

After `--ease-bounce`, add:

```css
--ease-linear: linear;
--duration-medium: 300ms;
```

**Step 3: Remove deprecated `--color-danger` tokens (6 total)**

Remove from `:root`:
```css
/* @deprecated Use --color-error instead */
--color-danger:               var(--red-600);
--color-danger-hover:         var(--red-700);
--color-danger-surface:       var(--red-50);
```

Remove from `.dark`:
```css
/* Danger — @deprecated Use --color-error instead */
--color-danger:               var(--red-500);
--color-danger-hover:         var(--red-400);
--color-danger-surface:       var(--red-900);
```

**Step 4: Search for any usage of removed tokens**

Run: `grep -r "color-danger" src/ --include="*.tsx" --include="*.ts" --include="*.css"`

If any component still references `--color-danger`, update it to use `--color-error` (or `--color-error-surface`/`--color-error-border` as appropriate).

**Step 5: Map new tokens to Tailwind preset**

In `src/tailwind/preset.ts`, add to the appropriate sections:

```ts
// In transitionDuration:
medium: 'var(--duration-medium)',

// In transitionTimingFunction:
linear: 'var(--ease-linear)',
```

**Step 6: Commit**

```bash
git add src/tokens/semantic.css src/tailwind/preset.ts
git commit -m "feat(tokens): add layout/animation tokens, remove deprecated danger

Fixes F-03, F-08: defines --max-width/--max-width-body that admin
components reference, adds linear easing and 300ms duration,
removes 6 deprecated --color-danger tokens in favor of --color-error."
```

### Task 1.4: Complete the Tailwind preset mapping

**Files:**
- Modify: `src/tailwind/preset.ts`

**Step 1: Add all missing color mappings**

In the `colors` object, add:

```ts
'interactive-disabled': 'var(--color-interactive-disabled)',
'field-02': 'var(--color-field-02)',
'field-02-hover': 'var(--color-field-02-hover)',
'text-on-color-dark': 'var(--color-text-on-color-dark)',
'text-link-hover': 'var(--color-text-link-hover)',
'success-border': 'var(--color-success-border)',
'error-border': 'var(--color-error-border)',
'warning-border': 'var(--color-warning-border)',
'info-border': 'var(--color-info-border)',
'success-text': 'var(--color-success-text)',
'error-text': 'var(--color-error-text)',
'warning-text': 'var(--color-warning-text)',
'info-text': 'var(--color-info-text)',
'tag-neutral-border': 'var(--color-tag-neutral-border)',
'tag-blue-border': 'var(--color-tag-blue-border)',
'tag-green-border': 'var(--color-tag-green-border)',
'tag-red-border': 'var(--color-tag-red-border)',
'tag-yellow-border': 'var(--color-tag-yellow-border)',
'tag-magenta-border': 'var(--color-tag-magenta-border)',
'tag-purple-border': 'var(--color-tag-purple-border)',
```

**Step 2: Add border width mapping**

```ts
borderWidth: {
  'ds-sm': 'var(--border-width-sm)',
  'ds-md': 'var(--border-width-md)',
  'ds-lg': 'var(--border-width-lg)',
},
```

**Step 3: Fix animation durations**

Replace hardcoded animation strings:

```ts
animation: {
  ripple: 'ripple var(--duration-slow) linear',
  'ripple-icon': 'ripple var(--duration-medium) linear forwards',
  shake: 'shake 1s var(--ease-standard) infinite',
},
```

**Step 4: Verify build**

Run: `pnpm typecheck && pnpm build`

**Step 5: Commit**

```bash
git add src/tailwind/preset.ts
git commit -m "feat(tokens): complete Tailwind preset mapping for all CSS variables

Fixes F-17, F-19: maps 22+ previously unmapped CSS variables to
Tailwind utilities, fixes animation durations to use token references."
```

---

## Phase 2: Typography & Font Strategy

*Fixes: F-10, F-11, F-12, F-13, F-14, F-15, F-16, F-21. This phase changes visual output — test thoroughly in Storybook.*

### Task 2.1: Fix body text line-heights

**Files:**
- Modify: `src/tokens/typography.css`

**Step 1: Update B-class line-heights**

Change all B-class (body) `line-height: 100%` to appropriate values:

```css
/* B1-Reg through B4-Reg: change line-height from 100% to 150% */
.B1-Reg { line-height: 150%; }
.B2-Reg { line-height: 150%; }
.B3-Reg { line-height: 150%; }
.B4-Reg { line-height: 150%; }

/* B5-Reg: already 140% — keep */
/* B6-Reg (semibold label-like): change from 100% to 140% */
.B6-Reg { line-height: 140%; }
/* B7-Reg: change from 100% to 150% */
.B7-Reg { line-height: 150%; }
/* B8-Reg: change from 100% to 150% */
.B8-Reg { line-height: 150%; }
/* B2-Semibold: change from 100% to 150% */
.B2-Semibold { line-height: 150%; }
```

**Step 2: Update L-class line-heights**

Labels can be tighter but not 100%:

```css
/* L1 through L6: change line-height from 100% to 130% */
.L1 { line-height: 130%; }
.L2 { line-height: 130%; }
.L3 { line-height: 130%; }
.L4 { line-height: 130%; }
.L5 { line-height: 130%; }
.L6 { line-height: 130%; }
```

**Step 3: Update T-class line-heights**

Titles can be tight but need some leading:

```css
/* T1-T4 (large display): change from 100% to 115% */
.T1-Reg { line-height: 115%; }
.T2-Reg { line-height: 115%; }
.T3-Reg { line-height: 115%; }
.T4-Reg { line-height: 115%; }

/* T5-T7 (smaller titles): change from 100% to 125% */
.T5-Reg { line-height: 125%; }
.T6-Reg { line-height: 125%; }
.T7-Reg { line-height: 125%; }
```

**Step 4: Visual review in Storybook**

Check every page in Storybook for text overflow or layout breakage. Body text should look more readable. Titles may push layouts slightly — verify cards, dialogs, panels.

**Step 5: Commit**

```bash
git add src/tokens/typography.css
git commit -m "fix(a11y): increase line-heights to meet WCAG 1.4.12 standards

Fixes F-10: body text was at 100% line-height (descenders collide
with ascenders). Now: body 150%, labels 130%, titles 115-125%.
Industry standard body is 1.4-1.6; we use 1.5."
```

### Task 2.2: Fix non-standard font sizes and remove duplicates

**Files:**
- Modify: `src/tokens/typography.css`

**Step 1: Fix non-standard sizes**

```css
/* T1-Reg: 62px → 60px (aligns with Tailwind 6xl) */
.T1-Reg { font-size: 60px; letter-spacing: -1.2px; }

/* T3-Reg: 38px → 36px (aligns with Tailwind 4xl, MD3 Display S) */
.T3-Reg { font-size: 36px; letter-spacing: -0.72px; }

/* prose-devsabha: 13px → 14px */
.prose-devsabha { font-size: 14px; }

/* prose-devsabha h4: 13px → 14px */
.prose-devsabha h4 { font-size: 14px; }
```

**Step 2: Remove duplicate L5 (identical to L4)**

Delete the entire `.L5` class block (lines ~227-235). Then search the codebase:

Run: `grep -r "L5" src/ --include="*.tsx" --include="*.ts" -l`

Replace any usage of `L5` with `L4`.

**Step 3: Document P2/B5-Reg near-duplicate**

These are only 0.04px letter-spacing apart. Add a comment in typography.css:

```css
/* NOTE: P2 (0.36px tracking) and B5-Reg (0.32px tracking) are near-identical
   at 16px/140%. P2 is for paragraph blocks, B5-Reg for inline body text. */
```

**Step 4: Commit**

```bash
git add src/tokens/typography.css
git commit -m "fix(tokens): align font sizes to industry standards, remove L5 duplicate

Fixes F-11, F-14, F-16: 62→60px, 38→36px, 13→14px to align with
Tailwind/MD3 scales. Removes L5 (identical to L4)."
```

### Task 2.3: Switch default font from Ranade to Google Sans

**Files:**
- Modify: `src/tokens/semantic.css:5`
- Modify: `src/tailwind/preset.ts:10-11`

**Step 1: Change --font-body to Google Sans**

In `src/tokens/semantic.css`:

```css
/* BEFORE: */
--font-body:    Ranade, sans-serif;

/* AFTER: */
--font-body:    "Google Sans", system-ui, sans-serif;
```

**Step 2: Create --font-accent for Ranade**

Add below `--font-body`:

```css
--font-accent:  Ranade, sans-serif;
```

**Step 3: Update Tailwind preset**

In `src/tailwind/preset.ts`:

```ts
// BEFORE:
accent: ['var(--font-body)', 'sans-serif'],

// AFTER:
accent: ['var(--font-accent)', 'sans-serif'],
```

**Step 4: Update the 4 direct Ranade references to use font-accent**

These are the intentional brand-moment usages that should stay as Ranade but use the token:

```
src/karm/custom-buttons/CustomButton.tsx:177  — font-['Ranade'] → font-accent
src/karm/custom-buttons/ExtendedFAB.tsx:141   — font-['Ranade'] → font-accent
src/karm/custom-buttons/Toggle.tsx:235        — font-['Ranade'] → font-accent
src/karm/custom-buttons/Toggle.tsx:290        — font-['Ranade'] → font-accent
```

**Step 5: Verify in Storybook**

All components should now render in Google Sans. The custom-buttons and prose-devsabha should still show Ranade. Check:
- Button, Input, Badge, Alert stories → Google Sans
- CustomButton stories → Ranade
- Chat panel prose → Ranade (via `.prose-devsabha`)

**Step 6: Commit**

```bash
git add src/tokens/semantic.css src/tailwind/preset.ts \
  src/karm/custom-buttons/CustomButton.tsx \
  src/karm/custom-buttons/ExtendedFAB.tsx \
  src/karm/custom-buttons/Toggle.tsx
git commit -m "feat(tokens): switch default body font to Google Sans, Ranade for accents only

Fixes F-21: --font-body now maps to Google Sans. Created --font-accent
for Ranade. Direct font-['Ranade'] references updated to font-accent token.
Prose-devsabha retains Ranade via direct CSS."
```

---

## Phase 3: Shared & Layout Component Fixes

*Fixes: F-26, F-27, F-28, F-29, F-30, F-31, F-33, F-34, F-35. These are the middle layer — fix before karm.*

### Task 3.1: Replace all `text-white` with semantic token

**Files:**
- Modify: 8 files (search-and-replace)

**Step 1: Global replacement**

In all `.tsx` files under `src/`, replace `text-white` with `text-[var(--color-text-on-color)]`:

Files to change:
- `src/layout/notification-center.tsx:311`
- `src/karm/dashboard/attendance-cta.tsx:98,187`
- `src/karm/chat/chat-input.tsx:71,80`
- `src/karm/chat/message-list.tsx:143`
- `src/karm/custom-buttons/FAB.tsx:120`
- `src/karm/admin/break/breaks.tsx:97`
- `src/karm/admin/break/leave-request.tsx:104,117`

**Important:** Do NOT change `text-white` in:
- `.storybook/` files (Storybook's own chrome)
- Story files that are demonstrating color contrast

**Step 2: Verify build**

Run: `pnpm typecheck`

**Step 3: Commit**

```bash
git commit -m "fix(tokens): replace text-white with semantic text-on-color token

Fixes F-28: 11 instances of hardcoded text-white now use
var(--color-text-on-color) for proper dark mode support."
```

### Task 3.2: Replace raw Tailwind colors with semantic tokens

**Files:**
- Modify: ~15 files across shared/, layout/, karm/

**Step 1: Create a mapping and replace**

| Raw Tailwind | Semantic Token Replacement |
|---|---|
| `bg-blue-400`, `bg-blue-500` | `bg-[var(--color-info)]` |
| `bg-amber-400`, `bg-amber-500` | `bg-[var(--color-warning)]` |
| `bg-red-500`, `bg-red-600` | `bg-[var(--color-error)]` |
| `bg-red-50` | `bg-[var(--color-error-surface)]` |
| `bg-amber-50` | `bg-[var(--color-warning-surface)]` |
| `text-red-500`, `text-red-600` | `text-[var(--color-text-error)]` |
| `text-amber-700` | `text-[var(--color-text-warning)]` |
| `bg-gray-900` | `bg-[var(--neutral-900)]` |
| `bg-gray-200` | `bg-[var(--color-layer-03)]` |
| `bg-gray-100` | `bg-[var(--color-field-hover)]` |
| `bg-gray-50` | `bg-[var(--color-field)]` |
| `bg-rose-100` | `bg-[var(--color-error-surface)]` |
| `hover:bg-red-50` | `hover:bg-[var(--color-error-surface)]` |
| `hover:text-red-500` | `hover:text-[var(--color-text-error)]` |
| `dark:bg-red-950/30` | *(remove — semantic tokens handle dark mode automatically)* |
| `dark:text-red-400` | *(remove — semantic tokens handle dark mode automatically)* |
| `dark:hover:bg-red-950/30` | *(remove)* |

**Step 2: Apply to each file**

Work through these files one at a time:
1. `src/layout/notification-center.tsx` — TIER_COLORS map (lines 109-113)
2. `src/karm/dashboard/daily-brief.tsx` — DOT_COLORS array (lines 26-32)
3. `src/karm/chat/chat-input.tsx` — stop button (line 71)
4. `src/karm/chat/message-list.tsx` — system message (lines 129-134)
5. `src/karm/chat/conversation-list.tsx` — delete button (line 135)
6. `src/karm/dashboard/attendance-cta.tsx` — break status (lines 126-128)
7. `src/karm/admin/break/leave-request.tsx` — tooltip bg (lines 104, 117)
8. `src/karm/admin/break/breaks.tsx` — tooltip bg + hover (lines 78, 97)
9. `src/karm/admin/break/header.tsx` — avatar bg (line 184)
10. `src/karm/admin/dashboard/dashboard-header.tsx` — avatar bg (lines 110, 164)
11. `src/karm/admin/break/edit-break.tsx` — hover bg (lines 483, 511)
12. `src/karm/admin/break/break-balance.tsx` — hover + icon bg (lines 40, 43)

**Step 3: Verify no raw Tailwind colors remain**

Run: `grep -rE "bg-(gray|slate|zinc|rose|amber|blue|red|green|emerald)-[0-9]" src/ --include="*.tsx" | grep -v ".stories." | grep -v "storybook"`

Should return zero results (excluding story files).

**Step 4: Commit**

```bash
git commit -m "fix(tokens): replace 50+ raw Tailwind colors with semantic tokens

Fixes F-29, F-44: all bg-gray-*, bg-red-*, bg-amber-*, bg-blue-*
now use semantic CSS variables. Dark mode overrides removed as
semantic tokens handle this automatically."
```

### Task 3.3: Fix PriorityIndicator and StatusBadge token usage

**Files:**
- Modify: `src/shared/priority-indicator.tsx:14-42`
- Modify: `src/shared/status-badge.tsx:31-40`

**Step 1: Fix PriorityIndicator**

Replace primitive tokens with semantic ones:

```tsx
// BEFORE:
color: 'text-[var(--blue-300)]',
bgColor: 'bg-[var(--blue-100)]',

// AFTER:
color: 'text-[var(--color-info-text)]',
bgColor: 'bg-[var(--color-info-surface)]',
```

Apply same pattern for all priorities:
- LOW: `--color-info-text` / `--color-info-surface`
- MEDIUM: `--color-warning-text` / `--color-warning-surface`
- HIGH: `--color-error-text` / `--color-error-surface`
- URGENT: `--color-error-text` / `--color-error-surface`

**Step 2: Fix StatusBadge dot map**

Align dot colors with the CVA variant tokens:

```tsx
const dotColorMap: Record<string, string> = {
  active: 'bg-[var(--color-success)]',
  pending: 'bg-[var(--color-warning)]',
  approved: 'bg-[var(--color-success)]',
  rejected: 'bg-[var(--color-error)]',
  completed: 'bg-[var(--color-success)]',
  blocked: 'bg-[var(--color-error)]',
  cancelled: 'bg-[var(--color-icon-disabled)]',
  draft: 'bg-[var(--color-icon-secondary)]',
}
```

**Step 3: Commit**

```bash
git add src/shared/priority-indicator.tsx src/shared/status-badge.tsx
git commit -m "fix(tokens): use semantic tokens in PriorityIndicator and StatusBadge

Fixes F-30, F-31: replaced primitive color refs (--blue-300, --green-500)
with semantic tokens (--color-info-text, --color-success) for proper
dark mode and theme support."
```

### Task 3.4: Add forwardRef to all shared and layout components

**Files:**
- Modify: `src/shared/content-card.tsx`
- Modify: `src/shared/status-badge.tsx`
- Modify: `src/shared/page-header.tsx`
- Modify: `src/shared/empty-state.tsx`
- Modify: `src/shared/avatar-group.tsx`
- Modify: `src/shared/priority-indicator.tsx`
- Modify: `src/layout/sidebar.tsx`
- Modify: `src/layout/top-bar.tsx`
- Modify: `src/layout/bottom-navbar.tsx`
- Modify: `src/layout/notification-center.tsx`

**Step 1: Pattern to apply**

For each component, wrap with `React.forwardRef` and add `displayName`:

```tsx
// BEFORE:
export function ContentCard({ variant, className, ...props }: ContentCardProps) {
  return <div className={cn(...)} {...props} />
}

// AFTER:
const ContentCard = React.forwardRef<HTMLDivElement, ContentCardProps>(
  ({ variant, className, ...props }, ref) => {
    return <div ref={ref} className={cn(...)} {...props} />
  }
)
ContentCard.displayName = 'ContentCard'
export { ContentCard }
```

Apply this pattern to all 10 components listed above. For layout components, also change from default export to named export.

**Step 2: Update layout imports if changed to named exports**

Check `src/layout/index.ts` — if it already re-exports by name, no change needed. If it uses default imports, update.

**Step 3: Verify build**

Run: `pnpm typecheck && pnpm build`

**Step 4: Commit**

```bash
git commit -m "refactor: add forwardRef to all shared and layout components

Fixes F-27, F-35: all shared/ and layout/ components now forward
refs and set displayName, matching the pattern used in ui/ layer.
Layout components switched to named exports for consistency."
```

### Task 3.5: Fix inline styles and ContentCard padding

**Files:**
- Modify: `src/shared/avatar-group.tsx:80,117`
- Modify: `src/shared/error-boundary.tsx:115,119`
- Modify: `src/shared/global-loading.tsx:37`
- Modify: `src/layout/top-bar.tsx:193-195`
- Modify: `src/shared/content-card.tsx:65,86-90`

**Step 1: Replace inline zIndex in avatar-group**

```tsx
// BEFORE:
style={{ zIndex: displayed.length - index }}

// AFTER — use Tailwind arbitrary value:
className={cn('...', `z-[${displayed.length - index}]`)}
```

**Step 2: Replace inline styles in error-boundary**

Move backgroundColor and color to className using `cn()` with Tailwind utilities.

**Step 3: Replace inline style in global-loading**

```tsx
// BEFORE:
style={{ backgroundColor: 'var(--color-interactive)' }}

// AFTER:
className="bg-[var(--color-interactive)]"
```

**Step 4: Replace inline shadow in top-bar**

```tsx
// BEFORE:
style={{ boxShadow: '0px 25px 40px 0px var(--color-shadow, rgba(0,0,0,0.08))' }}

// AFTER — use shadow token:
className="shadow-[var(--shadow-03)]"
```

**Step 5: Extract ContentCard padding helper**

In content-card.tsx, extract the repeated padding ternary into a helper:

```tsx
const getPadding = (padding: string) => {
  switch (padding) {
    case 'compact': return 'px-3 py-2.5'
    case 'spacious': return 'px-ds-06 py-ds-05'
    default: return 'px-ds-05 py-ds-04'
  }
}
```

Use this helper for header, content, and footer sections.

**Step 6: Commit**

```bash
git commit -m "fix: replace inline styles with Tailwind utilities, DRY ContentCard padding

Fixes F-33, F-34: removes inline style objects in favor of
className-based token references. Extracts ContentCard padding
logic to eliminate duplication."
```

---

## Phase 4: Karm Domain — Token Fixes

*Fixes: F-44 (remaining), F-45, F-46, F-53, F-54. Fix token violations across karm/ before restructuring components.*

### Task 4.1: Fix activity-tab and task-constants primitive token usage

**Files:**
- Modify: `src/karm/tasks/activity-tab.tsx:59-181`
- Modify: `src/karm/tasks/task-constants.ts:10-46`

**Step 1: Fix activity-tab**

Replace all primitive token references with semantic ones:

```tsx
// BEFORE:
color: 'text-[var(--green-500)]',
dotColor: 'bg-[var(--green-500)]',

// AFTER:
color: 'text-[var(--color-success-text)]',
dotColor: 'bg-[var(--color-success)]',
```

Apply to all ~15 instances. Map: green→success, blue→info, yellow→warning, red→error, purple→accent, neutral→text-secondary.

**Step 2: Fix PRIORITY_DOT_COLORS**

```tsx
export const PRIORITY_DOT_COLORS: Record<string, string> = {
  LOW: 'bg-[var(--color-info)]',
  MEDIUM: 'bg-[var(--color-warning)]',
  HIGH: 'bg-[var(--color-error)]',
  URGENT: 'bg-[var(--color-error)]',
}
```

**Step 3: Fix REVIEW_STATUS_MAP — remove className, rely on Badge variants**

```tsx
export const REVIEW_STATUS_MAP: Record<string, ReviewStatusConfig> = {
  PENDING: { variant: 'yellow', label: 'Pending' },
  APPROVED: { variant: 'green', label: 'Approved' },
  CHANGES_REQUESTED: { variant: 'magenta', label: 'Changes Requested' },
  REJECTED: { variant: 'red', label: 'Rejected' },
}
```

Remove the `className` field entirely — Badge's CVA variants handle the colors.

Update `review-tab.tsx` where it uses `statusInfo.className` — remove that prop from `<Badge>`.

**Step 4: Commit**

```bash
git commit -m "fix(tokens): replace primitive color refs with semantic tokens in task components

Fixes F-44 (partial): activity-tab and task-constants now use
semantic tokens (--color-success, --color-info, etc.) instead of
primitive palette values."
```

### Task 4.2: Fix board-column accent colors

**Files:**
- Modify: `src/karm/board/board-column.tsx:34-43`

**Step 1: Replace raw Tailwind column accents**

Since these are decorative column colors (not semantic), create a token-compatible approach:

```tsx
const COLUMN_ACCENTS = [
  'border-l-[var(--color-info)]',
  'border-l-[var(--color-accent)]',
  'border-l-[var(--color-warning)]',
  'border-l-[var(--color-success)]',
  'border-l-[var(--color-interactive)]',
  'border-l-[var(--blue-300)]',      // OK to use primitive for decorative variety
  'border-l-[var(--yellow-300)]',
  'border-l-[var(--green-300)]',
]
```

**Step 2: Commit**

```bash
git add src/karm/board/board-column.tsx
git commit -m "fix(tokens): use semantic/primitive tokens for board column accents

Fixes F-44 (partial): column accent colors now reference design
system tokens instead of raw Tailwind color classes."
```

### Task 4.3: Remove hex fallbacks from custom-button var() calls

**Files:**
- Modify: `src/karm/custom-buttons/CustomButton.tsx`
- Modify: `src/karm/custom-buttons/FAB.tsx`
- Modify: `src/karm/custom-buttons/ExtendedFAB.tsx`
- Modify: `src/karm/custom-buttons/Toggle.tsx`
- Modify: `src/karm/custom-buttons/AdminSwitch.tsx`

**Step 1: Strip all hex fallbacks from var() calls**

In each file, find-and-replace patterns like:
```
var(--color-interactive,#d33163)  →  var(--color-interactive)
var(--color-text-on-color,#fcf7f7)  →  var(--color-text-on-color)
var(--color-layer-02,#fff)  →  var(--color-layer-02)
var(--shadow-button-hover,#efd5d9)  →  var(--color-interactive-hover)  // token doesn't exist, map to real one
var(--color-field-disabled,#D3CED0)  →  var(--color-interactive-disabled)
```

For `--shadow-button-hover` (F-09 — doesn't exist): replace with `var(--color-interactive-hover)` or the appropriate existing token based on context.

For `--color-interactive-accent` (F-09): replace with `var(--color-accent)`.

**Step 2: Verify build**

Run: `pnpm typecheck`

**Step 3: Commit**

```bash
git commit -m "fix(tokens): remove hex fallbacks and fix non-existent token refs in custom-buttons

Fixes F-09, F-45: removes 50+ hardcoded hex fallbacks from var()
calls. Maps --shadow-button-hover and --color-interactive-accent
to existing tokens."
```

### Task 4.4: Fix magic numbers and hardcoded gradient

**Files:**
- Modify: `src/karm/admin/break/leave-request.tsx:104,117` — `z-[1600]` → `z-[var(--z-tooltip)]`
- Modify: `src/karm/dashboard/attendance-cta.tsx:167` — extract gradient to token or use `bg-gradient-brand`
- Modify: `src/karm/dashboard/attendance-cta.tsx:187` — `rounded-[14px]` → `rounded-[var(--radius-xl)]`

**Step 1: Fix z-index violations**

Replace `z-[1600]` with `z-[var(--z-tooltip)]` (or `z-tooltip` if using the Tailwind mapping).

**Step 2: Fix gradient**

```tsx
// BEFORE:
bg-gradient-to-br from-[#fcf7f7] via-white to-[rgba(225,248,224,0.3)]

// AFTER — use token colors:
bg-gradient-to-br from-[var(--pink-50)] via-[var(--neutral-0)] to-[var(--green-50)]
```

**Step 3: Fix border radius**

```tsx
// BEFORE:
rounded-[14px]

// AFTER:
rounded-[var(--radius-xl)]  // 16px — closest token value
```

**Step 4: Commit**

```bash
git commit -m "fix(tokens): replace magic z-index, gradient hex, and border-radius values

Fixes F-53, F-54: z-[1600] uses z-tooltip token, hardcoded gradient
uses primitive color vars, non-standard 14px radius uses xl token."
```

---

## Phase 5: Karm Domain — Component Consolidation

*Fixes: F-36, F-37, F-38, F-39, F-40, F-41, F-42, F-43, F-47, F-48. This is the biggest phase — restructuring components.*

### Task 5.1: Extract useRipple() and useButtonState() hooks

**Files:**
- Create: `src/karm/custom-buttons/use-ripple.ts`
- Create: `src/karm/custom-buttons/use-button-state.ts`

**Step 1: Extract useRipple hook**

Extract the common ripple logic from CustomButton.tsx (lines ~145-169) into a reusable hook:

```tsx
import { useState, useCallback, type MouseEvent } from 'react'

interface Ripple {
  id: number
  x: number
  y: number
  size: number
}

export function useRipple(duration = 600) {
  const [ripples, setRipples] = useState<Ripple[]>([])

  const createRipple = useCallback((e: MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 2
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2
    const id = Date.now()

    setRipples((prev) => [...prev, { id, x, y, size }])
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id))
    }, duration)
  }, [duration])

  return { ripples, createRipple }
}
```

**Step 2: Extract useButtonState hook**

Extract the state machine (default/hover/focused/pressed):

```tsx
import { useState, useCallback, type FocusEvent, type MouseEvent } from 'react'

type ButtonState = 'default' | 'focused' | 'hover' | 'pressed'

export function useButtonState() {
  const [state, setState] = useState<ButtonState>('default')

  const handlers = {
    onMouseEnter: useCallback(() => setState('hover'), []),
    onMouseLeave: useCallback(() => setState('default'), []),
    onMouseDown: useCallback(() => setState('pressed'), []),
    onMouseUp: useCallback(() => setState('hover'), []),
    onFocus: useCallback((e: FocusEvent) => {
      if (e.target === e.currentTarget) setState('focused')
    }, []),
    onBlur: useCallback(() => setState('default'), []),
  }

  return { state, handlers }
}
```

**Step 3: Update CustomButton.tsx to use the hooks**

Replace inline state management and ripple logic with the extracted hooks.

**Step 4: Run tests**

Run: `pnpm test`

**Step 5: Commit**

```bash
git add src/karm/custom-buttons/use-ripple.ts \
  src/karm/custom-buttons/use-button-state.ts \
  src/karm/custom-buttons/CustomButton.tsx
git commit -m "refactor: extract useRipple and useButtonState hooks from custom-buttons

Fixes F-47, F-48: ripple animation and button state machine
previously duplicated 5x are now shared hooks."
```

### Task 5.2: Delete redundant custom-button components

**Files:**
- Delete: `src/karm/custom-buttons/FAB.tsx`
- Delete: `src/karm/custom-buttons/ExtendedFAB.tsx`
- Delete: `src/karm/custom-buttons/icon-button.tsx`
- Delete: `src/karm/custom-buttons/AdminSwitch.tsx`
- Modify: `src/karm/custom-buttons/index.ts`
- Modify: `src/karm/index.ts`
- Modify: `src/index.ts`

**Step 1: Search for all usages**

For each component, search the codebase to find all import sites:

```bash
grep -r "FAB\|ExtendedFAB\|IconButton\|AdminSwitch" src/ --include="*.tsx" --include="*.ts" -l
```

**Step 2: Replace usages with existing components**

- `FAB` → `<Button size="icon-lg" variant="primary">{iconElement}</Button>`
- `ExtendedFAB` → `<Button variant="primary" size="lg">{icon}{label}</Button>`
- `IconButton` → `<Button size="icon-md" variant="ghost">{iconElement}</Button>`
- `AdminSwitch` → `<Switch className="...">` (migrate custom styling inline)

For AdminSwitch specifically: remove the S3 URL background images entirely — they are an external dependency that doesn't belong in a design system. If the custom toggle visuals are needed, implement them with CSS/SVG locally.

**Step 3: Delete files and update exports**

Remove from barrel exports in `custom-buttons/index.ts`, `karm/index.ts`, and `src/index.ts`.

**Step 4: Delete story files for removed components**

Remove corresponding `.stories.tsx` files (FAB.stories, ExtendedFAB.stories, icon-button.stories, AdminSwitch.stories — if they exist).

**Step 5: Verify build + tests**

Run: `pnpm typecheck && pnpm test && pnpm build`

**Step 6: Commit**

```bash
git commit -m "refactor: remove redundant FAB, ExtendedFAB, IconButton, AdminSwitch

Fixes F-36: these components are replaced by Button and Switch
from ui/ with appropriate variant/size props. Removes hardcoded
S3 URLs from AdminSwitch."
```

### Task 5.3: Rename Toggle to SegmentedControl and convert to CVA

**Files:**
- Rename: `src/karm/custom-buttons/Toggle.tsx` → `src/karm/custom-buttons/segmented-control.tsx`
- Modify: `src/karm/custom-buttons/index.ts`

**Step 1: Rename the file and component**

Rename `Toggle.tsx` → `segmented-control.tsx`. Rename the component from `Toggle` to `SegmentedControl` and `ToggleButton` to `SegmentedControlItem`.

**Step 2: Convert Record maps to CVA**

Replace the 6 `Record<...>` maps with CVA:

```tsx
const segmentedControlItemVariants = cva(
  'relative inline-flex items-center justify-center font-accent font-semibold text-sm leading-none text-center transition-all',
  {
    variants: {
      color: {
        filled: '...',
        tonal: '...',
      },
      size: {
        small: 'h-8 px-3',
        medium: 'h-10 px-4',
        big: 'h-12 px-6',
      },
      selected: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      { color: 'filled', selected: true, className: 'bg-[var(--color-interactive)] text-[var(--color-text-on-color)]' },
      { color: 'tonal', selected: true, className: 'bg-[var(--color-field)] text-[var(--color-text-primary)]' },
    ],
    defaultVariants: { color: 'filled', size: 'medium' },
  }
)
```

**Step 3: Use extracted hooks**

Replace inline ripple and state logic with `useRipple()` and `useButtonState()` from Task 5.1.

**Step 4: Update exports**

In `custom-buttons/index.ts`:
```ts
export { SegmentedControl, SegmentedControlItem } from './segmented-control'
```

Add deprecated re-exports for backward compatibility:
```ts
/** @deprecated Use SegmentedControl instead */
export { SegmentedControl as Toggle } from './segmented-control'
```

**Step 5: Commit**

```bash
git commit -m "refactor: rename Toggle to SegmentedControl, convert to CVA

Fixes F-36 (partial): Toggle was a multi-option tablist, not a
binary toggle — renamed to avoid confusion with ui/Toggle.
Converted 6 Record maps to CVA pattern for consistency."
```

### Task 5.4: Replace custom tabs in TaskDetailPanel with ui/Tabs

**Files:**
- Modify: `src/karm/tasks/task-detail-panel.tsx:318-364`

**Step 1: Import Tabs components**

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../ui'
```

**Step 2: Replace custom tab bar**

Replace the custom `<div className="flex gap-0">` tab bar (lines 318-364) with:

```tsx
<Tabs value={activeTab} onValueChange={handleTabChange}>
  <TabsList variant="line">
    {visibleTabs.map((tab) => (
      <TabsTrigger key={tab.id} value={tab.id}>
        <tab.icon className="h-[var(--icon-sm)] w-[var(--icon-sm)]" stroke={1.5} />
        {tab.label}
      </TabsTrigger>
    ))}
  </TabsList>
  {/* Tab content already rendered conditionally below */}
</Tabs>
```

**Step 3: Fix the 'IconActivity' label bug**

```tsx
// BEFORE:
{ id: 'activity', label: 'IconActivity', icon: IconActivity }

// AFTER:
{ id: 'activity', label: 'Activity', icon: IconActivity }
```

**Step 4: Verify in Storybook**

Check TaskDetailPanel story — tabs should now have:
- Arrow key navigation
- `role="tab"` and `aria-selected`
- Consistent visual styling with other tabs in the system

**Step 5: Commit**

```bash
git commit -m "refactor: replace custom tab bar with ui/Tabs in TaskDetailPanel

Fixes F-37: gains Radix a11y (role=tab, aria-selected, keyboard
navigation). Fixes 'IconActivity' label bug."
```

### Task 5.5: Replace custom progress, tooltips, status badge, and labels

**Files:**
- Modify: `src/karm/tasks/subtasks-tab.tsx` — custom progress → `<Progress>`
- Modify: `src/karm/admin/break/breaks.tsx:97-100` — custom tooltip → `<Tooltip>`
- Modify: `src/karm/admin/break/leave-request.tsx:100-107` — custom tooltip → `<Tooltip>`
- Modify: `src/karm/admin/utils/render-status.tsx:65-82` — custom badge → `<Badge>`
- Modify: `src/karm/admin/dashboard/edit-break.tsx:231-260` — remove local renderStatus duplicate
- Modify: `src/karm/board/task-card.tsx:121-136` — custom label → `<Badge size="sm">`

**Step 1: Replace custom progress in subtasks-tab**

```tsx
// BEFORE (lines 99-113):
<div className="flex-1 h-1.5 rounded-...">
  <div style={{ width: `${percent}%` }} />
</div>

// AFTER:
import { Progress } from '../../ui'
<Progress value={totalCount > 0 ? (completedCount / totalCount) * 100 : 0} className="h-1.5" />
```

**Step 2: Replace custom tooltips**

In both `breaks.tsx` and `leave-request.tsx`, replace the `group relative` + `invisible group-hover:visible` pattern:

```tsx
// BEFORE:
<div className="group relative truncate">
  <span>{name}</span>
  <div className="invisible absolute ... group-hover:visible">{name}</div>
</div>

// AFTER:
import { Tooltip, TooltipTrigger, TooltipContent } from '../../ui'
<Tooltip>
  <TooltipTrigger asChild>
    <span className="truncate">{name}</span>
  </TooltipTrigger>
  <TooltipContent>{name}</TooltipContent>
</Tooltip>
```

**Step 3: Replace render-status custom badge**

In `render-status.tsx`, replace the custom div with Badge:

```tsx
import { Badge } from '../../ui'

// BEFORE:
<div className={`B3-Reg w-fit rounded-[24px] px-[6px] py-[4px] ${className}`}>{text}</div>

// AFTER:
<Badge variant={mapStatusToVariant(status)} size="sm">{text}</Badge>
```

Remove the duplicate `renderStatus` function from `edit-break.tsx` and import from the utility instead.

**Step 4: Replace custom labels in task-card**

```tsx
// BEFORE:
<span className="inline-flex max-w-[80px] truncate rounded-... text-[10px]">{label}</span>

// AFTER:
<Badge size="sm" variant="neutral" className="max-w-[80px] truncate">{label}</Badge>
```

**Step 5: Commit**

```bash
git commit -m "refactor: replace custom progress/tooltip/badge/labels with ui/ components

Fixes F-38, F-39, F-40, F-41: eliminates 5 reinvented-wheel
patterns in favor of existing, accessible ui/ components."
```

### Task 5.6: Extract MemberPickerPopover to shared/

**Files:**
- Create: `src/shared/member-picker.tsx`
- Modify: `src/shared/index.ts`
- Modify: `src/karm/tasks/task-properties.tsx`
- Modify: `src/karm/tasks/review-tab.tsx`

**Step 1: Create the shared component**

Extract the common pattern from `task-properties.tsx:126-206`:

```tsx
import * as React from 'react'
import { Popover, PopoverTrigger, PopoverContent, Avatar, AvatarImage, AvatarFallback } from '../ui'
import { cn } from '../ui/lib/utils'
import { IconCheck, IconSearch } from '@tabler/icons-react'

interface MemberPickerMember {
  id: string
  name: string
  avatar?: string
}

interface MemberPickerProps {
  members: MemberPickerMember[]
  selectedIds: string[]
  onSelect: (memberId: string) => void
  multiple?: boolean
  placeholder?: string
  children: React.ReactNode
}

const MemberPicker = React.forwardRef<HTMLDivElement, MemberPickerProps>(
  ({ members, selectedIds, onSelect, multiple = false, placeholder = 'Search members...', children }, ref) => {
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState('')

    const filtered = members.filter((m) =>
      m.name.toLowerCase().includes(search.toLowerCase())
    )

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{children}</PopoverTrigger>
        <PopoverContent ref={ref} className="w-[240px] p-0" align="start">
          <div className="border-b border-[var(--color-border-default)] p-2">
            <div className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-field)] px-2">
              <IconSearch className="h-[var(--icon-sm)] w-[var(--icon-sm)] text-[var(--color-text-placeholder)]" stroke={1.5} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={placeholder}
                className="h-8 w-full bg-transparent text-sm outline-none"
              />
            </div>
          </div>
          <div className="max-h-[200px] overflow-y-auto p-1">
            {filtered.map((member) => {
              const isSelected = selectedIds.includes(member.id)
              return (
                <button
                  key={member.id}
                  onClick={() => {
                    onSelect(member.id)
                    if (!multiple) setOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5 text-left text-sm transition-colors',
                    'hover:bg-[var(--color-field)]',
                    isSelected && 'bg-[var(--color-interactive-subtle)]'
                  )}
                >
                  <Avatar className="h-6 w-6">
                    {member.avatar && <AvatarImage src={member.avatar} />}
                    <AvatarFallback className="text-[10px]">
                      {member.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1 truncate text-[var(--color-text-primary)]">{member.name}</span>
                  {isSelected && <IconCheck className="h-[var(--icon-sm)] w-[var(--icon-sm)] text-[var(--color-interactive)]" stroke={2} />}
                </button>
              )
            })}
          </div>
        </PopoverContent>
      </Popover>
    )
  }
)
MemberPicker.displayName = 'MemberPicker'
export { MemberPicker, type MemberPickerProps, type MemberPickerMember }
```

**Step 2: Export from shared/index.ts**

```ts
export { MemberPicker, type MemberPickerProps, type MemberPickerMember } from './member-picker'
```

**Step 3: Replace the 3 duplicate implementations**

In `task-properties.tsx` and `review-tab.tsx`, replace inline picker code with:

```tsx
import { MemberPicker } from '../../shared'

<MemberPicker
  members={members}
  selectedIds={selectedIds}
  onSelect={handleSelect}
  multiple
>
  <Button variant="ghost" size="sm">Add member</Button>
</MemberPicker>
```

**Step 4: Verify build + Storybook**

Run: `pnpm typecheck && pnpm build`
Check task-detail-panel stories — member pickers should work as before.

**Step 5: Commit**

```bash
git commit -m "refactor: extract MemberPicker to shared/, remove 3 duplicate implementations

Fixes F-42: searchable member picker popover was duplicated in
task-properties (2x) and review-tab. Now a single shared component."
```

### Task 5.7: Replace custom dropdown in ChatPanel

**Files:**
- Modify: `src/karm/chat/chat-panel.tsx`

**Step 1: Replace custom click-outside dropdown with DropdownMenu**

```tsx
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../../ui'

// Replace the custom dropdown (lines ~84-89 click-outside + manual state):
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="sm">{selectedAgent}</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="start">
    {agents.map((agent) => (
      <DropdownMenuItem key={agent.id} onClick={() => onAgentChange(agent.id)}>
        {agent.name}
      </DropdownMenuItem>
    ))}
  </DropdownMenuContent>
</DropdownMenu>
```

**Step 2: Remove custom click-outside handler code**

Delete the `useEffect` with `mousedown` event listener.

**Step 3: Commit**

```bash
git add src/karm/chat/chat-panel.tsx
git commit -m "refactor: replace custom dropdown with DropdownMenu in ChatPanel

Fixes F-43: eliminates manual click-outside handler in favor of
Radix-powered DropdownMenu with proper a11y and keyboard support."
```

---

## Phase 6: Icon Sizing Standardization

*Fixes: F-22, F-56. Do this last since it touches many files.*

### Task 6.1: Define icon sizing standard and apply

**Files:**
- Modify: `src/tokens/Iconography.mdx` — update docs
- Modify: ~30 component files

**Step 1: Define the standard**

The standard is: **always use token-based sizing**. Update `Iconography.mdx` to recommend:

```
h-[var(--icon-sm)] w-[var(--icon-sm)]   → 16px (small UI icons, dismiss buttons)
h-[var(--icon-md)] w-[var(--icon-md)]   → 20px (default — most icons)
h-[var(--icon-lg)] w-[var(--icon-lg)]   → 24px (prominent icons, empty states)
h-[var(--icon-xl)] w-[var(--icon-xl)]   → 32px (hero icons, illustrations)
```

Remove the recommendation of raw Tailwind classes from the docs.

**Step 2: Apply to UI components first**

Find all `h-4 w-4`, `h-3.5 w-3.5`, `h-5 w-5`, `h-3 w-3` in `src/ui/` and replace:

- `h-4 w-4` (16px) → `h-[var(--icon-sm)] w-[var(--icon-sm)]`
- `h-5 w-5` (20px) → `h-[var(--icon-md)] w-[var(--icon-md)]`
- `h-3.5 w-3.5` (14px) → `h-[var(--icon-sm)] w-[var(--icon-sm)]` (closest token, 16px)
- `h-3 w-3` (12px) → keep as-is (below token range, rare use)
- `h-2.5 w-2.5` (10px) → keep as-is (footer hints, very small)

**Step 3: Apply to shared/, layout/, karm/ components**

Same replacements across all component files.

**Step 4: Verify visual regression in Storybook**

Icons that were 14px (`h-3.5`) will become 16px. Verify this doesn't break layouts.

**Step 5: Commit**

```bash
git commit -m "fix(tokens): standardize icon sizing to use design tokens

Fixes F-22, F-56: all icon sizes now use var(--icon-sm/md/lg/xl)
tokens instead of raw Tailwind h-4 w-4 classes. Iconography docs
updated to reflect the standard."
```

---

## Verification Checklist

After all phases are complete, run:

```bash
# Type safety
pnpm typecheck

# Unit tests
pnpm test

# Build (library mode)
pnpm build

# Lint
pnpm lint

# Storybook builds
pnpm build-storybook

# Visual check — open Storybook and review all stories
pnpm storybook
```

### Manual Storybook spot-checks:
- [ ] Button stories — Google Sans font, proper colors
- [ ] Badge stories — all variants render correctly
- [ ] Alert/Banner — warning variant uses corrected yellow
- [ ] Dialog/Sheet — overlays render correctly
- [ ] Tabs — line and contained variants
- [ ] TaskDetailPanel — tabs have proper a11y
- [ ] Chat components — no `text-white`, proper send button colors
- [ ] Admin dashboard — calendar, tooltips work
- [ ] CustomButton — still has ripple animation, Ranade font
- [ ] SegmentedControl (formerly Toggle) — proper tab-group behavior
- [ ] Dark mode toggle — all components adapt correctly

---

## Summary

| Phase | Tasks | Findings Fixed | Commits |
|-------|-------|---------------|---------|
| 0: Icon hotfixes | 2 | F-55 | 2 |
| 1: Token foundation | 4 | F-01, F-03, F-04, F-05, F-06, F-08, F-09, F-17, F-19 | 4 |
| 2: Typography & fonts | 3 | F-10, F-11, F-12, F-14, F-16, F-21 | 3 |
| 3: Shared/layout fixes | 5 | F-26, F-27, F-28, F-29, F-30, F-31, F-33, F-34, F-35 | 5 |
| 4: Karm token fixes | 4 | F-44, F-45, F-46, F-53, F-54 | 4 |
| 5: Karm consolidation | 7 | F-36, F-37, F-38, F-39, F-40, F-41, F-42, F-43, F-47, F-48 | 7 |
| 6: Icon sizing | 1 | F-22, F-56 | 1 |
| **Total** | **26 tasks** | **46 findings** | **26 commits** |

**Remaining findings not in this plan** (documentation/story-only, lower priority):
- F-02: Neutral scale 0 vs 50 naming (cosmetic, breaking change)
- F-07: Shadow RGBA hardcoding (functional but not ideal)
- F-13: Font sizes not CSS vars (architectural — future phase)
- F-15: Missing responsive type scaling (future phase)
- F-18: No fontSize Tailwind mapping (future phase)
- F-20: font-accent = font-body (resolved by Task 2.3)
- F-23: Toast karam variant (needs investigation)
- F-24: Table color-mix (low risk)
- F-49: Month grid duplication (admin-specific)
- F-50, F-51: Component splitting (future refactor)
- F-52: Missing admin stories (separate effort)
