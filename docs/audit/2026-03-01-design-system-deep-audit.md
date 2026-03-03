# Shilp Sutra Design System — Deep Audit

**Date**: 2026-03-01
**Scope**: Full system audit — tokens, typography, components, domain modules, icon migration
**Method**: Bottom-up (smallest building blocks → largest compositions), compared against industry standards

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Layer 1: Token Foundation](#layer-1-token-foundation)
3. [Layer 2: Components (UI, Shared, Layout)](#layer-2-components)
4. [Layer 3: Domain Components (Karm)](#layer-3-domain-components-karm)
5. [Icon Migration Review](#icon-migration-review)
6. [Industry Standards Comparison](#industry-standards-comparison)
7. [Consolidated Issue Tracker](#consolidated-issue-tracker)

---

## Executive Summary

The shilp-sutra design system has a **strong architectural foundation** — the three-tier token cascade (primitives → semantic → Tailwind preset), CVA pattern adoption, vendored Radix primitives, and module boundary enforcement are all industry-standard choices. The UI layer (41 components) scores ~99% health.

However, problems accumulate as you move outward from the core:

| Layer | Health | Key Issues |
|-------|--------|------------|
| Tokens (CSS vars) | 7.5/10 | Yellow scale inversion, non-standard font sizes, body text at 100% line-height, missing radius/spacing steps |
| Typography | 6/10 | 100% line-height on body text (a11y), duplicate classes (L4=L5, P2≈B5), 13px non-standard, font sizes not tokenized as CSS vars |
| Tailwind Preset | 7/10 | 22+ CSS vars unmapped, no fontSize mapping, animations bypass tokens |
| UI Components | 9.5/10 | Near-perfect. Minor: inconsistent icon sizing (token vs raw Tailwind) |
| Shared Components | 7/10 | No forwardRef, CommandPalette keyboard bug, raw Tailwind colors, inline styles |
| Layout Components | 7/10 | Default exports, raw colors, inline shadows, no forwardRef |
| Karm Domain | 5.5/10 | 4 redundant custom-button components, 50+ raw Tailwind colors, 3x duplicated member picker, custom tabs/progress/tooltips that should use ui/ components |
| Font Strategy | 4/10 | Ranade (accent font) used as default body font in 50+ places; should be Google Sans everywhere |

**Total unique findings: 55**

---

## Layer 1: Token Foundation

### 1.1 Primitive Colors (`src/tokens/primitives.css`)

#### F-01: Yellow scale lightness inversion (**CRITICAL**)
`--yellow-500: #9a6b00` is darker than `--yellow-600: #a36200`. Breaks monotonic light→dark progression. Every other scale is correct.

#### F-02: Neutral scale starts at 0, not 50
`--neutral-0: #ffffff` while all chromatic scales start at 50. Industry standard (Tailwind, Radix, Carbon) uses `white` as a standalone and starts numbered scales at 50. Neutral has 12 steps; all others have 11.

### 1.2 Semantic Tokens (`src/tokens/semantic.css`)

#### F-03: Deprecated `--color-danger` still has 6 tokens
Marked `@deprecated` but `--color-danger`, `--color-danger-hover`, `--color-danger-surface` + 3 dark mode overrides remain. Duplicates `--color-error`.

#### F-04: Font families misplaced in semantic layer
`--font-sans`, `--font-display`, `--font-body`, `--font-mono` are raw values (not referencing other tokens). These are primitive tokens that belong in `primitives.css`.

#### F-05: Spacing scale gaps
Scale: `2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 160`
- Missing **6px** (tight padding — Tailwind, Chakra, MD3 all include it)
- Missing **20px** (comfortable padding — Tailwind, Chakra, MD3 all include it)
- **96→160 gap** is 64px (3x the previous step size)
- Missing **1px** (hairline gaps)

#### F-06: Border radius scale non-standard
```
none: 0,  sm: 2px,  md: 6px,  lg: 10px,  xl: 16px,  2xl: 24px,  full: 9999px
```
- **Missing DEFAULT (4px)**: Tailwind's `rounded`, MD3's extra-small, shadcn's base — all use 4px. This is the most common radius for small controls.
- **lg: 10px is non-standard**: No major system uses 10px. Tailwind lg = 8px, MD3 medium = 12px.
- The progression 2→6→10→16→24 has no consistent ratio.

#### F-07: Shadows use hardcoded RGBA, not token references
All 6 shadow tokens use `rgba(0, 0, 0, ...)` directly. `--shadow-brand` hardcodes `rgba(211, 49, 99, 0.25)` (= `--pink-500` at 25% opacity). If brand color changes, shadows become stale.

#### F-08: Undefined CSS variables referenced in components
`var(--max-width)` and `var(--max-width-body)` used in admin components but **don't exist** in any token file. Silently failing.

#### F-09: Non-existent tokens referenced in custom-buttons
`var(--shadow-button-hover)` and `var(--color-interactive-accent)` are used with hex fallbacks in custom-button components but **don't exist** in the token system.

### 1.3 Typography (`src/tokens/typography.css`)

#### F-10: Body text at 100% line-height (**CRITICAL** — a11y)
Most T and B classes use `line-height: 100%` (1.0). At this value, descenders (g, p, y) collide with ascenders (b, d, h) on the next line. WCAG 1.4.12 expects support for at least 1.5x. Material Design 3 uses 1.43-1.5 for body. **No major design system ships 1.0 for body text.**

Industry standards:
- Body text: **1.4–1.6** (1.5 is the standard)
- Dense UI (labels, captions): **1.3–1.4**
- Headings: **1.2–1.3**
- Display text (48px+): **1.1–1.15**

#### F-11: L4 and L5 are identical duplicates
Both: `10px / 600 / 100% / 0.6px / uppercase`. One should be removed.

#### F-12: P2 and B5-Reg are near-identical
P2: `16px/140%/0.36px`. B5: `16px/140%/0.32px`. 0.04px letter-spacing difference is imperceptible.

#### F-13: Font sizes not tokenized as CSS variables
All 22 type classes use `font-size: Xpx` directly. No `--font-size-*` variable scale exists. Cannot override font sizes at the theme level.

#### F-14: Non-standard font sizes
Sizes used: `10, 12, 13, 14, 16, 18, 20, 24, 32, 38, 48, 62`
- **13px**: No design system uses this. Should be 12 or 14.
- **38px**: Non-standard. Tailwind uses 36px (4xl), MD3 uses 36px (Display Small). Use 36.
- **62px**: Non-standard. Tailwind uses 60px (6xl). Use 60 or 64 (8px grid).
- **10px**: Below practical accessibility floor. Use only for non-essential annotations.

#### F-15: Only T5-Reg has responsive scaling
T5 shrinks 24→16px on mobile. T1 (62px), T2 (48px), T3 (38px) have no mobile overrides.

#### F-16: `prose-devsabha` uses 13px
The only place 13px appears. `h4` also uses 13px. Should align to 12 or 14.

### 1.4 Tailwind Preset (`src/tailwind/preset.ts`)

#### F-17: 22+ CSS variables unmapped to Tailwind
Missing from preset (requires `[var(...)]` syntax, loses autocomplete):
- `--color-interactive-disabled`, `--color-field-02`, `--color-field-02-hover`
- `--color-text-on-color-dark`, `--color-text-link-hover`
- All `--color-*-border` (success, error, warning, info)
- All `--color-*-text` (success, error, warning, info)
- All 7 `--color-tag-*-border` variants
- All `--border-width-*`, `--border-focus-*`

#### F-18: No fontSize in Tailwind theme
Despite 22 typography classes, none are in Tailwind's `fontSize` extension.

#### F-19: Animations use hardcoded durations
```ts
ripple: 'ripple 0.6s linear'         // should use var(--duration-slow)
'ripple-icon': 'ripple 300ms linear'  // no matching token
shake: 'shake 1s ease-in infinite'    // uses ease-in, not a token easing
```

#### F-20: `font-accent` maps to `--font-body` silently
Both `body` and `accent` resolve to Ranade. Needs a comment or its own variable.

### 1.5 Font Strategy

#### F-21: Ranade is default body font — should be Google Sans (**HIGH**)
`--font-body: Ranade` in semantic.css. `font-body` Tailwind class used in 50+ places (all task components, status-badge, priority-indicator, avatar-group, custom-buttons).

**User directive**: Google Sans primary everywhere, Ranade for special cases only.

Current Ranade usage:
| Pattern | Count | Action |
|---------|-------|--------|
| `font-body` class (= Ranade) | 50+ | Change `--font-body` to Google Sans |
| Direct `font-['Ranade']` | 4 (CustomButton, Toggle 2x, ExtendedFAB) | Keep — these are brand moments |
| `.prose-devsabha` | 2 rules | Keep — special AI prose |

---

## Layer 2: Components

### 2.1 UI Components (`src/ui/`) — Health: 9.5/10

The UI layer is near-perfect. 41 components with:
- 100% token adherence (all colors, spacing, sizing use CSS vars)
- 100% CVA consistency (18 variant-based components follow identical pattern)
- 100% forwardRef + displayName
- 100% focus-visible styles on interactive elements
- 100% className merging via `cn()`

#### F-22: Icon sizing inconsistent
Some use tokens (`h-[var(--icon-md)]`), others use raw Tailwind (`h-4 w-4`, `h-3.5 w-3.5`). No standard for which to use where.

#### F-23: Toast "karam" variant — verify if used
`toast.tsx` defines a `karam` variant. May be dead code.

#### F-24: Table uses `color-mix()` CSS function
`table.tsx`: `bg-[color-mix(in_srgb,var(--color-layer-02)_50%,transparent)]`. Works but advanced CSS with limited older browser support.

### 2.2 Shared Components (`src/shared/`) — Health: 7/10

#### F-25: CommandPalette arrow keys broken (**CRITICAL** bug)
`command-palette.tsx` lines 104, 111:
```js
case 'IconArrowDown':  // BUG — should be 'ArrowDown'
case 'IconArrowUp':    // BUG — should be 'ArrowUp'
```
Keyboard navigation completely non-functional.

#### F-26: CommandPalette placeholder has icon name
Placeholder reads `"IconSearch or jump to..."` instead of `"Search or jump to..."`.

#### F-27: No shared/layout component uses forwardRef
All 13 shared + 6 layout components lack `forwardRef`. UI layer does this perfectly; shared/layout doesn't.

#### F-28: `text-white` used instead of `text-[var(--color-text-on-color)]`
11 instances:
- notification-center.tsx:311, attendance-cta.tsx:98,187, chat-input.tsx:71,80
- message-list.tsx:143, FAB.tsx:120, breaks.tsx:97, leave-request.tsx:104,117

#### F-29: Raw Tailwind colors bypass token system (20+ instances in shared/layout)
`bg-blue-400`, `bg-amber-400`, `bg-red-500`, `bg-gray-900`, `bg-gray-200`, `bg-gray-100`, `bg-gray-50`, `bg-rose-100`, `bg-red-50`, `bg-amber-50` across notification-center, daily-brief, leave-request, breaks, header, dashboard-header, edit-break, break-balance, message-list, conversation-list, attendance-cta.

#### F-30: PriorityIndicator uses primitive tokens directly
`priority-indicator.tsx` uses `var(--blue-300)`, `var(--yellow-500)`, `var(--red-300)` — tier-1 primitive tokens that should never appear in component code.

#### F-31: StatusBadge dot map inconsistent with its own CVA
Dot color map uses primitives (`var(--green-500)`) while CVA variants use semantic tokens (`var(--color-success-surface)`).

#### F-32: Calendar buttons missing focus + aria
`date-picker.tsx`: Calendar day buttons have no `focus-visible` styles. Navigation prev/next buttons lack `aria-label`.

#### F-33: Inline styles bypass token system
- `avatar-group.tsx:80` — `style={{ zIndex }}` instead of Tailwind z-*
- `error-boundary.tsx:115,119` — inline backgroundColor/color
- `global-loading.tsx:37` — inline backgroundColor
- `top-bar.tsx:193-195` — inline boxShadow with hardcoded rgba fallback

#### F-34: ContentCard padding duplication + non-token values
Same padding ternary repeated for header, content, footer. Uses `py-2.5`, `py-3.5` which aren't token values.

#### F-35: Layout components use default exports
`AppSidebar`, `TopBar`, `BottomNavbar`, `NotificationCenter` use `export default` — differs from named export pattern everywhere else.

---

## Layer 3: Domain Components (Karm)

### 3.1 Replaceable Components (**HIGH** priority)

#### F-36: 4 custom-button components are redundant

| Component | Replace With | Why |
|-----------|-------------|-----|
| FAB | `<Button size="icon-lg" variant="primary">` | Icon-only button with pink bg |
| IconButton | `<Button size="icon-md" variant="ghost">` | Already uses forwardRef + asChild |
| AdminSwitch | `<Switch>` with className | Thin wrapper. Has hardcoded S3 URLs (`karm-crm.s3.ap-south-1.amazonaws.com`) — design system anti-pattern |
| ExtendedFAB | `<Button variant="primary" size="lg">` with icon | Text+icon button in 2 colors |

**Keep but refactor:**
- **CustomButton**: Has Material Design ripple + state machine. Convert to CVA. Extract `useRipple()` hook.
- **Toggle** (tab-group): Fundamentally different from ui/Toggle — multi-option selector with `role="tablist"`. Rename to `SegmentedControl`. Convert to CVA.

#### F-37: Custom tab bar in TaskDetailPanel should use ui/Tabs
`task-detail-panel.tsx:318-364` — raw `<button>` elements missing `role="tab"`, `aria-selected`, `aria-controls`, keyboard navigation. `<Tabs>` has all this built in via Radix.

Also: line 114 has bug — `label: 'IconActivity'` should be `label: 'Activity'`.

#### F-38: Custom progress bar should use ui/Progress
`subtasks-tab.tsx:99-113` — reimplements a progress indicator. `<Progress>` from ui/ has Radix a11y, forwardRef, className support.

#### F-39: Custom invisible tooltips should use Tooltip component
- `breaks.tsx:97-100` — hover tooltip for user name
- `leave-request.tsx:100-107` — hover tooltip for leave reason

Both use `bg-gray-900 text-white` and are keyboard-inaccessible.

#### F-40: Custom status badge should use Badge/StatusBadge
`render-status.tsx:65-82` builds `<div class="B3-Reg rounded-[24px] px-[6px] py-[4px]">`. Also duplicated locally in `edit-break.tsx:231-260`.

#### F-41: Custom labels/tags in TaskCard should use Badge
`task-card.tsx:121-136` builds inline label chips with hardcoded styling.

### 3.2 Extract as Shared Components

#### F-42: MemberPickerPopover duplicated 3x
Searchable member picker (Popover + search + list + checkmark):
1. `task-properties.tsx:126-206` — owner/assignee picker
2. `task-properties.tsx:305-340` — column picker
3. `review-tab.tsx:252-308` — reviewer picker

Extract to `shared/member-picker.tsx`.

#### F-43: Custom agent dropdown in ChatPanel
`chat-panel.tsx:84-89` — custom click-outside handler. Should use `<DropdownMenu>`.

### 3.3 Token Violations in Karm

#### F-44: 50+ raw Tailwind colors across all karm modules

Key offenders:
- `board-column.tsx:34-43` — 8 column accent colors (`border-l-blue-400`, `violet-400`, etc.)
- `task-constants.ts:10-15` — priority dot colors (`bg-blue-400`, `bg-yellow-400`, etc.)
- `task-constants.ts:25-46` — review status hardcoded classes (`bg-yellow-100 text-yellow-800`, etc.)
- `activity-tab.tsx:59-181` — 15+ primitive token refs (`var(--green-500)`, `var(--blue-300)`)
- `daily-brief.tsx:26-32` — dot colors (`bg-amber-500`, `bg-emerald-500`, etc.)
- All `bg-gray-*` instances in admin/ (see F-29)

#### F-45: 50+ hex fallbacks in var() calls (custom-buttons)
Every custom-button component has 10-18 hex fallbacks. Some reference non-existent tokens. Some have wrong fallback values (`var(--color-layer-02,#fff)` — layer-02 is actually `#f8f7f7`).

#### F-46: 20+ hardcoded RGBA shadow values
Concentrated in custom-buttons/ and admin/. Same inset shadow string (`rgba(255,255,255,0.16)...`) copied across 5+ files.

### 3.4 Code Duplication

#### F-47: Ripple animation duplicated 5x
Identical ripple logic in CustomButton, FAB, ExtendedFAB, Toggle, IconButton. Extract to `useRipple()` hook.

#### F-48: Button state machine duplicated 5x
Hover/focus/pressed event handlers repeated in all custom-button components. Extract to `useButtonState()` hook.

#### F-49: Month grid calculation duplicated
`edit-break.tsx:271-317` and `use-calendar-navigation.ts` implement near-identical logic.

### 3.5 Component Complexity

#### F-50: TaskProperties is 588 lines
7 property types in one component (column, owner, assignees, priority, due date, labels, visibility). Split into sub-components.

#### F-51: edit-break.tsx is 683 lines
Calendar rendering (lines 476-606) should be extracted.

### 3.6 Missing Stories

#### F-52: 16 admin components have no stories
admin-dashboard, dashboard-skeleton, dashboard-header, break-request, correction-list, render-date, break-admin, break-admin-skeleton, breaks, break-balance, header, edit-break, delete-break, approved-adjustments, calendar, render-status.

### 3.7 Other Issues

#### F-53: Magic numbers across karm
- `break-balance.tsx:28` — `w-[16.4%]`
- `break-request.tsx:192-193` — `w-[329px]`, `h-[170px]`
- `leave-request.tsx:104,117` — `z-[1600]` (should use `z-tooltip`)
- `render-date.tsx:155-156` — `rounded-l-[20px]`, `rounded-r-[20px]`
- `attendance-cta.tsx:187` — `rounded-[14px]`
- `chat-input.tsx:66` — `Math.min(el.scrollHeight, 160)` magic max-height

#### F-54: Hardcoded gradient in attendance-cta
`attendance-cta.tsx:167`: `bg-gradient-to-br from-[#fcf7f7] via-white to-[rgba(225,248,224,0.3)]` — mixes hex + rgba, bypasses tokens entirely.

---

## Icon Migration Review

*Reviewed commit `7c1515e`: lucide-react → @tabler/icons-react (68 files changed)*

### What went well
- lucide-react fully removed from `package.json` and all source imports (100% clean)
- `vite.config.ts` externals correctly updated to `@tabler/icons-react`
- CommandPalette keyboard bug (F-25) was **fixed** in this migration — `'ArrowDown'`/`'ArrowUp'` now correct
- Stroke width is logical: `1.5` for content icons, `2` for navigation, `2.5` for formatting toolbar
- `IconographyShowcase.tsx` is well-structured with clean sub-component decomposition
- Admin icon aliases (`karm/admin/icons.tsx`) clean — all re-exports map to sensible Tabler equivalents

### F-55: Icon name strings leaked into user-visible text (**HIGH**)

The migration appears to have done a find-and-replace that was too aggressive — replacing text content and comments, not just imports.

**User-visible (screen reader / visual):**
- `command-palette.tsx:182` — `<DialogPrimitive.Description>` reads "IconSearch or jump to pages..." (screen readers will announce "IconSearch"). Should be "Search or jump to..."
- `top-bar.tsx:142` — `<TooltipContent>` shows "IconSearch (Ctrl+K)" on hover. Should be "Search (Ctrl+K)"

**Comments and story names (no runtime impact but messy):**
- `bottom-navbar.tsx:107` — `// IconCheck if any "more" item is active` → should be `// Check if...`
- `bottom-navbar.tsx:163` — `{/* Bottom IconNavigation Bar */}` → should be `{/* Bottom Navigation Bar */}`
- `conversation-tab.tsx:121` — `// IconCheck that content is not just empty...` → `// Check that...`
- `app-command-palette.stories.tsx:176` — story name `'Empty IconSearch Results'` → shows in Storybook sidebar
- `command-palette.stories.tsx:267` — rendered story text `"IconCheck the browser console..."` → `"Check the..."`

### F-56: Icon sizing not standardized post-migration

The system has token-based classes (`h-ico-sm`, `h-ico-md`, `h-[var(--icon-md)]`) but the vast majority of icons use raw Tailwind (`h-4 w-4`, `h-3.5 w-3.5`, `h-5 w-5`). Even within the same file:
- `alert.tsx:46` uses `h-[var(--icon-md)]` for the lead icon
- `alert.tsx:58` uses `h-4 w-4` for the dismiss icon

No enforced standard exists. The new `Iconography.mdx` documentation recommends raw Tailwind classes, which contradicts the token-based approach used in the best-adhering components.

---

## Industry Standards Comparison

### Spacing Scale

| Step | shilp-sutra | Tailwind | Carbon | MD3 | Verdict |
|------|:-----------:|:--------:|:------:|:---:|---------|
| 1px | -- | -- | -- | -- | Optional |
| 2px | yes | yes | yes | -- | Aligned |
| 4px | yes | yes | yes | yes | Aligned |
| **6px** | **missing** | yes | -- | -- | **Add** — common for tight padding |
| 8px | yes | yes | yes | yes | Aligned |
| 12px | yes | yes | yes | yes | Aligned |
| 16px | yes | yes | yes | yes | Aligned |
| **20px** | **missing** | yes | -- | yes | **Add** — common comfortable padding |
| 24px | yes | yes | yes | yes | Aligned |
| 32px | yes | yes | yes | yes | Aligned |
| 40px | yes | yes | yes | yes | Aligned |
| 48px | yes | yes | yes | yes | Aligned |
| 64px | yes | yes | yes | yes | Aligned |
| 80px | yes | yes | -- | -- | Aligned |
| 96px | yes | yes | -- | -- | Aligned |
| 160px | yes | yes | -- | -- | Aligned (but gap from 96 is large) |

### Border Radius

| Token | shilp-sutra | Tailwind | MD3 | Verdict |
|-------|:-----------:|:--------:|:---:|---------|
| none | 0 | 0 | 0 | Aligned |
| sm | 2px | 2px | -- | Aligned |
| **DEFAULT** | **missing** | **4px** | **4px** | **Add** — most common radius |
| md | 6px | 6px | -- | Aligned |
| lg | **10px** | **8px** | 12px | **Non-standard** — use 8 or 12 |
| xl | 16px | -- | 16px | Aligned with MD3 |
| 2xl | 24px | 24px | 28px | Close enough |
| full | 9999px | 9999px | 9999px | Aligned |

### Font Sizes

| Size | shilp-sutra | Tailwind | MD3 | Verdict |
|------|:-----------:|:--------:|:---:|---------|
| 10px | yes | -- | -- | Caution — below a11y floor |
| 12px | yes | xs | yes | Aligned |
| **13px** | yes | -- | -- | **Non-standard** — use 12 or 14 |
| 14px | yes | sm | yes | Aligned |
| 16px | yes | base | yes | Aligned |
| 18px | yes | lg | -- | Aligned |
| 20px | yes | xl | -- | Aligned |
| 24px | yes | 2xl | yes | Aligned |
| 32px | yes | -- | yes | Aligned |
| **38px** | yes | -- | -- | **Non-standard** — use 36 |
| 48px | yes | 5xl | -- | Aligned |
| **62px** | yes | -- | -- | **Non-standard** — use 60 or 64 |

### Line Height

| Context | shilp-sutra | WCAG/Industry | Verdict |
|---------|:-----------:|:-------------:|---------|
| Body text (B1-B4) | **100% (1.0)** | **1.4–1.6** | **CRITICAL violation** |
| Paragraphs (P1-P5) | 140% (1.4) | 1.4–1.6 | Low end, acceptable |
| Titles (T1-T7) | 100% (1.0) | 1.1–1.3 | Low but acceptable for headings |
| Labels (L1-L6) | 100% (1.0) | 1.2–1.4 | Low — add 120% minimum |

### Shadow Scale

| Aspect | shilp-sutra | Industry | Verdict |
|--------|:-----------:|:--------:|---------|
| Levels | 5 + brand | 5 (MD3), 6 (Tailwind) | Aligned |
| Light opacity | 0.10–0.22 | 0.05–0.25 | Aligned |
| Dark opacity | 0.30–0.70 | Varies | High end — test shadow-04/05 |
| Multi-layer | No (single layer) | Yes (MD3, Tailwind) | **Add ambient layer** for depth |

### Z-Index Scale

| Layer | shilp-sutra | Bootstrap | Verdict |
|-------|:-----------:|:---------:|---------|
| dropdown | 1000 | 1000 | Aligned |
| sticky | 1100 | 1020 | Aligned (wider gap = better) |
| overlay | 1200 | -- | Good addition |
| modal | 1300 | 1055 | Aligned |
| **popover** | **missing** | 1070 | **Consider adding at 1400** |
| toast | 1500 | 1090 | Aligned |
| tooltip | 1600 | 1080 | Aligned |

### Component Sizes

| Token | shilp-sutra | WCAG 2.5.8 min | MD3 touch target | Verdict |
|-------|:-----------:|:--------------:|:-----------------:|---------|
| xs (24px) | 24px | 24px | -- | Meets minimum exactly — document touch guidance |
| sm (32px) | 32px | passes | -- | Good |
| md (40px) | 40px | passes | 40dp (visual) | Aligned |
| lg (48px) | 48px | passes | 48dp (touch) | Aligned |
| xl (56px) | 56px | passes | 56dp (default) | Aligned with MD3 |

### Animation/Easing

| Aspect | shilp-sutra | Industry | Verdict |
|--------|:-----------:|:--------:|---------|
| Duration steps | 5 | 5 (Carbon), 16 (MD3) | Sufficient |
| Duration values | 0, 100, 200, 400, 700 | Similar | Aligned — consider adding 300ms |
| Easing curves | Carbon-aligned | Carbon = well-validated | Excellent |
| Missing | -- | `linear` easing | **Add --ease-linear** |
| Reduced motion | yes | Required | Aligned |

### CVA + Variant Pattern

| Aspect | shilp-sutra | Industry | Verdict |
|--------|:-----------:|:--------:|---------|
| Pattern | CVA + Tailwind + cn() | shadcn/ui standard | **Industry standard** — no change needed |
| Adoption | 9 of 9 variant components | Expected | 100% in ui/, 0% in custom-buttons |

---

## Consolidated Issue Tracker

### CRITICAL (Fix immediately)

| ID | Finding | Location |
|----|---------|----------|
| F-01 | Yellow 500/600 lightness inversion | primitives.css:79-80 |
| F-10 | Body text at 100% line-height (a11y) | typography.css (all B classes) |
| F-25 | ~~CommandPalette arrow keys broken~~ **FIXED** in icon migration | command-palette.tsx:104,111 |

### HIGH (Fix soon)

| ID | Finding | Location |
|----|---------|----------|
| F-21 | Ranade is default body font (should be Google Sans) | semantic.css:5, 50+ component files |
| F-36 | 4 custom-button components redundant (FAB, IconButton, AdminSwitch, ExtendedFAB) | karm/custom-buttons/ |
| F-37 | Custom tab bar missing a11y — use ui/Tabs | task-detail-panel.tsx:318-364 |
| F-44 | 50+ raw Tailwind colors bypass tokens | Across all karm/ modules |
| F-28 | 11x `text-white` instead of token | Various karm/ files |
| F-06 | Missing 4px DEFAULT radius | semantic.css |
| F-08 | Undefined `--max-width` variables | admin components |
| F-17 | 22+ CSS vars unmapped to Tailwind | preset.ts |
| F-42 | MemberPickerPopover duplicated 3x | task-properties.tsx, review-tab.tsx |
| F-47 | Ripple animation duplicated 5x | All custom-button files |
| F-55 | Icon names leaked into user-visible text (a11y) | command-palette.tsx:182, top-bar.tsx:142 |

### MEDIUM (Plan and fix)

| ID | Finding | Location |
|----|---------|----------|
| F-05 | Spacing scale missing 6px, 20px | semantic.css |
| F-07 | Shadows hardcode RGBA | semantic.css |
| F-09 | Non-existent tokens referenced (--shadow-button-hover) | custom-buttons/ |
| F-13 | Font sizes not tokenized as CSS vars | typography.css |
| F-14 | Non-standard font sizes (13, 38, 62px) | typography.css |
| F-22 | Icon sizing inconsistent (token vs raw) — also see F-56 | ui/ components |
| F-27 | No shared/layout component uses forwardRef | shared/, layout/ |
| F-29 | 20+ raw Tailwind colors in shared/layout | shared/, layout/ |
| F-30 | PriorityIndicator uses primitive tokens | priority-indicator.tsx |
| F-31 | StatusBadge dot map inconsistent with CVA | status-badge.tsx |
| F-32 | Calendar buttons missing focus + aria | date-picker.tsx |
| F-33 | Inline styles bypass token system | 4 files |
| F-38 | Custom progress bar — use ui/Progress | subtasks-tab.tsx |
| F-39 | Custom tooltips — use Tooltip | breaks.tsx, leave-request.tsx |
| F-40 | Custom status badge — use Badge | render-status.tsx, edit-break.tsx |
| F-41 | Custom labels — use Badge | task-card.tsx |
| F-45 | 50+ hex fallbacks in var() calls | custom-buttons/ |
| F-46 | 20+ hardcoded RGBA shadow values | custom-buttons/, admin/ |
| F-48 | Button state machine duplicated 5x | custom-buttons/ |
| F-50 | TaskProperties is 588 lines — split | task-properties.tsx |
| F-52 | 16 admin components missing stories | admin/ |
| F-53 | Magic numbers across karm | Various |

### LOW (Cleanup when touching)

| ID | Finding | Location |
|----|---------|----------|
| F-02 | Neutral scale starts at 0 | primitives.css |
| F-03 | Deprecated --color-danger still has 6 tokens | semantic.css |
| F-04 | Font families in wrong layer | semantic.css |
| F-11 | L4 = L5 duplicate | typography.css |
| F-12 | P2 ≈ B5-Reg near-duplicate | typography.css |
| F-15 | Missing responsive type scaling | typography.css |
| F-16 | prose-devsabha uses 13px | typography.css |
| F-18 | No fontSize in Tailwind theme | preset.ts |
| F-19 | Animations bypass tokens | preset.ts |
| F-20 | font-accent = font-body silently | preset.ts |
| F-23 | Toast "karam" variant — verify | toast.tsx |
| F-56 | Icon sizing not standardized — raw Tailwind vs tokens | All component files with icons |
| F-24 | Table color-mix() | table.tsx |
| F-26 | CommandPalette placeholder "IconSearch" | command-palette.tsx |
| F-34 | ContentCard padding duplication | content-card.tsx |
| F-35 | Layout default exports | layout/ |
| F-43 | Custom dropdown in ChatPanel | chat-panel.tsx |
| F-49 | Month grid calculation duplicated | edit-break.tsx, use-calendar-navigation.ts |
| F-51 | edit-break.tsx is 683 lines | edit-break.tsx |
| F-54 | Hardcoded gradient | attendance-cta.tsx |

---

---

## Statistics

| Metric | Count |
|--------|-------|
| Total findings | 56 (F-01 through F-56) |
| Critical | 2 (1 fixed during icon migration) |
| High | 12 |
| Medium | 24 |
| Low | 18 |
| Files affected | ~80+ across src/ |
| Redundant components identified | 4 (FAB, IconButton, AdminSwitch, ExtendedFAB) |
| Components that should use existing ui/ | 6 (custom tabs, progress, tooltips, status badge, labels, dropdown) |
| Shared components to extract | 1 (MemberPickerPopover) |
| Missing stories | 16 (all in admin/) |

*Document generated by comprehensive bottom-up audit. Findings numbered F-01 through F-56 for tracking.*
