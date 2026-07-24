# ui/accordion — finish-bar audit

Finish: 3/5   Market: PARITY (Radix / shadcn Accordion)   Rebuild: polish

Thin, mostly-clean compound wrapper over the vendored Radix accordion primitive. No AI slop tells, correct token usage, correct ARIA via the primitive. It is shippable and looks right — but it carries one genuine defect (a dead Framer Motion layer that the doc actively misdescribes) and one scope gap (no `variant`/`size`/CVA — the only layout primitive with zero styling axes, well behind the Card bar). Source is unchanged since the 0.49/0.50/0.52 waves; the 2026-07-01 baseline's 3/5 and its two P1s still stand.

## Scores

| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | No accent rail / gradient / glass / emoji / pill-spam. Single `border-b border-surface-border` edge (no edge-soup). `rounded-control` role token. Hover/open row lift to `bg-surface-raised` is the correct "row lifts on the page" pattern. Minor: `pt-ds-02` (content:116) is off the ds-03/05/07 cadence; trailing `border-b` renders under the last item. |
| accessibility | gap | Radix gives correct `button` semantics, keyboard nav, `data-state`, aria wiring; axe test passes; `focus-visible:ring-2 ring-accent-9`. Gaps are finish-level: no explicit `touch-target` util (44px not guaranteed at low density — height is `py-ds-05` + line-height only), no `ring-offset`, and the only inter-item separator is a `border-b` that can vanish under `forced-colors` (no forced-colors handling). |
| api-composability | gap | Canonical `value`/`defaultValue`/`onValueChange` + `type` discriminated union via Radix; controlled + uncontrolled both work; `forwardRef` + `displayName` on all parts; typed (`chevronPosition` is a literal union, no `any`); composes the primitive rather than re-rolling it. But NO `cva`/`VariantProps` — no `size`, no `variant`. Density (`py-ds-05`) and separator style are hardcoded; a compact or boxed/contained accordion needs `className` overrides. Siblings (Card/StatCard) expose CVA axes; this is the biggest distance from bar. |
| docs-dx | gap | Doc has Props/Compound/Defaults/Example/Composability/Gotchas/Changes. But contains a **factual error**: "Framer Motion handles the fade" (accordion.md:38) — the `motion.div` is a no-op (see motion). Also `chevronPosition` is only mentioned inline (line 17), not in the Props table proper. |
| testing | gap | Unit + RTL + `vitest-axe` + chevron render-order + rotation-on-open + collapse-on-second-click — solid interaction coverage. Missing: `describeConformance`, and no RTL / forced-colors / reduced-motion assertion. |
| motion | gap | Chevron rotation is clean (transform-only, `duration-moderate-02`, `ease-productive-standard`). Height reveal via `accordion-down/up` keyframe animates `height` (layout prop) — the accepted Radix runtime-height exception, reduced-motion globally zeroed in semantic.css. **Defect:** `AccordionContent`'s `motion.div` uses `initial={false}` + hardcoded `animate={{opacity:1}}` — the transition never fires. Dead layer: pulls in framer-motion + `tweens`, adds a wrapper div per open panel, produces zero visual effect. No `active:scale` press feedback on the trigger. |
| state-coverage | gap | hover ✓, focus-visible ✓, open ✓. But no styled **disabled** state (Radix supports `disabled` on Item/Root; component adds no `data-disabled`/`data-[disabled]` styling), so a disabled trigger looks live. Empty/error/loading are n/a for this archetype. |
| content-resilience | gap | `justify-between` + `text-left` + chevron `shrink-0` handle long headings (wrap, chevron won't squish); content is fluid. Weak spot: `chevronPosition` is **physical** `left`/`right`, not logical — in RTL the chevron side does not auto-mirror (rotation is fine). No logical properties. |
| theming-resilience | ✓ | `accent-9` ring survives a brand swap; `rounded-control` honors `[data-shape]`; all surfaces are semantic tiers. No sunken-track dark-mode inversion risk (row lifts to `surface-raised`, which is defined in both themes). |
| system-cohesion | gap | Shares DS radius role, focus-ring shape, `Icon`, duration tokens, spacing tiers. Two drifts: `pt-ds-02` is off the 3-tier cadence, and it lacks the CVA + size-context pattern its layout siblings (Card's `CardSizeContext`) use — trigger (`py-ds-05`) and content (`pb-ds-05 pt-ds-02`) hardcode padding independently with no shared source, so density can silently diverge. |
| craft | gap | Nice: chevron `shrink-0`, rotation on open, hover row lift. Misses: trailing separator under the last item, no press feedback, no explicit `cursor-pointer` on the trigger (Radix `button` may not get a pointer cursor under some resets), physical (non-mirrored) chevron side. |
| perceived-performance | ✓ | Instant hover/open bg feedback; 200ms CSS height reveal; no unexpected layout shift beyond the intended expand; no skeleton needed for this archetype. |
| market-benchmark | ✓ (PARITY) | Core parity with Radix / shadcn accordion (same primitive family, same reveal model). Behind on cleanliness (shadcn ships pure CSS with no dead JS layer) and behind richer peers (Carbon/Radix Themes/Ark) on size + variant + per-item disabled. |
| cross-ds-adoption | gap | Several concrete, un-adopted patterns available from peers (see below). |

## Top gaps (prioritized)

- **[P1] motion / docs — dead no-op Framer Motion layer + doc that lies about it.** `motion.div` at accordion.tsx:111-115 (`initial={false}` + constant `opacity:1`) never animates, yet accordion.md:38 tells consumers "Framer Motion handles the fade. Don't wrap AccordionContent children in additional motion components." → Either delete the wrapper (let the CSS height keyframe own the reveal, drop the framer-motion import from this module) OR make it real: `initial={{opacity:0}} animate={{opacity:1}}` so content fades as it expands. Then correct accordion.md:38 to match reality.
- **[P1] api-composability — no CVA / `size` / `variant`.** Only layout primitive with zero styling axes; density and separator style are hardcoded, forcing `className` drift. → Add a `size` axis (`sm/md/lg`) driving trigger + content padding via CVA and an `AccordionSizeContext` (mirror Card's `CardSizeContext`), plus a `variant` axis (bordered rows / separated / contained) folding in the hardcoded `border-b`.
- **[P2] accessibility — touch-target + forced-colors.** Height not guaranteed 44px at low density; the only inter-item affordance is a `border-b` that can drop out under forced-colors. → Apply the `touch-target` util (or min-height) to the trigger; add a forced-colors fallback / keep the separator on a `Separator`-strength token.
- **[P2] state-coverage — no styled disabled.** → Add `data-[disabled]:opacity-…`/`cursor-not-allowed` styling on the trigger so a disabled item reads as disabled.
- **[P2] content-resilience — physical chevron side in RTL.** `chevronPosition: 'left'|'right'` doesn't mirror. → Either use logical positioning or document the RTL behavior; add an RTL story.
- **[P3] testing — no `describeConformance`, no RTL/forced-colors/reduced-motion story.** → Backfill.
- **[P3] craft — trailing `border-b` under last item.** → Drop on `:last-child` (fold into the `variant` axis).

## What it does well

- Correctly **composes** the vendored Radix primitive (`Accordion = AccordionPrimitive.Root`) — no re-rolled state, no re-rolled a11y. Controlled + uncontrolled both inherited cleanly.
- All tokens are semantic/role-based: `rounded-control`, `border-surface-border`, `bg-surface-raised`, `accent-9`, `duration-moderate-02`, `Icon size="sm"`. No hex, no bare `rounded`/`shadow`, no `rounded-ds-*`/`rounded-full`.
- Chevron rotation is textbook: transform-only, on a real duration + easing token, driven by `group-data-[state=open]`.
- Clean typing across all parts (`forwardRef` + `displayName`, `ElementRef`/`ComponentPropsWithoutRef`, exported prop types, literal-union `chevronPosition`).
- Solid interaction test coverage (open/collapse/chevron-order/rotation) + axe-clean.

## Cross-DS adoption ideas

- **Carbon / Radix Themes** — accordion `size` (`sm/md/lg`) and a `variant` (bordered vs flush/ghost vs contained surface). We have neither; would kill the `className` density drift.
- **Base UI / Ark** — first-class per-item `disabled` with a styled disabled state (we pass Radix's `disabled` through but give it no visual).
- **MUI** — `disableGutters` + programmatic expand-all/collapse-all affordance for `type="multiple"` (a controlled convenience, not core primitive).
- **shadcn** — the negative lesson: it ships the same reveal with pure CSS and *no* JS motion wrapper. Adopting that (deleting our no-op `motion.div`) removes a framer-motion import from this module for free.

## Rebuild note

**Polish, not rebuild.** The primitive composition, a11y foundation, tokens, and types are all sound — nothing structural is wrong. Scope: (1) resolve the dead `motion.div` (delete or make it a real fade) and fix the doc line it contradicts; (2) add a CVA with `size` + `variant` axes and an `AccordionSizeContext` so the compound parts read one density source (mirror Card); (3) add styled disabled + `touch-target` + forced-colors separator; (4) backfill RTL/forced-colors/reduced-motion stories and `describeConformance`. All in-place; the public API only gains additive, non-breaking props.
