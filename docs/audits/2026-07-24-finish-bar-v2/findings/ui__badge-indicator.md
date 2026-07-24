# ui/badge-indicator — finish-bar audit
Finish: 3/5   Market: PARITY (MUI/Ant Badge)   Rebuild: polish

BadgeIndicator is a positional notification overlay (`dot` / `count`) exported as `Badge.Indicator`. Since the 2026-07-01 baseline (3/5) it has **improved on three fronts**: motion default swapped `springs.bouncy` → `springs.smooth` (bounce-by-default resolved), `forwardRef<HTMLSpanElement>` added, and a per-component doc now exists. It remains genuinely clean on the headline slop tells. What still holds it at 3 is a hard a11y gap (dynamic count announced to nobody, dot has no accessible name), a **missing test file** (publish gate), magic-number sizing, and a color map re-rolled from Badge instead of composed.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | No accent rail / gradient / glass / emoji; `rounded-pill` role token correct; single ring edge (`ring-2 ring-surface-raised`), no edge-soup. BUT magic numbers: `min-w-[18px] h-[18px] text-[11px] px-1` + dot `h-2.5 w-2.5` — off DS cadence. |
| accessibility | ✗ | Count `motion.span` has no `role`/`aria-live` → count changes announced to no one; `dot` has no accessible name (invisible to SR). No `forced-colors` handling. Mitigant: `...rest` spreads onto the wrapper so a consumer *can* pass `aria-label`, but there is no built-in live region. Non-interactive overlay so no focus/keyboard needs. (Classed P1, not a P0 pattern break.) |
| api-composability | gap | `forwardRef` ✓, `displayName` ✓, `children: ReactNode` ✓, controlled via `count` ✓, sensible defaults ✓. BUT `color` typed off private `COLOR_CLASSES` const (not shared `BadgeColor`); no `size` axis; no `offset`/`overlap` fine-positioning; re-rolls the family color map. |
| docs-dx | ✓ | Doc present with Props/Defaults/Example/Composability/Gotchas and matches source (colors, placements, defaults verified). Stories cover Default/Overflow/Dot/Colors/Placements/HidesZero. Nit: changelog stops at v0.29 (no note of forwardRef/motion change). |
| testing | ✗ | No `badge-indicator.test.tsx` (Glob: none). Show/hide logic (`showZero`, `count>max` cap, `invisible`, `dot`) and the reduced-motion branch are untested. CLAUDE.md treats tests as a publish gate. |
| motion | ✓ | `springs.smooth` (ζ≈0.97, effectively bounce-free); `useReducedMotion` drops scale → fade-only; enter/exit differentiated via `AnimatePresence`; animates transform+opacity only. Sibling Badge dot uses `springs.snappy` (cohesion drift, see below) but this is at-bar. |
| state-coverage | ✓ | count>0 show, count=0 hide, `showZero`, `dot`, `invisible` (layout-stable), `max` overflow → `99+`. Empty handled deliberately. hover/active/loading/error/selected N/A (non-interactive). |
| content-resilience | gap | `99+` overflow cap good; `min-w`/`px` grows for multi-digit. BUT placement uses **physical** `-right-1`/`-left-1` — no logical properties, won't mirror in RTL. |
| theming-resilience | gap | Semantic `*-9`/`*-fg` survive accent-9 swap ✓; `rounded-pill` honors `[data-shape]` ✓. BUT ring color is **hardcoded `ring-surface-raised`** — the cutout halo mismatches the real backdrop when the badge sits on surface-1 (page) or surface-2 (card). Solid fill stays visible in dark (not a recessed track), so no vanish bug. |
| system-cohesion | gap | Duplicates Badge's `colorMap` solid rows instead of composing (drift risk); spring differs from Badge dot (`smooth` vs `snappy`); `color` type not the shared `BadgeColor`. |
| craft | ✓ | Ring-2 cutout halo punches the marker off the child; `min-w` keeps single digits circular then grows; `leading-none` prevents vertical drift; scale-from-0 pop is satisfying. |
| perceived-performance | ✓ | Pure state-driven, instant; `invisible` preserves layout (no CLS); spring is interruptible. |
| market-benchmark | gap | PARITY with MUI/Ant Badge on the core surface (count/max/dot/color/placement/invisible/showZero); lags on `size`, `offset`/`overlap`, accessible `title`, custom color, and `status`+text presence. |
| cross-DS-adoption | gap | See ideas below — several cheap wins from Ant/MUI. |

