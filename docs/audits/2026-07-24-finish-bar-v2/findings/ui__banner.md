# ui/banner — finish-bar audit
Finish: 3/5   Market: PARITY (leans behind Primer/Geist on a11y semantics + motion)   Rebuild: polish

Banner is a full-width `role="alert"` notification strip: colored leading icon (auto-selected
from `color`), message children, optional `actions` slot, optional dismiss `×`. Visually clean —
no AI slop tells, correct role-radius token, semantic step-token palette, single-edge treatment.
The real gaps are all in a11y correctness and motion, and there is a live source↔story drift
(the `action` prop removed in v0.38.0 is still used by two stories). All fixable in place.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | No accent rail, single `border-b` (no shadow → no edge-soup), semantic `info/success/warning/error/neutral` step-3/7/11 tokens (not framework palette), Tabler icons (no emoji), no glass/glow/blob. Dismiss uses `rounded-control-inner` role token — no `rounded-ds-*`/`rounded-full`. Spacing all on-cadence (`gap-ds-04`, `px-ds-06`, `py-ds-04`), zero arbitrary values. |
| accessibility | ✗ | (a) `role="alert"` hardcoded for ALL colors incl. the `info` default — assertive live region interrupts the SR user for a non-urgent "new version available"; info/success/neutral should be `role="status"` (polite). (b) Dismiss hit area is 24×24 (`min-h-ds-xs`/`min-w-ds-xs` = 24px, semantic.css:333), below WCAG 2.5.5 / 44px. (c) `hover:bg-current/10` has no `forced-colors:` fallback. Focus ring is correct (`ring-2 ring-accent-9`). |
| api-composability | gap | `forwardRef` + `displayName`, typed props (`Omit<HTMLAttributes,'color'>` + `VariantProps`), canonical `color` axis. But: no icon override / no slot compound (icon is `BANNER_ICONS[color]`-only), dismissal is internal `useState` only — no controlled `open`/`onOpenChange`, so a consumer can't re-show without remount. Convenience `actions`/`onDismiss` are fine. |
| docs-dx | gap | Doc Props/Defaults/Example/Composability/Gotchas present and matches source. But stories `WithAction` + `WithActionAndDismissible` still pass `action=` (singular, removed v0.38.0) — silently dropped, so those two demos render with NO action button. Only `MultipleActions` exercises `actions` correctly. |
| testing | gap | Unit + RTL + `describeConformance` (all 5 colors), covers role, children, dismiss presence/absence/click, actions slot. Missing: keyboard-activation test, focus-visible, reduced-motion, RTL. No axe play test in stories. |
| motion | ✗ | (a) Animates `height: 'auto' → 0` — a layout prop, non-compositable, reflows every frame; sibling Alert animates opacity+`y` correctly. (b) No `useReducedMotion()`/`withReducedMotion()` and no `MotionConfig` — the repo ships the helper (lib/motion.ts:58) and Banner ignores it. (c) Enter is a no-op (`initial` opacity:1, full height) — no fade-in. (d) `springs.snappy` used for a full-width collapse where `springs.gentle` is the documented choice. |
| state-coverage | gap | hover / focus-visible / default deliberate. disabled/loading are N/A for a banner. Empty/error expressed via `color`. Missing: forced-colors state, no visual for very-long content wrapping beyond flex. |
| content-resilience | ✓ | `min-w-0 flex-1` on the content wrapper + `flex-wrap` on the root + `shrink-0` on icon/actions/dismiss → long text truncates gracefully and actions drop below on narrow viewports. `border-b` is physical but symmetric under RTL; icon-leading order is fine mirrored. |
| theming-resilience | ✓ | Binds to semantic step tokens → survives an accent-9 brand swap; `rounded-control-inner` honors `[data-shape]`; neutral uses `surface-raised` (not a card surface). Light/dark handled by the token layer, no hardcoded light-only values. |
| system-cohesion | gap | Shares focus-ring, radius language, spacing tiers, motion springs with siblings. But the `info/success/warning/error/neutral` step-3/7/11 color map is duplicated verbatim from Alert's `subtle` variants (drift risk — extract one source), and the snappy-vs-gentle spring choice diverges from the documented collapse spring. |
| craft | gap | Nice: `shrink-0` icon, `min-w-0 flex-1`, `title="Dismiss"` tooltip, button hover tint scoped to `[&_button:hover]`. Misses: the 24px dismiss target and the `height:auto` collapse are craft tells; no cursor/optical corrections beyond defaults. |
| perceived-performance | gap | Dismiss feedback is instant (state flips immediately). But the `height` collapse causes layout reflow/jank on exit; a transform/opacity or measured-layout collapse would be smoother. No CLS on mount (enter is a no-op). |
| market-benchmark | gap | Peer: Primer `Banner`, Geist/Vercel callout bars, Radix Callout. PARITY on visuals and API convenience; LAGS specifically on (1) assertive-by-default live-region semantics (Primer varies role/`aria-live` by intent) and (2) compositor-friendly enter/exit motion. |
| cross-ds-adoption | gap | See ideas below — role-by-intent, icon override slot, controlled open. |

