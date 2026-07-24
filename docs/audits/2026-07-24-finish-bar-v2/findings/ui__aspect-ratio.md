# ui/aspect-ratio — finish-bar audit
Finish: 5/5   Market: PARITY (Radix AspectRatio / shadcn)   Rebuild: none

Archetype: non-visual layout-math utility. It is an 11-line `forwardRef` passthrough over the vendored Radix aspect-ratio primitive (`@primitives/react-aspect-ratio`). It ships zero color, zero radius, zero motion, and no CVA — so the visual/motion/state axes are scored N/A rather than penalized, per the utility-component rule.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | Paints nothing — transparent box. No edge-soup, gradient, glow, accent rail, emoji, pill-spam. No radius token at all, so no `rounded-ds-*`/`rounded-full` risk. No magic numbers in source (the padding-bottom is Radix's internal ratio math, the legitimate technique). |
| accessibility | ✓ (N/A-heavy) | No interactive state, no ARIA to own. It is a layout div; a11y lives on the child (`<img alt>`). Nothing to break, nothing required. `forced-colors`/focus/keyboard all N/A. |
| api-composability | ✓ | Exemplary passthrough: `forwardRef<ComponentRef<typeof Root>, ComponentPropsWithoutRef<typeof Root>>`, spreads all props, `displayName` set. `ratio: number` inherited from primitive. No bespoke props, no `any`. Composes the primitive rather than re-rolling — the F-section ideal. `asChild` N/A (consumers polymorph the child, not the box). Controlled/uncontrolled N/A (stateless). |
| docs-dx | gap | Doc has Props/Defaults/Example/Composability/Gotchas and matches source. Gap: doc's headline usage is an `<img className="object-cover">` but no story demonstrates it; the "child must fill" gotcha (the #1 consumer mistake) is untested visually. |
| testing | ✓ | `describeConformance` (ref/className/displayName) + renders-children + padding-bottom assertions. Padding-bottom test couples to the vendored primitive's `100/ratio` technique — acceptable brittleness for a passthrough, and an intentional canary if the primitive moves to native CSS `aspect-ratio`. |
| motion | N/A | Static layout box — no entrance/exit/interaction. Correctly motionless; no reduced-motion guard needed. Neither systemic motion tell (slide-no-fade) applies — there is no framer-motion here. |
| state-coverage | N/A | No hover/active/focus/disabled/loading/empty/error states exist. Nothing to design. |
| content-resilience | ✓ | Child-fill contract documented; overflow/truncation is the child's concern. RTL trivially fine (symmetric box, no directional chrome). Ratio range (16:9, 1:1, portrait) works by construction. |
| theming-resilience | ✓ | Paints nothing → survives any accent-9 swap, `[data-shape]`, density, and light↔dark inversion trivially. No sunken track to vanish in dark. |
| system-cohesion | ✓ | No bespoke spring/radius/focus/spacing — it borrows none because it needs none. Sits cleanly inside Card/flex/grid with nothing to configure. "One system" by abstention. |
| craft | gap | One cosmetic no-op: `className={cn(className)}` (line 13) — `cn()` over a single value does nothing; a copy-paste reflex from components that merge a base class. Should be `className={className}` with the `cn` import dropped. Zero behavior impact. |
| perceived-performance | ✓ | The padding-bottom technique reserves layout space before the child paints → prevents CLS on media/image containers. Genuinely good for perceived perf; this is the component's quiet strength. |
| market-benchmark | ✓ (PARITY) | Peer is Radix AspectRatio (which this literally wraps) and shadcn's identical wrapper. We match the best-in-class exactly — there is no meaningful "lead" available for a math primitive of this shape. |
| cross-ds-adoption | gap | Native CSS `aspect-ratio` is now broadly supported; peers still ship the padding-bottom polyfill for legacy compat. Room to consider (a) a string-accepting `ratio` (`"16/9"`) convenience, (b) a built-in `object-cover` fill affordance so consumers stop hitting the child-fill gotcha. |

## Top gaps (prioritized)
- [P2] docs-dx — no story renders the doc's prescribed `<img className="object-cover h-full w-full rounded-surface">` pattern, and the "child must fill" gotcha is undemonstrated → add an `Image` story (and optionally a `Portrait` 3/4 story to show the ratio range).
- [P3] craft — `className={cn(className)}` is a redundant no-op → `className={className}` and drop the unused `cn` import. Fold into any incidental edit; not worth a dedicated PR.
- [P2] cross-ds-adoption — consider a small fill-helper or string-`ratio` convenience so consumers avoid the most common mistake (child not size-fluid). Optional, additive, non-breaking.

## What it does well
- Textbook passthrough: `forwardRef` to `ComponentRef<typeof Root>`, full `ComponentPropsWithoutRef` spread, `displayName` set — nothing bespoke, nothing to drift.
- Composes the primitive instead of re-rolling layout math — the anti-drift ideal the DS keeps asking components to hit.
- Ships zero color and zero radius, so it is theme-, shape-, and dark-mode-proof by construction.
- Reserves layout space (padding-bottom) → no CLS for image/media frames.
- Doc is terse and prescriptive; correctly documents the child-fill contract and number-not-string gotcha.

## Cross-DS adoption ideas
- Radix/shadcn keep the padding-bottom polyfill for legacy support; we could offer a native-CSS `aspect-ratio` path (or document it) now that browser support is broad, dropping the wrapper `<div>` for modern consumers.
- Ark/React-Aria containers often bundle an object-fit fill helper — we could expose an opt-in fill wrapper (or `objectFit` prop) so consumers stop hitting the child-fill gotcha the doc has to warn about.
- Accept a string `ratio` (`"16/9"`) in addition to `number`, coerced internally — a small DX affordance several peers offer.

## Rebuild note
None. This is the best-in-class shape for its archetype — a stateless layout-math primitive at exact parity with Radix/shadcn, with no visual, motion, a11y, or theming surface to get wrong, and it gets none of them wrong. The only actionable items are cosmetic (the `cn` no-op) and coverage (an image story) — both P2/P3, both fold into incidental work. No structural reason for a rebuild or a dedicated polish pass exists.
