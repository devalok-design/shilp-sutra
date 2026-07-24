# ui/dot — finish-bar audit

Finish: 4/5   Market: LEADS   Rebuild: polish

A small semantic status/indicator dot — the low-level primitive behind StatusBadge,
presence/health indicators, legend swatches, Avatar status. Non-interactive
(decorative-or-announced), so the interactive-state axes (hover/focus/press/keyboard)
are N/A and not penalized. Peer: Mantine `Indicator` / Chakra v3 `Status` / Ant `Badge status`.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | `rounded-pill` role token (good, NOT rounded-full); no edge-soup; `withBorder` uses a single `ring-2` treatment. BUT `border-[1.5px]` (ring variant, L150) is a raw arbitrary value — should be a token/role width. `gap-ds-02` is below the ds-03/05/07 cadence (minor, and defensible for a tight label gap). |
| accessibility | ✓ | Exemplary. Bare dot = `aria-hidden` (surrounding element carries meaning); a `label` OR `aria-label` promotes it to `role="status"`. This decorative↔announced auto-switch is the pattern most DS get wrong. Labels use step-11 text (AA). No touch-target/focus needed (non-interactive). Gap: no `forced-colors` fallback — a `bg-*-9` fill can vanish in Windows high-contrast (mitigated for announced dots by the text label; a concern only for bare decorative dots, which by design aren't the sole signal). |
| api-composability | ✓ | Typed intent union (`color`), no stringly `color?: string`; `variant` filled/ring/off; `label: ReactNode`; `forwardRef` + `displayName`; sensible defaults. Stateless so no controlled/uncontrolled needed. It IS the shared primitive others compose (StatusBadge/Badge), not a re-roll. `current` color for text inheritance is a nice touch. |
| docs-dx | ✓ | Doc has Props/Defaults/Example/Composability/Gotchas/Changes and matches source. Rich composability notes (decorative-vs-announced, pulse=live semantics). Minor: no explicit Types section (props table covers it); example references `StatusDot` in prose (L7) though StatusDot was merged INTO Dot in 0.49.0 — light staleness. |
| testing | ✓ | `describeConformance` + RTL for decorative/announced/aria-label/pulse-present/pulse-absent. axe via conformance. Solid for a primitive. Minor: no explicit test for `off`-suppresses-pulse or `withBorder`. |
| motion | ✓ | Pulse is opt-in, off by default (correct — a static status shouldn't animate). Contained opacity breathe (`animate-pulse`), explicitly NOT an expanding halo/ring (a common slop tell, avoided by design). Opacity-only = HW-accel. `motion-reduce:animate-none` guard present. `pulseSpeed` maps to real durations (0.6/1/2s). Bounce-free. Keyframe (non-interruptible) is fine for an ambient loop. |
| state-coverage | ✓ | For an indicator the "states" are the treatments: filled (active) / ring (outline) / off (inactive) + pulse (live), all deliberately designed. `off` cleanly serves the disabled/inactive role. `showPulse = pulse && variant !== 'off'` prevents a contradictory pulsing-inactive dot. Interactive states genuinely N/A. |
| content-resilience | ✓ | Dot is fixed-size (no overflow risk); `label` is ReactNode and free to wrap per consumer layout; `labelPosition` handles start/end. Gap: `labelPosition` is physical, not logical — it won't auto-flip in RTL (consumer must set it), and the wrapper uses `gap` (side-neutral) but order is explicit. Minor. |
| theming-resilience | ✓ | step-9 fills / step-11 text survive an accent-9 swap; `rounded-pill` honors `[data-shape]`; `withBorder` ring uses `ring-surface-raised` (theme-adaptive). `off` variant (`*-9/10` fill + `/40` border) is faint on near-black dark but that IS the inactive intent — no elevation-inversion bug. |
| system-cohesion | ✓ | Shares intent vocabulary, radius role token, `text-body-*` ramp, and ds spacing with siblings. No bespoke drift — it's the canonical primitive the rest of the status family composes. |
| craft | ✓ | Strong. Decorative/announced auto-switch, pulse-suppressed-for-off, contained-breathe-not-halo, `aria-label` passthrough, `current` color, per-size label text scaling. The micro-decisions a user feels but never names. |
| perceived-performance | ✓ | Instant, static, zero layout shift; opacity animation is HW-accelerated. |
| market-benchmark | ✓ (LEADS) | Richer than Chakra Status (simpler indicator) and Ant `Badge status` (color+text only) on treatments (filled/ring/off) and pulse tempo, and clearly ahead of all peers on the decorative↔announced a11y semantics. Mantine `Indicator` adds positioned-overlay/`processing`/`disabled` — but our positioned-overlay case is deliberately delegated to `BadgeIndicator`, so for the bare-dot archetype we lead. |
| cross-ds-adoption | — | See ideas below. |

## Top gaps (prioritized)
- [P1] accessibility — no `forced-colors` fallback; a `bg-*-9` disc can disappear in Windows high-contrast. → add a `forced-colors:` outline/border so the disc keeps a visible edge (announced dots survive via label, bare decorative ones don't).
- [P2] visual-integrity — `border-[1.5px]` (ring variant) is a raw arbitrary value (magic-number). → promote to a shared ring-width token/role so it can't drift from sibling ring components.
- [P2] visual-integrity — `gap-ds-02` is below the ds-03/05/07 cadence. → acceptable for a tight dot↔label gap; document the exception or move to ds-03 if it reads too tight.
- [P2] content-resilience — `labelPosition` is physical (start/end don't auto-flip in RTL). → note in docs, or derive from writing direction.
- [P2] docs-dx — prose still references `StatusDot` (merged into Dot in 0.49.0). → reword to avoid implying a separate component.

## What it does well
- Best-in-class decorative↔announced a11y: bare = `aria-hidden`, labeled/`aria-label` = `role="status"`. Nails the semantic most DS botch.
- Motion restraint: pulse off by default, opacity-only contained breathe (never an expanding halo), reduced-motion guarded, tunable tempo.
- Clean primitive with correct role tokens (`rounded-pill`, `text-body-*`) and no re-rolled siblings — it's the composition root for the status family.
- Thoughtful guards: `off` can't pulse; `current` color inherits text; per-size label scaling.

## Cross-DS adoption ideas
- Mantine `Indicator` exposes `processing` (an animated variant) and a `disabled` toggle — our `pulse`/`off` cover both, but consider a single `status` shorthand (`live`/`idle`/`inactive`) that sets variant+pulse together for the common presence case.
- Chakra v3 `Status` ships a compound `Status.Root`/`Status.Indicator` API for slotting the dot beside arbitrary content with shared color context — we do this via `label`, but a `color`-context provider would let a Dot color a nearby text node without repeating the prop.
- Ant `Badge status` pairs the dot with a `text` and a subtle `overflowCount` on the numeric sibling — the count case is (correctly) `BadgeIndicator`'s job here; worth a doc cross-link so consumers don't reach for Dot for counts.
- Radix/React-Aria pattern: add a `forced-colors` treatment (see P1) — none of the simpler peers do this either, so it'd be a differentiator.

## Rebuild note
Polish, not rebuild. The structure, API, a11y semantics, and motion are all at or above market bar — this is one of the cleaner primitives in the DS. Scope the polish to: (1) a `forced-colors` edge fallback [P1]; (2) replace `border-[1.5px]` with a shared ring-width token [P2]; (3) minor doc dewax (StatusDot prose, RTL labelPosition note). No P0s; no structural concerns.
