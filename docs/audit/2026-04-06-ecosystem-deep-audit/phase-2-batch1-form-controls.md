# Phase 2 Batch 1 — Form Controls Audit

**Date:** 2026-04-06
**Auditor:** Claude Opus 4.6 (automated deep audit)
**Scope:** 19 form control components in `packages/core/src/ui/`

## Token Reference

| Token | Value |
|-------|-------|
| `h-ds-xs-plus` | 28px |
| `h-ds-sm` | 32px |
| `h-ds-sm-plus` | 36px |
| `h-ds-md` | 40px |
| `h-ds-lg` | 48px |
| `h-5` / `w-5` | 20px |
| `h-6` / `w-6` | 24px |
| `h-7` / `w-7` | 28px |

## Summary Table

| # | Component | WCAG 2.2 | APG KB | API/DX | Tests | Bundle/SSR | Docs | Issues |
|---|-----------|----------|--------|--------|-------|------------|------|--------|
| 1 | Input | P | P | P | P | C | P | 0 |
| 2 | Textarea | P | P | P | P | C | P | 0 |
| 3 | Select | P | P | P | P | C | P | 0 |
| 4 | Checkbox | C | P | P | P | C | P | 1 |
| 5 | Radio | C | P | P | P | C | P | 1 |
| 6 | Switch | C | P | P | P | C | P | 1 |
| 7 | Slider | P | P | P | P | C | P | 1 |
| 8 | NumberInput | C | C | P | P | C | P | 2 |
| 9 | SearchInput | P | P | P | P | C | P | 0 |
| 10 | InputOTP | P | P | P | P | C | P | 0 |
| 11 | ColorInput | C | C | P | P | C | P | 3 |
| 12 | Autocomplete | C | C | P | P | C | P | 2 |
| 13 | Combobox | P | P | P | P | C | P | 0 |
| 14 | FileUpload | P | P | P | P | C | P | 0 |
| 15 | Label | P | P | P | P | C | P | 0 |
| 16 | Form | P | P | P | P | C | P | 0 |
| 17 | Toggle | P | P | P | P | C | P | 0 |
| 18 | ToggleGroup | P | P | P | P | C | P | 0 |
| 19 | SegmentedControl | C | C | P | P | C | P | 3 |

**Legend:** P = Pass, F = Fail, C = Conditional (issues but not blocking)

**Total issues found: 14**

---

## 1. Input
**File:** `packages/core/src/ui/input.tsx`

| Dimension | Score | Notes |
|-----------|-------|-------|
| WCAG 2.2 | P | Semantic tokens pass contrast. Focus ring `ring-2 ring-accent-9 ring-offset-2` is visible. All sizes >= 28px (xs=28px). `aria-invalid`, `aria-describedby`, `aria-required` wired via `useFormField()`. No fixed widths (`w-full`). |
| APG Keyboard | P | Native `<input>` element — no custom keyboard handling needed. Focus-within on wrapper for visual ring. |
| API/DX | P | `forwardRef`, `displayName`, `cn()`, CVA for wrapper, props spread, exported types. Section-based architecture with icon/label inference. `wrapperClassName` escape hatch. |
| Tests | P | 2 test files (30+ assertions). `toHaveNoViolations()` in 4 axe tests. Behavioral: state classes, section rendering, pointer-events, deprecated prop compat. |
| Bundle/SSR | C | `'use client'` directive. No `@server-safe` annotation (correct — uses `useFormField` hook). No side effects. |
| Docs | P | Story at `input.stories.tsx` with `['autodocs', 'stable']`. JSDoc with examples. |

**Issues:** None.

---

## 2. Textarea
**File:** `packages/core/src/ui/textarea.tsx`

