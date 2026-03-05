# AI-Friendliness Improvements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make shilp-sutra maximally usable by AI coding assistants (Claude, Cursor, Copilot) by eliminating silent failure modes, adding inline `@example` JSDoc, fixing barrel export gaps, and preventing documentation drift.

**Architecture:** Pure documentation + minor type exports + one CVA rename. No runtime behavior changes. Every task is independently committable. Tasks 1–9 are Tier 1 (critical, one day). Tasks 10–12 are Tier 2 (systematic, one sprint).

**Tech Stack:** TypeScript JSDoc, CVA, Storybook autodocs, pnpm, Vitest

**Test command:** `pnpm tsc --noEmit && pnpm test --run`

---

## Background: What This Plan Fixes

Council audit identified these ranked footguns (silent AI failures):

| # | Footgun | Severity | TypeScript catches? |
|---|---------|----------|---------------------|
| 1 | `<Select size="lg">` silently ignored — `size` must go on `<SelectTrigger>` | Critical | No |
| 2 | Toast notification setup: `toast()` called without `<Toaster>` mounted | Critical | No |
| 3 | No `@example` JSDoc on 87/89 ui/ components | Critical | No |
| 4 | `karam`/`destructive` variant names in memory notes — non-existent in source | Critical | No |
| 5 | `<Progress color="danger">` should be `color="error"` | High | Yes |
| 6 | Alert vs Banner vs Toast — no selection guide anywhere | High | No |
| 7 | `<Chip color="success">` vs `<Badge variant="success">` — different prop for same concept | High | Yes (wrong key) |
| 8 | `<Chip>Text</Chip>` fails — must use `label="Text"` | Medium | Yes (loud) |
| 9 | `TabsContentProps`, `TabsProps` not in barrel | Medium | No |
| 10 | `SelectTriggerProps` not in barrel | Medium | No |
| 11 | `getFormFieldA11y` never demonstrated in stories | Medium | No |
| 12 | Chip stories `size` argTypes missing `lg` | Low | No |

---

## Task 1: Fix `Progress color="danger"` → `color="error"`

**Why:** Every other component uses `error` (Button, Alert, Input, Chip, Toast). Progress alone uses `danger`. An AI generating error state UI will use `color="error"` on Progress — which silently falls through to the default style.

**Files:**
- Modify: `src/ui/progress.tsx:33`
- Modify: `src/ui/progress.stories.tsx` (update any `danger` references)

**Step 1: Verify current usage**

```bash
grep -r 'color.*danger\|danger.*color' src/ --include="*.tsx" --include="*.ts"
```

Expected: Matches only in `progress.tsx` and its stories.

**Step 2: Rename in source**

In `src/ui/progress.tsx`, change the CVA variant key:

```typescript
// BEFORE (line 33):
danger: 'bg-error',

// AFTER:
error: 'bg-error',
```

**Step 3: Update progress.stories.tsx**

Find any story using `color="danger"` and rename to `color="error"`. Run:

```bash
grep -n 'danger' src/ui/progress.stories.tsx
```

Update each occurrence from `danger` to `error`.

**Step 4: TypeScript check**

```bash
pnpm tsc --noEmit
```

Expected: Zero errors.

**Step 5: Run tests**

```bash
pnpm test --run src/ui/progress
```

Expected: All pass.

**Step 6: Commit**

```bash
git add src/ui/progress.tsx src/ui/progress.stories.tsx
git commit -m "fix(progress): rename color='danger' to color='error' for consistency"
```

---

## Task 2: Export `SelectTriggerProps` from barrel + JSDoc on Select

**Why:** The barrel (`src/ui/index.ts`) exports all Select components but zero types. An AI cannot discover that `size` exists on `SelectTrigger` without reading the source file. Also, `<Select size="lg">` silently ignores the prop since Select = Radix Root which accepts arbitrary HTML attributes.

**Files:**
- Modify: `src/ui/index.ts:23-34` (add type export)
- Modify: `src/ui/select.tsx:8` (add JSDoc to Select const)
- Modify: `src/ui/select.tsx:28` (add JSDoc to SelectTriggerProps)

