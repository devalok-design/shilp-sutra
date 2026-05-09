# Lens 6 — Edge Case & State Coverage

**Compiled:** 2026-05-09 (principal-architect audit)
**Scope:** ~168 interactive components across `ui/`, `composed/`, `shell/`, `ai/`
**Rubric:** [`00-best-practices.md`](./00-best-practices.md) §§ 8 (State coverage matrix), 11 (i18n), 12 (a11y baseline)

## Executive summary

- **Average state coverage:** ~82% across sampled interactive components
- **P0 findings (8):** hardcoded user-facing strings, focus-trap edge cases, partial aria wiring
- **P1 findings (10):** RTL support 0%, forced-colors mode incomplete (~36% coverage), async aria-live gaps, axe coverage holes
- **P2 findings (8):** keyboard-nav edge cases, variant gaps
- **P3 findings (8):** polish (icon scaling, opacity preview, etc.)

**Top systemic gaps:** RTL (zero coverage system-wide), forced-colors (added in 0.36.0 but uneven backfill), hardcoded English strings (25 instances across 8 components).

## State coverage matrix (top 20 interactive components)

✅ = covered in source AND demonstrated. ⚠️ = partial (source-only or demo-only). ❌ = gap. N/A = state doesn't apply.

| Component | Default | Hover | Focus | Pressed | Disabled | Loading | Error | Success | Empty | Read-only | Required | RTL | Forced-colors | Reduced-motion | Dark | Selected | Indeterminate | Async |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Button | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | N/A | N/A | N/A | ❌ | ⚠️ | ✅ | ✅ | N/A | N/A | ✅ |
| Input | ✅ | ✅ | ✅ | N/A | ✅ | N/A | ✅ | ⚠️ | ✅ | ✅ | ⚠️ | ❌ | ⚠️ | ✅ | ✅ | N/A | N/A | N/A |
| Checkbox | ✅ | ✅ | ✅ | ✅ | ✅ | N/A | ⚠️ | N/A | N/A | N/A | ⚠️ | ❌ | ⚠️ | ✅ | ✅ | ✅ | ✅ | N/A |
| Select | ✅ | ✅ | ✅ | ✅ | ✅ | N/A | ✅ | N/A | ⚠️ | N/A | ⚠️ | ❌ | ⚠️ | ✅ | ✅ | N/A | N/A | N/A |
| Tabs | ✅ | ✅ | ✅ | ✅ | ❌ | N/A | N/A | N/A | N/A | N/A | N/A | ❌ | ⚠️ | ✅ | ✅ | ✅ | N/A | N/A |
| Dialog | ✅ | N/A | ✅ | N/A | N/A | ⚠️ | ⚠️ | N/A | N/A | N/A | N/A | ❌ | ⚠️ | ✅ | ✅ | N/A | N/A | N/A |
| Spinner | ✅ | N/A | N/A | N/A | N/A | ✅ | ✅ | ✅ | N/A | N/A | N/A | N/A | ⚠️ | ✅ | ✅ | N/A | N/A | N/A |
| Toast | ✅ | N/A | N/A | N/A | N/A | ✅ | ✅ | ✅ | ✅ | N/A | N/A | ❌ | ⚠️ | ✅ | ✅ | N/A | N/A | N/A |
| Toggle | ✅ | ✅ | ✅ | ✅ | ❌ | N/A | N/A | N/A | N/A | N/A | N/A | ❌ | ⚠️ | ✅ | ✅ | ✅ | N/A | N/A |
| Slider | ✅ | ✅ | ✅ | ✅ | ✅ | N/A | N/A | N/A | N/A | N/A | N/A | ❌ | ⚠️ | ✅ | ✅ | N/A | N/A | N/A |
| DatePicker | ✅ | ✅ | ✅ | N/A | ⚠️ | ⚠️ | ✅ | N/A | N/A | N/A | N/A | ❌ | ⚠️ | ⚠️ | ✅ | N/A | N/A | ⚠️ |
| Combobox | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ✅ | N/A | ⚠️ | N/A | N/A | ❌ | ⚠️ | ✅ | ✅ | N/A | N/A | ⚠️ |
| Autocomplete | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ✅ | N/A | ⚠️ | N/A | N/A | ❌ | ⚠️ | ✅ | ✅ | N/A | N/A | ⚠️ |
| Switch | ✅ | ✅ | ✅ | ✅ | ❌ | N/A | N/A | N/A | N/A | N/A | N/A | ❌ | ⚠️ | ✅ | ✅ | ✅ | N/A | N/A |
| Tooltip | ✅ | ✅ | ✅ | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | ❌ | ⚠️ | ✅ | ✅ | N/A | N/A | N/A |
| DataTable | ✅ | ✅ | ⚠️ | ✅ | ⚠️ | ⚠️ | ⚠️ | N/A | ✅ | ⚠️ | N/A | ❌ | ⚠️ | ⚠️ | ✅ | ✅ | N/A | ⚠️ |
| Accordion | ✅ | ✅ | ✅ | ✅ | ⚠️ | N/A | N/A | N/A | N/A | N/A | N/A | ❌ | ⚠️ | ⚠️ | ✅ | ✅ | N/A | N/A |
| FormField | ✅ | N/A | N/A | N/A | N/A | N/A | ✅ | ✅ | N/A | N/A | ✅ | ❌ | ⚠️ | ✅ | ✅ | N/A | N/A | N/A |
| ConfirmDialog | ✅ | N/A | ✅ | N/A | ⚠️ | ⚠️ | N/A | N/A | N/A | N/A | N/A | ❌ | ⚠️ | ✅ | ✅ | N/A | N/A | N/A |
| FileUpload | ✅ | ✅ | ✅ | N/A | ⚠️ | ✅ | ✅ | ✅ | ⚠️ | N/A | N/A | ❌ | ⚠️ | ✅ | ✅ | N/A | N/A | ⚠️ |