| Dimension | Score | Notes |
|-----------|-------|-------|
| WCAG 2.2 | P | `focus-visible:ring-2 ring-accent-9`. Min heights start at 48px (xs). `aria-invalid`, `aria-describedby`, `aria-required` wired. Resizable (`resize-y`). No fixed widths. |
| APG Keyboard | P | Native `<textarea>` — standard keyboard behavior. Uses `motion.textarea` but this doesn't alter keyboard semantics. |
| API/DX | P | `forwardRef`, `displayName`, `cn()`, CVA, props spread via `motionProps()`. Shares `InputState` type with Input. |
| Tests | P | 2 test files. `toHaveNoViolations()` in 3 axe tests. Behavioral: value change, disabled, readonly, state classes, rows attribute. |
| Bundle/SSR | C | `'use client'`. Imports `framer-motion`. No side effects. |
| Docs | P | Story with `['autodocs', 'stable']`. JSDoc with 4 examples. |

**Issues:** None.

---

## 3. Select
**File:** `packages/core/src/ui/select.tsx`

| Dimension | Score | Notes |
|-----------|-------|-------|
| WCAG 2.2 | P | Focus ring on trigger (`focus-visible:ring-2 ring-accent-9 ring-offset-2`). Trigger sizes xs=28px, sm=32px, md=40px, lg=48px — all >= 24px. `aria-invalid` set for `color="error"`. Variant/color CVA axes. Content uses `bg-surface-overlay`. |
| APG Keyboard | P | Radix Select primitive handles all APG listbox keyboard patterns (ArrowUp/Down, Enter, Escape, type-ahead). |
| API/DX | P | All sub-components use `forwardRef` and `displayName`. CVA with `variant`, `color`, `size`. `SelectTriggerProps` properly typed. Compound pattern (Select > SelectTrigger > SelectContent > SelectItem). |
| Tests | P | 2 test files. `toHaveNoViolations()` in 2 axe tests. Behavioral: option selection, disabled, variants, colors, aria-invalid, default value, className merge, ref forwarding. |
| Bundle/SSR | C | `'use client'`. Imports Radix primitives + framer-motion. |
| Docs | P | Story with `['autodocs', 'stable']`. JSDoc with size placement warning. |

**Issues:** None.

---

## 4. Checkbox
**File:** `packages/core/src/ui/checkbox.tsx`

| Dimension | Score | Notes |
|-----------|-------|-------|
| WCAG 2.2 | C | Focus ring present. **Size: sm=20px (h-5), md=24px (h-6), lg=28px (h-7).** sm size is 20px which is < 24px WCAG 2.5.8 target size. md and lg pass. `error` prop adds `border-error-7`. Indeterminate state handled with SVG path animation. |
| APG Keyboard | P | Radix Checkbox handles Space to toggle. No keyboard traps. |
| API/DX | P | `forwardRef`, `displayName`, `cn()`, size prop, error prop, indeterminate prop. AnimatePresence for check animation. |
| Tests | P | 2 test files (checkbox.test + checkbox-a11y.test). `toHaveNoViolations()` in 4 axe tests. Behavioral: checked/unchecked, click toggle, size classes, ref forwarding. |
| Bundle/SSR | C | `'use client'`. Imports Radix + framer-motion. |
| Docs | P | Story with `['autodocs', 'stable']`. JSDoc with indeterminate examples. |

**Issues:**
- **[WCAG 2.5.8] sm size (20px) is below 24px target size minimum.** Doc comment says "sm (20px)" which is correct but non-compliant. The comment on md says "WCAG compliant" which is accurate — but sm is not flagged as non-compliant.

---

## 5. Radio
**File:** `packages/core/src/ui/radio.tsx`

| Dimension | Score | Notes |
|-----------|-------|-------|
| WCAG 2.2 | C | Focus ring present (`focus-visible:ring-2 ring-accent-9 ring-offset-2`). **Size: sm=20px, md=24px, lg=28px.** Same sm < 24px issue as Checkbox. Hover state changes border color. |
| APG Keyboard | P | Radix RadioGroup handles Arrow keys for navigation within group, Space to select. |
| API/DX | P | Both `RadioGroup` and `RadioGroupItem` use `forwardRef` and `displayName`. Size prop on item. Exported types. |
| Tests | P | 2 test files. `toHaveNoViolations()` in 2 axe tests. Behavioral: selection, default value, single selection enforcement, disabled group, size classes, ref forwarding. |
| Bundle/SSR | C | `'use client'`. Imports Radix + framer-motion. |
| Docs | P | Story with `['autodocs', 'stable']`. |

