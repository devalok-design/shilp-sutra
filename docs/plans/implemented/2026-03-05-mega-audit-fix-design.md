# Design: Mega-Audit Fix — All 38 Issues

**Date:** 2026-03-05
**Status:** Approved
**Breaking changes:** Yes (no external users, acceptable)
**Version bump:** 0.3.0 (minor, pre-1.0)

---

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Heavy deps strategy | Move to optional peerDependencies | Deployers only install what they use |
| Font replacement | Inter (WOFF2) + Ranade (WOFF2) | Google Sans is proprietary; Inter is industry-standard OSS |
| Font format | WOFF2 only | 98%+ browser support, ~70% smaller than TTF |
| Variant naming | Chip model (variant × color) | Separates visual style from semantic intent consistently |
| onChange convention | `onValueChange(value: T)` for custom inputs | Follows Radix convention; native inputs keep `onChange` |

---

## Section 1: Package Architecture

**Issues:** #2 (Google Sans), #5 (no root export), #6 (hard deps), #9 (missing exports), #21 (no main/module), #23 (ESM-only), #25 (sideEffects)

### Dependencies overhaul

Move to `peerDependencies` with `"optional": true` in `peerDependenciesMeta`:
- D3: d3-array, d3-axis, d3-format, d3-interpolate, d3-scale, d3-selection, d3-shape, d3-time-format, d3-transition
- TipTap: @tiptap/react, @tiptap/starter-kit, @tiptap/extension-placeholder
- TanStack: @tanstack/react-table, @tanstack/react-virtual
- Other: react-markdown, date-fns, input-otp, @tabler/icons-react

Keep as hard `dependencies` (truly core):
- class-variance-authority, clsx, tailwind-merge
- aria-hidden, react-remove-scroll, @floating-ui/react-dom

### Exports map fixes

- Add `"."` root export → `./dist/ui/index.js`
- Add `./ui/charts`, `./ui/tree-view`, `./composed/date-picker`
- Add `"main"` and `"module"` fields pointing to `./dist/ui/index.js`

### sideEffects

Expand to: `["**/*.css", "**/primitives/**"]`

---

## Section 2: Fonts

**Issues:** #2 (licensing), #7 (TTF size), #24 (tokens missing fonts), #32 (next/font friction)

- Remove GoogleSans-Variable.ttf and GoogleSans-Italic-Variable.ttf
- Download Inter variable font (WOFF2 format)
- Convert Ranade TTF → WOFF2
- Update `@font-face` declarations in typography.css
- Update `tokens/index.css` to include typography.css
- Update preset.ts `fontFamily.sans` default to reference Inter
- Document `next/font` alternative in README

---

## Section 3: Karm Fixes

**Issues:** #1 (hooks→ui rewrite), #3 (no use client), #30 (orphaned file), #33 (peer dep range)

- Fix `karm/vite.config.ts:65`: `hooks/` → `@devalok/shilp-sutra/hooks`
- Create `karm/scripts/inject-use-client.mjs` (mirror core's pattern)
- Add `inject-use-client` step to karm build script
- Remove or properly route orphaned `page-skeletons.js`
- Tighten peer dep: `@devalok/shilp-sutra >=0.3.0`

---

## Section 4: Component API Fixes

**Issues:** #4 (phantom token), #10 (HTMLAttributes), #11 (onChange), #16 (variant/color), #17 (forwardRef), #18 (type exports), #28 (Switch error)

### Phantom token
- `badge.tsx:16`: Replace `text-text-on-interactive` → `text-text-on-color`

### HTMLAttributes extension
- `NumberInputProps` extends `Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>`
- `ComboboxProps` extends `Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>`

### onChange standardization
- Custom inputs use `onValueChange(value: T)`:
  - Combobox: `onValueChange: (value: string | string[]) => void`
  - NumberInput: `onValueChange: (value: number) => void`
  - Autocomplete: `onValueChange: (option: AutocompleteOption) => void`
- HTML-extending components keep native `onChange`

### Variant/color axis (Chip model)
All status-bearing components get two axes:
- `variant`: visual style — `"solid" | "outline" | "subtle" | "ghost"` (subset per component)
- `color`: semantic intent — `"default" | "error" | "success" | "warning" | "info"` + category colors

Components affected: Button, Badge, Alert, Banner, Toast, Progress

### forwardRef
Add to: DialogHeader, DialogFooter, DialogDescription, SheetHeader, SheetFooter

### Type exports
Export props types from: Switch, Slider, Toast, and all other components missing exports

### Switch error state
Add `error?: boolean` prop matching Checkbox API

---

## Section 5: Accessibility Fixes

**Issues:** #13 (aria-describedby), #14 (touch targets), #15 (motion-reduce), #26 (toast close), #27 (required indicator)

### Touch targets (24px minimum)
Add `min-h-6 min-w-6` to icon-only action buttons in:
Alert, Banner, Badge, Chip, Dialog, Sheet, Toast

### Motion reduction
Add `motion-reduce:animate-none` to:
- Spinner (`spinner.tsx`)
- SearchInput loader (`search-input.tsx`)
- FileUpload spinners (`file-upload.tsx`)

### FormField aria-describedby
Auto-wire via React context: FormField provides `aria-describedby` ID to child Input/Textarea/Select automatically. Remove manual `getFormFieldA11y()` requirement.

### Label required
Auto-wire `aria-required="true"` via FormField context when `required` prop is set.

### Toast close visibility
Change from `opacity-0 group-hover:opacity-100` to `opacity-70 hover:opacity-100`

---

## Section 6: Tailwind Preset Fixes

**Issues:** #19 (screens replaces), #20 (darkMode SSR)

- Move `screens` from `theme.screens` to `theme.extend.screens`
- Add prominent JSDoc comment on `darkMode: 'class'` explaining implications
- Document that deployers needing `media` strategy should set it explicitly in their config

---

## Section 7: Brand Package

**Issue:** #8 (34MB PNGs)

- Convert all PNG assets to WebP format
- Keep SVG sources as-is
- Expected savings: ~34MB → ~8MB

---

## Section 8: Documentation

**Issues:** #12 (no package READMEs), #31 (wrong count), #34 (no API docs), #35 (no dark mode guide), #36 (no migration guide), #37 (no TS guide), #38 (mental model)

- Per-package READMEs for core, brand, karm
- Fix component count in root README
- Add ui/composed/shell mental model explainer
- Dark mode setup guide with ThemeScript pattern
- TypeScript setup notes
- Import pattern guide (per-component recommended, barrel acceptable, bare → root)
- Server-safe component table
- CHANGELOG entry for v0.3.0 breaking changes