## Findings — P0 (block 1.0)

| # | Severity | Pattern | Component | Issue | Fix | Effort |
|---|---|---|---|---|---|---|
| 1 | **P0** | i18n | `ui/dialog.tsx:165` | Hardcoded `<button title="Close">`. Blocks non-English markets | Add `closeButtonAriaLabel?: string` prop on `DialogContent`; thread to Close button | S |
| 2 | **P0** | i18n | `composed/confirm-dialog.tsx:44-45,75` | Hardcoded `confirmText="Confirm"`, `cancelText="Cancel"`, `processingLabel="Processing..."` | Accept `confirmLabel`/`cancelLabel`/`processingLabel` props; defaults preserve current behavior | S |
| 3 | **P0** | i18n | `ui/spinner.tsx:68-72,313` | sr-only text `Loading...`/`Complete`/`Error` hardcoded — screen-reader announcements not localizable | Add `srLabel?: string` prop with mode-specific defaults | S |
| 4 | **P0** | a11y | `ui/checkbox.tsx` | `aria-required` not propagated from FormField context to `<input>` | Wire `aria-required={ariaRequired \|\| undefined}` from FormField context | S |
| 5 | **P0** | a11y | `ui/dialog.tsx` (mobile sheet variant via `useIsMobile`) | Focus trap not explicitly tested for mobile sheet variant. Radix usually traps focus but needs verification | Add Playwright test: open Dialog at mobile viewport; tab cycle stays within sheet | M |
| 6 | **P0** | resource cleanup | `ui/button.tsx:315-338,474-498` | `onClickAsync` doesn't handle unmount during pending promise. Potential `setState`-after-unmount warning | Add mounted ref or `AbortController` cleanup pattern | S |
| 7 | **P0** | a11y | `shell/data-table.tsx` | Rows visible but no `tabIndex`, no `role="button"`, no keyboard selection. WCAG 2.2 fail | Add row tab index management + arrow key nav + Space-to-toggle pattern | M |
| 8 | **P0** | a11y | `ui/button.tsx` | No `aria-pressed` exposed for toggle-style use (e.g. "Bold" toolbar button) | Accept optional `isPressed?: boolean`; set `aria-pressed={isPressed}` when defined | S |

## Findings — P1 (fix before 1.0 freeze)