## Top gaps (prioritized)
- [P1] motion — animates layout `height` with no reduced-motion guard and no fade-in → replace `height:auto→0` with opacity + small `y`/`scaleY` (mirror Alert) or framer `layout`; wire `useReducedMotion()` → `withReducedMotion(springs.snappy)` (or standardize on a `MotionConfig reducedMotion="user"`). Fix Alert as a pair.
- [P1] accessibility — role hardcoded assertive for non-urgent default → map role by color (`error`/`warning`→`alert`, `info`/`success`/`neutral`→`status`), allow `role`/`aria-live` override prop.
- [P1] accessibility — 24px dismiss touch target → bump hit area to ≥44px (invisible padding / negative margin to keep visual size) using the `touch-target` util; coordinate the fix across Dialog/Sheet/Alert (family-wide 24px pattern).
- [P1] docs-dx — broken demos: `WithAction`/`WithActionAndDismissible` use removed `action=` prop → rename to `actions=`.
- [P2] api-composability — no icon override & internal-only dismissal → add an `icon` prop (or `Banner.Icon` slot) and controlled `open`/`onOpenChange`, keeping convenience props.
- [P2] accessibility — `hover:bg-current/10` vanishes in forced-colors → add a `forced-colors:` outline/border fallback on the dismiss button and actions.
- [P2] system-cohesion — Alert/Banner duplicate the intent-color map verbatim → extract one shared semantic-intent token map.

## What it does well
- Genuinely slop-free: single-edge `border-b`, no accent rail / gradient text / glass / emoji.
- All-token, zero-magic-number: spacing on the ds-04/06 cadence, `rounded-control-inner` role token, `duration-moderate-01` + `ease-productive-standard`, `ring-accent-9` focus.
- Content resilience is quietly correct — `min-w-0 flex-1` + `flex-wrap` + `shrink-0` handle long text and multiple wrapping actions without a bespoke breakpoint.
- Theming-resilient by construction: semantic step tokens survive an accent swap and adapt light/dark for free.
- `forwardRef` + `displayName`, typed public surface, canonical `color` axis, conformance test across all five colors.

## Cross-DS adoption ideas
- **GitHub Primer Banner** varies the live-region politeness by intent (critical/warning assertive, info polite) and exposes a `hideTitle`/dismiss with a proper button size — adopt role-by-color + a ≥44px dismiss.
- **Geist/Vercel note bars** offer an explicit `icon` slot (and `icon={null}` to suppress) — add an icon override rather than locking to `BANNER_ICONS[color]`.
- **Radix Callout** is a slot compound (`Callout.Icon` / `Callout.Text`) — a `Banner.Icon`/`Banner.Content`/`Banner.Actions` compound would let consumers reorder and supply custom affordances.
- **Sonner/Radix motion baseline** — compositor-only transform+opacity transitions with reduced-motion respect; port that to replace the `height` collapse.

## Rebuild note
Polish, not rebuild. The structure (CVA color axis + AnimatePresence + convenience props) is sound and visually at bar. The fix set is in-place and mostly shared with Alert: (1) motion — swap the layout-`height` animation for transform+opacity and add the reduced-motion guard; (2) a11y — role-by-color + ≥44px dismiss target + forced-colors fallback; (3) rename `action`→`actions` in two stories; (4) optional composability additions (icon override, controlled open). No API break required — role mapping and motion changes are internal; new props are additive.
