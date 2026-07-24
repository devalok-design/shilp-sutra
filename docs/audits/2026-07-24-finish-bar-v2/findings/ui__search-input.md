# ui/search-input — finish-bar audit
Finish: 3/5   Market: LAGS(React Aria SearchField)   Rebuild: polish

SearchInput is a thin, correctly-composed wrapper over `Input` (adds a leading `IconSearch`, an
auto-shown clear `Button`, and a loading `Spinner`). Structure and visuals are clean — no slop
tells, role radius tokens inherited from Input, shared spring. But it is unchanged since the
2026-07-01 baseline: both prior P1s (size drift, controlled-only clear) and the wrong doc
keyboard claim survive three release cycles. The gaps are real (silent uncontrolled failure, a
factually-false doc claim about Escape-to-clear, a hard-cut spinner swap), which is what pulls it
from the baseline's 4 down to 3.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | No slop tells. Inherits `rounded-control` (role token), `bg-surface-raised-hover`, muted icon color from Input. No edge-soup, no radius-ds/full, no arbitrary values in its own source. |
| accessibility | gap | Clear button has `aria-label="Clear search"` + `title`; `aria-busy` on loading; focus-within ring inherited. But NO `type="search"`/`role=searchbox` semantics, no built-in accessible name (leans on consumer placeholder), and the clear `Button size="icon-xs"` is below the 44px touch target. No forced-colors-specific handling beyond Input's. |
| api-composability | gap | `forwardRef` + `displayName` ✓, composes Input cleanly ✓, `value`/`onChange`/`onClear` canonical. But clear is **controlled-only** — `hasValue = value !== undefined && value !== ''`, so `defaultValue` + `onClear` silently renders no clear button. No `type="search"` default. No uncontrolled path. |
| docs-dx | ✗ | doc.md line 34 claims "Escape auto-triggers `onClear` … via `type="search"`'s native behavior" — the code never sets `type="search"` and never wires Escape, so this is factually wrong and will cause consumer bugs. Plus size drift: props table + JSDoc say `sm\|md\|lg` while the type ships `xs\|sm\|md\|lg`. |
| testing | ✓ | Unit + RTL + `describeConformance` (a11y/focus/ref). Covers placeholder, icon render, value change, clear show/hide/click, disabled, loading+aria-busy. Missing xs/RTL/all-sizes but the core matrix is solid. |
| motion | gap | Clear button enter/exit is correct: `springs.snappy` (near-critically-damped, bounce-free), opacity+scale (HW-accel), `AnimatePresence` exit. But the `loading` branch sits OUTSIDE AnimatePresence → spinner↔clear hard-cuts on toggle (the most visible async transition). No `useReducedMotion` guard. |
| state-coverage | gap | default/hover/focus/disabled/loading/empty/clear all designed & storied. error delegated to Input+FormField (legit scoping). But the uncontrolled case is an undesigned silent-failure state (no clear button ever appears). |
| content-resilience | gap | Long query scrolls natively; clear button in fixed-width endSection (no shift). But no RTL handling — Input uses physical `border-r/-l` + `rounded-l/-r`, and the clear button stays on the right edge in `dir="rtl"` (should flip to leading). No RTL story. |
| theming-resilience | ✓ | Inherits Input tokens; survives accent-9 swap (focus ring `ring-accent-9`); `rounded-control` honors `[data-shape]`; no sunken track to invert, so no dark-mode vanish risk. |
| system-cohesion | ✓ | Textbook composition — shared `springs.snappy`, `Input`/`Button` ghost/`Spinner`/`Icon` primitives, shared focus-ring and radius language. Zero bespoke drift. |
| craft | ✓ | `title="Clear"`, `aria-busy`, `endSectionClickable` gating (pointer-events), scale-in affordance. Minor miss: `hasValue` treats numeric `0` as non-empty (`0 !== ''` → true). |
| perceived-performance | ✓ | Instant controlled feedback, spinner for async, `aria-busy`, clear button scales within a fixed-width slot → no CLS. |
| market-benchmark | gap | LAGS React Aria SearchField: it wires Escape-to-clear, sets `type="search"`, supports uncontrolled, and returns focus to the input after clear — all of which we either lack or falsely claim. |
| cross-ds-adoption | — | See ideas below. |

## Top gaps (prioritized)
- [P1] api-composability — Clear button is controlled-only; `defaultValue` + `onClear` silently renders nothing → wire `type="search"` as default + read the ref (or internal uncontrolled state) so the clear affordance works uncontrolled, and add a `defaultValue` story.
- [P1] docs-dx — doc.md's Escape/`type="search"` keyboard claim is verifiably false (grep confirms no `type="search"`, no Escape handler) → either implement it (set `type="search"` default + `onKeyDown` Escape→`onClear`, which also fixes the P1 above) or delete the claim.
- [P1] docs-dx — `size` axis drift: type ships `xs` but JSDoc + props table + autodocs say `sm|md|lg` → add `xs` (Input supports 28px) to both, add an `AllSizes` story, or drop it from the type deliberately.
- [P2] motion — spinner↔clear hard-cuts because the `loading` branch is outside AnimatePresence → wrap both in one `<AnimatePresence mode="wait">` keyed by state so the swap crossfades.
- [P2] accessibility — clear `Button size="icon-xs"` is below 44px touch target; consider bumping the hit area (invisible padding) without growing the visual glyph.
- [P2] content-resilience — no RTL: clear button doesn't flip to the leading edge in `dir="rtl"` → add an RTL story to lock behavior; note physical-property inheritance from Input.
- [P3] craft — `hasValue` treats numeric `0` as non-empty → narrow `value?: string` on SearchInputProps so a search field is unambiguously text-valued.

## What it does well
- Clean composition — delegates all surface/padding/border/token concerns to `Input` via `startSection`/`endSection`; does not re-roll primitives (the StatCard-composes-Card ideal).
- Clear-button motion is genuinely good: bounce-free `springs.snappy`, animates transform+opacity only, `AnimatePresence` handles exit.
- Solid a11y basics on the affordances it owns: `aria-label`/`title` on clear, `aria-busy` on loading, focus-within ring inherited.
- Real tests: `describeConformance` + explicit clear-button gating/click/loading assertions.

## Cross-DS adoption ideas
- **React Aria SearchField** — Escape-to-clear wired to the callback, `type="search"` semantics, and returns focus to the input after clear. We should adopt all three (and it retroactively makes our doc claim true).
- **React Aria / Ark** — uncontrolled support with a built-in clear that reads the field's own value, plus an `onSubmit` (search-on-Enter) affordance we don't expose.
- **cmdk / Linear command bar** — instant-filter + inline result-count affordance in the trailing slot; a natural extension of our existing `endSection`.
- **Adobe** — clearing returns focus to the input so keyboard users keep typing; our clear button leaves focus on the (now-unmounted) button.

## Rebuild note
polish — the structure is correct (composes Input), so no structural rebuild. Fixes are additive:
(1) set `type="search"` default + `onKeyDown` Escape→`onClear`, which also unlocks a ref-read uncontrolled clear path; (2) delete/repair the false doc keyboard claim and fix the `xs` size drift in JSDoc + doc.md; (3) merge the spinner and clear into one `AnimatePresence mode="wait"`; (4) add `AllSizes` + `RTL` + `defaultValue` stories; (5) optionally narrow `value?: string`. No visual or a11y-P0 blocker, no radius-role gate risk. Systemic tells checked: none (no `border-card-strong`, motion carries `opacity: 0` so no slide-no-fade, no `rounded-ds-`/`rounded-full`, no arbitrary values in its own source).