**Step 1: Add type to barrel**

In `src/ui/index.ts`, change the Select block (currently lines 23-34):

```typescript
// BEFORE:
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from './select'

// AFTER:
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  SelectScrollUpButton,
  SelectScrollDownButton,
  type SelectTriggerProps,
} from './select'
```

**Step 2: Add JSDoc to `Select` in `select.tsx`**

```typescript
// BEFORE (line 8):
const Select = SelectPrimitive.Root

// AFTER:
/**
 * Select root — manages open/close state and selected value.
 *
 * **Important:** `size` is NOT a prop on `Select`. Set it on `SelectTrigger` instead.
 *
 * @example
 * // CORRECT — size goes on SelectTrigger:
 * <Select onValueChange={setValue}>
 *   <SelectTrigger size="lg">
 *     <SelectValue placeholder="Choose..." />
 *   </SelectTrigger>
 *   <SelectContent>
 *     <SelectItem value="a">Option A</SelectItem>
 *   </SelectContent>
 * </Select>
 *
 * // WRONG — size on Select root is silently ignored:
 * <Select size="lg">  {/* ← produces no TypeScript error but has no effect */}
 */
const Select = SelectPrimitive.Root
```

**Step 3: Add JSDoc to `SelectTriggerProps`**

```typescript
// BEFORE (line 28):
export interface SelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>,
    VariantProps<typeof selectTriggerVariants> {}

// AFTER:
/**
 * Props for SelectTrigger. Size variants: `sm` | `md` (default) | `lg`.
 *
 * @example
 * <SelectTrigger size="lg">
 *   <SelectValue placeholder="Select an option" />
 * </SelectTrigger>
 */
export interface SelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>,
    VariantProps<typeof selectTriggerVariants> {}
```

**Step 4: TypeScript check**

```bash
pnpm tsc --noEmit
```

Expected: Zero errors.

**Step 5: Commit**

```bash
git add src/ui/index.ts src/ui/select.tsx
git commit -m "fix(select): export SelectTriggerProps from barrel + JSDoc on Select size trap"
```

---

## Task 3: Export `TabsContentProps` and `TabsProps` from barrel

**Why:** `src/ui/index.ts:119` exports `TabsListProps` and `TabsTriggerProps` but not `TabsContentProps` (which is an anonymous `React.ComponentPropsWithoutRef<...>`). `TabsProps` doesn't exist at all since `Tabs = TabsPrimitive.Root`. Both are needed for consumers writing typed wrapper components.

**Files:**
- Modify: `src/ui/tabs.tsx` (add TabsContentProps typedef + TabsProps + JSDoc on TabsList)
- Modify: `src/ui/index.ts:119` (add type exports)

**Step 1: Add named types to `tabs.tsx`**

In `src/ui/tabs.tsx`, add after line 6 (`const Tabs = TabsPrimitive.Root`):

```typescript
const Tabs = TabsPrimitive.Root

/** Props for the Tabs root. Passes `defaultValue`, `value`, `onValueChange` to Radix. */
export type TabsProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
```

And add after the `TabsContent` forwardRef definition (before `TabsContent.displayName = ...`):

```typescript
/** Props for TabsContent. Use `value` to match its triggering TabsTrigger. */
export type TabsContentProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
```

**Step 2: Add JSDoc to `TabsList` explaining context propagation**

In `tabs.tsx`, update the `TabsListProps` interface (currently line 43):

```typescript
/**
 * TabsList — container for TabsTrigger items. Sets the `variant` for all child triggers via context.
 *
 * **Compound structure:**
 * ```
 * <Tabs defaultValue="tab1">
 *   <TabsList variant="contained">      ← variant propagates to triggers via context
 *     <TabsTrigger value="tab1">Tab 1</TabsTrigger>
 *     <TabsTrigger value="tab2">Tab 2</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="tab1">Content 1</TabsContent>
 *   <TabsContent value="tab2">Content 2</TabsContent>
 * </Tabs>
 * ```
 *
 * `variant` on TabsList is NOT required on individual TabsTriggers — context handles it.
 */
export interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
    VariantProps<typeof tabsListVariants> {}
```

