# ui/surface — finish-bar audit

Finish: 4/5   Market: LEADS (vs MUI Paper)   Rebuild: none

Low-level elevated-container primitive. One job: paint a tokened surface (bg + shadow) with optional radius/padding/border. Card/Popover/Toast/Sheet compose it. No slots, no color axis, no motion — by design. Source-verified against `surface.tsx`, stories, tests, doc, and the token files it consumes (all classes resolve to real tokens; nothing dead).

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | Role radius (`rounded-control/surface/overlay/pill`), surface-bg + role shadow tokens, `p-ds-04/05/06` cadence. bg and shadow are coupled in every `elevation` value — impossible to produce an un-tokened surface. Actively guards against edge-soup: dev-warns when `bordered` is combined with a shadowed elevation (the double-edge anti-pattern). `border-surface-border-strong` is a real token (semantic.css:185/611) — NOT the dead `border-card-strong`. No slop tells. |
| accessibility | ✓ (mostly N/A) | Generic non-interactive container. Spreads `React.HTMLAttributes<HTMLDivElement>` so a consumer can add `role`/`aria-*`; `asChild` (Slot) lets the surface BE a semantic element (link/section/article) with no wrapper. No focus/keyboard/touch-target obligations for a static box. Correctly delegates semantics rather than hardcoding a `div` role. |
| api-composability | ✓ | Canonical, minimal, correct: `forwardRef` + `displayName`, `VariantProps`-typed axes (no `any`, no stringly `color?: string`), `asChild` via Radix Slot, exports `surfaceVariants` for downstream composition, sensible defaults (`raised`/`none`/`surface`). Stateless so controlled/uncontrolled is N/A. Deliberately does NOT re-roll Card — it is the thing Card composes. Textbook primitive design. |
| docs-dx | gap | Doc has Props/Defaults/Elevation/Padding/Example/Composability/Gotchas and matches source. Two nits: `bordered` is documented as `"true" | "false"` (string) when it's a real boolean prop; and no `## Types` section. Minor, non-blocking. |
| testing | ✓ | `describeConformance` + unit tests for each elevation, padding scale, radius override, bordered+flat, `asChild` class carry-through, AND both branches of the double-edge dev-warn (warns on raised+bordered, silent on flat+bordered). Thorough for the surface area. No standalone axe play test in stories, but conformance covers the a11y baseline for a static container. |
| motion | N/A | No motion by design — the docstring explicitly assigns motion to the components composed on top. Not penalized. |
| state-coverage | gap (N/A-leaning) | No interactive states by design (static box). `--color-surface-raised-hover`/`-active` and `--shadow-raised-hover` tokens exist in the system but Surface exposes no `interactive`/hover-elevation affordance — so the `asChild`-as-link story renders a clickable surface with zero hover feedback. Consumer must add it via `className`. Reasonable for a primitive; noted as a cross-DS idea, not a defect. |
| content-resilience | ✓ | Plain box, no text of its own; overflow/truncation is the child's concern. Symmetric all-side padding (`p-ds-*`) is inherently RTL-safe (no logical-property gaps). Handles zero/any children. |
| theming-resilience | ✓ | 100% token-driven, zero raw values. Dark-mode overrides defined (`surface-raised`→neutral-2 / 0.17L, explicit `surface-overlay` dark oklch, `border-strong`→neutral-5). Radius role tokens honor `[data-shape]` presets. Uses no accent, so an accent-9 swap can't break it. `flat` sits at neutral-2 in dark — visibly above a near-black page, so no elevation-inversion vanish (the segmented-track bug does not recur here). forced-colors handled at token layer. |
| system-cohesion | ✓ (LEADS) | This IS the cohesion primitive — the shared surface/shadow/radius vocabulary other components are meant to inherit. No bespoke drift; it defines the tune the "thousand voices" sing in. |
| craft | ✓ | The double-edge dev-warn is genuine above-bar craft — it encodes a design rule as a runtime guardrail (prod-stripped via `NODE_ENV`). bg+shadow coupling makes the wrong thing unrepresentable. `asChild` adds no DOM node. `// @server-safe` annotation for correct RSC "use client" handling. |
| perceived-performance | ✓ (N/A-leaning) | Pure presentational, no runtime state, no layout shift, no jank. The only JS is a dev-only warn check. |
| market-benchmark | ✓ LEADS | Closest peer is **MUI Paper** (elevation prop). shadcn/Radix Themes have no standalone surface primitive — they hardcode elevation into Card. vs Paper: Paper offers 25 numeric elevation levels (0–24) + `variant=elevation|outlined` + `square`. Surface's 4 *semantic* elevations (flat/raised/floating/overlay) mapped to intent + the anti-edge-soup guard is cleaner and more opinionated than Paper's raw shadow ramp. We LEAD on token discipline and the double-edge guardrail; Paper only "leads" on shadow granularity, which is itself an inconsistency vector. |
| cross-ds-adoption | gap | Concrete imports below. |

## Top gaps (prioritized)
- [P2] docs-dx — `bordered` shown as `"true" | "false"` string in the doc Props table; it's a boolean. → correct the generated/authored prop type; add a `## Types` line.
- [P2] state-coverage — no built-in hover/active elevation despite `surface-raised-hover`/`shadow-raised-hover` tokens existing; the `asChild`-link story has no press/hover affordance. → consider an opt-in `interactive` variant (see cross-DS).
- [P2] testing — no explicit `vitest-axe` assertion in stories/tests (conformance covers baseline). → add a lightweight axe play test for parity with other components.

## What it does well
- Encodes a design rule as a runtime guardrail: the double-edge dev-warn stops raised+bordered edge-soup before a user sees it.
- bg + shadow are coupled per elevation value — there is literally no API path to an un-tokened surface.
- Radius role tokens only (no `rounded-ds-*`/`rounded-full`) — passes the release-only radius gate cleanly; `[data-shape]`-ready.
- Correct scope discipline: refuses to grow slots/color/motion, leaving those to Card and friends. This is the anti-drift primitive.
- `asChild` + forwardRef + `surfaceVariants` export + `// @server-safe` — composes cleanly and renders in RSC.

## Cross-DS adoption ideas
- **MUI Paper `variant="outlined"`** ↔ our `elevation="flat" bordered` — same intent, ours is already covered; keep as-is.
- **Radix Themes Card `interactive` + `asChild`**: Radix wires a hover/active surface shift for clickable cards. We have `surface-raised-hover`/`-active` + `shadow-raised-hover` tokens sitting unused by Surface. Add an opt-in `interactive` boolean that layers `hover:bg-surface-raised-hover hover:shadow-raised-hover active:bg-surface-raised-active` (motion-safe, transform/opacity-free) so the `asChild`-as-link pattern gets real affordance without every consumer re-deriving it.
- **MUI Paper polymorphic `component` prop**: we already do this better via `asChild` (no wrapper node) — no action, just confirms we lead here.

## Rebuild note
None. This is a market-leading primitive for its scope — clean token discipline, a runtime anti-slop guardrail, correct composition boundaries, thorough tests. The only work is polish: fix the `bordered` doc type, optionally add an `interactive` opt-in variant (tokens already exist), and add an axe play test. All P2, none blocking. Do not touch the elevation/edge model — it is the DS's surface source-of-truth and everything else composes it.
