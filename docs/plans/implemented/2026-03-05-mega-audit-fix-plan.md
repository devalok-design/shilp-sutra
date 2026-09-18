# Mega-Audit Fix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all 38 issues from the mega-council audit, making the design system ready for external adoption.

**Architecture:** Breaking changes to component APIs (variant/color axis, onChange signatures), dependency restructuring (heavy deps → optional peer deps), font replacement (Google Sans → Inter WOFF2), and comprehensive documentation. All changes ship as v0.3.0.

**Tech Stack:** React 18, TypeScript 5.7, Vite 5.4, Tailwind 3.4, CVA, Radix UI primitives (vendored)

**Design doc:** `docs/plans/2026-03-05-mega-audit-fix-design.md`

---

## Phase 1: P0 — Ship-Stoppers

### Task 1: Fix karm hooks→ui path rewrite bug

**Files:**
- Modify: `packages/karm/vite.config.ts:65`

**Step 1: Fix the path rewrite**

In `packages/karm/vite.config.ts`, line 65, change:
```ts
if (subpath.startsWith('hooks/')) return `@devalok/shilp-sutra/ui`
```
to:
```ts
if (subpath.startsWith('hooks/')) return `@devalok/shilp-sutra/hooks`
```

**Step 2: Also fix the fallback on line 67**

The fallback `return '@devalok/shilp-sutra/ui'` on line 67 is a catch-all that may silently misroute future imports. Change to a more explicit mapping or log a warning. For now, keep it but add a comment:
```ts
// Fallback — if this triggers, add an explicit mapping above
return `@devalok/shilp-sutra/ui`
```

**Step 3: Rebuild karm and verify**

Run: `cd packages/karm && pnpm build`

Then check the built output for correct hook imports:
```bash
grep -r "shilp-sutra/hooks" packages/karm/dist/
grep -r "shilp-sutra/ui" packages/karm/dist/ | grep -i "hook\|mobile\|toast\|color-mode"
```
Expected: hooks references point to `/hooks`, NOT `/ui`.

**Step 4: Commit**

```
fix(karm): correct hooks path rewrite from /ui to /hooks
```

---

### Task 2: Fix phantom token text-on-interactive in Badge

**Files:**
- Modify: `packages/core/src/ui/badge.tsx:16`

**Step 1: Fix the token reference**

In `packages/core/src/ui/badge.tsx`, line 16, change:
```ts
'bg-interactive text-text-on-interactive border-transparent',
```
to:
```ts
'bg-interactive text-text-on-color border-transparent',
```

`text-on-color` exists in the Tailwind preset at line 173: `'text-on-color': 'var(--color-text-on-color)'`.

**Step 2: Run tests**

Run: `cd packages/core && pnpm test -- badge`
Expected: All badge tests pass.

**Step 3: Commit**

```
fix(core): replace phantom token text-on-interactive with text-on-color in Badge
```

---

### Task 3: Add "use client" injection to karm build

**Files:**
- Create: `packages/karm/scripts/inject-use-client.mjs`
- Modify: `packages/karm/package.json` (build script)

**Step 1: Create the karm inject-use-client script**

