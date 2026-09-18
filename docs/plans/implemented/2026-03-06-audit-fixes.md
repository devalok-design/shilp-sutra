# Design System Audit Fixes — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all critical and important issues found in the design system audit, organized into parallelizable phases.

**Architecture:** Phase 1 is safe, non-breaking fixes. Phase 2 is API consistency (breaking changes to Chip). Phase 3 is feature additions. Phase 4 is build/packaging fixes. Each task is independent within its phase.

**Tech Stack:** React 18, TypeScript 5.7, CVA, Tailwind 3.4, Vitest + RTL

---

## Phase 1: Non-Breaking Fixes (all independent — parallelize)

### Task 1: Fix twMerge config for full text-ds-* scale

**Files:**
- Modify: `packages/core/src/ui/lib/utils.ts`
- Test: Run `pnpm --filter @devalok/shilp-sutra test`

**Step 1: Fix the incomplete classGroups**

```ts
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ 'text-ds': ['xs', 'sm', 'md', 'base', 'lg', 'xl', '2xl', '3xl'] }],
    },
  },
})
```

**Step 2: Run tests to verify no regressions**

Run: `pnpm --filter @devalok/shilp-sutra test`

**Step 3: Commit**

```
fix(core): complete twMerge config for all text-ds-* font sizes
```

---

### Task 2: TopBar — use `<header>` instead of `<div>`

**Files:**
- Modify: `packages/core/src/shell/top-bar.tsx:96`
- Modify: `packages/core/src/shell/top-bar.test.tsx` (update any selectors)

**Step 1: Change the root element from `<div>` to `<header>`**

In `top-bar.tsx`, change line 96 and update the interface:

```tsx
// Change TopBarProps to extend HTMLAttributes<HTMLElement> instead of HTMLDivElement
export interface TopBarProps
  extends React.HTMLAttributes<HTMLElement> {
```

Change line 96 from `<div` to `<header` and line 244 from `</div>` to `</header>`.

Change the forwardRef generic from `HTMLDivElement` to `HTMLElement`.

**Step 2: Update tests if they query by div role**

**Step 3: Run tests**

Run: `pnpm --filter @devalok/shilp-sutra test`

**Step 4: Commit**

```
fix(shell): use <header> landmark in TopBar for WCAG 1.3.1
```

---

### Task 3: AlertDialogHeader/Footer — add forwardRef

**Files:**
- Modify: `packages/core/src/ui/alert-dialog.tsx:47-73`

**Step 1: Wrap in forwardRef to match Dialog counterparts**

```tsx
const AlertDialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col space-y-ds-02b text-center sm:text-left',
      className,
    )}
    {...props}
  />
))
AlertDialogHeader.displayName = 'AlertDialogHeader'

const AlertDialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-ds-03',
      className,
    )}
    {...props}
  />
))
AlertDialogFooter.displayName = 'AlertDialogFooter'
```

**Step 2: Run tests**

**Step 3: Commit**

```
fix(ui): add forwardRef to AlertDialogHeader and AlertDialogFooter
```

---

### Task 4: TableCell — fix padding mismatch with TableHead

**Files:**
- Modify: `packages/core/src/ui/table.tsx:91`

**Step 1: Add horizontal padding to TableCell to match TableHead**

Change line 91-92 from:
```tsx
"py-ds-03 px-0 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
```
To:
```tsx
"py-ds-03 px-ds-03 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
```

**Step 2: Run tests**

**Step 3: Commit**

```
fix(ui): align TableCell horizontal padding with TableHead
```

---

### Task 5: Collapse transition — use duration prop instead of hardcoded 300ms

**Files:**
- Modify: `packages/core/src/ui/transitions.tsx:46`

**Step 1: Parse duration and use it for the timer**

Replace the Collapse useEffect (lines 42-51):

```tsx
React.useEffect(() => {
  if (!contentRef.current) return
  const durationMs = parseDuration(duration || 'var(--duration-moderate-02)')
  if (open) {
    setHeight(contentRef.current.scrollHeight)
    const timer = setTimeout(() => setHeight(undefined), durationMs)
    return () => clearTimeout(timer)
  } else {
    setHeight(contentRef.current.scrollHeight)
    requestAnimationFrame(() => setHeight(0))
  }
}, [open, duration])
```

Add helper at the top of the file:

```tsx
/** Parse CSS duration string to milliseconds. Falls back to 300ms for CSS variables. */
function parseDuration(d: string): number {
  if (d.endsWith('ms')) return parseInt(d, 10) || 300
  if (d.endsWith('s')) return (parseFloat(d) || 0.3) * 1000
  return 300 // fallback for CSS variables
}
```

**Step 2: Run tests**

**Step 3: Commit**