| # | Severity | Pattern | Scope | Issue | Fix | Effort |
|---|---|---|---|---|---|---|
| 9 | **P1** | RTL | ALL ~168 interactive components | Zero RTL coverage. No `dir="rtl"` stories, no logical-property CSS migration, no icon mirroring. Blocks Arabic/Hebrew/Persian/Urdu markets | Phase: (a) Storybook RTL decorator, (b) global codemod `mr-` → `me-`, `ml-` → `ms-`, (c) directional-icon mirror via `transform: scaleX(-1)` on `dir="rtl"`, (d) RTL story for top 20 components | L (2-3 days for top 20; weeks for full surface) |
| 10 | **P1** | forced-colors | Select, Tabs, Dialog, Toast, DatePicker, Combobox, Tooltip, Alert, Accordion, Skeleton, Stepper | Forced-colors support added 0.36.0 but uneven backfill — only ~36% of components have explicit `@media (forced-colors: active)` blocks | Audit each component; add forced-colors block with CSS system-color keywords (`Canvas`, `CanvasText`, `Highlight`, `LinkText`) | M |
| 11 | **P1** | a11y | `ui/select.tsx` | No `placeholder` prop; aria-label fallback unclear when no value selected | Add `placeholder?: string`; render when `!value`; expose as fallback aria-label | S |
| 12 | **P1** | RTL + i18n | `composed/date-picker.tsx` | Calendar grid not mirrored in RTL; arrow keys (left/right) don't flip semantically (RTL: left arrow = next day) | Logical CSS properties + RTL-aware key handler | M |
| 13 | **P1** | a11y | `composed/combobox.tsx` | Async search doesn't set `aria-busy="true"` on trigger / listbox during fetch | Add `aria-busy={isLoading}` to trigger and listbox | S |
| 14 | **P1** | RTL | `ui/slider.tsx` | Track fill animates left-to-right always; should mirror in RTL | Use logical properties or `transform: scaleX(-1)` on dir-rtl | S |
| 15 | **P1** | a11y | `ui/{toggle,switch}.tsx` | Disabled state styling exists but `disabled` attribute / `aria-disabled` mismatch in some paths | Verify `disabled` attribute on inner control; wrappers only adjust opacity / cursor | S |
| 16 | **P1** | a11y | `ui/badge.tsx` | No semantic state variants (`error`/`warning`/`success`) — only color tokens. Can't semantically distinguish a "warning badge" beyond color | Add `state?: 'default' \| 'error' \| 'warning' \| 'success'` axis; cascade through CVA | S |
| 17 | **P1** | a11y | `ui/tooltip.tsx` | Portal renders outside scroll containers; collision detection not always handled | Use Floating-UI collision detection or test boundary explicitly | M |
| 18 | **P1** | a11y test backfill | 32 of 44 components LACK explicit `vitest-axe` assertion in their tests | Backfill axe assertion in Button, Input, Checkbox, Select, Tabs, Dialog, Toast, DatePicker, Combobox, Slider, Switch, Toggle, DataTable, FormField, FileUpload — top 15 first | M |

## Findings — P2 (post-1.0)

| # | Severity | Pattern | Component | Issue | Fix | Effort |
|---|---|---|---|---|---|---|
| 19 | P2 | keyboard nav | `ui/tabs.tsx` | Arrow keys work; Home/End not handled for first/last tab jump | Add Home/End handler in TabsList | S |
| 20 | P2 | a11y | `composed/dropdown.tsx` | Disabled menu items not styled distinctly + missing `aria-disabled` | Add `aria-disabled` and disabled-item styling | S |
| 21 | P2 | RTL | `ui/alert.tsx` | Icon-start alignment not mirrored on RTL | Logical margin properties | S |
| 22 | P2 | layout | `shell/navigation.tsx` | Horizontal nav alignment edge-case on tablet | Add tablet breakpoint alignment | S |
| 23 | P2 | feature | `composed/inline-edit.tsx` | No read-only variant; can't show non-editable preview | Add `readOnly?: boolean` prop | S |
| 24 | P2 | feature | `composed/color-input.tsx` | Opacity slider doesn't preview color in real-time | Live-update preview swatch | S |
| 25 | P2 | a11y | `composed/stepper.tsx` | Disabled steps not visually distinct; can be visited via keyboard | Add muted styling + `aria-disabled` | S |
| 26 | P2 | RTL | `ui/file-upload.tsx` | Status + progress flex direction LTR-only | Logical flex properties | S |