**Step 3: Update barrel**

In `src/ui/index.ts:119`, change:

```typescript
// BEFORE:
export { Tabs, TabsList, TabsTrigger, TabsContent, type TabsListProps, type TabsTriggerProps } from './tabs'

// AFTER:
export { Tabs, TabsList, TabsTrigger, TabsContent, type TabsProps, type TabsListProps, type TabsTriggerProps, type TabsContentProps } from './tabs'
```

**Step 4: TypeScript check**

```bash
pnpm tsc --noEmit
```

Expected: Zero errors.

**Step 5: Run tabs tests**

```bash
pnpm test --run src/ui/tabs
```

Expected: All pass.

**Step 6: Commit**

```bash
git add src/ui/tabs.tsx src/ui/index.ts
git commit -m "fix(tabs): export TabsContentProps + TabsProps + JSDoc on compound structure"
```

---

## Task 4: Fix `form.stories.tsx` ErrorState to show accessible pattern

**Why:** The `ErrorState` story currently sets `state="error"` on both `Input` and `FormHelperText` but does NOT wire `aria-describedby` / `aria-invalid` via `getFormFieldA11y`. This means the official Storybook demo models an inaccessible pattern. Every AI reading autodocs will copy the broken pattern.

**Files:**
- Modify: `src/ui/form.stories.tsx:1-35`

**Step 1: Update imports**

```typescript
// BEFORE (line 2):
import { FormField, FormHelperText } from './form'

// AFTER:
import { FormField, FormHelperText, getFormFieldA11y } from './form'
```

**Step 2: Replace `ErrorState` story**

```typescript
// BEFORE (lines 25-35):
export const ErrorState: Story = {
  render: () => (
    <FormField className="max-w-sm">
      <Label htmlFor="email" required>
        Email
      </Label>
      <Input id="email" state="error" defaultValue="not-an-email" />
      <FormHelperText state="error">Please enter a valid email address.</FormHelperText>
    </FormField>
  ),
}

// AFTER:
export const ErrorState: Story = {
  render: () => {
    const helperTextId = 'email-error-hint'
    return (
      <FormField className="max-w-sm" state="error">
        <Label htmlFor="email" required>
          Email
        </Label>
        <Input
          id="email"
          state="error"
          defaultValue="not-an-email"
          {...getFormFieldA11y(helperTextId, 'error')}
        />
        <FormHelperText id={helperTextId} state="error">
          Please enter a valid email address.
        </FormHelperText>
      </FormField>
    )
  },
}
```

**Step 3: Also update `WarningState` and `SuccessState` stories the same way for completeness**

Apply the same pattern to `WarningState` (use `helperTextId = 'password-warning-hint'`) and `SuccessState` (use `helperTextId = 'username-success-hint'`), calling `getFormFieldA11y(helperTextId, 'warning')` and `getFormFieldA11y(helperTextId, 'success')` respectively.

**Step 4: Run tests**

```bash
pnpm test --run
```

Expected: All pass (no runtime tests for stories, but TypeScript must compile).

**Step 5: TypeScript check**

```bash
pnpm tsc --noEmit
```

Expected: Zero errors.

**Step 6: Commit**

```bash
git add src/ui/form.stories.tsx
git commit -m "fix(form): show complete accessible pattern with getFormFieldA11y in stories"
```

---

## Task 5: Add notification disambiguation comment to barrel + `@see` cross-links

**Why:** Alert, Banner, Toast, and Toaster are four distinct notification-related exports with no guidance on when to use each. An AI will pick arbitrarily. The Toaster shell component and `useToast`/`toast()` hook have no cross-references anywhere.

**Files:**
- Modify: `src/ui/index.ts:95-103` (add comment block + see links near Toast/Toaster/Alert/Banner exports)
- Modify: `src/ui/toaster.tsx:13` (add JSDoc with @see)

