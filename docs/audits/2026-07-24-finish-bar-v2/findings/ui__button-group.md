# ui/button-group — finish-bar audit
Finish: 4/5   Market: PARITY (MUI ButtonGroup / Chakra ButtonGroup)   Rebuild: polish

ButtonGroup is a presentational layout container: it propagates Button props through two
React contexts (group settings + per-child position), collapses inner radii/borders on
attached children so segments read as one control, and injects tonal divider divs between
non-outline children. It is NOT a selection control (no `value`/`aria-pressed`) — that is
correct; SegmentedControl fills the toggle role. Source is clean of AI slop tells and uses
canonical vocabulary throughout. The one real defect carried from the 0.49/0.50/0.52 cycles
is unfixed: the position geometry uses **physical** sides, so attached groups invert under
`dir="rtl"`.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | No slop tells; semantic tokens throughout; no `rounded-ds-*`/`rounded-full` (radius zeroed inline). BUT eyeballed divider alphas (`/20` chromatic, `/30` neutral, button-group.tsx:101-113) and a potential double-seam where the solid divider sits over each button's own `shadow-raised` ring. |
| accessibility | ✓ | `role="group"` correct for an action group; dividers `aria-hidden`; `disabled` propagates via context; focus z-isolation (`[&>*:focus-within]:z-10`) so the ring isn't clipped by adjacent seams. Independently-tabbable buttons is the right pattern here (not a radiogroup) — no arrow-nav required. |
| api-composability | gap | Canonical axes delegate to ButtonProps; per-child override (`variant ?? group.variant`); `forwardRef`+`displayName`; memoized context; `Omit<…,'color'>` resolves the CVA conflict. Gaps: no `asChild` on the wrapper; **position/context break for wrapped children** (a Tooltip-wrapped or Fragment-wrapped Button counts as one slot but never receives context) — fragile positional-index coupling + injected sibling divs. |
| docs-dx | gap | Doc has Props/Defaults/Example/Composability/Gotchas. Drift: doc says dividers are for "solid/soft/ghost" but source injects for **every** non-outline variant incl. `link` (`variant !== 'outline'`, line 158); story comments say "secondary"/"primary" (non-canonical variant words). No RTL / dark / forced-colors story. |
| testing | gap | `describeConformance` + renders/role/orientation/context-propagation tests. Thin: no divider assertion, no `disabled`-propagation test, no RTL/`dir` test, no explicit axe play test beyond conformance. |
| motion | ✓ | Correct restraint — a layout container should not animate. Per-segment press/hover feedback + `useReducedMotion` live in Button. Only nit: the hover/focus z-lift is un-transitioned (fine for z-index) and the static divider doesn't react to an adjacent segment's `hover:bg-*`, so the seam can clash over a hovered solid segment. |
| state-coverage | ✓ | hover/active/focus-visible/disabled all deliberate (via Button + z-isolation + `disabled` propagation). loading/empty/error are N/A at the container level. Minor: divider color is computed once at rest, doesn't track adjacent hover. |
| content-resilience | ✗ | **RTL is broken.** `getGroupPositionStyle` (lines 54-72) emits physical `borderTopRightRadius`/`borderRightWidth` (+`borderBottomWidth` vertical). Under `dir="rtl"` the "first" button sits on the right, but its *right* corners are still squared and its *right* border dropped — the merged seam lands on the wrong edge and the rounded ends invert. For a component whose entire job is directional seam geometry this is the headline gap. fullWidth/long-text/zero-one-many are handled. |
| theming-resilience | ✓ | Survives accent-9 swap (color-scoped divider tokens); dark mode fine (`neutral-8/30`, `accent-5` step tokens resolve in `.dark`); no `[data-shape]` hazard since it zeroes radii rather than hardcoding. Only blemish is the eyeballed alpha steps (folded into visual-integrity). |
| system-cohesion | ✓ | Shares Button's tokens, focus-ring, radius language; composes with SplitButton via the same context. Minor: `gap-ds-02` (spaced mode, line 150) is off the ds-03/05/07 cadence tier. |
| craft | ✓ | Genuinely nice unseen details: per-position border-*collapse* (drops one side's border rather than overlapping) to guarantee crisp 1px seams regardless of nesting; `self-stretch` full-height dividers; focus z-isolation so the ring is never clipped. |
| perceived-performance | ✓ | Instant, no layout shift, context value memoized, divider injection is cheap. No jank. |
| market-benchmark | PARITY | Peer: MUI/Chakra ButtonGroup + shadcn's newer ButtonGroup. On par for context propagation + attached seams; **lags** specifically on RTL (MUI/Chakra use logical properties and mirror correctly) and on wrapped-child robustness (shadcn/Ark use child `data-*` attributes + `[&>*]` selectors instead of injected divider divs). |
| cross-DS-adoption | see below | Concrete imports listed. |

## Top gaps (prioritized)
- **[P0] content-resilience — RTL geometry inverts.** Rewrite `getGroupPositionStyle` to emit logical props (`borderStartStartRadius`/`borderStartEndRadius`/`borderEndStartRadius`/`borderEndEndRadius`, `borderInlineEndWidth`/`borderBlockEndWidth`) so attached groups auto-mirror under `dir="rtl"`. Localized to one helper (Button consumes via inline `style`). Add an RTL story + a `dir="rtl"` test asserting the squared corners flip. *(P1 in the prior audit; raised to P0 here because it's still unfixed and it defeats the component's core purpose in RTL locales.)*
- **[P1] api-composability — wrapped children break position + context.** A Tooltip/Fragment-wrapped Button occupies a position slot but never receives group context (variant/position). Move from positional-index + injected siblings toward a `data-bg-position` contract the child reads, or document the constraint loudly.
- **[P1] visual-integrity — confirm solid divider vs per-button shadow ring.** Verify in Storybook that the injected divider on `solid` doesn't compound with each button's `shadow-raised` into a double seam; if it does, drop the divider for solid (let the ring delineate) or flatten segment shadows inside an attached group.
- **[P2] docs-dx — fix drift.** Doc's divider-variant list should read "all attached non-outline variants" (source: `variant !== 'outline'`); drop "primary/secondary" from story comments; add RTL/dark/forced-colors stories.
- **[P2] visual-integrity — name the divider alphas.** Replace eyeballed `/20` (chromatic) vs `/30` (neutral) with an on-fill border token or a documented rationale.
- **[P3] structural — index React keys.** `key={i}` on injected fragments → `child.key ?? i`.

## What it does well
- Border **collapse** (dropping one side rather than overlapping two borders) guarantees consistent 1px seams even under wrapper nesting — a subtle, correct craft choice.
- Focus z-isolation lifts the focused/hovered child so its ring is never clipped by an adjacent segment's border.
- Clean, canonical API: everything delegates to ButtonProps, per-child override works, context is memoized, `forwardRef`+`displayName` present, `Omit<…,'color'>` resolves the CVA conflict — no bespoke corner-props, composes with SplitButton.
- Correctly restrained: no motion, no surface misuse, no accent rails — it is a transparent layout wrapper and behaves like one.

## Cross-DS adoption ideas
- **MUI / Chakra ButtonGroup** mirror attached-seam geometry via CSS logical properties — adopt for our RTL fix (the P0 above) instead of physical sides.
- **shadcn (2025) ButtonGroup + Ark** delineate segments with child `data-*` attributes and `[&>*]` sibling selectors rather than injecting divider `<div>`s — more robust to wrapped/conditional children and removes the double-seam-over-shadow risk. Worth considering to replace the injected-divider approach.
- **Radix Toolbar** offers roving tabindex + orientation-aware arrow-key navigation. If we ever want a `toolbar`-semantics mode (icon-dense formatting bars, the WithIcons story use case), a `role="toolbar"` opt-in with arrow nav would top a plain group.

## Rebuild note
**Polish, not rebuild.** The architecture (two-context propagation + positional border collapse + composes Button) is sound and market-competitive. The fixes are localized: (1) swap physical → logical border properties in the one `getGroupPositionStyle` helper to close the RTL P0; (2) verify/soften the solid divider-vs-shadow seam; (3) doc/story drift + divider-alpha token + index keys. Consider (separate, larger) migrating from injected divider divs to a child `data-position` contract to harden wrapped-child composability — that is the only piece approaching structural, and it can be staged behind the current behavior.
