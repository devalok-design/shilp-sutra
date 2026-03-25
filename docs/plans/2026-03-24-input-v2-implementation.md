# Input v2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rewrite Input with container-first architecture, section-based icons with automatic padding, per-size scaling, container-level focus ring, interactive sections, and backward-compatible deprecated aliases.

**Architecture:** The `<input>` element is stripped of all visual styling (border, bg, ring). A wrapper `<div>` handles all visual concerns. Sections are absolutely positioned within the wrapper. Padding on the input adjusts based on section presence. Focus-within on the wrapper provides the unified focus ring.

**Tech Stack:** React 18, TypeScript 5.7, CVA, shilp-sutra tokens, `<Icon>` system.

**Design Doc:** `docs/plans/2026-03-24-input-v2-design.md`

---

## Conventions

**File:** `packages/core/src/ui/input.tsx` (rewrite in place)
**Tests:** `packages/core/src/ui/__tests__/input.test.tsx`
**Stories:** `packages/core/src/ui/input.stories.tsx`
**Commit after each task.**

---

## Task Dependency Graph

```
Task 1 (Input rewrite) → Task 2 (SearchInput update)
Task 1 → Task 3 (tests)
Task 2 + 3 → Task 4 (migrate consumers)
Task 4 → Task 5 (stories)
Task 5 → Task 6 (docs)
```

Total: **6 tasks.**

---

## Phase 1: Core Rewrite

### Task 1: Rewrite Input component

**File:** `packages/core/src/ui/input.tsx`

Read the current file, then replace with the new architecture:

**CVA for the WRAPPER (not the input):**

```typescript
const inputWrapperVariants = cva(
  [
    'relative flex items-center w-full font-sans',
    'bg-surface-raised-hover text-surface-fg',
    'border border-surface-border',
    'hover:bg-surface-raised-active',
    'transition-[color,background-color,border-color,box-shadow] duration-fast-02 ease-productive-standard',
    'focus-within:outline-none focus-within:ring-2 focus-within:ring-accent-9 focus-within:ring-offset-2 focus-within:border-surface-border',
    'has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-action-disabled',
    'has-[:read-only]:bg-surface-raised has-[:read-only]:cursor-default',
  ],
  {
    variants: {
      size: {
        xs: 'h-ds-xs-plus rounded-ds-md text-ds-sm',
        sm: 'h-ds-sm rounded-ds-md text-ds-sm',
        md: 'h-ds-md rounded-ds-md text-ds-md',
        lg: 'h-ds-lg rounded-ds-lg text-ds-md',
      },
    },
    defaultVariants: { size: 'md' },
  },
)
```

**Section width per size (square = height - 2px for border):**

```typescript
const sectionWidthMap: Record<string, string> = {
  xs: 'w-[26px]',  // 28 - 2
  sm: 'w-[30px]',  // 32 - 2
  md: 'w-[38px]',  // 40 - 2
  lg: 'w-[46px]',  // 48 - 2
}
```

**Input padding per size (with/without sections):**

```typescript
const paddingMap: Record<string, { default: string; withStart: string; withEnd: string }> = {
  xs: { default: 'px-ds-02', withStart: 'pl-[26px]', withEnd: 'pr-[26px]' },
  sm: { default: 'px-ds-03', withStart: 'pl-[30px]', withEnd: 'pr-[30px]' },
  md: { default: 'px-ds-04', withStart: 'pl-[38px]', withEnd: 'pr-[38px]' },
  lg: { default: 'px-ds-05', withStart: 'pl-[46px]', withEnd: 'pr-[46px]' },
}
```

**Icon size per input size:**

```typescript
import type { IconSize } from './icon-context'

const iconSizeMap: Record<string, IconSize> = {
  xs: 'xs',  // 14px
  sm: 'sm',  // 16px
  md: 'md',  // 18px
  lg: 'lg',  // 20px
}
```

**The component:**

