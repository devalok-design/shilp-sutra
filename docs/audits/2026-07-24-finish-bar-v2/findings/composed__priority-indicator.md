# composed/priority-indicator — finish-bar audit
Finish: 2/5   Market: LAGS(Linear)   Rebuild: rebuild

_Source-verified against `priority-indicator.tsx` (0.52.x). Prior 2026-07-01 baseline scored 2/5; re-verified — none of that baseline's P0/P1 items have been fixed in source, so the score holds._

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | No slop tells (no edge-soup, gradient, glow, emoji). Uses semantic + `category-slate` tokens, `rounded-control` (valid role token), `p-ds-01/02`, `gap-ds-02b` (all defined tokens — no magic numbers). BUT HIGH and URGENT are visually IDENTICAL statically (both `bg-error-3`/`text-error-11`), differing only by icon glyph + the pulse. And it uses `rounded-control` where its true sibling `Badge` uses `rounded-pill` — family radius mismatch. |
| accessibility | ✗ | **P0.** Compact mode's only accessible name is `title={config.label}` on a non-interactive `<div>` (:87) — SR-unreliable, mouse-only. No `aria-label`/`role="img"`; Icon carries no label. Animated `motion.div` wrappers (:96,:116) have no `aria-hidden`. Not color-only (icons distinguish), which is the one thing it gets right. Non-interactive so no keyboard/focus obligations. |
| api-composability | gap | `forwardRef`+`displayName`, exported `Priority` union, no `any`, case-insensitive normalization — good typing. BUT the CVA `display` axis emits **empty strings for both branches** (:53-56) — a dead axis that does nothing (real branching is `if (display==='compact')`); test even skips the `variants` conformance axis because of it. `display` is off-taxonomy (canonical is `size`/`variant`). Re-rolls the chip surface 3× instead of composing `Badge`. `children` Omitted → closed re-implementation, no label override. |
| docs-dx | gap | Doc **contradicts source**: says "LOW=success" (:27) but source is `category-slate` (neutral). Doc claims "Server-safe: Yes" but source has a hardcoded `'use client'` (:1) + framer-motion import — it is NOT server-renderable. Changelog stalls at v0.2.0. Has Props/Defaults/Example/Composability/Gotchas though. |
| testing | gap | Conformance + 8 behavior tests (labels, lowercase normalize, compact title, svg present). No axe play test in stories, no reduced-motion test, no compact accessible-name assertion. `variants` axis skipped (dead CVA). Renders-focused. |
| motion | ✗ | **P0.** Infinite URGENT pulse `animate={{scale:[1,1.1,1]}} transition={{repeat:Infinity,duration:2,ease:'easeInOut'}}` (:97-98, :116-118) with **no `useReducedMotion` guard** — WCAG 2.2.2 (Pause/Stop/Hide) + vestibular. Sibling `Badge` gates its identical dot-pulse behind `useReducedMotion`; this didn't. Inline hardcoded 2s/easeInOut, not a `lib/motion` preset. It's decoration, not communication. |
| state-coverage | gap | One deliberate state per priority; hover/active/focus N/A (non-interactive). No fallback for an unexpected `priority` string — `priorityConfig[normalizedPriority]` is `undefined` → `.icon` throws (TS union guards compile-time, not runtime). Severity states under-differentiated (HIGH≈URGENT). |
| content-resilience | gap | Labels hardcoded English, no override path (`children` Omitted) → no i18n. Short strings, no overflow risk. Arrows are semantic (up/down severity), not layout-directional, so RTL is fine; flex `gap` handles mirroring. Unknown priority → runtime crash (no defensive fallback). |
| theming-resilience | ✓ | Semantic + `category` tokens; uses no accent, so an accent-9 swap is a non-issue. `rounded-control` honors `[data-shape]`. `bg-*-3`/`text-*-11` pairs hold in light + dark; no sunken track to invert. |
| system-cohesion | gap | Drifts from `Badge` (the component it visually IS): different radius (`control` vs `pill`), re-rolled surface, inline easing vs motion presets, and — tellingly — doesn't reuse Badge's `useReducedMotion` handling. Tokens are on-system; the composition is bespoke. |
| craft | gap | Icons optically centered; default cursor appropriate. But `title`-only tooltip is mouse-only, and the HIGH/URGENT static collapse is an anti-craft detail — once reduced-motion is honored, the two top severities are indistinguishable at a glance. |
| perceived-performance | ✓ | Static render, no async, no layout shift, instant. Pulse animates `scale` (compositor-cheap); only cost is a forever-running animation (addressed by the reduced-motion fix). |
| market-benchmark | gap | LAGS Linear/Jira priority indicators: they render crisp, static, labeled severity glyphs with no perpetual motion and accessible names in compact form. We match on token discipline but lose on compact a11y, unguarded infinite motion, and static severity separation. |
| cross-DS-adoption | n/a | See ideas below. |