**Step 1: Add disambiguation comment to `src/ui/index.ts`**

Find the block exporting Alert, Banner, Toast, Toaster (around lines 95-103). Add a comment block above:

```typescript
// ---------------------------------------------------------------------------
// Notifications — choose based on use case:
//   Alert   — inline, contextual feedback within a form or page section
//   Banner  — persistent, page-level notifications (above page content)
//   Toast   — imperative, transient notifications triggered by user actions
//             Requires <Toaster> mounted once at layout root + useToast() hook
//             Usage: const { toast } = useToast(); toast({ title: "Saved!" })
// ---------------------------------------------------------------------------
export { Alert, alertVariants, type AlertProps } from './alert'
export { Banner, bannerVariants, type BannerProps } from './banner'
// ... (existing Toast export stays as-is)
export { Toaster } from './toaster'  // mount once at layout root
```

**Step 2: Add JSDoc to `Toaster` in `toaster.tsx`**

```typescript
// BEFORE (line 13):
export function Toaster() {

// AFTER:
/**
 * Toaster — shell component that renders active toasts. Mount once at your layout root.
 *
 * @see {@link useToast} — hook to imperatively trigger toasts
 * @see {@link toast} — direct function to trigger a toast (same as useToast().toast)
 *
 * @example
 * // In your root layout:
 * import { Toaster } from '@devalok/shilp-sutra'
 * export default function RootLayout({ children }) {
 *   return <html><body>{children}<Toaster /></body></html>
 * }
 *
 * // In any component:
 * import { useToast } from '@devalok/shilp-sutra'
 * function MyComponent() {
 *   const { toast } = useToast()
 *   return <button onClick={() => toast({ title: "Saved!", variant: "success" })}>Save</button>
 * }
 */
export function Toaster() {
```

**Step 3: TypeScript check**

```bash
pnpm tsc --noEmit
```

Expected: Zero errors.

**Step 4: Commit**

```bash
git add src/ui/index.ts src/ui/toaster.tsx
git commit -m "docs(notifications): add disambiguation guide + Toaster @see cross-links"
```

---

## Task 6: Add `@example` JSDoc to `Chip` + fix stories argTypes

**Why:** Chip has two non-obvious API facts: (1) it uses `label: string` not `children`, and (2) it has a two-axis variant system (`variant` = shape, `color` = intent) unlike Badge which uses `variant` for both. The stories `argTypes` also incorrectly omit `lg` from `size` and omit the 7 Sapta Varna colors from `color`.

**Files:**
- Modify: `src/ui/chip.tsx:70` (add JSDoc to ChipProps)
- Modify: `src/ui/chip.stories.tsx:14-21` (fix argTypes size and color options)

**Step 1: Add JSDoc to `ChipProps` in `chip.tsx`**

```typescript
// BEFORE (line 70):
type ChipProps = Omit<VariantProps<typeof chipVariants>, 'color'> & {
  label: string
  ...

// AFTER:
/**
 * Props for Chip.
 *
 * **API note:** Chip uses a two-axis variant system:
 * - `variant` controls **shape**: `"filled"` (default) | `"outlined"`
 * - `color` controls **intent**: `"default"` | `"primary"` | `"success"` | `"error"` |
 *   `"warning"` | `"info"` | `"teal"` | `"amber"` | `"slate"` | `"indigo"` | `"cyan"` | `"orange"` | `"emerald"`
 *
 * This differs from Badge, which uses `variant` for both shape and intent.
 *
 * **Important:** Use the `label` prop, not `children`.
 *
 * @example
 * // CORRECT — use label prop:
 * <Chip label="High Priority" color="warning" />
 * <Chip label="Done" variant="outlined" color="success" onDelete={() => {}} />
 *
 * // WRONG — children are not rendered:
 * <Chip>High Priority</Chip>  // ← produces an empty chip (TypeScript error in strict mode)
 *
 * // Badge comparison — Badge uses variant for intent:
 * <Badge variant="success">Done</Badge>  // children-based, variant for intent
 * <Chip label="Done" color="success" />  // label-based, color for intent
 */
type ChipProps = Omit<VariantProps<typeof chipVariants>, 'color'> & {
  label: string
```