## Top gaps (prioritized)
- [P1] accessibility — count not in a live region; `dot` has no accessible name → add `role="status"` + `aria-live="polite"` (or offscreen "N unread") to the count span; give `dot` an optional `aria-label` or `aria-hidden` when purely decorative.
- [P1] testing — no co-located test → add RTL + `vitest-axe`: hides at `count={0}`, shows with `showZero`, `99+` cap, `dot` renders no text, `invisible` hides, axe-clean.
- [P1] visual-integrity — magic numbers `min-w-[18px] h-[18px] text-[11px] px-1` → map to DS scale (`text-ds-xs`, `px-ds-01`, sizing tokens); raise a scale gap if 18/11px genuinely have no token rather than inlining literals.
- [P2] system-cohesion / api — derive color rows from Badge's `colorMap` and type `color?: BadgeColor` (single source of truth); add missing `neutral`.
- [P2] content-resilience — swap physical `-top/-right/-left/-bottom-1` for logical properties so placement mirrors in RTL.
- [P2] theming-resilience — make the ring color context-aware (or document that it assumes a raised backdrop) so the halo matches surface-1/2 hosts.
- [P2] api-composability — consider a `size` axis (`sm`/`md`) for dense contexts.

## What it does well
- Clean of every headline slop tell (no accent rail, gradient text, glass/glow/blob, emoji, framework palette). Uses semantic `*-9`/`*-fg` tokens throughout.
- Correct radius role token (`rounded-pill`) — no `rounded-ds-*`/`rounded-full` release-gate blocker.
- Single edge treatment (`ring-2` halo) — no border+shadow edge-soup.
- Motion is now bounce-free and reduced-motion-guarded; enter/exit differentiated.
- Deliberate empty/overflow/invisible states; `invisible` gives layout stability.
- `forwardRef` + `displayName` now present (baseline gap closed).

## Cross-DS adoption ideas
- **Ant Design Badge** has a `size` axis (`default`/`small`) and an `offset` prop for pixel-nudging the marker — we have neither; a `size` axis + optional `offset` would cover dense toolbars and irregular child shapes.
- **Ant Badge** `status` + `text` renders a colored presence dot with an inline label ("● Online") — a first-class presence pattern we currently force consumers to compose by hand; worth a dedicated variant.
- **Ant Badge** exposes `title` (the accessible/hover string) — the cleanest fix for our a11y-name gap; adopt as an explicit prop rather than relying on `...rest` spread.
- **MUI Badge** has `overlap` (`rectangular`/`circular`) that changes the offset geometry so the marker hugs a round avatar vs a square icon correctly — our fixed `-top-1/-right-1` offsets don't adapt to child shape.
- **MUI/Ant** both support a custom color (hex/CSS color) alongside the semantic enum — useful for brand-tinted counts; we're enum-only.

## Rebuild note
Polish, not rebuild — the anatomy (relative wrapper + absolute animated marker) is sound and the visual/motion layers are at bar. In-place scope: (1) add `role="status"`/`aria-live` + a `dot` accessible name; (2) add the missing test; (3) replace magic-number sizing with DS tokens; (4) compose Badge's `colorMap` and type `color?: BadgeColor` (+ `neutral`); (5) logical properties for RTL placement. Optional richness: `size` axis, `offset`/`overlap`, `title`, custom color, and a `status`+text presence variant to reach LEADS.