**Issues:**
- **[WCAG 2.5.8] sm size (20px) is below 24px target size minimum** — same as Checkbox.

---

## 6. Switch
**File:** `packages/core/src/ui/switch.tsx`

| Dimension | Score | Notes |
|-----------|-------|-------|
| WCAG 2.2 | C | Focus ring present. **Track sizes: sm=h-6 w-[38px] (24x38), md=h-6 w-11 (24x44), lg=h-7 w-[52px] (28x52).** All track heights >= 24px so target size passes. **Thumb sizes: sm=18px, md=20px (`h-ico-md`), lg=24px.** Thumb itself is below 24px for sm/md but the track (the interactive element) is >= 24px, which is the clickable area. `error` prop colors border+bg. `color` prop for accent/success/warning. |
| APG Keyboard | P | Radix Switch handles Space/Enter to toggle. `role="switch"` with `aria-checked`. |
| API/DX | P | `forwardRef`, `displayName`, `cn()`. Size/color/error props. Framer Motion thumb animation with `whileTap`. `thumbIcon` slot. |
| Tests | P | 2 test files. `toHaveNoViolations()` in 4 axe tests. Behavioral: toggle, checked/unchecked, disabled, size/color variants, error override, thumbIcon, ref. |
| Bundle/SSR | C | `'use client'`. Imports Radix + framer-motion. |
| Docs | P | Story with `['autodocs', 'stable']`. |

**Issues:**
- **[WCAG 2.5.8] Thumb visual sizes (sm=18px, md=20px) are small but the interactive track element is >= 24px, so technically compliant.** However, visual affordance is small — users may perceive the thumb as the target. This is a UX concern, not a strict WCAG failure.

---

## 7. Slider
**File:** `packages/core/src/ui/slider.tsx`

| Dimension | Score | Notes |
|-----------|-------|-------|
| WCAG 2.2 | P | Thumb is `h-6 w-6` (24x24px) — exactly meets 24px minimum. Focus ring on thumb (`focus-visible:ring-2 ring-accent-9 ring-offset-2`). Track is `h-ds-02b` (~6px) but the thumb is the interactive element. `aria-label` passed through. |
| APG Keyboard | P | Radix Slider handles Arrow keys, Home/End, Page Up/Down for value adjustment. |
| API/DX | P | `forwardRef`, `displayName`, `cn()`. Multi-thumb support via `value`/`defaultValue` array. Exported `SliderProps` type. |
| Tests | P | 2 test files. `toHaveNoViolations()` in 4 axe tests. Behavioral: aria-label, value, min/max, disabled, ref, step, className. |
| Bundle/SSR | C | `'use client'`. Imports Radix Slider. |
| Docs | P | Story with `['autodocs', 'stable']`. JSDoc with range slider example. |

**Issues:**
- **[Missing] No size axis** — the memory notes this is a known remaining item from the variant audit. Not a WCAG issue but a DX gap.

---

## 8. NumberInput
**File:** `packages/core/src/ui/number-input.tsx`

