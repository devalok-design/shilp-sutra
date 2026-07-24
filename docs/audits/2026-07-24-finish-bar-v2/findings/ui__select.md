# ui/select — finish-bar audit
Finish: 4/5   Market: PARITY (Radix)   Rebuild: polish

A faithful, well-typed compound wrapper over the vendored Radix Select. Accessible, correctly surfaced, role-token clean. The one axis below bar is **motion**: the dropdown fades/scales in with no reduced-motion guard and no exit animation (snaps shut), and the trigger has no hover/press feedback. All fixable in place — no structural rebuild.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | No edge-soup (trigger picks border OR overlay-elevation; content is `shadow-floating` with no competing border). Role radius `rounded-control`/`rounded-overlay`. Semantic tokens throughout. Lone arbitrary value `min-w-[8rem]` (L164) — the Radix/shadcn min-width idiom, benign. |
| accessibility | gap | Radix baseline is strong: `combobox` role, keyboard open (Enter/Space tested), roving nav, `focus-visible:ring-2 ring-accent-9 ring-offset-2`, `aria-invalid` on error, `aria-describedby`/`aria-required` wired from FormField. Gaps: disabled dimming is opacity-only (collapses under `forced-colors` HC); no `forced-colors:` fallback in-unit; `xs`/`sm` trigger heights fall under the 44px touch target with no `touch-target` util. |
| api-composability | ✓ | Compound parts, `asChild` used correctly (Icon L105, Content L156), controlled + uncontrolled via Radix (`value`/`defaultValue`/`onValueChange`/`open`), `forwardRef` + `displayName` on every part, `VariantProps`-derived axes, `Omit<…,'color'>` to dodge the HTML clash, `SelectTriggerProps` exported, no `any`. `color`→`state` was a hard break in 0.49.0 (no alias) but that's shipped history, not a live regression. |
| docs-dx | gap | Doc prop table matches CVA; size-on-trigger gotcha documented + JSDoc'd; the prior FormField-drift note is now corrected in the doc (v0.49 changelog states inheritance). Remaining: no Sizes coverage; doc doesn't state the spring+tween overlay rhythm. |
| testing | gap | Solid: variants, all 4 states + `aria-invalid`, keyboard open, ref, className merge, disabled/does-not-open, disabled-item `data-disabled`, axe-clean. Missing: the whole `size` axis (xs/sm/md/lg untested), focus-visible assertion, RTL, forced-colors. No `describeConformance`. |
| motion | ✗ | Two P1s unchanged since the 2026-07-01 finding: (1) entrance `motion.div` (scale 0.95→1 + fade, L159-162) has **no `useReducedMotion`/`withReducedMotion` guard** despite the helper existing in the motion lib — vestibular a11y gap; (2) **no exit animation** — `Content asChild` wraps a bare `motion.div` with only `initial`/`animate`, no `AnimatePresence`/`forceMount`, so Radix unmounts and close is an instant pop (asymmetric feedback). Plus default/outline trigger has no hover/press transition (only `ghost` and items get one). |
| state-coverage | gap | default / hover / focus-visible / disabled / error / success / warning / selected(indicator) all designed. But hover/press is missing on the default+outline trigger (the most-touched element), and there's no empty-list (zero-item) affordance. |
| content-resilience | ✓ | `line-clamp-1` + `min-w-0` on both trigger value and item text, `whitespace-nowrap`, `max-h-96` + scroll up/down buttons for long lists, `--radix-select-trigger-width` matching. Down-chevron is non-directional so RTL-safe. |
| theming-resilience | ✓ | Semantic tokens only (`accent-9/7`, `surface-*`, `error/success/warning-7`); role radius honors `[data-shape]`; overlay uses `bg-surface-overlay` so it survives dark. No sunken track to invert — no dark-elevation trap. |
| system-cohesion | ✓ | Shares the DS spring (`springs.snappy` + `tweens.fade`), role radius, focus-ring, `ds-*` spacing, and `FieldState`/`resolveFieldState` with the input family. Minor drift: trigger lacks the `transition-colors duration-fast-01` that SelectItem and Input/Button carry. |
| craft | gap | Nice touches: `select-none`, `cursor-default` items (Radix convention), absolutely-positioned indicator so text doesn't shift, `[&>span]:line-clamp-1`. Miss: the trigger has zero resting→hover micro-feedback on its two most-used variants. |
| perceived-performance | ✓ | Instant Radix open, portaled, no CLS, snappy spring. Only ding is the abrupt close (folds into the motion ✗). |
| market-benchmark | PARITY | It *is* Radix underneath, cleanly wrapped — parity with Radix's own select. Lags Linear/Vercel-tier polish on motion (no easing-out close) and trails Base UI / React Aria on advanced listbox features (below). |
| cross-ds-adoption | gap | Concrete imports available from peers (see list). |

## Top gaps (prioritized)
- [P1] motion — no reduced-motion guard on the entrance (scale+fade). Wrap the transition in `useReducedMotion()` / `withReducedMotion()` so scale collapses to opacity-only/instant. Mirror Dialog/Popover.
- [P1] motion — no exit animation; dropdown snaps shut. Add `AnimatePresence` + Radix `forceMount` with `exit={{ opacity:0, scale:0.95 }}` mirroring the enter, or drive close off `data-state` CSS.
- [P2] motion / state-coverage — default+outline trigger has no hover/press feedback. Add `transition-colors duration-fast-01 ease-productive-standard` + a subtle hover to the base, matching SelectItem and the input family.
- [P2] accessibility — `xs`/`sm` heights below 44px touch target and opacity-only disabled dims under forced-colors. Confirm the global forced-colors layer covers disabled controls; consider `touch-target` on small sizes.
- [P2] testing/docs — add a `Sizes` story + size assertion; add focus-visible and forced-colors demonstration.
- [P2] api — `success`/`warning` states paint only `border-*-7` while `error` paints border+text+ring. Either bring them to parity or document the intentional validation-only subset.

## What it does well
- Textbook Radix compound wrapper: every part `forwardRef` + `displayName`, controlled/uncontrolled both work, `asChild` used precisely.
- Clean visual integrity — one edge treatment per element, role radius, `shadow-floating` overlay, no slop tells.
- Correct surface + theming: `bg-surface-overlay` content, semantic tokens, honors `[data-shape]`.
- FormField integration is genuinely good — inherits `state`, `helperTextId`, `required` into ARIA with explicit-prop precedence, shared `resolveFieldState`.
- Content resilience (line-clamp + min-w-0 + scroll buttons) is better than most DS selects.

## Cross-DS adoption ideas
- **Base UI / React Aria**: virtualized listbox + async/loading item state for long option sets — we render all items eagerly. Worth a `loading` slot and virtualization for 100+ options.
- **React Aria (Adobe)**: multi-character typeahead beyond Radix's single-key match, and a documented empty/"no results" affordance — we have neither.
- **Radix `Select.Item` + shadcn patterns**: item description / secondary-text slot and leading-icon convention. Our `SelectItem` only clamps a single line of children.
- **Linear/Vercel taste**: ease-*out* close (the exit we're missing) and a hairline hover on the trigger — the difference between "functional" and "feels finished".

## Rebuild note
**Polish, not rebuild.** Structure, API, a11y baseline, and visuals are sound — the wrapper is faithful and cohesive. Scope is tight and in-place: (1) reduced-motion guard on the entrance, (2) `AnimatePresence`/`forceMount` exit so close eases out symmetrically, (3) trigger hover/press transition on default+outline, (4) size story/test + forced-colors/touch-target confirmation, (5) success/warning state parity or a documented subset. No file restructuring, no API change.