## Top gaps (prioritized)
- **[P0] motion** — Infinite URGENT pulse, no reduced-motion guard → add `const reduced = useReducedMotion()`; when true render the static chip (no `motion.div`). Mirror `badge.tsx` exactly.
- **[P0] accessibility** — Compact chip has no real accessible name → add `aria-label={config.label}` + `role="img"`, keep Icon `aria-hidden`; add `aria-hidden` to the animated wrapper. (Composing Badge resolves this for free.)
- **[P1] system-cohesion / api** — Re-rolls the chip 3× instead of composing `Badge` → recompose as `<Badge color=… startIcon=config.icon variant="soft">`; icon-only Badge for compact. Erases the radius drift, the a11y gap, and the triplication in one move.
- **[P1] api** — Dead CVA `display` axis (both branches empty) → drive real classes through CVA or drop the CVA; rename off-taxonomy `display` toward `size`/a boolean `iconOnly`.
- **[P1] docs** — Doc says LOW=success (source=slate) and "Server-safe: Yes" (source has `'use client'`) → correct both; refresh stale v0.2.0 changelog.
- **[P2] visual/state** — HIGH and URGENT statically identical → give URGENT a stronger static treatment (solid `bg-error-9`/`text-error-fg` or a border) so severity reads without motion.
- **[P2] resilience** — Unknown `priority` string crashes at runtime → default-fallback the config lookup.

## What it does well
- Clean token usage — semantic `error`/`warning` + `category-slate`, valid `rounded-control` role token, defined `ds` spacing tokens. Zero slop tells, zero magic numbers, zero dead classes (`border-card-strong`), no `rounded-ds-*`/`rounded-full` ship-blockers.
- Not color-only: every severity carries a distinct Tabler icon (down/minus/up/alert), so meaning survives color-blindness.
- Case-insensitive `priority` normalization matches both UPPERCASE and lowercase backend conventions without consumer coercion.
- Solid typing: `forwardRef` + `displayName`, exported `Priority` union, no `any`, no `React.FC`, no stringly `color?: string`.

## Cross-DS adoption ideas
- **Linear** ships priority as a compact, labeled, static glyph set with a keyboard-navigable picker — we could pair this indicator with a `PrioritySelect` and keep the indicator purely presentational + accessible.
- **Jira/GitHub** never loop motion on a priority flag; attention is conveyed by static weight (solid fill for the top tier). Adopt a solid `error-9` URGENT so severity reads without any animation.
- **Radix/Base UI status primitives** expose `asChild`/`children` for label override; add a `label` or `children` escape hatch here for i18n and custom copy.

## Rebuild note
**Rebuild (small, structural).** Public API (`priority` + `display`) can be preserved, but the fix is a body rewrite: recompose the three hand-rolled chips as a single `<Badge>` (inheriting `rounded-pill`, color semantics, a11y labeling, and reduced-motion-gated pulse), delete the dead CVA `display` axis, add the compact accessible name, differentiate URGENT statically, and reconcile the doc. This is the same F5 drift StatCard eliminated by composing Card — the closed re-implementation is precisely why a11y, motion, and radius all drifted. It's ~50 lines, so cheap, but it's structural, not cosmetic. The two P0s (unguarded infinite motion + compact a11y) cap the finish at 2/5 until fixed.
