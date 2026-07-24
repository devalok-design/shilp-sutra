# ui/toggle — finish-bar audit
Finish: 4/5   Market: PARITY (shadcn/Radix Toggle)   Rebuild: polish

Thin, well-built wrapper over the vendored Radix `@primitives/react-toggle`. Composes the base primitive (no re-rolled surface), semantic tokens throughout, role-radius `rounded-control`, zero slop tells, conformance-backed tests, and a full story matrix. Since the 2026-07-01 baseline (4/5) the per-component doc gap is **resolved** (doc exists and matches source). Remaining gaps are polish-tier: the `whileTap` press scale still has **no reduced-motion guard** (the one real reflex, unfixed since baseline), the default `md`/`sm` sizes sit **below the 44px touch target**, the `color` axis is short `warning`/`info`, and there's no `asChild`.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| 1 visual-integrity | ✓ | `rounded-control` role token; transparent bg + `hover:bg-surface-raised-hover` (default) or single `border-surface-border-strong` (outline) — no edge-soup, no accent rail, no gradient/glow, no pill-spam. Semantic scales (`accent/error/success` -2/-11), not framework palette. |
| 2 accessibility | gap | Radix gives correct `role=button` + `aria-pressed` + native keyboard; focus-visible ring+offset present; `aria-label` required and documented. BUT `sm`=32px and default `md`=40px are **below 44px**; only `lg`=48px passes. No `touch-target` util applied, no `forced-colors` treatment. |
| 3 api-composability | gap | Correct Radix toggle vocab (`pressed`/`defaultPressed`/`onPressedChange`); `forwardRef`+`displayName`; typed, no `any`. But variant taxonomy is `default/outline` (no `soft`/`ghost` naming); `color` axis missing `warning`+`info`; **no `asChild`** though the underlying primitive supports it. |
| 4 docs-dx | ✓ | Per-component doc now present, accurate vs source (Props/Defaults/Example/Composability/Gotchas), correctly frames Toggle-vs-Switch. Minor: no `@example` JSDoc block on the component itself (Card/StatCard family standard). |
| 5 testing | ✓ | `describeConformance` + RTL: renders, click-toggles, `pressed`/`defaultPressed`, `aria-pressed`/`data-state`, disabled, no-toggle-when-disabled. Conformance carries the axe pass. |
| 6 motion | ✗ | `whileTap={{ scale: 0.95 }}` with **no `useReducedMotion` guard** (toggle.tsx:50) — the rubric's hard tell; the established pattern (button.tsx, badge.tsx) is skipped. Also inconsistent: standalone Toggle animates press, `ToggleGroupItem` (reuses `toggleVariants`) does not. Spring itself (`springs.snappy`, damping 30) is bounce-free — correct. |
| 7 state-coverage | gap | hover/press/focus-visible/disabled/pressed all deliberate. But `color` paints only `data-[state=on]` — an unpressed colored toggle hovers neutral grey regardless of `color`, so the prop is inert until pressed (defensible, undocumented). Loading/empty/error-as-state are N/A for this archetype. |
| 8 content-resilience | ✓ | Archetype is a single icon or 1–2 char label; `gap-ds-03` is logical-safe, no directional glyphs. No truncation strategy, but nothing to truncate by design. |
| 9 theming-resilience | ✓ | Role radius honors `[data-shape]`; accent-9 swap flows through `focus-visible:ring-accent-9` + `accent-2/11`; transparent/`surface-*` bg means no dark-mode recess-vanish risk. |
| 10 system-cohesion | gap | Shares `toggleVariants` with ToggleGroup (good), uses DS springs/tokens/focus-ring. Drift: press animation exists on standalone Toggle but not on grouped items; variant naming (`default`) diverges from the `soft/ghost` sibling taxonomy. |
| 11 craft | ✓ | Press-scale feedback, focus ring offset, `disabled:pointer-events-none` + `opacity-action-disabled`, CSS color transition on hover. Clean micro-details (only the sub-44px hit area detracts, scored in a11y). |
| 12 perceived-performance | ✓ | Instant; animates `scale`/color only (HW-accel, no layout shift); no CLS. |
| 13 market-benchmark | ✓ (PARITY) | vs shadcn Toggle (default/outline, sm/default/lg) — we **lead** with a semantic `color` axis + press-spring feedback; shadcn's sizes are also sub-44px. vs Radix (headless) — not visually comparable. Net parity+. |
| 14 cross-DS adoption | — | See ideas below. |