**Step 2: Fix `chip.stories.tsx` argTypes**

```typescript
// BEFORE (lines 14-21):
argTypes: {
  variant: {
    control: 'select',
    options: ['filled', 'outlined'],
  },
  size: {
    control: 'select',
    options: ['sm', 'md'],
  },
  color: {
    control: 'select',
    options: ['default', 'primary', 'success', 'error', 'warning'],
  },
  label: { control: 'text' },
  disabled: { control: 'boolean' },
},

// AFTER:
argTypes: {
  variant: {
    control: 'select',
    options: ['filled', 'outlined'],
    description: 'Shape: filled (solid background) or outlined (border only)',
  },
  size: {
    control: 'select',
    options: ['sm', 'md', 'lg'],
  },
  color: {
    control: 'select',
    options: ['default', 'primary', 'success', 'error', 'warning', 'info', 'teal', 'amber', 'slate', 'indigo', 'cyan', 'orange', 'emerald'],
    description: 'Intent color. Unlike Badge which uses variant= for this, Chip uses color=',
  },
  label: {
    control: 'text',
    description: 'Text label (use this, not children)',
  },
  disabled: { control: 'boolean' },
},
```

**Step 3: TypeScript check**

```bash
pnpm tsc --noEmit
```

**Step 4: Commit**

```bash
git add src/ui/chip.tsx src/ui/chip.stories.tsx
git commit -m "docs(chip): add @example JSDoc for label/dual-axis model + fix stories argTypes"
```

---

## Task 7: Add `@example` JSDoc to `Toast` / `Toaster`

**Why:** Toast has the lowest first-attempt success rate (~35%). An AI needs to see the full three-part setup (Toaster mount + useToast hook + toast() call) inline in the source, not only in Storybook.

**Files:**
- Modify: `src/ui/toast.tsx:25` (add JSDoc to `toastVariants`)
- Modify: `src/ui/toast.tsx:122` (add JSDoc to `ToastProps`)

**Step 1: Add JSDoc to `toastVariants`**

```typescript
// BEFORE (line 25):
const toastVariants = cva(

// AFTER:
/**
 * Toast variant classes. Valid variants: `default` | `success` | `warning` | `error` | `info`.
 *
 * Note: `destructive` and `karam` do NOT exist as variant values. The class name
 * `destructive` appears internally in the `error` variant's group selector — it is not a prop value.
 */
const toastVariants = cva(
```

**Step 2: Add JSDoc to `ToastProps`**

```typescript
// BEFORE (line 122):
type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

// AFTER:
/**
 * Props for the Toast component. Use `variant` for intent styling.
 *
 * **Setup required:** `Toast` is a low-level primitive. For imperative toasts (triggered
 * by user actions), use `useToast()` + mount `<Toaster>` at your layout root instead.
 *
 * @example
 * // IMPERATIVE (recommended for action-triggered notifications):
 * // 1. Mount <Toaster /> once at your root layout
 * // 2. Call the hook anywhere:
 * import { useToast } from '@devalok/shilp-sutra'
 * const { toast } = useToast()
 * toast({ title: 'Saved!', description: 'Your changes were saved.', variant: 'success' })
 *
 * // DECLARATIVE (for controlled rendering in Storybook/tests only):
 * <ToastProvider>
 *   <Toast open variant="success">
 *     <ToastTitle>Success</ToastTitle>
 *     <ToastClose />
 *   </Toast>
 *   <ToastViewport />
 * </ToastProvider>
 */
type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>
```

**Step 3: TypeScript check**

```bash
pnpm tsc --noEmit
```

**Step 4: Commit**

```bash
git add src/ui/toast.tsx
git commit -m "docs(toast): add @example JSDoc documenting full setup pattern and valid variants"
```

