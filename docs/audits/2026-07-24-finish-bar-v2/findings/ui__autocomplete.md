# ui/autocomplete — finish-bar audit
Finish: 2/5   Market: LAGS (Base UI Combobox / React Aria)   Rebuild: rebuild

Free-text input + live-filtered listbox with real combobox ARIA, keyboard nav, Floating-UI positioning, and clean semantic tokens. It is genuinely NOT slop. It lags because it **re-rolls the `Input` primitive** (already drifted), is **controlled-only with no `size`/`state` axes**, and **reads FormField error state but never paints it**. Essentially unchanged since the 2026-07-01 baseline (also 2/5) apart from a `text-ds-md`→`text-body-md` type-ramp touch — every structural gap (F5/G2/H/F6/G3, dead effect, JSDoc tell) survives.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | No slop tells. Correct surfaces (input `surface-raised-hover`, dropdown `surface-overlay`), role radius (`rounded-control`/`rounded-overlay`), single edge treatment (dropdown = `shadow-raised-hover`, no border → no edge-soup). Spacing on cadence (ds-03/04). |
| accessibility | gap | Strong combobox ARIA (expanded/autocomplete/controls/activedescendant, listbox/option/aria-selected), focus-visible ring, axe-clean. BUT input `h-ds-md`=40px and option rows `py-ds-03` are **under the 44px touch target**; no `touch-target` util. `aria-controls` set only while open. |
| api-composability | ✗ | Re-rolls the field instead of composing `Input`; **no `defaultValue`/uncontrolled path** (controlled-only selection); no `size`/`state` axes its sibling inputs carry; no `renderOption` slot / `asChild`. Good: `forwardRef`+`displayName`, typed, `onValueChange`, object value. |
| docs-dx | gap | Doc line 33 says "Does NOT auto-consume FormField state" — **source does** (`useFormField()`, wires aria-invalid/describedby/required). Optional props listed without `?`. Otherwise accurate. |
| testing | ✓ | Render, filter, case-insensitivity, click+keyboard select, empty (custom+default), Escape close, aria-expanded/autocomplete, disabled, axe. Missing: `describeConformance`, ArrowUp/Home/End, disabled-blocks-keyboard. |
| motion-emil | gap | DS tokens only (`springs.snappy`, `tweens.fade`), no bounce-by-default. Items have proper fade+slide (opacity:0 + y:4 — **not** slide-no-fade). But `staggerChildren:0.03` on a dropdown that opens on every focus and re-filters on every keystroke is high-frequency animation Emil would cut; no local `useReducedMotion` (relies on global `MotionConfig`); no press feedback on options. |
| state-coverage | ✗ | default/hover(`bg-accent-3`)/focus/disabled/empty all designed; selected via `font-semibold`. BUT `isError` is read from FormField and **only fed to aria-invalid — never painted** (SR users told invalid, sighted users see grey; `Input` colors the border). **No loading/async state** for a search control. |
| content-resilience | gap | Option labels render as bare text with no truncation in a fixed reference-width dropdown → long/i18n labels wrap unbounded. Zero/one/many handled. Physical `px-ds-04` (not logical) for RTL; vertical list so no arrow-mirroring needed. |
| theming-resilience | ✓ | Semantic tokens throughout (`accent-9`/`accent-3`, surface tokens); survives accent swap; role radius honors `[data-shape]`; no sunken track, so no dark-mode elevation-inversion risk. |
| system-cohesion | ✗ | The "thousand voices" failure: a **second source of truth for text-input appearance** that has already diverged from `Input` — `ring-offset-[var(--border-focus-offset)]` vs Input's `ring-offset-2`, `focus-visible` vs Input's `focus-within`, no hover-active bg, no read-only handling, hardcoded `h-ds-md` vs Input's `size` CVA. |
| craft | ✓ | Nice unseen details: `onMouseDown` preventDefault keeps input focused on option click, `onBlur` relatedTarget check keeps dropdown open when clicking into it, `size` middleware matches dropdown width to input, `mouseEnter` syncs highlight to pointer. Blemish: dead no-op cleanup effect (tsx:144-148). |
| perceived-performance | ✓ | Instant client-side `useMemo` filter, no layout shift. No virtualization (fine for the known-list use case; would jank on thousands). |
| market-benchmark | ✗ | LAGS Base UI Combobox / React Aria: they ship virtualized listbox, async/loading state, matched-substring highlighting, grouping, uncontrolled mode, size/state, custom option render. We match only on ARIA + keyboard + portal positioning. |
| cross-ds-adoption | n/a | See ideas below. |

