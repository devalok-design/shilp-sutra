# ui/icon-button — finish-bar audit
Finish: 4/5   Market: PARITY (Radix Themes IconButton / shadcn Button size="icon")   Rebuild: polish

IconButton is a thin, disciplined wrapper over `Button`. It composes the base primitive rather than re-rolling it (perfect system cohesion), TypeScript-*enforces* `aria-label` at compile time (a genuine market lead), and inherits all of Button's motion, loading, async, processing, and ButtonGroup machinery by passthrough. No visual slop tells. It sits at the bar. The gaps are (1) a real touch-target miss the v2 rubric surfaces — the default `md` size is 40px and `sm` is 32px, both under 44px, with no `touch-target` util applied — and (2) the exact drift/docs findings from the 2026-07-01 baseline, **all still unfixed**: stale JSDoc taxonomy, an engagement-bait closer comment, and a Storybook control that hides `soft` and the whole `color` axis. Source is truth and the source has not moved since the last audit.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | Role tokens only — `rounded-control` (via Button) + `rounded-pill` for `circle`. No edge-soup, no accent rail, no gradient/glass/glow. `solid` carries one edge treatment (`shadow-raised`). No `rounded-ds-*`/`rounded-full`. No arbitrary values in this file. |
| accessibility | gap | `aria-label` required *at the type level* (leads the market). focus-visible ring+offset, `aria-busy`, `role="status"` spinner, `disabled` handling — all correct via Button. **Miss:** touch target. `md` (default) = 40px, `sm` = 32px < 44px; only `lg` (48px) clears WCAG 2.5.5 / Apple HIG. The `touch-target` util (utilities.css:187) exists but is not applied — and icon-only buttons are exactly where hit-area matters (no text to widen the target). |
| api-composability | ✓ | Composes Button (F5). `forwardRef<HTMLButtonElement>` + `displayName`. `icon: IconInput` (shared contract, no `any`). `aria-label` required. `shape` square/circle maps cleanly; `loadingPosition="center"` hard-set. Minor: size axis is a 3-tier subset (`sm/md/lg`) — Button exposes `icon-xs` which IconButton can't reach. |
| docs-dx | gap | doc.md is mostly accurate but now missing the `info` color (added 0.52.0). **JSDoc (icon-button.tsx:30) is stale**: lists "`default`, `error`" (pre-v0.29 taxonomy) and omits `soft` — contradicts the CVA source. Doc claims size inherits from ButtonGroup (Composability §) but size is *always* passed (default `md`→`icon-md`), so group `size` never applies — inaccurate. |
| testing | gap | `describeConformance` + 8 cases (render, aria-label, shape, loading→aria-busy+role=status, click). "forwards variant" test only asserts it renders, not that `soft`/`color` reach the button. No axe play test in stories; no RTL/forced-colors coverage. Solid baseline, real gaps. |
| motion | ✓ | Inherits Button: `active:scale-[0.95]`, `useReducedMotion` guard, transform/opacity/color transitions with asymmetric hover timing, bounce-free. Centered spinner replaces the glyph in place (no layout shift). Emil-clean; adds no motion of its own. |
| state-coverage | ✓ | hover/active/focus-visible/disabled/loading all deliberate via Button and shown in stories (Loading, Disabled). error surfaced via `color="error"`. Empty N/A. No toggle/pressed affordance — but toggling is ToggleGroup's job, defensible. |
| content-resilience | ✓ | Fixed square dimensions, single icon, no overflow/truncation surface. Loading centered → no reflow. RTL mirroring of directional glyphs (Toolbar chevrons) is the icon's concern, not the button's. |
| theming-resilience | ✓ | Survives accent-9 swap (colors flow from Button's ramp tokens). Honors `[data-shape]` via the `rounded-control` role token; `circle` intentionally shape-invariant (`rounded-pill`). Light/dark both fine. |
| system-cohesion | ✓ | Best-in-DS by construction — it *is* Button, so spring, radius language, focus-ring, and spacing are shared with zero drift. Thousand voices in tune. |
| craft | ✓ | `loadingPosition="center"` hard-set so the spinner swaps in-place; `aria-label` impossible to forget; nested `<Icon>` auto-sizes via IconProvider cascade. Quiet, correct details. |
| perceived-performance | ✓ | Instant press feedback (scale), centered spinner, no CLS on loading toggle. |
| market-benchmark | PARITY | vs Radix Themes IconButton, shadcn `Button size="icon"`, React Aria. **We lead** on compile-time `aria-label` enforcement (Radix/shadcn are runtime/lint-only) and on `IconInput` normalization + Button's async/processing inheritance. **We match** on the sub-44 default hit area (shadcn's `size-9`≈36px and Radix Themes size-1/2 share the same trait). No hard lag. |
| cross-DS | ✓ (ideas below) | Concrete imports available from peers — see list. |

