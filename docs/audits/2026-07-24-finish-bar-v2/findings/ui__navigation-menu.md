# ui/navigation-menu — finish-bar audit
Finish: 3/5   Market: PARITY (lags Radix on motion cleanliness)   Rebuild: polish

NavigationMenu is a thin, well-mannered wrapper over the vendored Radix NavigationMenu primitive. It composes the primitive (keyboard/portal/roving-focus/state inherited, not re-rolled), uses semantic surface tokens, role radius tokens, and the shared motion lib. It is visually clean (no accent rail, gradient text, glass/blob, emoji) and passes axe. It scores exactly the same 3/5 as the 2026-07-01 baseline: none of that baseline's polish gaps have been fixed — the bespoke MutationObserver motion bridge, the dead decorative viewport overlay, the missing reduced-motion guard, several magic numbers, LTR-only slide, and a thin/stale doc + single closed-panel story all remain in source.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | Clean: role radius tokens (`rounded-control`/`rounded-overlay`/`rounded-tl-control-inner`), `bg-surface-overlay` panel, `shadow-floating`, no accent-rail/gradient/glass/emoji. Gaps are magic numbers — `x:'13rem'` (l.68-71), `top-[1px]` (l.60), `top-[60%] h-2 w-2` (l.259) — off `--spacing-ds-*` cadence. `h-2 w-2` caret should be a `size-ds-*` token. |
| a11y | gap | Real `<button>` triggers, `focus-visible:ring-2 ring-accent-9`, `disabled:opacity-action-disabled`, axe + Enter-key tests pass, ref+displayName on every subcomponent (all inherited from Radix). Gaps: trigger height is `h-ds-sm-plus` (~36px), no `touch-target` util → sub-44px hit area; no explicit `forced-colors` handling on the caret/indicator (relies on primitive defaults). |
| api-composability | gap | Compound API is idiomatic Radix; `NavigationMenuItem`/`NavigationMenuLink` are passthroughs; `asChild` works for router links. But: caret `IconChevronDown` is hardcoded on every Trigger (l.59-60) with no `showCaret`/icon-slot to suppress or swap; the three `motion.div`/observer wrappers are opaque — consumers can't reach or override the motion. No CVA variant surface (pure wrapper), so nothing to standardize. |
| docs-dx | gap | Doc has compound tree + one example + Composability + Gotchas, but no prop/type table for `NavigationMenuProps`/`NavigationMenuContentProps`, and the `## Changes` log stops at v0.18.0 while source now ships the observer/framer machinery. Below the Card doc bar. |
| testing | gap | 10 RTL tests: renders/click-open/Enter-open/ref/className/role/axe. Good baseline, but no disabled-trigger, no panel-content-slide assertion, no describeConformance, no RTL/reduced-motion coverage. |
| motion | ✗ | Below bar. (1) No reduced-motion guard anywhere despite a full `13rem` (~208px) horizontal slide — `withReducedMotion` exists in `./lib/motion` and is unused. (2) Dead decorative overlay: the scale+fade `motion.div` (l.196-202) is `aria-hidden`, transparent, childless — paints nothing; the real Viewport gets no entrance motion. (3) `key={motionDir}` (l.134) forces a full content remount on every direction change, interrupting the animation it's meant to play. Transforms/opacity are correctly HW-accel, and springs are from the shared lib — but the implementation is fragile. |
| state-coverage | gap | hover (`hover:bg-surface-raised-hover`), focus-visible, disabled, open/closed all present via Radix. No deliberate empty/loading/error design (arguably N/A for nav), and the disabled + open-panel states are undocumented/untested. |
| content-resilience | ✗ | Slide `x` sign is hardcoded LTR (`from-start`→`-13rem`, `from-end`→`+13rem`, l.68-71) with no `dir`/`useDirection` consultation — directional motion plays backwards in RTL. Fixed `13rem` offset won't track actual panel width. Long-label/many-item overflow untested. |
| theming-resilience | ✓ | All colors semantic (`accent-9`, `surface-overlay`, `surface-raised-hover`, `surface-border`); survives accent-9 swap and `[data-shape]` presets via role radius tokens; overlay panel elevation reads in both themes (`bg-surface-overlay` + `shadow-floating` don't invert-vanish). |
| system-cohesion | gap | Shares focus-ring, radius language, surface tokens, and the `springs`/`tweens` presets with siblings. But the per-subcomponent MutationObserver-driven framer bridge is bespoke drift — the rest of the system animates Radix overlays declaratively (framer props / AnimatePresence / CSS data-attr variants), not by spying on DOM attributes. |
| craft | gap | `select-none`/`no-underline`/optical `top-[1px]` chevron nudge show care; `group-data-[state=open]:rotate-180` caret flip is a nice touch. Undercut by the dead overlay and the remount-thrash — machinery that doesn't pay off. |
| perceived-performance | gap | Radix opens instantly; but MutationObserver + `useState` per subcomponent introduces an initial-value race (state set in `useEffect` after first paint) and the `key` remount can drop a frame on rapid trigger switching. |
| market-benchmark | gap | Peer: Radix NavigationMenu (what we wrap), Base UI, Ark. We inherit Radix's excellent a11y/keyboard model = parity on structure. We LAG the canonical Radix pattern on motion: Radix ships CSS `data-[motion=from-start]`/`data-[state]` selectors that do this declaratively with zero observers and free RTL via logical values — our hand-rolled observer bridge is strictly more fragile than the thing it replaces. |
| cross-ds-adoption | gap | See ideas below. |

## Top gaps (prioritized)
- [P1] motion — Replace the three near-identical `useRef`+`composedRef`+`useState`+`MutationObserver` blocks (Content l.79-110, Viewport l.155-183, Indicator l.215-243) with Radix's own CSS `data-[motion=*]`/`data-[state]` variants (or one shared hook). Removes the `key={motionDir}` remount, the initial-value race, and the observer-leak surface → fixes cohesion + perceived-perf at once.
- [P1] motion — Fix viewport entrance: make `NavigationMenuPrimitive.Viewport` itself the animated (scale+fade) element and delete the dead `aria-hidden` overlay `motion.div` + its observer (l.165-202). Motion machinery that paints nothing is dead weight.
- [P1] motion — Add reduced-motion: wire `useReducedMotion()` / `withReducedMotion(...)` into Content/Viewport/Indicator; collapse the 13rem slide to opacity-only when set. The helper already exists.
- [P1] content-resilience — RTL: resolve the slide `x` sign against document direction so `from-start`/`from-end` mirror; derive the offset from `--radix-navigation-menu-viewport-width` instead of the fixed `13rem`.
- [P2] visual-integrity — Tokenize magic numbers: `13rem`→width-derived, `h-2 w-2` caret→`size-ds-*`; keep `top-[1px]`/`top-[60%]` only with an optical-alignment comment.
- [P2] docs-dx / testing — Add a panel-open story + Indicator story + disabled/RTL/dark variants; refresh the doc `## Changes` log and add a prop/type reference.
- [P2] api-composability — Add a `showCaret`/icon-slot escape so a Trigger can suppress or swap the hardcoded chevron.
- [P3] types — Narrow `motionDir` to `'from-start'|'from-end'|'to-start'|'to-end'|null` and drop the `as keyof` casts (l.113, l.121).

## What it does well
- Composes the vendored Radix primitive cleanly — keyboard model, portal, roving focus, state are inherited, not re-rolled (F5 clean).
- Fully semantic tokens throughout; theming-resilient across accent swap, shape presets, and light/dark.
- No anti-slop tells: no accent rail, gradient text, glass/blob/glow, emoji, or `rounded-ds-*`/`rounded-full`. Radius uses role tokens only — no release-gate radius blocker.
- Slide variants correctly pair `x` translate with `opacity:0` (proper fade-in, no slide-no-fade tell), and animate transform/opacity only (HW-accel).
- Solid a11y baseline with axe + Enter-key + ref-forwarding tests.

## Cross-DS adoption ideas
- **Radix (canonical):** its own `data-[motion=from-start]` CSS-variant recipe animates the directional slide with zero JS observers and free RTL via logical values — we should adopt this exact pattern and delete our bridge.
- **Base UI NavigationMenu:** exposes an explicit `NavigationMenu.Arrow`/positioner model and a viewport that animates size via CSS custom props with no remount — cleaner than our `key`-remount + dead-overlay approach.
- **Ark UI:** ships `orientation` (horizontal/vertical) as a first-class prop and a documented RTL story — we have neither an orientation option nor RTL coverage.
- **Radix/Ark both** expose a caret/indicator as an opt-in slot rather than a hardcoded child — matches the `showCaret` gap above.

## Rebuild note
**Polish, not rebuild.** The structure (Radix wrapper) is correct and worth keeping. The work is a focused motion + resilience pass: (1) rip out the three MutationObserver bridges in favor of Radix CSS data-attr variants or one shared hook, (2) animate the real Viewport and delete the dead overlay, (3) add reduced-motion + RTL sign resolution, (4) tokenize the magic numbers, (5) refresh doc/stories/tests and add a caret-suppression slot. No API break required — all additive or internal. This is the same polish list the 2026-07-01 baseline wrote; it has not been actioned, so the 3/5 stands.