## Top gaps (prioritized)
- **[P1] motion** — `whileTap` scale has no `useReducedMotion` guard → mirror Button/Badge: `const prefersReduced = useReducedMotion(); whileTap={prefersReduced ? undefined : { scale: 0.95 }}`.
- **[P1] accessibility** — default `md` (40px) and `sm` (32px) below 44px hit target → apply the `touch-target` util (invisible expanded pointer area) so at least the default meets AA without changing visual size.
- **[P1] api-composability** — `color` axis missing `warning`+`info` → add `warning: 'data-[state=on]:bg-warning-2 data-[state=on]:text-warning-11'` and `info` (same pattern); extend test `colors` + `ColorVariants` story.
- **[P2] api-composability** — no `asChild` though the Radix primitive supports it → thread `asChild` (drop/wrap the motion element in the slotted branch) or document non-support deliberately.
- **[P2] system-cohesion** — grouped items don't get the press animation standalone toggles do → decide one way (animate both, or neither) so the family reads as one system.
- **[P2] state-coverage** — document that `color` applies to the on/pressed state only, so consumers don't expect colored hover.
- **[P3] docs-dx** — add `@example` JSDoc on `Toggle`/`ToggleProps` to match Card/StatCard family standard; WithIcon story uses raw `h-4 w-4` — model the `<Icon icon={...} size="sm" />` API instead.

## What it does well
- Composes `TogglePrimitive.Root` rather than re-rolling a button surface — no F5-style drift; controlled + uncontrolled both correct.
- Role-radius `rounded-control` (not `rounded-ds-*`/`rounded-full`) — clears the release-only radius gate.
- No slop tells whatsoever (no edge-soup, gradient text, accent rail, glow/glass, emoji, pill-spam); all semantic tokens.
- Bounce-free `springs.snappy` for a functional press micro-interaction — correct Emil call.
- Shares its CVA (`toggleVariants`) with ToggleGroup — single source of truth for the toggle look.
- Clean, complete test + story matrix; doc is accurate against source.

## Cross-DS adoption ideas
- **shadcn / Radix**: expose `asChild` so a toggle can render as a link or custom element (formatting toolbars occasionally need this) — the underlying primitive already supports it; we just don't thread it.
- **React Aria (Adobe) ToggleButton**: ships a true expanded press/hit area independent of visual size — adopt via our `touch-target` util so the default `md` meets 44px without growing the pixel box.
- **Apple HIG / Linear toolbars**: a `soft` selected treatment (tinted fill without border) as a variant option would round out the taxonomy and align with the DS-wide soft-over-outline preference; today selected relies on the per-`color` step-2/11 fill only.
- **Base UI Toggle**: distinct `data-[state=on]` hover step (colored hover on selected) so hover is legible on an already-pressed colored toggle — we currently reuse the neutral hover regardless of state.

## Rebuild note
**Polish, not rebuild.** Structure is sound — it correctly wraps the Radix primitive, shares its CVA with ToggleGroup, and has no structural or slop defect. Four in-place edits close the bar: (1) add the `useReducedMotion` guard on `whileTap`; (2) apply `touch-target` so the default size meets 44px; (3) add `warning`+`info` to the `color` axis (+ test/story); (4) decide `asChild` and the grouped-item motion consistency deliberately. All are additive/non-breaking.