```tsx
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, state: stateProp, size = 'md',
     startSection, endSection, startSectionClickable, endSectionClickable,
     startIcon, endIcon, // deprecated aliases
     ...props }, ref) => {

    const fieldCtx = useFormField()
    const state = stateProp ?? (fieldCtx.state === 'helper' ? undefined : fieldCtx.state as InputState | undefined)
    const ariaDescribedBy = props['aria-describedby'] ?? fieldCtx.helperTextId
    const ariaRequired = props['aria-required'] ?? fieldCtx.required

    // Backward compat: map deprecated props
    const resolvedStartSection = startSection ?? startIcon
    const resolvedEndSection = endSection ?? endIcon

    const pad = paddingMap[size]
    const hasStart = !!resolvedStartSection
    const hasEnd = !!resolvedEndSection

    return (
      <div
        className={cn(
          inputWrapperVariants({ size }),
          state === 'error' && 'border-error-7 focus-within:ring-error-7',
          state === 'warning' && 'border-warning-7 focus-within:ring-warning-7',
          state === 'success' && 'border-success-7 focus-within:ring-success-7',
          className,
        )}
      >
        {/* Start section */}
        {hasStart && (
          <span
            className={cn(
              'absolute left-0 top-0 h-full flex items-center justify-center text-surface-fg-muted',
              sectionWidthMap[size],
              !startSectionClickable && 'pointer-events-none',
            )}
          >
            <IconProvider size={iconSizeMap[size]}>
              {resolvedStartSection}
            </IconProvider>
          </span>
        )}

        {/* The actual input — no visual styling */}
        <input
          type={type}
          className={cn(
            'w-full h-full bg-transparent outline-none placeholder:text-surface-fg-subtle',
            pad.default,
            hasStart && pad.withStart,
            hasEnd && pad.withEnd,
          )}
          aria-invalid={state === 'error' || undefined}
          aria-describedby={ariaDescribedBy}
          aria-required={ariaRequired || undefined}
          ref={ref}
          {...props}
        />

        {/* End section */}
        {hasEnd && (
          <span
            className={cn(
              'absolute right-0 top-0 h-full flex items-center justify-center text-surface-fg-muted',
              sectionWidthMap[size],
              !endSectionClickable && 'pointer-events-none',
            )}
          >
            <IconProvider size={iconSizeMap[size]}>
              {resolvedEndSection}
            </IconProvider>
          </span>
        )}
      </div>
    )
  },
)
```

**IMPORTANT:** Import `IconProvider` from `./icon-context` for auto-sizing icons in sections.

**IMPORTANT:** Remove the `motion.input` wrapper — the current Input uses Framer Motion's `motion.input` but there's no animation on the input itself. The wrapper handles transitions now. Use a plain `<input>` to avoid unnecessary Framer Motion bundle cost.

**className handling (CRITICAL):** `className` stays on the `<input>` element (not wrapper) for backward compat. New `wrapperClassName` prop targets the wrapper div. This preserves all existing consumer contracts:

```typescript
interface InputProps {
  // ...existing props...
  /** Classes for the wrapper div (border, bg, ring). */
  wrapperClassName?: string
  // className continues to target the <input> element
}
```

**Export:** Export `inputWrapperVariants` as the new wrapper CVA. Keep `inputVariants` as a deprecated re-export pointing to `inputWrapperVariants` with a JSDoc deprecation note. Document that the semantics changed (now targets wrapper, not input).

**Test fix (CRITICAL):** Update existing tests in the SAME COMMIT as the rewrite (not a later task). The `h-ds-xs-plus` assertion needs to check the wrapper, not the input. The `className` assertion needs to verify it's on the input.

**SidebarInput fix (CRITICAL):** Explicitly include `packages/core/src/ui/sidebar.tsx` in Task 4 migration. Change SidebarInput's `className` to `wrapperClassName` for the wrapper-level overrides, and keep input-level classes on `className`.

**focus-within vs focus-visible-within (WARNING W4):** Use `:focus-within:has(:focus-visible)` (CSS nesting) to only show the ring on keyboard focus, not mouse clicks on section buttons. If browser support is insufficient, fall back to `:focus-within` (current behavior) and document the tradeoff.

**SearchInput loading (WARNING W2):** Task 2 MUST preserve the `loading` prop, `aria-busy`, and Spinner behavior from the current SearchInput. The simplification only removes icon positioning code, not features.

**board-toolbar endSectionClickable (WARNING W1):** Task 4 migration list must include `board-toolbar.tsx` with explicit `endSectionClickable` addition.

**NumberInput note (INFO I1):** Removed incorrect claim that NumberInput wraps Input. It renders its own `<input>` directly.

**task-panel-wing-properties (INFO I7):** Added to Task 4 migration scope.

**Verify:** `pnpm --filter @devalok/shilp-sutra typecheck`

**Commit:** `feat(core): Input v2 — container focus ring, section-based icons, per-size scaling`