```
fix(ui): use duration prop in Collapse transition timer
```

---

### Task 6: ContentCard — handle `padding="none"` explicitly

**Files:**
- Modify: `packages/core/src/composed/content-card.tsx:39-45`

**Step 1: Add `'none'` case to getContentPadding**

```tsx
const getContentPadding = (padding: string | null | undefined) => {
  switch (padding) {
    case 'none': return ''
    case 'compact': return 'p-ds-04'
    case 'spacious': return 'p-ds-06'
    default: return 'p-ds-05b'
  }
}
```

Also update `getPadding` similarly:

```tsx
const getPadding = (padding: string | null | undefined) => {
  switch (padding) {
    case 'none': return ''
    case 'compact': return 'px-ds-04 py-ds-03'
    case 'spacious': return 'px-ds-06 py-ds-05'
    default: return 'px-ds-05b py-ds-04'
  }
}
```

**Step 2: Run tests**

**Step 3: Commit**

```
fix(composed): handle padding="none" explicitly in ContentCard
```

---

### Task 7: PageSkeletons — accept className and rest props

**Files:**
- Modify: `packages/core/src/composed/page-skeletons.tsx`

**Step 1: Add props type and accept className + rest**

For each skeleton component, change from:

```tsx
const DashboardSkeleton = React.forwardRef<HTMLDivElement>(
  function DashboardSkeleton(_props, ref) {
  return (
    <div ref={ref} className="flex flex-col gap-ds-06">
```

To:

```tsx
const DashboardSkeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function DashboardSkeleton({ className, ...props }, ref) {
  return (
    <div ref={ref} className={cn('flex flex-col gap-ds-06', className)} {...props}>
```

Apply the same pattern to `ProjectListSkeleton` and `TaskDetailSkeleton`. Import `cn` at the top (already imported).

**Step 2: Run tests**

**Step 3: Commit**

```
fix(composed): accept className and HTML attributes in PageSkeletons
```

---

### Task 8: PriorityIndicator — add aria-label to compact mode

**Files:**
- Modify: `packages/core/src/composed/priority-indicator.tsx:70-84`

**Step 1: Add aria-label alongside title**

In the compact return (line 70-84), add `aria-label`:

```tsx
if (display === 'compact') {
  return (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-ds-md p-ds-02',
        config.bgColor,
        className,
      )}
      title={config.label}
      aria-label={config.label}
      {...props}
    >
      <Icon className={cn('h-ico-sm w-ico-sm', config.color)} stroke={2} />
    </div>
  )
}
```

**Step 2: Run tests**

**Step 3: Commit**

```
fix(composed): add aria-label to PriorityIndicator compact mode
```

---

### Task 9: BottomNavbar — fix overlay role and remove user gate

**Files:**
- Modify: `packages/core/src/shell/bottom-navbar.tsx:121,127-137`

**Step 1: Remove the `if (!user) return null` gate (line 121)**

Delete line 121. The bottom navbar should render for all users.

**Step 2: Fix overlay role from `role="button"` to proper backdrop**

Change lines 127-137 from:
```tsx
<div
  role="button"
  tabIndex={0}
  className="fixed inset-0 z-overlay md:hidden"
  onClick={() => setShowMore(false)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setShowMore(false)
    }
  }}
>
```

To:
```tsx
{/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- backdrop overlay */}
<div
  aria-hidden="true"
  className="fixed inset-0 z-overlay md:hidden"
  onClick={() => setShowMore(false)}
>
```

**Step 3: Run tests**

**Step 4: Commit**

```
fix(shell): fix BottomNavbar overlay role and remove user gate
```

---

### Task 10: Shell barrel — re-export SidebarProvider and useSidebar

**Files:**
- Modify: `packages/core/src/shell/index.ts`

**Step 1: Add re-exports**

Add after the existing imports:

```ts
// Re-export sidebar primitives needed for shell layout composition
export { SidebarProvider, SidebarInset, useSidebar } from '../ui/sidebar'
```

**Step 2: Run build to verify no circular deps**

Run: `pnpm --filter @devalok/shilp-sutra build`

**Step 3: Commit**

```
fix(shell): re-export SidebarProvider, SidebarInset, and useSidebar from shell barrel
```

---

### Task 11: Export cardVariants from UI barrel

**Files:**
- Modify: `packages/core/src/ui/index.ts:132`

**Step 1: Add cardVariants to the export**

Change line 132 from:
```ts
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, type CardProps } from './card'
```
To:
```ts
export { Card, cardVariants, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, type CardProps } from './card'
```

**Step 2: Commit**

```
fix(ui): export cardVariants from barrel index
```

---

### Task 12: Slider — support range mode with multiple thumbs

**Files:**
- Modify: `packages/core/src/ui/slider.tsx`