## Top gaps (prioritized)
- **[P1] accessibility** — default `md` (40px) and `sm` (32px) icon buttons are below the 44px touch target, with no `touch-target` util → adopt an *invisible* expanded hit area (a `::before`/`touch-target`-style 44px press region) so the visual size stays 32/40px but the tappable target is ≥44px. Best-of-both; matches React Aria / Material's press-target approach.
- **[P1] docs-dx** — JSDoc (icon-button.tsx:30) still advertises the pre-v0.29 "`default`, `error`" taxonomy and omits `soft` (unfixed since 2026-07-01) → replace with the real v2 axes *or* point at Button as the single source of truth; add `info` to doc.md's color list.
- **[P1] docs-dx** — Storybook `variant` argType omits `soft` and there is no `color` control (stories.tsx:23) → add `'soft'` and a `color` argType + a soft/color example so the preferred non-primary default and the color axis are discoverable.
- **[P2] testing** — no assertion that `soft`/`color`/`variant` actually reach the underlying button, no axe play test, no RTL/forced-colors story → add a `SoftAndColors` story + assertions and an axe play test.
- **[P2] docs-dx** — Composability section claims ButtonGroup `size` inheritance that never fires (size is always passed) → correct the doc, or drop the explicit default so group size can flow.
- **[P2] api** — cannot reach Button's `icon-xs` (28px) size → add an `xs` tier or document the 3-tier subset as intentional.
- **[P3] verbal-tell** — engagement-bait closer comment (icon-button.tsx:47, "feel free to combine props creatively!") persists → delete; end JSDoc on the last `@example`. House-wide tic (also in Card/StatCard) worth a sweep.

## What it does well
- Composes the base primitive instead of duplicating it — the anti-drift gold standard for the DS.
- Compile-time `aria-label` enforcement: the standout a11y win for an icon-only control, stronger than any major peer.
- Role-token radius (`rounded-control` + `rounded-pill`), so it honors `[data-shape]` presets for free.
- `loadingPosition="center"` hard-set — spinner replaces the glyph with zero layout shift.
- Inherits Button's reduced-motion-aware, bounce-free press/hover motion without adding any of its own.

## Cross-DS adoption ideas
- **React Aria / Material — expanded press target:** ship an invisible ≥44px hit area under the 32/40px visual button so mobile hit-area meets WCAG without inflating the visual footprint. Directly closes the top a11y gap.
- **Radix / Ark — tooltip pairing convention:** icon-only buttons almost always need a tooltip (the label the sighted user can't see). Peers document/wire this; we could add a `tooltip` prop (or a documented `Tooltip`+`IconButton` recipe) so the accessible name and the hover hint don't drift apart.
- **Radix Toggle — `aria-pressed` toggle affordance:** mute/like/bookmark/pin are the archetypal icon-button use cases. A `pressed`/`defaultPressed` toggle variant (distinct from ToggleGroup, which is for sets) would cover a common single-button need we currently push onto consumers.
- **shadcn/Radix parity — `xs` size:** expose Button's `icon-xs` (28px) for dense toolbars, matching the primitive's own capability.

## Rebuild note
**Polish, not rebuild.** There is no structural problem — the component correctly composes Button and its cohesion/motion/visual axes are at or above bar. The work is: (1) add an expanded touch target for `sm`/`md`, (2) fix the still-stale JSDoc taxonomy + doc `info`/ButtonGroup-size inaccuracies, (3) surface `soft`/`color` in stories and assert they reach the button, (4) delete the engagement-bait comment, (5) optionally add `xs`. All in-place edits to a fundamentally sound wrapper.