| Dimension | Score | Notes |
|-----------|-------|-------|
| WCAG 2.2 | C | Buttons are `h-ds-sm w-ds-sm` (32x32px) — passes target size. Input is `w-ds-sm-plus` (36px) with `focus-visible:ring-1 ring-accent-7`. **Issue: focus ring uses `ring-1` (thinner) and `ring-accent-7` instead of the standard `ring-2 ring-accent-9` used everywhere else.** `aria-label` defaults to "Numeric value" when no label context. `aria-describedby` wired via `useFormField()`. |
| APG Keyboard | C | **Buttons are keyboard-accessible (type="button").** Input is `type="number"` with native spinbutton behavior. **However: no keyboard shortcut to increment/decrement from the input itself beyond native browser spinbutton arrows (which are hidden via `[appearance:textfield]`).** User must Tab to buttons. The native spin buttons are explicitly hidden with CSS. |
| API/DX | P | `forwardRef`, `displayName`. `value`/`onValueChange` controlled API. `min`/`max`/`step` props. Buttons have `type="button"` to prevent form submission. |
| Tests | P | 2 test files. `toHaveNoViolations()` in 4 axe tests. Behavioral: increment/decrement, step, min/max bounds, disabled buttons, ref, className. |
| Bundle/SSR | C | `'use client'`. No heavy dependencies. |
| Docs | P | Story with `['autodocs', 'stable']`. JSDoc with examples. |

**Issues:**
- **[WCAG 1.4.11] Focus ring inconsistency:** Uses `ring-1 ring-accent-7` on the input instead of the standard `ring-2 ring-accent-9` — weaker visual focus indicator than other form controls.
- **[APG] Hidden native spin buttons** — `[appearance:textfield]` hides browser-native increment/decrement arrows. Users must Tab to the +/- buttons separately. Not strictly a violation but reduces keyboard efficiency.

---

## 9. SearchInput
**File:** `packages/core/src/ui/search-input.tsx`

| Dimension | Score | Notes |
|-----------|-------|-------|
| WCAG 2.2 | P | Composes `<Input>` so inherits all its a11y wiring. Clear button uses `<Button variant="ghost" size="icon-xs">` with `aria-label="Clear search"`. `aria-busy` set during loading. Size variants inherited from Input. |
| APG Keyboard | P | Native input behavior. Clear button is a standard `<Button>` (keyboard accessible). |
| API/DX | P | `forwardRef`, `displayName`. Composes Input with startSection/endSection. `onClear`, `loading`, `size` props. |
| Tests | P | 2 test files. `toHaveNoViolations()` in 4 axe tests. Behavioral: clear button visibility, loading spinner, disabled, ref, className. |
| Bundle/SSR | C | `'use client'`. Imports Button, Input, Spinner, framer-motion. |
| Docs | P | Story with `['autodocs', 'stable']`. JSDoc with examples. |

**Issues:** None.

---

## 10. InputOTP
**File:** `packages/core/src/ui/input-otp.tsx`

| Dimension | Score | Notes |
|-----------|-------|-------|
| WCAG 2.2 | P | Slot size is `h-ds-sm-plus w-ds-sm-plus` (36x36px) — well above 24px. Active slot gets `ring-2 ring-accent-9`. Separator has `role="separator"`. Fake caret animation for visual feedback. |
| APG Keyboard | P | Uses `input-otp` library which manages a hidden input with focus tracking. Arrow keys navigate between slots. |
| API/DX | P | All sub-components use `forwardRef` and `displayName`. Compound pattern (InputOTP > InputOTPGroup > InputOTPSlot). Exported `InputOTPProps` type. |
| Tests | P | 2 test files. `toHaveNoViolations()` in 3 axe tests. Behavioral: character input, maxLength, separator rendering, multi-char. |
| Bundle/SSR | C | `'use client'`. Imports `input-otp` library. |
| Docs | P | Story with `['autodocs', 'stable']`. |

**Issues:** None.

---

## 11. ColorInput
**File:** `packages/core/src/ui/color-input.tsx`