**Step 1: Render thumbs based on value array length**

Replace the single-thumb Slider with a dynamic version:

```tsx
const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, value, defaultValue, 'aria-label': ariaLabel, ...props }, ref) => {
  // Determine number of thumbs from value or defaultValue
  const thumbCount = value?.length ?? defaultValue?.length ?? 1

  return (
    <SliderPrimitive.Root
      ref={ref}
      value={value}
      defaultValue={defaultValue}
      className={cn(
        'relative flex w-full touch-none select-none items-center',
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-ds-02b w-full grow overflow-hidden rounded-ds-full bg-field">
        <SliderPrimitive.Range className="absolute h-full bg-interactive" />
      </SliderPrimitive.Track>
      {Array.from({ length: thumbCount }).map((_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          aria-label={Array.isArray(ariaLabel) ? ariaLabel[i] : ariaLabel}
          className="block h-ico-sm w-ico-sm rounded-ds-full border-2 border-interactive bg-layer-01 shadow-01 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-[0.38]"
        />
      ))}
    </SliderPrimitive.Root>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName
```

**Step 2: Run tests**

**Step 3: Commit**

```
fix(ui): support range mode in Slider by rendering dynamic thumbs
```

---

## Phase 2: API Consistency — Chip Alignment (sequential, breaking)

### Task 13: Align Chip variant naming with Badge

**Files:**
- Modify: `packages/core/src/ui/chip.tsx`
- Modify: All files importing Chip with `variant="filled"` or `variant="outlined"` or `onDelete` or `color="primary"`
- Search: `grep -r "variant=\"filled\"\|variant=\"outlined\"\|onDelete\|color=\"primary\"" packages/`

This is a **breaking change**. Rename:
- `variant="filled"` → `variant="solid"` (matches Badge)
- `variant="outlined"` → `variant="outline"` (matches Badge)
- `onDelete` → `onDismiss` (matches Badge)
- `color="primary"` → `color="brand"` (matches Badge)
- `label` prop stays (intentional design — Chip is label-only, not composable)

**Step 1: Search for all usages of old names**

Run: `grep -rn "variant=\"filled\"\|variant=\"outlined\"\|onDelete\|color=\"primary\"" packages/`

Also check stories and tests.

**Step 2: Update CVA variants in chip.tsx**

Change `chipVariants`:
- `filled:` → `solid:`
- `outlined:` → `outline:`

Change compoundVariants:
- All `variant: 'filled'` → `variant: 'solid'`
- All `variant: 'outlined'` → `variant: 'outline'`

Change defaultVariants:
- `variant: 'filled'` → `variant: 'solid'`

Update `ChipColor` type: replace `primary` with `brand`.

Change compoundVariants: `color: 'primary'` → `color: 'brand'`

**Step 3: Rename `onDelete` → `onDismiss` in ChipProps and implementation**

```tsx
type ChipProps = Omit<VariantProps<typeof chipVariants>, 'color'> & {
  label: string
  color?: ChipColor
  icon?: React.ReactNode
  onClick?: React.MouseEventHandler
  onDismiss?: () => void  // was onDelete
  disabled?: boolean
  className?: string
}
```

Update the component body: `onDelete` → `onDismiss` everywhere.

**Step 4: Extend ChipProps with HTMLAttributes for data-*/aria-* support**

```tsx
type ChipProps = Omit<VariantProps<typeof chipVariants>, 'color'> &
  Omit<React.HTMLAttributes<HTMLElement>, 'color' | 'children'> & {
  label: string
  color?: ChipColor
  icon?: React.ReactNode
  onDismiss?: () => void
  disabled?: boolean
}
```

**Step 5: Update JSDoc**

Update the JSDoc to reflect new naming.

**Step 6: Update all consumers** (stories, tests, karm components)

Search and replace across the codebase.

**Step 7: Run all tests**

Run: `pnpm test`

**Step 8: Commit**

```
feat(ui)!: align Chip API with Badge — solid/outline variants, onDismiss, brand color

BREAKING CHANGE: Chip variant "filled" renamed to "solid", "outlined" renamed to "outline".
Chip onDelete renamed to onDismiss. Chip color "primary" renamed to "brand".
```

---

## Phase 3: Feature Additions (independent — parallelize)

### Task 14: CommandPalette — add controlled open/onOpenChange props

**Files:**
- Modify: `packages/core/src/composed/command-palette.tsx`

**Step 1: Add optional controlled props**

Update `CommandPaletteProps`:

```tsx
export interface CommandPaletteProps {
  groups?: CommandGroup[]
  placeholder?: string
  onSearch?: (query: string) => void
  emptyMessage?: string
  /** Controlled open state. If omitted, the palette manages its own open state. */
  open?: boolean
  /** Callback when open state changes (controlled or uncontrolled). */
  onOpenChange?: (open: boolean) => void
}
```

