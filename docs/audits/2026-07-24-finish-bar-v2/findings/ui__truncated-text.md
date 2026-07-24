# ui/truncated-text — finish-bar audit
Finish: 4/5   Market: PARITY (Ant Design Typography.Text)   Rebuild: polish

A small, genuinely well-built layout/utility text primitive: truncates in three modes
(`end`/`clamp` pure-CSS, `middle` JS-measured binary-search fit) and *recovers* via a
tooltip that appears only when the text is actually clipped, while always keeping the
full string as the accessible name. Source is anti-slop-clean (no CVA, no colors, no
radius, no motion of its own). Scored on the applicable axes; motion is correctly N/A.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | Component emits only `block truncate` / `overflow-hidden whitespace-nowrap` / line-clamp — zero slop tells, no `rounded-ds-*`/`rounded-full`, no arbitrary `p-[..]`/`h-[..]` magic numbers. Clean. (Story drift is separate, see docs axis.) |
| accessibility | gap | Full string is the a11y name and tooltip is overflow-gated — strong. BUT for `mode="middle"` the DOM text is the *shortened* string; the full text rides only on `aria-label` applied to a **role-less** `<span>`/`<p>`/`<div>`, which several screen readers do not reliably announce on non-interactive generic elements. `end`/`clamp` are safe (full text stays in DOM); `middle` is the exposure risk. No `vitest-axe` assertion. |
| api-composability | gap | `forwardRef`+`displayName`, precise types, no `any`, composes DS `Tooltip`, `children: string` a documented deliberate narrowing — all good. But `as?: 'span' \| 'p' \| 'div'` is arbitrarily closed and there is **no `asChild`**: cannot truncate inside a real `<a>` (nav row), `<h3>` (clamped card title), `<label>`, `<dt>`, or `<li>`. This is a wrap-other-content primitive that can't wrap the elements it most needs to. Prior audit's top gap, still unfixed. |
| docs-dx | gap | Doc has Props/Defaults/Example/Composability/Gotchas and matches source. But both story containers use the **dead class `border-border-subtle`** (real token is `border-surface-border-subtle`, confirmed in semantic.css:186) — the demo border silently never renders and it advertises a wrong vocabulary to copy-pasters. No autodocs play/axe test. |
| testing | gap | RTL + unit cover end/clamp/middle, overflow→aria-label, tooltip toggle, `as` — solid for logic. Missing `vitest-axe`, `describeConformance`, and any RTL or forced-overflow-tooltip-open assertion. |
| motion | ✓ (N/A) | Ships zero motion, which is correct for a static text primitive. Remeasure is layout logic, not animation; the composed `Tooltip` owns its own entrance/exit + reduced-motion. Not penalized. |
| state-coverage | ✓ | The two states that matter — *fits* (no tooltip, no aria-label) and *overflowing* (tooltip + full-string aria-label) — are both deliberately designed across all three modes. Loading/disabled/error are N/A for text. Minor: no story statically freezes the tooltip-open state. |
| content-resilience | ✓ | This is the component's core competency and it's excellent: `middle` binary-searches the largest middle-truncated string that fits, `truncateMiddle` guards the `slice(-0)` whole-string trap, ResizeObserver remeasures on container resize, long text / i18n expansion handled by measurement rather than a fixed cutoff. Best-in-class breadth. |
| theming-resilience | ✓ | Emits no color/surface/radius of its own — inherits from context. Survives an accent-9 swap, `[data-shape]`, and density presets trivially; no dark-mode elevation-inversion risk (no surface). |
| system-cohesion | ✓ | `cn`, `forwardRef`+`displayName`, composes the DS `Tooltip` rather than re-rolling one. No bespoke drift — feels like the rest of the system. |
| craft | ✓ | Standout: callback-ref reconnects the ResizeObserver on every node change to dodge the stale-observer-on-detached-node loop when the Tooltip wrapper remounts (documented); `+1px` overflow tolerance; tooltip suppressed entirely when text fits (no tooltip noise); binary-search fit. Micro-details users feel but never notice. |
| perceived-performance | gap | `end`/`clamp` are cheap (one `scrollWidth`/`scrollHeight` read). `middle` runs a binary search that **mutates `textContent` and reads `scrollWidth` in a loop** — synchronous forced reflows — inside a raw (undebounced, un-rAF'd) ResizeObserver callback. A list of many `middle` instances all re-fitting on a window resize can jank. No batching. |
| market-benchmark | gap PARITY | vs Mantine `<Text truncate lineClamp>` / Chakra `noOfLines` / MUI (end + clamp only) we LEAD — measured best-fit `middle`, an overflow-*gated* tooltip, and full-string SR recovery in one primitive is ahead of that common bar. But the strongest real peer, Ant Design `Typography.Text` ellipsis, ships `expandable`/rows-toggle, `onEllipsis` callback, `suffix`, and `copyable` — features we lack. Net: PARITY (we win on measured middle; Ant wins on expand/callback/copy). Also lags on polymorphism (Mantine `component`/`renderRoot`) and resize batching. |
| cross-ds-adoption | ✓ | See ideas below. |

## Top gaps (prioritized)
- [P1] api-composability — closed `as` union + no `asChild` blocks the realistic cases (truncated link, clamped `<h3>`, `<label>`, `<li>`) → add Slot-based `asChild` (cleanest: component renders exactly one element, merges className/ref) and/or widen `as` to `ElementType`; keep `min-w-0`-at-call-site guidance for whichever element wins.
- [P1] docs-dx — dead `border-border-subtle` in stories (:24 Box, :70 flex-row) renders no border and teaches wrong vocab → replace with `border-surface-border-subtle` (matches semantic.css) or `border-surface-border`; verify in Storybook.
- [P2] accessibility — `middle` mode conveys the full string only via `aria-label` on a role-less element (unreliable in some SRs) → keep the full text in a visually-hidden node, or apply the label on an element with a text role; add a `vitest-axe` pass on the overflowing variant.
- [P2] perceived-performance — `middle` binary-search thrashes layout in an undebounced ResizeObserver → wrap `measure()` in `requestAnimationFrame` (and coalesce) so rapid resizes with many instances don't jank.
- [P2] testing — no axe / `describeConformance` / RTL / tooltip-open coverage → add them; add an RTL `mode="end"` story and a forced-overflow story that statically shows clipped + tooltip-open.

## What it does well
- Truncate-and-recover in one place: `end`/`clamp` stay pure CSS (full text in DOM, SR-safe); `middle` measures and shortens but preserves the accessible name.
- Tooltip appears only on *actual* clipping (ResizeObserver-measured), so no tooltip noise on text that fits.
- ResizeObserver ownership via a callback ref that reconnects on node change — avoids the stale-observer-on-remount loop the Tooltip wrapper would otherwise cause. Real engineering, documented inline.
- `truncateMiddle` binary-searches the largest fitting string and guards the `slice(-0)` whole-string trap.
- Clean types (`forwardRef<HTMLElement>`, `displayName`, exported props, `children: string` as a deliberate documented constraint), no bespoke tokens, composes the DS Tooltip.

## Cross-DS adoption ideas
- **Ant `Typography.Text` `expandable` + `onEllipsis`** — add an opt-in `expandable`/`showMore` so `clamp` can expand in place (not just recover via tooltip), and expose an `onEllipsis(clipped: boolean)` callback so parents can react (e.g. reveal a "copy full" affordance only when clipped).
- **Ant `copyable`** — a copy affordance is natural for the identifier use-case (`middle` mode targets filenames/hashes/emails/paths) where the visible string is deliberately incomplete.
- **Mantine `component` + `renderRoot`** (polymorphism done right) — adopt `asChild` so consumers own the tag; TruncatedText owns only the truncation behavior.
- **TanStack Virtual / ResizeObserver batching** — rAF-coalesce the `middle` remeasure to kill layout thrash under many instances.
- **Render-prop / `data-truncated` attribute** — expose the measured overflow boolean so consumers can build custom recovery UI (a "show more" affordance, an inline expand) instead of only the tooltip. Tooltips don't fire on touch, so a data-attr gives touch users a recovery path.
- **Native CSS `line-clamp`** — Tailwind now ships `line-clamp-N`; consider it over the hand-rolled `-webkit-box` inline style for `clamp` mode (fewer inline styles, same result) while keeping the JS overflow detection.

## Rebuild note
**Polish, not rebuild.** The architecture is sound and the core competency (measured middle-truncation + overflow-gated tooltip + SR-safe full-string recovery) already leads the market — a rebuild would throw away genuinely good engineering. Scope: (1) add `asChild`/widen `as` for polymorphism (P1), (2) fix the dead `border-border-subtle` story token (P1), (3) shore up `middle`-mode SR exposure beyond a role-less `aria-label` (P2), (4) rAF-batch the resize measure (P2), (5) add axe/RTL/tooltip-open test + story coverage (P2). All in-place; no structural change.