---

### Task 2: Update SearchInput

**File:** `packages/core/src/ui/search-input.tsx`

Read the file. SearchInput currently wraps Input and adds its own search icon + clear button logic. After Input v2, simplify it to just pass `startSection` and `endSection`:

```tsx
<Input
  ref={ref}
  size={size}
  startSection={<Icon icon={IconSearch} />}
  endSection={value ? (
    <Button variant="ghost" size="icon-xs" onClick={onClear} aria-label="Clear search">
      <Icon icon={IconX} />
    </Button>
  ) : null}
  endSectionClickable={!!value}
  placeholder={placeholder ?? 'Search...'}
  value={value}
  onChange={onChange}
  {...props}
/>
```

Remove any icon positioning logic that was duplicating Input's work.

**Verify:** `pnpm --filter @devalok/shilp-sutra typecheck`

**Commit:** `refactor(core): SearchInput simplified — delegates to Input v2 sections`

---

## Phase 2: Tests + Migration

### Task 3: Tests

**File:** Create or update `packages/core/src/ui/__tests__/input.test.tsx`

Test cases:
- Renders a basic input
- Wrapper gets focus-within ring when input is focused
- startSection renders and input gets adjusted left padding
- endSection renders and input gets adjusted right padding
- Both sections simultaneously
- State error applies error border to wrapper
- Disabled input disables wrapper styling
- startSectionClickable enables pointer-events
- Deprecated startIcon prop still works
- Icon auto-sizes via IconProvider in sections

**Verify:** `pnpm --filter @devalok/shilp-sutra test -- --run -- input`

**Commit:** `test(core): Input v2 — container focus, sections, states, backward compat`

---

### Task 4: Migrate consumers

Find all files using Input's old `startIcon`/`endIcon`:

```bash
grep -rn "startIcon\|endIcon" packages/ --include="*.tsx" | grep -i "input" | grep -v "test\|stories\|node_modules\|button\|\.d\.ts"
```

For each, migrate to `startSection`/`endSection`:
- `startIcon={<IconSearch />}` → `startSection={<Icon icon={IconSearch} />}`
- `endIcon={<IconCopy />}` → `endSection={<Icon icon={IconCopy} />}`

**Key files likely affected:**
- `packages/core/src/ui/search-input.tsx` (already done in Task 2)
- `packages/core/src/composed/command-palette.tsx`
- `packages/karm/src/board/board-toolbar.tsx`
- Any other file passing icons to Input

**Verify:**
```
pnpm --filter @devalok/shilp-sutra typecheck
pnpm --filter @devalok/shilp-sutra-karm typecheck
```

**Commit:** `refactor: migrate Input consumers to startSection/endSection`

---

## Phase 3: Stories + Docs

### Task 5: Stories

**File:** Rewrite `packages/core/src/ui/input.stories.tsx`

Stories:
1. **Default** — basic input with controls
2. **Sizes** — xs through lg side by side
3. **WithSearchIcon** — startSection with Icon
4. **WithClearButton** — endSection with clickable clear (endSectionClickable)
5. **BothSections** — start icon + end button
6. **TextPrefix** — startSection with "$" text
7. **States** — error, warning, success
8. **Disabled** — disabled state
9. **FocusRing** — shows container-level focus ring (instruction to click/tab in)
10. **WithGrain** — DevalokGrain on the wrapper (just to prove it works, not recommended for production)

**Commit:** `feat(core): Input v2 stories — sections, states, sizes, focus ring`

---

### Task 6: Docs

**File:** Update `CHANGELOG.md`, `packages/core/llms.txt`

CHANGELOG:
- Added: Input v2 — container-level focus ring, section-based icons, per-size scaling
- Added: `startSection`/`endSection` props (replace `startIcon`/`endIcon`)
- Added: `startSectionClickable`/`endSectionClickable` for interactive sections
- Deprecated: `startIcon`/`endIcon` (kept as aliases)

**Commit:** `docs(core): CHANGELOG + llms.txt — Input v2`

---

## Summary

| Task | What | Files |
|------|------|-------|
| 1 | Input rewrite | input.tsx |
| 2 | SearchInput update | search-input.tsx |
| 3 | Tests | input.test.tsx |
| 4 | Migrate consumers | core + karm files |
| 5 | Stories | input.stories.tsx |
| 6 | Docs | CHANGELOG, llms.txt |