| Dimension | Score | Notes |
|-----------|-------|-------|
| WCAG 2.2 | C | Trigger buttons have `aria-label` with color value. **Preset swatch buttons are `h-6 w-6` (24x24px) — meets minimum.** Format inputs use `h-ds-xs-plus` (28px). **Issue 1: Format switcher buttons (`text-[10px]`) have very small text that may not meet 4.5:1 contrast at 10px.** **Issue 2: "Undo" and "Reset" buttons use `text-[10px]` with minimal padding — may be below 24px target.** **Issue 3: Default trigger variant has focus ring using `ring-1` instead of standard `ring-2`.** |
| APG Keyboard | C | Trigger opens Popover (Radix handles Escape to close). **Format inputs and preset swatches are keyboard accessible.** However, the HexColorPicker from `react-colorful` — **keyboard accessibility depends on the library implementation; it uses pointer events primarily.** No custom keyboard navigation for the gradient picker area. |
| API/DX | P | `forwardRef`, `displayName`, `cn()`. Rich API: `value`/`onChange`, `presets`, `showPicker`, `defaultFormat`, `variant`, `align`. Internal undo/reset. `useId()` for stable IDs. |
| Tests | P | 1 test file. `toHaveNoViolations()` in 1 axe test. Behavioral: trigger display, popover open, presets, format switching (hex/rgb/hsl), disabled, variant. |
| Bundle/SSR | C | `'use client'`. Imports `react-colorful`, Popover, framer-motion. |
| Docs | P | Story with `['autodocs', 'stable']`. |

**Issues:**
- **[WCAG 1.4.3] Format switcher and Undo/Reset buttons use `text-[10px]`** — extremely small text. At 10px, even with 4.5:1 ratio, readability is poor.
- **[WCAG 2.5.8] Undo/Reset buttons have minimal padding (`px-ds-02 py-px`) at 10px font** — likely below 24px target height.
- **[APG] HexColorPicker (react-colorful)** is primarily pointer-driven. Keyboard users cannot adjust hue/saturation/lightness via the gradient picker. They can use the format text inputs as a workaround, but the picker itself lacks keyboard support.

---

## 12. Autocomplete
**File:** `packages/core/src/ui/autocomplete.tsx`