---

## Task 8: Add `@example` JSDoc to `FormField` + improve `FormFieldProps`

**Why:** `FormFieldProps.helperTextId` has a JSDoc comment saying "link to input via aria-describedby" but the prop is NOT propagated — it does nothing in the implementation (`helperTextId: _helperTextId`). An AI will pass it expecting automatic wiring and get silence. The JSDoc must clarify that `getFormFieldA11y()` is required.

**Files:**
- Modify: `src/ui/form.tsx:9-14` (strengthen JSDoc on `helperTextId` prop)

**Step 1: Update `FormFieldProps` JSDoc**

```typescript
// BEFORE (lines 9-14):
export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Unique ID for the helper text — link to input via aria-describedby */
  helperTextId?: string
  /** Current validation state — propagated to children via context */
  state?: FormHelperState
}

// AFTER:
/**
 * FormField — vertical stack that provides validation state via context to children.
 *
 * **Accessibility wiring:** To connect a helper text to its input, you must wire
 * `aria-describedby` manually using `getFormFieldA11y()`. The `helperTextId` prop
 * on `FormField` is informational only and does NOT automatically propagate.
 *
 * @example
 * const helperTextId = 'email-error-hint'
 * <FormField state="error">
 *   <Label htmlFor="email">Email</Label>
 *   <Input
 *     id="email"
 *     state="error"
 *     {...getFormFieldA11y(helperTextId, 'error')}
 *   />
 *   <FormHelperText id={helperTextId} state="error">
 *     Please enter a valid email address.
 *   </FormHelperText>
 * </FormField>
 */
export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * ID that will be set on `FormHelperText`. Pass this value to `getFormFieldA11y(id, state)`
   * and spread the result onto your Input. This prop itself does NOT auto-wire aria attributes.
   */
  helperTextId?: string
  /** Current validation state — propagated to children (FormHelperText) via context */
  state?: FormHelperState
}
```

**Step 2: TypeScript check**

```bash
pnpm tsc --noEmit
```

**Step 3: Run tests**

```bash
pnpm test --run src/ui/form
```

**Step 4: Commit**

```bash
git add src/ui/form.tsx
git commit -m "docs(form): clarify helperTextId is informational-only, document getFormFieldA11y pattern"
```

---

## Task 9: Fix MEMORY.md — remove incorrect variant references

**Why:** The project's `MEMORY.md` references `karam` and `destructive` as Toast variant values. Neither exists in the source CVA definition. Confirmed correct variants: `default | success | warning | error | info`. Keeping wrong variant names in memory poisons future AI sessions.

**Files:**
- Modify: `C:\Users\mudit\.claude\projects\C--Users-mudit-Documents-GitHub-shilp-sutra\memory\MEMORY.md`

**Step 1: Find and remove the incorrect references**

Search for any mention of `karam` or `destructive` in MEMORY.md. Remove or correct:
- Any line stating Toast has a `karam` variant → remove
- Any line stating Toast has a `destructive` variant → remove or note: "`destructive` is a CSS group class applied inside the `error` variant, not a variant prop value"
- If the Variant Audit section in MEMORY.md references `Toast: 'destructive' and 'karam' variants are visually identical` → update to: `Toast variants (confirmed in source): default | success | warning | error | info`

**Step 2: Add a note about authoritative source**

Add this line to the "Known issues" or relevant section:
```
## Source of Truth Rule
CVA source files are authoritative for variant names. Never update variant names in MEMORY.md — grep the CVA source instead.
```

**Step 3: No TypeScript check needed (Markdown file)**

Commit:

```bash
git add "C:/Users/mudit/.claude/projects/C--Users-mudit-Documents-GitHub-shilp-sutra/memory/MEMORY.md"
git commit -m "docs(memory): remove incorrect karam/destructive Toast variant references"
```

---

## Task 10: Add `@example` JSDoc to ALL remaining ui/ Props interfaces (Tier 2)

