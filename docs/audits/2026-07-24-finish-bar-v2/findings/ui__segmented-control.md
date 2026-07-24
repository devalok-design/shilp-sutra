# ui/segmented-control — finish-bar audit
Finish: 4/5   Market: PARITY (Apple HIG / shadcn+Radix ToggleGroup)   Rebuild: none

> Audited against the **0.52.0 rebuild** (published 2026-07-24). The 2026-07-01
> baseline scored this **3/5** with a **P0 a11y failure** (tablist/tab on a
> panel-less toggle) plus five P1/P2 gaps. Every one of those is now fixed —
> re-verified against source below. This is a strong, near-exemplary rebuild; the
> only remaining gap is content-resilience at scale (many-segment overflow + no
> per-option disabled), which is already tracked as deferred follow-up work.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| 1 visual-integrity | ✓ | Rounded-rect track via role tokens (`rounded-surface` track / `rounded-control` segments). Single edge: `--shadow-segment` on the thumb, **no border** on the track → the baseline's edge-soup (border + inset) is gone. No accent rail / gradient / glow / emoji. Minor cadence nit: heights `h-7/h-8/h-10` and icon box `h-4 w-4` are raw Tailwind, not ds size tokens (baseline G3, still present — but not arbitrary-bracket magic). |
| 2 accessibility | ✓ | **Fixed P0**: `role="radiogroup"` + `role="radio"` + `aria-checked` (was tablist/tab). Roving tabindex (selected=0, rest=-1), Arrow/Home/End with wrap, RTL-mirrored arrows, `touch-target` 44px hit area via ::before (was 28/32/40px), `focus-visible:ring-2 + offset`, `ariaLabel` for icon-only segments, vitest-axe clean. Best-in-class. |
| 3 api-composability | ✓ | Canonical `value`/`defaultValue`/`onValueChange`; controlled **and** uncontrolled; `selectedId`/`onSelect`/`variant="default"` staged as `@deprecated` aliases (no hard break); `text` widened to `ReactNode` + optional; `IconInput` typed; `forwardRef`+`displayName`. Ceiling: data-driven `options` array (no per-option `asChild`/`render`/`disabled`) — documented deliberate tradeoff. |
| 4 docs-dx | ✓ | Doc has Props/Types/Defaults/Example/Composability/Gotchas/Changes and matches source (`icon?: IconInput` corrected from baseline's stale `ComponentType`). Thorough v0.52.0 changelog. Story argTypes fixed to `soft/solid` (dead `accent` removed). |
| 5 testing | ✓ | `describeConformance` + 25 cases: radio semantics, roving tabindex, arrows/Home/End/wrap, RTL arrows, disabled blocks click+keyboard, controlled+uncontrolled+defaultValue, deprecated-alias back-compat, icon render, fullWidth, icon-only ariaLabel, axe. |
| 6 motion-emil | ✓ | Frequency-appropriate: functional toggle → crisp bounce-free spring (`{duration:0.3, bounce:0}`, Apple notation). `useReducedMotion` snaps to `duration:0`; `motion-safe:active:scale-[0.97]` press feedback; `transition-[color,transform]` (not `all`); `layoutId` thumb = transform-based + interruptible. Textbook. |
| 7 state-coverage | ✓ | hover (muted→fg), active (press-scale), focus-visible, disabled (`opacity-action-disabled` + `pointer-events-none`), selected (thumb+text). empty/error/loading are N/A for a segmented control. |
| 8 content-resilience | gap | RTL handled (mirrored arrows, logical). **But**: no overflow/scroll strategy for many segments (deferred), `fullWidth` + `min-w-16` per segment can overflow a narrow container, long labels just expand (no truncation), i18n length-expansion untested. Zero-options degrades gracefully (`options[0]?.id`). |
| 9 theming-resilience | ✓ | Survives accent-9 swap (solid thumb + focus ring track accent); role radius tokens honor `[data-shape]`; **dark-mode elevation inversion explicitly fixed** — separate dark `--color-segment-track` (white 7% tint) + `--color-segment-thumb` (`neutral-3`) so the groove no longer vanishes on near-black (the baseline's dark-track bug). Density via `size`. |
| 10 system-cohesion | ✓ | Shares role radius, focus-ring, ds spacing, DS spring language, `IconProvider`, and the `value/onValueChange` vocab of Tabs/ToggleGroup. Only drift is the raw Tailwind heights. |
| 11 craft | ✓ | Thumb rendered *before* content so content paints above with no z-index juggling; `useId`-scoped `LayoutGroup` prevents cross-instance thumb collisions; `initial={false}` kills mount animation; RTL from nearest `[dir]` with computed-style fallback; touch-target keeps dense visual height. |
| 12 perceived-perf | ✓ | Instant optimistic selection + press-scale; transform/opacity-only (HW-accel); absolutely-positioned thumb → no reflow/CLS; `requestAnimationFrame` focus hand-off after keyboard nav. |
| 13 market-benchmark | ✓ (parity) | vs shadcn: **ahead** — shadcn has no first-class sliding-thumb segmented control (you compose ToggleGroup); this ships radiogroup a11y + RTL + reduced-motion + touch targets out of the box. vs Apple HIG native / React Aria: **parity** — matches the crisp slide and semantics but lacks Apple's overflow/scroll-at-scale handling. |
| 14 cross-ds | ✓ | Concrete imports listed below. |

## Top gaps (prioritized)
- **[P2] content-resilience** — no overflow strategy for many segments; `fullWidth` + `min-w-16` can overflow a narrow column → add a horizontal-scroll or wrap strategy (or document a max sensible segment count). *Already tracked as deferred.*
- **[P2] api-composability** — no per-option `disabled` → add `disabled?: boolean` to `SegmentedControlOption` (skip in roving tabindex + block `emit`). *Already tracked as deferred.*
- **[P3] visual/cohesion** — heights `h-7/h-8/h-10` and icon `h-4 w-4` are raw Tailwind, not ds size tokens (baseline G3 partial) → map to ds size tokens for full cadence conformance; the `h-4 w-4` icon wrapper is redundant since `IconProvider` sizes.

## What it does well
- **Killed the P0**: correct `radiogroup`/`radio`/`aria-checked` for a panel-less single-select — the exact bug this whole audit skill was born from.
- **Motion is a reference implementation** — bounce-free functional spring, reduced-motion snap, motion-safe press-scale, transform-only, interruptible. Cite it as the DS motion exemplar.
- **Dark-mode elevation inversion solved with dedicated tokens** (`--color-segment-track`/`-thumb` light+dark) — the recessed groove stays visible on near-black, fixing the baseline's vanishing track.
- **No edge-soup** — track carries no border/inset; the thumb's single `--shadow-segment` is the only edge treatment.
- **API migrated cleanly** — canonical vocab, controlled+uncontrolled, deprecated aliases with JSDoc, `ReactNode` labels — a breaking rename done the right way.

## Cross-DS adoption ideas
- **Radix ToggleGroup** exposes per-item `disabled` — we should add `disabled` to `SegmentedControlOption` (partial-disable a single view mode).
- **Apple HIG / Carbon ContentSwitcher** handle many-segment overflow (scroll or proportional shrink) — we truncate/overflow ungracefully; adopt a horizontal-scroll container when segment count exceeds the track width.
- **Radix `asChild` polymorphism** — a per-option `asChild`/`render` escape hatch would let view-mode segments become routed `<a>` links (common in dashboards) without leaving the data-driven API.

## Rebuild note
**None.** This is a fresh, high-quality 0.52.0 rebuild that resolved every baseline P0/P1 and re-verifies clean against source. No structural defect and no in-place fix is *required*. The three gaps are additive enhancements (many-segment overflow, per-option `disabled`, raw-height→ds-token cleanup), all already tracked as deferred follow-ups — schedule them as ordinary backlog polish, not a rebuild. Reserve 5/5 for after the overflow-at-scale story lands.