| Dimension | Score | Notes |
|-----------|-------|-------|
| WCAG 2.2 | C | Input has `role="combobox"`, `aria-expanded`, `aria-autocomplete="list"`, `aria-controls`, `aria-activedescendant`. Focus ring `ring-2 ring-accent-9`. Input height `h-ds-md` (40px). **Issue: `ring-offset-[var(--border-focus-offset)]` — uses a CSS variable for offset instead of a fixed value. If the variable is undefined, ring offset may be 0, making the ring less visible.** Options have `role="option"` and `aria-selected`. |
| APG Keyboard | C | ArrowDown/Up to navigate, Enter to select, Escape to close. **Issue: ArrowDown from last item doesn't wrap to first (it stays at max). ArrowUp from first item doesn't wrap to last (it stays at 0).** This is acceptable (APG doesn't require wrapping) but differs from Combobox which also doesn't wrap. |
| API/DX | P | `forwardRef`, `displayName`, `cn()`. Uses `useId()` for listbox and option IDs. Composed ref handling. `AutocompleteOption` type exported. |
| Tests | P | 1 test file. `toHaveNoViolations()` in 1 axe test. Behavioral: filtering, selection, keyboard nav, Escape, aria-expanded, aria-autocomplete, empty state, disabled. |
| Bundle/SSR | C | `'use client'`. Imports framer-motion. |
| Docs | P | Story with `['autodocs', 'stable']`. JSDoc with distinction from Combobox. |

**Issues:**
- **[WCAG 1.4.11] `ring-offset-[var(--border-focus-offset)]`** — non-standard focus ring offset using a CSS variable. If variable is undefined, offset defaults to 0 which may make focus ring harder to see against the input border.
- **[A11y] Blur timeout (`setTimeout 150ms`) to close dropdown** — fragile for screen readers that may have slower focus transitions. Could cause premature closing.

---

## 13. Combobox
**File:** `packages/core/src/ui/combobox.tsx`

| Dimension | Score | Notes |
|-----------|-------|-------|
| WCAG 2.2 | P | Trigger has `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-haspopup="listbox"`, `aria-label`. Focus ring `ring-2 ring-accent-9 ring-offset-2`. Trigger height `h-ds-md` (40px). Search input has `aria-autocomplete="list"`, `aria-controls`, `aria-activedescendant`, `aria-label`. Options have `role="option"`, `aria-selected`, `aria-disabled`. Listbox has `aria-multiselectable` for multi-select. Pill remove buttons have `aria-label`. |
| APG Keyboard | P | ArrowDown/Up, Home/End, Enter, Escape. Disabled options skipped during navigation. Search input auto-focused on open. |
| API/DX | P | `forwardRef`, `displayName`, `cn()`. Discriminated union props for single/multi. `renderOption` customization. `accessibleLabel`, `triggerClassName`, `maxVisible`. |
| Tests | P | 2 test files. `toHaveNoViolations()` in 4 axe tests. Behavioral: filter, single/multi select, pills, overflow, disabled options, keyboard nav (Home/End/ArrowDown/ArrowUp/Escape), aria-activedescendant, maxVisible, renderOption, icon/description. Excellent coverage. |
| Bundle/SSR | C | `'use client'`. Imports Radix Popover + framer-motion. |
| Docs | P | Story with `['autodocs', 'stable']`. JSDoc with discriminated union explanation. |

**Issues:** None. This is one of the best-tested components in the batch.

---

## 14. FileUpload
**File:** `packages/core/src/ui/file-upload.tsx`

| Dimension | Score | Notes |
|-----------|-------|-------|
| WCAG 2.2 | P | Drop zone has `role="button"`, `tabIndex={0}`, keyboard handler for Enter/Space. `aria-disabled` when disabled. Error messages use `role="alert"` with `aria-live="polite"`. Progress bar has `role="progressbar"` with `aria-valuenow/min/max`. Compact mode button is a native `<button>`. Hidden file input has `aria-hidden="true"` and `aria-label`. |
| APG Keyboard | P | Drop zone responds to Enter/Space. File input is triggered programmatically. No keyboard traps. |
| API/DX | P | `forwardRef`, `displayName`, `cn()`. Rich API: `accept`, `maxSize`, `multiple`, `uploading`, `progress`, `compact`, `error`, `label`, `sublabel`. Client-side validation with clear error messages. |
| Tests | P | 1 test file. `toHaveNoViolations()` in 1 axe test. Behavioral: file selection, size validation, type validation, error display, progress bar, compact mode, multiple, disabled, drag-active, ref, className. |
| Bundle/SSR | C | `'use client'`. Imports framer-motion, Spinner, Icon. |
| Docs | P | Story with `['autodocs', 'stable']`. JSDoc with 3 examples. |

**Issues:** None.

---

## 15. Label
**File:** `packages/core/src/ui/label.tsx`

| Dimension | Score | Notes |
|-----------|-------|-------|
| WCAG 2.2 | P | Uses Radix Label primitive. Required indicator (`*`) has `aria-hidden="true"` — correct, screen readers should get required state from the input's `aria-required`. Text uses `text-surface-fg` for good contrast. `peer-disabled:opacity-action-disabled` for visual feedback. |
| APG Keyboard | P | Label is non-interactive — clicking it focuses the associated input (native behavior via `htmlFor`). |
| API/DX | P | `forwardRef`, `displayName`, `cn()`. `required` prop for visual indicator. Extends Radix Label props. |
| Tests | P | 2 test files. `toHaveNoViolations()` in 3 axe tests. Behavioral: text content, htmlFor association, className, ref, required indicator, children elements. |
| Bundle/SSR | C | `'use client'`. Imports Radix Label. Could arguably be `@server-safe` since Label is purely visual, but Radix Label uses client-side focus management. |
| Docs | P | Story with `['autodocs', 'stable']`. |

**Issues:** None.

---

## 16. Form (FormField + FormHelperText + useFormField)
**File:** `packages/core/src/ui/form.tsx`

| Dimension | Score | Notes |
|-----------|-------|-------|
| WCAG 2.2 | P | `FormHelperText` uses `role="alert"` for error state. Auto-generates stable IDs via `useId()` for `aria-describedby` wiring. Context provides `state`, `helperTextId`, `required` to child inputs. Color-coded states: `text-error-11`, `text-warning-11`, `text-success-11`. |
| APG Keyboard | P | Non-interactive container — provides context only. |
| API/DX | P | `forwardRef` on both `FormField` and `FormHelperText`. `displayName`. `useFormField()` hook exported. `FormHelperState` type exported. Clean context pattern with memoized value. |
| Tests | P | 2 test files (32+ assertions). `toHaveNoViolations()` in 4 axe tests. Behavioral: context propagation (state, helperTextId, required), state override, role="alert" for errors, auto-generated IDs, custom IDs, all state color variants, useFormField outside context. Excellent coverage. |
| Bundle/SSR | C | `'use client'`. Imports framer-motion for FormHelperText animation. |
| Docs | P | Story with `['autodocs', 'stable']`. JSDoc with useFormField examples. |

**Issues:** None. This is the a11y backbone — well-designed.

---

## 17. Toggle
**File:** `packages/core/src/ui/toggle.tsx`

| Dimension | Score | Notes |
|-----------|-------|-------|
| WCAG 2.2 | P | Focus ring `ring-2 ring-accent-9 ring-offset-2`. Sizes: sm=32px, md=40px, lg=48px — all >= 24px. `aria-pressed` managed by Radix Toggle. `data-[state=on]` styling for visual pressed state. Disabled uses `pointer-events-none` + `opacity-action-disabled`. |
| APG Keyboard | P | Radix Toggle handles Space/Enter to toggle. `aria-pressed` attribute. |
| API/DX | P | `forwardRef`, `displayName`, `cn()`, CVA with `variant`/`size`. Framer Motion `whileTap` for press feedback. `motionProps()` for safe event-handler spread. Exported `ToggleProps` and `toggleVariants`. |
| Tests | P | 2 test files. `toHaveNoViolations()` in 4 axe tests. Behavioral: toggle pressed state, click, defaultPressed, disabled, variant/size classes, ref, className. |
| Bundle/SSR | C | `'use client'`. Imports Radix Toggle + framer-motion. |
| Docs | P | Story with `['autodocs', 'stable']`. |

**Issues:** None.

---

## 18. ToggleGroup
**File:** `packages/core/src/ui/toggle-group.tsx`

| Dimension | Score | Notes |
|-----------|-------|-------|
| WCAG 2.2 | P | Inherits Toggle's focus ring and sizing. Radix ToggleGroup provides `role="group"`. Items inherit `toggleVariants` from Toggle context. |
| APG Keyboard | P | Radix ToggleGroup handles roving tabindex and Arrow key navigation between items. |
| API/DX | P | `forwardRef`, `displayName` on both root and item. Context pattern propagates `variant`/`size` from group to items. Exported `ToggleGroupProps` and `ToggleGroupItemProps`. |
| Tests | P | 2 test files. `toHaveNoViolations()` in 3 axe tests. Behavioral: single/multiple selection, controlled value, deselect, disabled, className, ref. |
| Bundle/SSR | C | `'use client'`. Imports Radix ToggleGroup. |
| Docs | P | Story with `['autodocs', 'stable']`. |

**Issues:** None.

---

## 19. SegmentedControl
**File:** `packages/core/src/ui/segmented-control.tsx`

| Dimension | Score | Notes |
|-----------|-------|-------|
| WCAG 2.2 | C | `role="tablist"` on root, `role="tab"` and `aria-selected` on items. `aria-label="Segmented control options"`. **Issue 1: No visible focus indicator** — the item buttons lack `focus-visible:ring-*` or `focus-visible:outline-*` classes. The `outline-none` in CVA suppresses the default browser outline but no replacement ring is added. Focus is only tracked internally via `isFocused` state but not reflected visually. **Issue 2: `tabIndex={-1}` on the root means the tablist itself isn't focusable, but individual tab buttons are (correct per APG).** |
| APG Keyboard | C | ArrowLeft/Right with wrapping, Home/End. **Issue: `onSelect` is called during keyboard navigation, not just on Enter/Space.** APG tabs pattern says focus follows selection (which this implements), but this means ArrowLeft/Right immediately changes selection. This is the "automatic activation" variant which is valid but may be unexpected for some users. **More critically: the `focusedId` state is tracked but buttons don't actually receive DOM focus** — there's no `ref` or `focus()` call when `focusedId` changes, so keyboard navigation changes selection without moving DOM focus. |
| API/DX | P | `forwardRef` on both SegmentedControl and SegmentedControlItem. `displayName`. CVA with `size`/`variant`/`selected`/`isHovered`/`isDisabled`. Legacy size aliases. `LayoutGroup` for shared layout animation. `useRipple` for press feedback. |
| Tests | P | 1 test file. `toHaveNoViolations()` in 2 axe tests. Behavioral: tablist role, aria-selected, disabled, filled variant. |
| Bundle/SSR | C | `'use client'`. Imports framer-motion. |
| Docs | P | Story with `['autodocs', 'stable']`. JSDoc with examples. |

**Issues:**
- **[WCAG 2.4.7 CRITICAL] No visible focus indicator on tab items.** The CVA includes `outline-none` in the base classes and `cursor-pointer` but NO `focus-visible:ring-*` or `focus-visible:outline-*` replacement. Keyboard users cannot see which tab is focused. This is a hard WCAG 2.4.7 failure.
- **[APG] Keyboard navigation doesn't move DOM focus.** `focusedId` updates state but no `buttonRef.focus()` call is made. The next focused button won't receive actual DOM focus, breaking screen reader announcements.
- **[APG] ArrowLeft/Right immediately calls `onSelect`** (automatic activation). While valid per APG, there's no configuration to use manual activation (where arrows only move focus, Enter/Space activates). Combined with the missing DOM focus, this means keyboard navigation is both invisible and doesn't move focus.

---

## Cross-Cutting Observations

### Reduced Motion
None of the 19 form control components individually check `prefers-reduced-motion` or call `useReducedMotion()`. However, the system-level `MotionProvider` wraps apps in `MotionConfig reducedMotion="user"`, which instructs Framer Motion to suppress all animations when the OS preference is set. This is sufficient for components that use Framer Motion (Textarea, Checkbox, Radio, Switch, ColorInput, Autocomplete, Combobox, FileUpload, Toggle, SegmentedControl). **Components that use only CSS transitions (Input, Select items, NumberInput, Label) have no `motion-reduce:` media query overrides**, but their transitions are micro (color, opacity) and not disorienting, so this is acceptable per WCAG 2.3.3.

### Server Safety
None of the 19 form controls have `@server-safe` annotation, which is correct — they all use `'use client'` and require browser APIs (event handlers, React state, or Radix primitives with DOM access). The `inject-use-client` post-build script handles the directive injection.

### Consistent Issues Across Components
1. **Checkbox/Radio sm size (20px)** — known gap from variant audit, documented in memory
2. **Focus ring inconsistency** — most use `ring-2 ring-accent-9 ring-offset-2`, but NumberInput uses `ring-1 ring-accent-7` and ColorInput default trigger uses `ring-1 ring-accent-9`
3. **SegmentedControl focus visibility** — the most severe issue in this batch, a hard WCAG failure

### Priority Fixes (Recommended Order)
1. **SegmentedControl focus-visible ring** — CRITICAL, blocks WCAG 2.4.7
2. **SegmentedControl keyboard DOM focus** — CRITICAL, breaks keyboard navigation
3. **NumberInput focus ring consistency** — LOW, upgrade to `ring-2 ring-accent-9`
4. **ColorInput Undo/Reset button target size** — MEDIUM
5. **Autocomplete ring-offset CSS variable** — LOW, verify variable resolution