## Findings — P3 (polish)

| # | Severity | Pattern | Component | Issue |
|---|---|---|---|---|
| 27 | P3 | scaling | `ui/icon.tsx` | Icon size cascade in dense layouts could use IconGroup more uniformly |
| 28 | P3 | motion | `ui/toast.tsx` | Timer-bar opacity crossfade could be smoother |
| 29 | P3 | affordance | `composed/date-picker.tsx` | First-tap interaction affordance subtle |
| 30 | P3 | motion | `ui/accordion.tsx` | `prefers-reduced-motion` honored but transition crossfade could be more graceful |
| 31 | P3 | RTL motion | `ui/spinner.tsx` | Arc rotation direction same in LTR/RTL — minor visual nit, not functional |
| 32 | P3 | RTL motion | `ui/toast.tsx` | Slide-in direction same in LTR/RTL |
| 33 | P3 | docs | RTL Storybook decorator | Ship one for global RTL preview |
| 34 | P3 | docs | Forced-colors Storybook foundation | Already exists per CHANGELOG 0.36.0 — verify still rendering |

## Hardcoded user-facing strings (i18n hot list — 25 instances across 8 components)

| Component | Strings | File | Lines |
|---|---|---|---|
| Dialog | `"Close"` | `ui/dialog.tsx` | 165 |
| ConfirmDialog | `"Confirm"`, `"Cancel"`, `"Processing..."` | `composed/confirm-dialog.tsx` | 44-75 |
| Spinner | `"Loading..."`, `"Complete"`, `"Error"` | `ui/spinner.tsx` | 68-72, 313 |
| Toast | File-size units `"B"`, `"KB"`, `"MB"`, `"GB"` | `ui/toast.tsx` | 330-406 |
| FileUpload | `"File too large"`, `"Invalid type"` | `ui/file-upload.tsx` | ~150 |
| Pagination | `"Previous"`, `"Next"` | `ui/pagination.tsx` | ~80 |
| Calendar | Day/month names (verify if locale-aware via `date-fns` already) | `composed/date-picker/calendar.tsx` | ~120 |
| DatePicker | `"Select date"`, `"Clear"` | `composed/date-picker/index.tsx` | ~90 |
| Combobox | `"No results"`, `"Loading..."` | `ui/combobox.tsx` | ~130 |

**Strategy:** add per-component i18n props (`closeLabel?: string`, etc.) with current strings as English defaults. Backwards-compatible. Pre-1.0 P0 because public release without localization-readiness blocks Karm i18n + most enterprise adoption.

## Layer averages

| Layer | Avg coverage | P0 | P1 | P2 | P3 |
|---|---|---|---|---|---|
| `ui/` | ~82% | 4 | 6 | 4 | 2 |
| `composed/` | ~75% | 3 | 3 | 2 | 4 |
| `shell/` | ~70% | 1 | 1 | 1 | 0 |
| `ai/` | ~60% | 0 | 0 | 1 | 2 |

## Pre-1.0 timeline (optimistic)

| Week | Focus |
|---|---|
| 1 | P0 — i18n props + aria-required + button-unmount + DataTable keyboard nav (8 fixes) |
| 2 | P1 — RTL audit framework + RTL fixes for top 10 components (mr→me, icon mirrors, directional motion) |
| 3 | P1 — forced-colors backfill across 11 missing components + axe test backfill for top 15 |

**Total:** 2-3 weeks to P0/P1 resolution. P2/P3 deferred post-1.0.

## Verdict

**Edge-case coverage is uneven but trackable.** P0 set is small + mechanical. The single biggest systemic gap is RTL (zero coverage) — fixing it transforms the codebase from "single-locale-ready" to "internationalization-capable". Forced-colors backfill is the second-largest gap; foundation laid in 0.36.0, finish the work uniformly.

After P0+P1 resolution, the codebase clears the WCAG 2.2 AA bar uniformly and is ready for global market positioning at 1.0.