## Top gaps (prioritized)
- [P0] system-cohesion / api — Re-rolls `Input` and has drifted (ring-offset, focus-within vs focus-visible, no hover/read-only, hardcoded height). → Compose `<Input role="combobox" state={isError?'error':undefined} size={size} .../>`; let Input own the box, Autocomplete own the behavior. Kills F5+G2+H+disabled-guard in one move.
- [P1] state-coverage — `isError` read but never painted; no loading state. → Falls out of composing Input (border/ring come along); add an `isLoading` prop + spinner endSection for async lists.
- [P1] api — Controlled-only; no `size`/`state`. → Add `defaultValue?: AutocompleteOption | null` (uncontrolled) and forward `size`/`state` through the composed Input.
- [P1] accessibility — 40px input / sub-44px option rows. → `touch-target` util on input; min-height on option rows.
- [P2] docs — Doc contradicts source on FormField consumption; optional props unmarked. → Rewrite line 33; add `?` markers.
- [P2] motion — Stagger on a keystroke-frequency dropdown. → Drop `staggerChildren` (or gate to first-open only); add local reduced-motion note.
- [P2] content — No option-label truncation. → `truncate` + `title` on option rows.
- [P2] craft — Dead no-op cleanup effect (tsx:144-148). → Delete.
- [P2] verbal-tell — JSDoc closer "These are just a few ways — feel free to combine props creatively!" (tsx:56) is copy-pasted AI filler. → Delete.

## What it does well
- Correct combobox ARIA pattern end-to-end (activedescendant model, not focus-stealing) — axe-clean and tested.
- Real keyboard nav: ArrowDown/Up/Home/End/Enter/Escape all handled.
- Focus-retention craft: `onMouseDown` preventDefault + `onBlur` relatedTarget check so clicking an option (in a body portal) doesn't blur-close the field.
- Floating-UI `size` middleware syncs dropdown width to the input and caps height to available viewport space.
- Clean token discipline: no raw px/hex, role radius tokens, correct surface layering, no visual slop tells.

## Cross-DS adoption ideas
- **Base UI Combobox / React Aria** — virtualized listbox: import a windowing strategy so a 5k-option list stays smooth (we render every filtered node).
- **React Aria / Ark** — async/loading contract (`isLoading` + `loadingText`) so "type to search" against a server has a first-class state; today there's only sync client-side filtering.
- **cmdk / Algolia autocomplete** — matched-substring highlighting: bold the query span inside each `option.label`. Cheap, high-perceived-quality, and the single most-recognizable "good autocomplete" affordance we lack.
- **Base UI / Downshift** — a `renderOption`/item slot for icons, secondary text, and grouping; `filtered.map` currently renders bare `option.label`.

## Rebuild note
Rebuild — structural, but bounded. The behavior/ARIA/positioning layer is sound and worth keeping wholesale; the rebuild is a **re-parenting**: render the field through the existing `Input` primitive instead of a hand-rolled `<input>`. That single move deletes the drift (cohesion ✗), inherits `size`/`state`/read-only/hover (api ✗ + state-coverage error-border), and standardizes the disabled guard. Layer on `defaultValue` (uncontrolled), matched-text highlighting, and an optional `isLoading` state to reach parity with Base UI. No behavioral rewrite needed — this is composition debt, the exact StatCard→Card pattern the audit exists to close.