**Why:** 87/89 ui/ components have zero JSDoc. An AI reading `variant: "default" | "elevated" | "outlined" | "flat"` with no description pattern-matches from training data. Adding `@example` blocks makes intent visible and reduces hallucination.

**Files:**
- Modify: Every `src/ui/*.tsx` file that exports a Props interface without JSDoc

**Approach:** Handle these components as a batch. For each file, add a JSDoc block immediately before the `export interface XxxProps` or `type XxxProps` line. Follow the Chip pattern from Task 6.

**Components to cover (priority order):**

1. `avatar.tsx` — `AvatarProps` (shape + size variants)
2. `badge.tsx` — `BadgeProps` (15-variant system, children-based unlike Chip)
3. `alert.tsx` — `AlertProps` (inline contextual feedback, vs Banner/Toast)
4. `banner.tsx` — `BannerProps` (persistent page-level, vs Alert/Toast)
5. `button.tsx` — `ButtonProps` (loading, startIcon/endIcon, fullWidth)
6. `input.tsx` — `InputProps` (state, startIcon/endIcon — note: no size prop)
7. `card.tsx` — `CardProps` (variant system)
8. `dialog.tsx` — document compound structure
9. `dropdown-menu.tsx` — document compound structure
10. All remaining: `accordion`, `checkbox`, `radio`, `switch`, `slider`, `tooltip`, `popover`, `sheet`, `sidebar`, `data-table`, `pagination`, `skeleton`, `spinner`, `stat-card`, `code`, `segmented-control`, `toggle`, `number-input`, `search-input`, `textarea`, `combobox`, `autocomplete`, `file-upload`, `input-otp`

**Template for each component:**

```typescript
/**
 * [ComponentName] — [one sentence description, 10 words max].
 *
 * @example
 * <ComponentName prop1="value" prop2={true}>
 *   [children or label]
 * </ComponentName>
 */
export interface ComponentNameProps { ... }
```

**Step 1: Work through files one by one**

For each file, add JSDoc, then run:

```bash
pnpm tsc --noEmit
```

**Step 2: Commit per-component or in logical groups**

```bash
git add src/ui/avatar.tsx src/ui/badge.tsx src/ui/alert.tsx src/ui/banner.tsx
git commit -m "docs(ui): add @example JSDoc to avatar, badge, alert, banner Props interfaces"
```

Repeat for each group.

---

## Task 11: Add `@compound` JSDoc to compound component roots (Tier 2)

**Why:** `AdminDashboard`, `Tabs`, `FormField`, `Dialog`, `Sheet`, `Accordion`, `DropdownMenu` are compound components whose sub-parts are exported flat. An AI cannot discover the valid composition tree without reading source.

**Files:**
- Modify: `src/ui/tabs.tsx` — already partially done in Task 3; add full compound docs to `Tabs` const
- Modify: `src/ui/form.tsx` — already done in Task 8
- Modify: `src/karm/admin/admin-dashboard.tsx` (or wherever AdminDashboard root is)
- Modify: `src/ui/accordion.tsx`, `src/ui/dialog.tsx`, `src/ui/sheet.tsx`, `src/ui/dropdown-menu.tsx`

**Pattern for each compound root:**

```typescript
/**
 * [Root] — compound component. Valid sub-components:
 * - `[Root]Header` — title area
 * - `[Root]Content` — main content area
 * - `[Root]Footer` — action buttons
 *
 * @example
 * <Root>
 *   <RootHeader><RootTitle>Title</RootTitle></RootHeader>
 *   <RootContent>Content</RootContent>
 *   <RootFooter><button>Close</button></RootFooter>
 * </Root>
 */
```

**Step 1: Find AdminDashboard root**

```bash
grep -r "AdminDashboard" src/karm --include="*.tsx" -l
```

**Step 2: Add JSDoc to each compound root**

Follow the Tabs model from Task 3. Include the full composition tree in the `@example`.

**Step 3: TypeScript check + commit**