**Step 2: Implement controllable state**

Replace `const [open, setOpen] = React.useState(false)` with:

```tsx
const [internalOpen, setInternalOpen] = React.useState(false)
const isControlled = controlledOpen !== undefined
const open = isControlled ? controlledOpen : internalOpen
const setOpen = React.useCallback((value: boolean | ((prev: boolean) => boolean)) => {
  const next = typeof value === 'function' ? value(open) : value
  if (!isControlled) setInternalOpen(next)
  onOpenChange?.(next)
}, [isControlled, open, onOpenChange])
```

(Rename the destructured `open` prop to `controlledOpen` in the parameter list.)

**Step 3: Run tests**

**Step 4: Commit**

```
feat(composed): add controlled open/onOpenChange to CommandPalette
```

---

### Task 15: Button — expand color axis

**Files:**
- Modify: `packages/core/src/ui/button.tsx`
- Test: Update button tests and stories

**Step 1: Add success and warning colors to buttonVariants**

Add to the `color` variants object:

```tsx
color: {
  default: '',
  error: '',
  success: '',
  warning: '',
},
```

Add compound variants for the new colors:

```tsx
// solid + success
{ variant: 'solid', color: 'success', className: 'bg-success text-text-on-color hover:bg-success-hover active:bg-success-hover shadow-01' },
// outline + success
{ variant: 'outline', color: 'success', className: 'bg-transparent text-success border border-border-success hover:bg-success-surface active:bg-success-surface' },
// ghost + success
{ variant: 'ghost', color: 'success', className: 'bg-transparent text-success hover:bg-success-surface active:bg-success-surface' },
// solid + warning
{ variant: 'solid', color: 'warning', className: 'bg-warning text-text-on-color hover:bg-warning-hover active:bg-warning-hover shadow-01' },
// outline + warning
{ variant: 'outline', color: 'warning', className: 'bg-transparent text-warning border border-border-warning hover:bg-warning-surface active:bg-warning-surface' },
// ghost + warning
{ variant: 'ghost', color: 'warning', className: 'bg-transparent text-warning hover:bg-warning-surface active:bg-warning-surface' },
```

**Step 2: Update ButtonProps JSDoc to document new colors**

**Step 3: Run tests**

**Step 4: Commit**

```
feat(ui): add success and warning color variants to Button
```

---

### Task 16: Export missing Props types from UI barrel

**Files:**
- Modify: `packages/core/src/ui/radio.tsx` — add and export `RadioGroupProps`, `RadioGroupItemProps`
- Modify: `packages/core/src/ui/toggle.tsx` — add and export `ToggleProps`
- Modify: `packages/core/src/ui/toggle-group.tsx` — add and export `ToggleGroupProps`, `ToggleGroupItemProps`
- Modify: `packages/core/src/ui/separator.tsx` — add and export `SeparatorProps`
- Modify: `packages/core/src/ui/accordion.tsx` — add and export `AccordionProps` etc.
- Modify: `packages/core/src/ui/index.ts` — add all new type exports

For each component, add a type alias and export it:

```tsx
// Example for radio.tsx
export type RadioGroupProps = React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
export type RadioGroupItemProps = React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
```

Then add to index.ts barrel:

```ts
export { RadioGroup, RadioGroupItem, type RadioGroupProps, type RadioGroupItemProps } from './radio'
export { Toggle, toggleVariants, type ToggleProps } from './toggle'
// etc.
```

**Commit:**

```
feat(ui): export Props types for RadioGroup, Toggle, Separator, Accordion, and more
```

---

## Phase 4: Build & Packaging Fixes

### Task 17: Fix Karm .d.ts SegmentedControl path + remove re-export

**Files:**
- Modify: `packages/karm/src/index.ts` — remove SegmentedControl re-export
- Run: `pnpm --filter @devalok/shilp-sutra-karm build`
- Verify: `dist/index.d.ts` no longer has `../../core/src/` paths

**Step 1: Remove the SegmentedControl re-export from karm/src/index.ts**

Delete lines 103-113 (the SegmentedControl re-export block).

**Step 2: Update any karm components that import SegmentedControl via the barrel**

If any karm source files import SegmentedControl from `../index` or similar, change them to import from `@/ui/segmented-control` directly.

**Step 3: Build and verify**

Run: `pnpm --filter @devalok/shilp-sutra-karm build`

Check `dist/index.d.ts` for any remaining `../../core/src/` paths.

**Step 4: Commit**

```
fix(karm): remove SegmentedControl re-export to fix broken .d.ts paths
```

---

## Verification

After all phases, run the full CI pipeline:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

All must pass before committing the final state.
