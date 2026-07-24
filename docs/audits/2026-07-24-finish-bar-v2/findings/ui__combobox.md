# ui/combobox — finish-bar audit
Finish: 3/5   Market: PARITY (LAGS Base UI / React Aria on async + virtualization)   Rebuild: polish

Searchable single/multi-select built on our Radix Popover primitive. Since the 2026-07-01 baseline (3/5) two of its four P1s have landed: the error state is now *visually* painted (`stateBorderClasses`, applied at trigger) and the vocabulary drift is resolved by converging on the unified `state`/`FieldState` API (0.49.0) — Select moved the same way, so the selector family now shares one vocabulary. What remains is finish/DX polish, not structure: no uncontrolled mode, no reduced-motion guard, asymmetric enter/exit, a keyboard-unreachable pill remove, untokened pill padding, and feature gaps (virtualization / async / custom filter / groups) vs the best-in-class peers. Core a11y and testing are genuinely strong.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | Border-led trigger + shadow-led overlay (`shadow-floating`), role radius tokens only, semantic `accent-*`/`surface-*`, no slop tells. Single drift: `py-[1px]`/`py-[2px]` pill padding (lines 60–61) are off-cadence arbitrary values. |
| accessibility | gap | Strong: `role=combobox/listbox/option`, `aria-activedescendant`, `aria-expanded/controls/haspopup`, `aria-invalid` via `state`, `aria-describedby/required` from FormField, focus mgmt on open/close, full keyboard nav, axe-clean. Gap: per-pill remove button is `tabIndex={-1}` (line 387) — mouse-only; keyboard users must reopen the list to deselect. No `touch-target` on the pill X. |
| api-composability | gap | Canonical `value`/`onValueChange`, unified `state`, `size` axis, discriminated single/multi union, `forwardRef`+`displayName`, typed (no public `any`), composes Popover. Gaps: controlled-only (no `defaultValue`, `onValueChange` required), closed `options[]`+`renderOption` callback (no `Combobox.Option`/`Group` slots, no sections/headers), no custom `filter` prop. |
| docs-dx | gap | Doc has Props/Defaults/Example/Composability/Gotchas/Changes. Stale line: combobox.md:45 says "Does NOT auto-consume FormField state… style error manually" — source *does* auto-consume a11y (lines 417–421) and now paints the visual error. Source wins. |
| testing | ✓ | `describeConformance` (4 sizes) + ~33 cases: keyboard (Arrow/Home/End/Enter/Escape, disabled-skip), multi-select toggle, pill +N, pill remove, empty, disabled-no-open, `aria-activedescendant`, `aria-selected`, `maxVisible` height, `renderOption`, axe-clean. |
| motion | gap | Entrance `{opacity:0, scale:0.95}` → spring+`tweens.fade` (transform/opacity only, HW-accel; chevron rotate clean). Gaps: no `useReducedMotion`/explicit guard — relies on an unguaranteed ambient `MotionConfig`; no `AnimatePresence`/`exit` so close is a hard cut (asymmetric enter/exit). |
| state-coverage | ✓ | default/hover/active/focus-visible/disabled/selected(+check)/highlighted/empty(`emptyMessage`)/error+warning+success (now visual) all deliberately designed & tested. Only missing: async loading state (see cross-DS). |
| content-resilience | gap | Single label `truncate`; pills capped 2 + "+N more"; empty message. Weak spots: filter matches `label` only (ignores `description`); option rows don't truncate long labels; RTL uses physical props (`ml-ds-02` on chevron, `text-left`) not logical (`ms-`/`text-start`). |
| theming-resilience | ✓ | `accent-*`/`surface-*` semantic tokens survive an accent-9 swap; role radius honors `[data-shape]`; trigger `bg-surface-raised-hover` + overlay `bg-surface-overlay` are real tiers — no dark-mode vanish. |
| system-cohesion | ✓ | Shares `springs.snappy`/`tweens.fade`, radius roles, focus-ring pattern, spacing tokens, Icon API, and the unified `FieldState` with its siblings. No bespoke drift. |
| craft | ✓ | `cursor-pointer`+`select-none` options, `scrollIntoView({block:'nearest'})` on highlight, auto-focus search on open, clear-search-on-close, mouse-enter syncs highlight, chevron rotate. The `py-[Npx]` is a craft-motivated optical nudge — just untokened. |
| perceived-performance | gap | Instant open + synchronous filter feel snappy for typical lists. But all filtered options render (no virtualization) — a large option set mounts every node; `maxVisible` only caps scroll height, not DOM. No loading affordance for async data. |
| market-benchmark | gap | PARITY on core UX (a11y, keyboard, multi-select pills, custom render) with shadcn/Radix. LAGS Base UI / React Aria / Ark on virtualization, async loading, custom/fuzzy filter, and grouping. |
| cross-ds | ✓ | Concrete import targets identified below. |