```bash
pnpm tsc --noEmit
git add src/ui/accordion.tsx src/ui/dialog.tsx src/ui/sheet.tsx src/ui/dropdown-menu.tsx
git commit -m "docs(compound): add @compound JSDoc to Dialog, Sheet, Accordion, DropdownMenu"
```

---

## Task 12: CI lint rule — Props co-export completeness (Tier 2)

**Why:** Every exported component should have a corresponding `{Component}Props` type co-exported from the barrel. Without enforcement, gaps accumulate over time (Select had zero type exports; `TabsContentProps` was missing). A CI script catches these at PR time.

**Files:**
- Create: `scripts/check-props-exports.ts`
- Modify: `package.json` (add `lint:props` script)
- Modify: `.github/workflows/ci.yml` (add step)

**Step 1: Write the check script**

Create `scripts/check-props-exports.ts`:

```typescript
/**
 * check-props-exports.ts
 * Verifies that every exported component from src/ui/index.ts has a corresponding
 * exported Props type. Exits with code 1 if any gaps are found.
 *
 * Usage: pnpm tsx scripts/check-props-exports.ts
 */
import { readFileSync } from 'fs'
import { resolve } from 'path'

const barrel = readFileSync(resolve('src/ui/index.ts'), 'utf-8')

// Extract component names (PascalCase exports that are NOT types)
const componentExports = [...barrel.matchAll(/export \{[^}]+\} from/g)]
  .flatMap(m => m[0].match(/(?<!type )\b([A-Z][A-Za-z]+)\b/g) ?? [])
  .filter(name => !name.startsWith('type'))

// Extract type exports
const typeExports = new Set(
  [...barrel.matchAll(/type (\w+Props)\b/g)].map(m => m[1])
)

// Known compounds/primitives that don't need Props types (raw re-exports)
const SKIP = new Set([
  'AspectRatio', 'Toaster', // no Props interface by design
])

const missing: string[] = []
for (const name of componentExports) {
  if (SKIP.has(name)) continue
  const propsName = `${name}Props`
  if (!typeExports.has(propsName)) {
    missing.push(`  ${name} → missing ${propsName}`)
  }
}

if (missing.length > 0) {
  console.error('❌ Missing Props type exports in src/ui/index.ts:')
  missing.forEach(m => console.error(m))
  process.exit(1)
} else {
  console.log('✅ All component Props types are exported')
}
```

**Step 2: Add npm script**

In `package.json`, add to `scripts`:

```json
"lint:props": "tsx scripts/check-props-exports.ts"
```

**Step 3: Run it and fix any gaps it finds**

```bash
pnpm lint:props
```

For each gap reported, add the missing `type XxxProps` to `src/ui/index.ts`.

**Step 4: Add to CI**

In `.github/workflows/ci.yml`, add a step after `typecheck`:

```yaml
- name: Check Props type exports
  run: pnpm lint:props
```

**Step 5: Commit**

```bash
git add scripts/check-props-exports.ts package.json .github/workflows/ci.yml
git commit -m "ci: add Props co-export lint check to prevent barrel type gaps"
```

---

## Verification Checklist

After completing all Tier 1 tasks (1–9), run:

```bash
# 1. TypeScript must be clean
pnpm tsc --noEmit

# 2. All tests must pass
pnpm test --run

# 3. Build must succeed
pnpm build

# 4. Storybook must compile (dev mode)
pnpm storybook --ci --smoke-test
```

Expected first-attempt AI success rate improvement (council estimate):
- **Before:** 5.5–6.5/10
- **After Tier 1:** ~7.5/10
- **After Tier 2:** ~8.5/10

---

## Execution Notes

- Tasks 1–9 are **independent** — they can be executed in parallel by separate subagents
- Tasks 3, 4, 5 each touch separate files — safe to parallelize
- Tasks 10 and 11 are best batched by module (avatar+badge+button group, then form group, etc.)
- Task 12 (CI script) should be last — it validates all the type exports added in Tasks 2–3 and 10
- No runtime behavior changes — only JSDoc, type exports, CVA key rename (Task 1), and one story update (Task 4)