Based on `packages/core/scripts/inject-use-client.mjs` but simpler — ALL karm components are client-side (they all use hooks), so no SERVER_SAFE list needed. Skip only `primitives` and `tokens` dirs (which don't exist in karm anyway).

Create `packages/karm/scripts/inject-use-client.mjs`:
```js
/**
 * Post-build: inject "use client" directive into all JS/DTS files in dist/.
 * All karm components are client-only (use React hooks).
 */
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, extname } from 'node:path'

const DIST = new URL('../dist/', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await walk(full))
    } else if (['.js', '.mjs'].includes(extname(entry.name))) {
      files.push(full)
    }
  }
  return files
}

async function inject() {
  const files = await walk(DIST)
  let count = 0
  for (const file of files) {
    const content = await readFile(file, 'utf8')
    if (content.startsWith('"use client"') || content.startsWith("'use client'")) continue
    await writeFile(file, `"use client";\n${content}`)
    count++
  }
  console.log(`[inject-use-client] Added "use client" to ${count} files in karm dist/`)
}

inject().catch(console.error)
```

**Step 2: Update karm build script**

In `packages/karm/package.json`, change build script (line ~45):
```json
"build": "vite build && node scripts/inject-use-client.mjs"
```

**Step 3: Rebuild and verify**

Run: `cd packages/karm && pnpm build`
Then: `head -1 packages/karm/dist/board/index.js`
Expected: `"use client";`

**Step 4: Commit**

```
feat(karm): add "use client" injection to build pipeline
```

---

### Task 4: Replace Google Sans with Inter (WOFF2)

**Files:**
- Delete: `packages/core/fonts/GoogleSans-Variable.ttf`
- Delete: `packages/core/fonts/GoogleSans-Italic-Variable.ttf`
- Create: `packages/core/fonts/Inter-Variable.woff2`
- Create: `packages/core/fonts/Inter-Italic-Variable.woff2`
- Convert: `packages/core/fonts/Ranade-Variable.ttf` → `.woff2`
- Convert: `packages/core/fonts/Ranade-VariableItalic.ttf` → `.woff2`
- Modify: `packages/core/src/tokens/typography.css:12-40`
- Modify: `packages/core/src/tokens/index.css`

**Step 1: Download Inter WOFF2 variable font**

Inter is available from Google Fonts or https://rsms.me/inter/. Download the variable WOFF2 files:
```bash
# Download Inter variable WOFF2
curl -L -o packages/core/fonts/Inter-Variable.woff2 "https://github.com/rsms/inter/raw/master/docs/font-files/InterVariable.woff2"
curl -L -o packages/core/fonts/Inter-Italic-Variable.woff2 "https://github.com/rsms/inter/raw/master/docs/font-files/InterVariable-Italic.woff2"
```

**Step 2: Convert Ranade TTF to WOFF2**

Use a tool like `woff2_compress` or an online converter. If `woff2` CLI is available:
```bash
# If woff2_compress is available:
woff2_compress packages/core/fonts/Ranade-Variable.ttf
woff2_compress packages/core/fonts/Ranade-VariableItalic.ttf
```
Otherwise use https://cloudconvert.com/ttf-to-woff2 or a Node-based converter.

**Step 3: Remove Google Sans TTF files**

```bash
rm packages/core/fonts/GoogleSans-Variable.ttf
rm packages/core/fonts/GoogleSans-Italic-Variable.ttf
rm packages/core/fonts/Ranade-Variable.ttf
rm packages/core/fonts/Ranade-VariableItalic.ttf
```

**Step 4: Update @font-face declarations**

In `packages/core/src/tokens/typography.css`, replace lines 12-40:
```css
/* ── Inter (sans/display/body) ────── */
@font-face {
  font-family: 'Inter';
  src: url('../../fonts/Inter-Variable.woff2') format('woff2');
  font-weight: 100 900;
  font-display: swap;
  font-style: normal;
}
@font-face {
  font-family: 'Inter';
  src: url('../../fonts/Inter-Italic-Variable.woff2') format('woff2');
  font-weight: 100 900;
  font-display: swap;
  font-style: italic;
}

/* ── Ranade (accent) ────── */
@font-face {
  font-family: 'Ranade';
  src: url('../../fonts/Ranade-Variable.woff2') format('woff2');
  font-weight: 100 900;
  font-display: swap;
  font-style: normal;
}
@font-face {
  font-family: 'Ranade';
  src: url('../../fonts/Ranade-VariableItalic.woff2') format('woff2');
  font-weight: 100 900;
  font-display: swap;
  font-style: italic;
}
```

**Step 5: Update CSS variable values for font family**

In `packages/core/src/tokens/typography-semantic.css` (or wherever `--font-sans` is defined), update the font family references from `'Google Sans'` to `'Inter'`:
```css
--font-sans: 'Inter', system-ui, sans-serif;
--font-display: 'Inter', system-ui, sans-serif;
--font-body: 'Inter', sans-serif;
--font-accent: 'Ranade', sans-serif;
```

**Step 6: Include typography.css in tokens/index.css**

In `packages/core/src/tokens/index.css`, add the font-face import:
```css
@import './primitives.css';
@import './semantic.css';
@import './typography.css';
@import './typography-semantic.css';
```

**Step 7: Build and verify**

Run: `cd packages/core && pnpm build`
Check font files are in dist: `ls -la packages/core/fonts/`
Expected: Only `.woff2` files, total size ~1-2MB.

**Step 8: Commit**

```
feat(core)!: replace Google Sans with Inter, convert all fonts to WOFF2

BREAKING CHANGE: Google Sans removed (licensing). Inter is now the default
sans-serif font. Ranade retained as accent font. All fonts converted from
TTF to WOFF2 (~70% smaller).
```

---

## Phase 2: Package Architecture

### Task 5: Move heavy deps to optional peerDependencies

**Files:**
- Modify: `packages/core/package.json`

**Step 1: Restructure dependencies**

In `packages/core/package.json`, move from `dependencies` to `peerDependencies`:
```json
"peerDependencies": {
  "react": "^18 || ^19",
  "react-dom": "^18 || ^19",
  "@tabler/icons-react": "^3.0.0",
  "@tanstack/react-table": "^8.0.0",
  "@tanstack/react-virtual": "^3.0.0",
  "@tiptap/react": "^2.0.0",
  "@tiptap/starter-kit": "^2.0.0",
  "@tiptap/extension-placeholder": "^2.0.0",
  "d3-array": "^3.0.0",
  "d3-axis": "^3.0.0",
  "d3-format": "^3.0.0",
  "d3-interpolate": "^3.0.0",
  "d3-scale": "^4.0.0",
  "d3-selection": "^3.0.0",
  "d3-shape": "^3.0.0",
  "d3-time-format": "^4.0.0",
  "d3-transition": "^3.0.0",
  "date-fns": "^4.0.0",
  "input-otp": "^1.0.0",
  "react-markdown": "^10.0.0"
},
"peerDependenciesMeta": {
  "@tabler/icons-react": { "optional": true },
  "@tanstack/react-table": { "optional": true },
  "@tanstack/react-virtual": { "optional": true },
  "@tiptap/react": { "optional": true },
  "@tiptap/starter-kit": { "optional": true },
  "@tiptap/extension-placeholder": { "optional": true },
  "d3-array": { "optional": true },
  "d3-axis": { "optional": true },
  "d3-format": { "optional": true },
  "d3-interpolate": { "optional": true },
  "d3-scale": { "optional": true },
  "d3-selection": { "optional": true },
  "d3-shape": { "optional": true },
  "d3-time-format": { "optional": true },
  "d3-transition": { "optional": true },
  "date-fns": { "optional": true },
  "input-otp": { "optional": true },
  "react-markdown": { "optional": true }
}
```

Keep as hard `dependencies`:
```json
"dependencies": {
  "@floating-ui/react-dom": "^2.1.7",
  "aria-hidden": "^1.2.4",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "react-remove-scroll": "^2.6.3",
  "tailwind-merge": "^3.0.1"
}
```

**Step 2: Update root workspace dev dependencies**

Ensure these packages are in the root `devDependencies` or the workspace so that the monorepo can still build:
```bash
pnpm add -w -D @tabler/icons-react @tanstack/react-table @tanstack/react-virtual @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder d3-array d3-axis d3-format d3-interpolate d3-scale d3-selection d3-shape d3-time-format d3-transition date-fns input-otp react-markdown
```

**Step 3: Build and test**

Run: `pnpm build && pnpm test`
Expected: All tests pass (monorepo has dev deps available).

**Step 4: Commit**

```
feat(core)!: move heavy deps to optional peerDependencies

BREAKING CHANGE: D3, TipTap, TanStack, @tabler/icons-react, date-fns,
input-otp, and react-markdown are now optional peer dependencies.
Install only what you use.
```

---

### Task 6: Add root export, main/module fields, and missing exports

**Files:**
- Modify: `packages/core/package.json`

**Step 1: Add "." root export, main, module fields**

In `packages/core/package.json`, add at the top of `exports`:
```json
".": { "import": "./dist/ui/index.js", "types": "./dist/ui/index.d.ts" },
```

Add top-level fields (before `"exports"`):
```json
"main": "./dist/ui/index.js",
"module": "./dist/ui/index.js",
"types": "./dist/ui/index.d.ts",
```

**Step 2: Add missing per-component exports**

Add these entries to the `exports` map:
```json
"./ui/charts": { "import": "./dist/ui/charts/index.js", "types": "./dist/ui/charts/index.d.ts" },
"./ui/tree-view": { "import": "./dist/ui/tree-view/index.js", "types": "./dist/ui/tree-view/index.d.ts" },
"./composed/date-picker": { "import": "./dist/composed/date-picker/index.js", "types": "./dist/composed/date-picker/index.d.ts" },
```

**Step 3: Expand sideEffects**

Change:
```json
"sideEffects": ["**/*.css"]
```
to:
```json
"sideEffects": ["**/*.css", "**/primitives/**"]
```

**Step 4: Commit**

```
feat(core): add root export, main/module fields, and missing per-component exports
```

---

### Task 7: Tighten karm peer dep and fix orphaned file

**Files:**
- Modify: `packages/karm/package.json`

**Step 1: Tighten peer dep range**

In `packages/karm/package.json`, change:
```json
"@devalok/shilp-sutra": ">=0.1.0"
```
to:
```json
"@devalok/shilp-sutra": ">=0.3.0"
```

**Step 2: Check for orphaned page-skeletons.js**

Verify if `page-skeletons` is properly exported. Check if it should be under `./composed/page-skeletons` or removed from karm's scope entirely. If it belongs to composed (it does — it's in core's composed), then it shouldn't be in karm dist root.

If it's a build artifact from karm importing it:
- The karm vite config should externalize it properly — check the built output after Phase 1 fixes.

**Step 3: Commit**

```
fix(karm): tighten core peer dep range to >=0.3.0
```

---

## Phase 3: Component API Fixes

### Task 8: Extend HTMLAttributes on NumberInput and Combobox

**Files:**
- Modify: `packages/core/src/ui/number-input.tsx:34-42`
- Modify: `packages/core/src/ui/combobox.tsx:66-80`

**Step 1: Fix NumberInputProps**

Replace the interface at lines 34-42:
```ts
export interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type' | 'size'> {
  value?: number
  onValueChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
}
```

Update the component to destructure the new props and spread remaining HTML attrs onto the `<input>`.

**Step 2: Fix ComboboxProps**

Replace the interface at lines 66-80:
```ts
export interface ComboboxProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: ComboboxOption[]
  value?: string | string[]
  onValueChange: (value: string | string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  multiple?: boolean
  disabled?: boolean
  triggerClassName?: string
  maxVisible?: number
  renderOption?: (option: ComboboxOption, selected: boolean) => React.ReactNode
}
```

**Step 3: Update all internal usages of onChange → onValueChange in both components**

In NumberInput: rename `onChange` to `onValueChange` in the destructuring (line 48) and all call sites (lines 60, 69, 76).

In Combobox: rename `onChange` to `onValueChange` in the destructuring and all internal call sites.

**Step 4: Run tests**

Run: `cd packages/core && pnpm test -- number-input && pnpm test -- combobox`
Update test files to use `onValueChange` instead of `onChange`.

**Step 5: Commit**

```
feat(core)!: NumberInput/Combobox extend HTMLAttributes, rename onChange to onValueChange

BREAKING CHANGE: onChange is now onValueChange on NumberInput and Combobox.
Both now accept all standard HTML attributes.
```

---

### Task 9: Standardize onChange → onValueChange on Autocomplete

**Files:**
- Modify: `packages/core/src/ui/autocomplete.tsx:42-51`

**Step 1: Rename onChange to onValueChange**

In AutocompleteProps (lines 42-51), rename:
```ts
onValueChange?: (option: AutocompleteOption) => void
```

Update the internal usage at line 109: `onValueChange?.(option)` and the destructuring.

**Step 2: Update tests and stories**

**Step 3: Commit**

```
feat(core)!: rename Autocomplete onChange to onValueChange

BREAKING CHANGE: onChange is now onValueChange on Autocomplete.
```

---

### Task 10: Standardize variant/color axis on Button

**Files:**
- Modify: `packages/core/src/ui/button.tsx:10-41`

**Step 1: Restructure Button CVA variants**

Replace the current `variant` axis (lines 14-26) which mixes style + intent:
```ts
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-ds-02 whitespace-nowrap rounded-ds-default text-ds-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-action-disabled [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        solid: '',
        ghost: 'hover:bg-field hover:text-text-primary',
        outline: 'border border-border bg-transparent hover:bg-field hover:text-text-primary',
        link: 'text-text-link underline-offset-4 hover:underline',
      },
      color: {
        default: '',
        error: '',
      },
      size: {
        sm: 'h-ds-xs-plus px-ds-04 text-ds-xs rounded-ds-sm',
        md: 'h-ds-sm px-ds-05 text-ds-sm',
        lg: 'h-ds-sm-plus px-ds-06 text-ds-md',
        'icon-sm': 'h-ds-xs-plus w-ds-xs-plus rounded-ds-sm',
        'icon-md': 'h-ds-sm w-ds-sm',
        'icon-lg': 'h-ds-sm-plus w-ds-sm-plus',
      },
    },
    compoundVariants: [
      // solid + default (primary)
      { variant: 'solid', color: 'default', className: 'bg-interactive text-text-on-color hover:bg-interactive-hover active:bg-interactive-active' },
      // solid + error
      { variant: 'solid', color: 'error', className: 'bg-error text-text-on-color hover:bg-error-hover' },
      // ghost + error
      { variant: 'ghost', color: 'error', className: 'text-text-error hover:bg-error-surface hover:text-text-error' },
    ],
    defaultVariants: {
      variant: 'solid',
      color: 'default',
      size: 'md',
    },
  },
)
```

Note: Map old API names → new: `primary` → `variant="solid" color="default"`, `secondary` → `variant="outline"`, `error` → `variant="solid" color="error"`, `error-ghost` → `variant="ghost" color="error"`, `ghost` → `variant="ghost"`, `link` → `variant="link"`.

**Step 2: Update ButtonProps to include color**

Add `color` to the VariantProps extraction and the ButtonProps interface.

**Step 3: Update all Button usages in stories, tests, composed, shell, and karm**

Search for `variant="primary"`, `variant="error"`, `variant="error-ghost"`, `variant="secondary"` across the entire codebase and update.

**Step 4: Run full test suite**

Run: `cd packages/core && pnpm test`

**Step 5: Commit**

```
feat(core)!: standardize Button to variant/color axis (Chip model)

BREAKING CHANGE: Button variant="primary" → variant="solid" (default).
variant="secondary" → variant="outline". variant="error" → color="error".
variant="error-ghost" → variant="ghost" color="error".
```

---

### Task 11: Standardize variant/color axis on Badge

**Files:**
- Modify: `packages/core/src/ui/badge.tsx:8-55`

**Step 1: Restructure Badge CVA**

Split the current single `variant` axis (which mixes semantic status + category colors) into `variant` + `color`:

```ts
variant: {
  subtle: '...', // current default (neutral) style
  solid: '...',
  outline: '...',
},
color: {
  default: '',
  info: '',
  success: '',
  error: '',
  warning: '',
  brand: '',
  accent: '',
  teal: '',
  amber: '',
  slate: '',
  indigo: '',
  cyan: '',
  orange: '',
  emerald: '',
},
```

Use `compoundVariants` to define the color × variant matrix.

**Step 2: Update all Badge usages across codebase**

**Step 3: Run tests**

**Step 4: Commit**

```
feat(core)!: standardize Badge to variant/color axis

BREAKING CHANGE: Badge variant="info" → color="info". variant="solid" is now a
visual style. Use variant + color together.
```

---

### Task 12: Standardize variant/color axis on Alert, Banner, Toast, Progress

**Files:**
- Modify: `packages/core/src/ui/alert.tsx:8-27`
- Modify: `packages/core/src/ui/banner.tsx` (similar CVA)
- Modify: `packages/core/src/ui/toast.tsx` (variant → color)
- Modify: `packages/core/src/ui/progress.tsx:27-40` (already uses `color` — just verify consistency)

**Step 1: Alert — rename `variant` to `color`, keep default variant axis**

Alert currently uses `variant` for semantic status. Rename to `color`:
```ts
color: {
  info: '...',
  success: '...',
  warning: '...',
  error: '...',
  neutral: '...',
},
```

Add `variant` axis if multiple visual styles make sense (e.g., `subtle`, `solid`, `outline`). If Alert only has one visual style, just use `color`.

**Step 2: Banner — same pattern as Alert**

**Step 3: Toast — rename `variant` to `color`**

**Step 4: Progress — already uses `color`, verify it matches the standard set**

**Step 5: Update all usages across codebase**

**Step 6: Run full tests**

**Step 7: Commit**

```
feat(core)!: standardize Alert/Banner/Toast to color axis

BREAKING CHANGE: Alert/Banner/Toast variant="info" → color="info".
Semantic intent is now expressed via color prop consistently.
```

---

### Task 13: Add forwardRef to Dialog/Sheet sub-components

**Files:**
- Modify: `packages/core/src/ui/dialog.tsx:121-147`
- Modify: `packages/core/src/ui/sheet.tsx:159-185`

**Step 1: Convert DialogHeader to forwardRef**

Replace lines 121-133:
```tsx
const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-ds-02b text-center sm:text-left', className)}
    {...props}
  />
))
DialogHeader.displayName = 'DialogHeader'
```

**Step 2: Same for DialogFooter (lines 135-147)**

**Step 3: Same for SheetHeader (lines 159-171) and SheetFooter (lines 173-185)**

**Step 4: Run tests**

Run: `cd packages/core && pnpm test -- dialog && pnpm test -- sheet`

**Step 5: Commit**

```
fix(core): add forwardRef to DialogHeader/Footer and SheetHeader/Footer
```

---

### Task 14: Export missing prop types and add Switch error state

**Files:**
- Modify: `packages/core/src/ui/switch.tsx`
- Modify: `packages/core/src/ui/slider.tsx`
- Modify: `packages/core/src/ui/toast.tsx`
- Modify: `packages/core/src/ui/index.ts` (update re-exports)

**Step 1: Switch — add error prop and export SwitchProps**

In `switch.tsx`, add a custom props type:
```tsx
export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  error?: boolean
}

const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, error, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      // existing classes...
      error && 'border-border-error data-[state=checked]:bg-error',
      className,
    )}
    {...props}
    ref={ref}
  />
))
```

**Step 2: Slider — export SliderProps**

```tsx
export type SliderProps = React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
```

Update export line: `export { Slider, type SliderProps }`

**Step 3: Toast — export ToastProps if not already**

Check and add: `export type ToastProps = ...`

**Step 4: Update ui/index.ts to re-export new types**

Add type exports for Switch, Slider, Toast where missing.

**Step 5: Run tests**

**Step 6: Commit**

```
feat(core): export SwitchProps/SliderProps/ToastProps, add Switch error state
```

---

## Phase 4: Accessibility Fixes

### Task 15: Fix touch targets on dismiss/close buttons

**Files:**
- Modify: `packages/core/src/ui/alert.tsx:91-98`
- Modify: `packages/core/src/ui/banner.tsx:84-92`
- Modify: `packages/core/src/ui/badge.tsx` (dismiss button)
- Modify: `packages/core/src/ui/chip.tsx:139-151`
- Modify: `packages/core/src/ui/dialog.tsx:94` (close button)
- Modify: `packages/core/src/ui/sheet.tsx:149` (close button)
- Modify: `packages/core/src/ui/toast.tsx:95`

**Step 1: Add minimum touch target to all dismiss buttons**

For each file, add `min-h-6 min-w-6 flex items-center justify-center` to the button className. This ensures at least 24×24px touch target (WCAG 2.5.8 minimum).

Example for Alert dismiss (lines 91-98):
```tsx
<button
  type="button"
  onClick={onDismiss}
  className="shrink-0 min-h-6 min-w-6 flex items-center justify-center rounded-ds-sm text-icon-secondary transition-colors hover:text-icon-primary hover:bg-field focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
  aria-label="Dismiss"
>
  <IconX className="h-ico-sm w-ico-sm" />
</button>
```

Apply the same pattern (`min-h-6 min-w-6 flex items-center justify-center`) to Banner, Badge, Chip, Dialog close, Sheet close, and Toast close buttons.

**Step 2: Run a11y tests**

Run: `cd packages/core && pnpm test`

**Step 3: Commit**

```
fix(core): ensure all dismiss/close buttons meet 24px minimum touch target (WCAG 2.5.8)
```

---

### Task 16: Add motion-reduce to spinners

**Files:**
- Modify: `packages/core/src/ui/spinner.tsx:51`
- Modify: `packages/core/src/ui/search-input.tsx:85`
- Modify: `packages/core/src/ui/file-upload.tsx:250,319`

**Step 1: Spinner**

Line 51, change:
```ts
className={cn('animate-spin', sizeClasses[size], className)}
```
to:
```ts
className={cn('animate-spin motion-reduce:animate-none', sizeClasses[size], className)}
```

**Step 2: SearchInput**

Line 85, add `motion-reduce:animate-none` to the className string.

**Step 3: FileUpload**

Lines 250 and 319, add `motion-reduce:animate-none` to both `animate-spin` usages.

**Step 4: Run tests**

**Step 5: Commit**

```
fix(core): add motion-reduce:animate-none to all spinner animations (WCAG 2.3.3)
```

---

### Task 17: Auto-wire FormField aria-describedby

**Files:**
- Modify: `packages/core/src/ui/form.tsx`

**Step 1: Enhance FormFieldContext to include IDs**

Update the context to provide `helperTextId` and `state` to children:
```tsx
interface FormFieldContextValue {
  state?: FormHelperState
  helperTextId?: string
  required?: boolean
}

const FormFieldContext = React.createContext<FormFieldContextValue>({})
```

**Step 2: Update FormField to generate and provide IDs**

```tsx
const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, helperTextId, state, required, children, ...props }, ref) => {
    const generatedId = React.useId()
    const resolvedHelperTextId = helperTextId || `${generatedId}-helper`

    return (
      <FormFieldContext.Provider value={{ state, helperTextId: resolvedHelperTextId, required }}>
        <div ref={ref} className={cn('space-y-ds-02', className)} {...props}>
          {children}
        </div>
      </FormFieldContext.Provider>
    )
  },
)
```

**Step 3: Export a useFormField hook**

```tsx
export function useFormField() {
  return React.useContext(FormFieldContext)
}
```

Components like Input, Textarea, Select can use this to auto-wire:
```tsx
const { state, helperTextId, required } = useFormField()
// Spread: aria-describedby={helperTextId}, aria-invalid={state === 'error'}, aria-required={required}
```

**Step 4: Update FormHelperText to use the context ID**

**Step 5: Keep `getFormFieldA11y` as a deprecated export for backwards compat (or remove since breaking changes are OK)**

**Step 6: Run tests**

**Step 7: Commit**

```
feat(core)!: auto-wire FormField aria-describedby via React context

BREAKING CHANGE: FormField now auto-provides aria-describedby to child inputs.
Manual getFormFieldA11y() is no longer needed and has been removed.
```

---

### Task 18: Fix Toast close button visibility

**Files:**
- Modify: `packages/core/src/ui/toast.tsx:95`

**Step 1: Change opacity**

In line 95, replace:
```
opacity-0 transition-opacity hover:text-text-primary focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus group-hover:opacity-100
```
with:
```
opacity-70 transition-opacity hover:opacity-100 hover:text-text-primary focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus
```

**Step 2: Run tests**

**Step 3: Commit**

```
fix(core): make Toast close button always visible (a11y touch/keyboard)
```

---

## Phase 5: Tailwind Preset Fixes

### Task 19: Move screens to theme.extend and document darkMode

**Files:**
- Modify: `packages/core/src/tailwind/preset.ts:4-15`

**Step 1: Move screens inside extend**

Move the `screens` block from `theme.screens` (lines 9-15) into `theme.extend`:
```ts
const preset: Partial<Config> = {
  /**
   * Dark mode uses the `.dark` class strategy.
   * If your app uses `darkMode: 'media'`, set it explicitly in YOUR tailwind.config —
   * your config takes precedence over this preset.
   */
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
      fontFamily: {
      // ... rest of extend stays the same
```

**Step 2: Build and verify**

Run: `cd packages/core && pnpm build`

**Step 3: Commit**

```
fix(core): move screens to theme.extend to not replace deployer breakpoints
```

---

## Phase 6: Brand Package

### Task 20: Convert brand PNGs to WebP

**Files:**
- Modify: `packages/brand/dist/assets/` (all PNGs)
- Modify: `packages/brand/scripts/copy-assets.mjs` (if it needs to handle WebP)

**Step 1: Install cwebp or use sharp**

```bash
pnpm add -w -D sharp
```

**Step 2: Create conversion script**

Create `packages/brand/scripts/convert-to-webp.mjs`:
```js
import sharp from 'sharp'
import { readdir } from 'node:fs/promises'
import { join, parse } from 'node:path'

const ASSETS = new URL('../assets/', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')

const files = await readdir(ASSETS)
for (const file of files) {
  if (!file.endsWith('.png')) continue
  const { name } = parse(file)
  await sharp(join(ASSETS, file))
    .webp({ quality: 90 })
    .toFile(join(ASSETS, `${name}.webp`))
  console.log(`Converted: ${file} → ${name}.webp`)
}
```

**Step 3: Run conversion, keep originals for now, update exports**

**Step 4: Commit**

```
perf(brand): convert PNG assets to WebP (~75% size reduction)
```

---

## Phase 7: Documentation

### Task 21: Write per-package READMEs

**Files:**
- Create: `packages/core/README.md`
- Create: `packages/brand/README.md`
- Create: `packages/karm/README.md`

Each README should include:
- Package name and description
- Installation command
- Quick start (import tokens, add preset, use component)
- Link to Storybook
- Peer dependencies table (what's required vs optional)
- Server-safe component table (core only)
- License

**Commit:**
```
docs: add per-package READMEs for npm landing pages
```

---

### Task 22: Update root README

**Files:**
- Modify: `README.md`

Update:
1. Fix component count (audit actual exports)
2. Add ui/composed/shell mental model explainer
3. Add "Import Patterns" section (per-component recommended, barrel acceptable)
4. Add "Dark Mode Setup" section
5. Add "TypeScript Setup" section
6. Add "Server-Safe Components" table
7. Add "Peer Dependencies" section listing optional deps by feature

**Commit:**
```
docs: comprehensive README update — mental model, dark mode, TS, imports
```

---

### Task 23: Write CHANGELOG entry for v0.3.0

**Files:**
- Modify: `CHANGELOG.md`

Add v0.3.0 section with all breaking changes documented:
- Google Sans → Inter
- Heavy deps → optional peer deps
- onChange → onValueChange (NumberInput, Combobox, Autocomplete)
- variant/color axis standardization
- FormField auto-wiring
- getFormFieldA11y removed
- Karm peer dep tightened to >=0.3.0

**Commit:**
```
docs: add CHANGELOG entry for v0.3.0
```

---

### Task 24: Bump all packages to v0.3.0

**Files:**
- Modify: `packages/core/package.json` (version)
- Modify: `packages/brand/package.json` (version)
- Modify: `packages/karm/package.json` (version)

**Commit:**
```
chore: bump all packages to v0.3.0
```

---

## Summary: Task Dependency Graph

```
Phase 1 (P0):  Task 1 → Task 2 → Task 3 → Task 4
Phase 2 (Arch): Task 5 → Task 6 → Task 7
Phase 3 (API):  Task 8 → Task 9 → Task 10 → Task 11 → Task 12 → Task 13 → Task 14
Phase 4 (A11y): Task 15 → Task 16 → Task 17 → Task 18
Phase 5 (TW):   Task 19
Phase 6 (Brand): Task 20
Phase 7 (Docs):  Task 21 → Task 22 → Task 23 → Task 24

Phases 1-6 can run in parallel where independent.
Phase 7 (docs) should run last after all code changes are finalized.
```

## Parallelization Opportunities

These phases are independent and can be dispatched as parallel subagents:
- **Phase 1** (P0 fixes) — do first, everything else depends on these
- **Phase 3** (API) + **Phase 4** (A11y) + **Phase 5** (TW preset) — can run in parallel after Phase 1
- **Phase 2** (package.json arch) — can run in parallel with Phase 3-5
- **Phase 6** (brand WebP) — fully independent
- **Phase 7** (docs) — last, after all code changes