## Top gaps (prioritized)
- [P1] accessibility — pill remove `<button tabIndex={-1}>` (line 387) is mouse-only → make pills roving-tabbable or add Backspace-to-remove-last on the trigger; at minimum document the listbox as the canonical keyboard-removal path.
- [P1] api-composability — controlled-only; `onValueChange` required, no `defaultValue` → add uncontrolled mode (internal state when `value` undefined) and make `onValueChange` optional, matching every other value control in the system.
- [P1] motion — no reduced-motion guard on the open animation + no exit → gate entrance via `useReducedMotion()` (collapse to opacity/duration-0) or guarantee+document the ambient `MotionConfig`; wrap in `AnimatePresence` with a quick symmetric `exit={{opacity:0, scale:0.97}}`.
- [P2] content-resilience — filter ignores `description` and RTL uses physical properties → search label+description (or accept a `filter` prop) and switch `ml-`/`text-left` to logical `ms-`/`text-start`.
- [P2] visual-integrity — `py-[1px]`/`py-[2px]` pill padding (magic numbers) → replace with a spacing token or add a dedicated pill-density token; comment if 1px is genuinely intentional.
- [P2] perceived-performance — no virtualization/async → virtualize the listbox for large sets; add an optional `loading` state.
- [P2] docs-dx — combobox.md:45 FormField line contradicts source → update to "auto-consumes FormField a11y; visual error styling is now automatic via `state`."

## What it does well
- Real Radix Popover composition (not re-rolled), typed `HTMLButtonElement` `forwardRef`, correctly-typed single/multi discriminated union with no public `any`.
- Complete, tested keyboard model: Arrow/Home/End with disabled-option skipping, Enter to select, Escape to close, `aria-activedescendant` on the search input tracking the highlighted option.
- Full ARIA combobox/listbox/option wiring + FormField a11y consumption (`aria-invalid`/`describedby`/`required`) and now a matching *visual* validation border via the unified `state` API.
- Thoughtful craft: auto-focus search, clear-on-close, scroll-highlight-into-view, mouse/keyboard highlight sync, `+N more` pill overflow.
- Clean tokens end to end — role radius, semantic surface/accent, shared springs; survives accent swap and dark mode without drift.

## Cross-DS adoption ideas
- **React Aria / Base UI Combobox** ship async loading state (spinner + `loadingState`) and virtualized listboxes — we render all filtered options and have no loading affordance. Import both for data-backed pickers.
- **Ark / React Aria** expose `Section`/`Group` collection nodes (grouped options with headers/separators) — our flat `options[]` can't group. Add `Combobox.Group` alongside the data prop.
- **Base UI / Downshift** accept a custom `filter`/matcher function (fuzzy, diacritics-insensitive, multi-field) — ours is a hardcoded `label.toLowerCase().includes`. Expose a `filter` prop and search `description` by default.
- **React Aria** supports uncontrolled `defaultInputValue`/`defaultSelectedKey` — we're controlled-only. Adopt the standard controlled/uncontrolled merge.

## Rebuild note
**Polish, not rebuild.** The structure is right: it composes the Popover primitive, the discriminated union is sound, a11y and testing are strong, and the two heaviest 2026-07-01 P1s (visible error state, selector-family vocabulary) are already resolved via the unified `state` API. The remaining work is in-place: keyboard-reachable pill removal, uncontrolled mode, a reduced-motion guard + symmetric exit, logical-property RTL, tokenized pill padding, and the stale doc line. Feature parity with Base UI / React Aria (virtualization, async, grouping, custom filter) is a separate, additive roadmap — flag, don't force, since the data-driven API is a legitimate pattern for searchable lists.
