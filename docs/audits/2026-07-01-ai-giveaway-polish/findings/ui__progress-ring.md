# ui/progress-ring — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:3 P2:3 P3:2

This is a competent, restrained SVG primitive — no gradients, no accent rail, correct
`strokeDashoffset` animation technique, real reduced-motion guard, sensible a11y on the
single ring. It is NOT AI slop. It falls short of the Card bar on three fronts: the color
axis is off-canonical (`color="default"` instead of `accent`, no `neutral`), `MultiProgressRing`
silently drops the per-ring `label` (dead prop + a11y gap), and forced-colors isn't handled.

## Findings

### [P1][G3] `color` axis uses `default` and omits the canonical `accent`/`neutral`
- **Category:** vocabulary / drift
- **Evidence:** progress-ring.tsx:9-15 — `const colorMap: Record<string, string> = { default: 'var(--color-accent-9)', success: ..., warning: ..., error: ..., info: ... }`; props at :38 `color?: 'default' | 'success' | 'warning' | 'error' | 'info'`; same at :137.
- **Why:** Rubric G3 explicitly lists `color="default"` as off-taxonomy. The canonical color axis is `accent | neutral | success | warning | error | info`. Here the brand/accent value is mislabeled `default` (it actually paints `accent-9`), and there is no `neutral` option at all.
- **Fix:** Rename the brand option `accent` (map `accent → var(--color-accent-9)`), add `neutral` (→ `var(--color-neutral-9)` or surface-fg-muted), default the prop to `accent`. Mirror in `MultiProgressRing.rings[].color`, the story `argTypes` options (stories:12), the doc, and llms-full.txt. This is a breaking rename — note it in the changeset.

### [P1][H] `MultiProgressRing` accepts a per-ring `label` but never renders or exposes it
- **Category:** a11y / state-coverage
- **Evidence:** progress-ring.tsx:133-142 props declare `rings: Array<{ ...; label?: string }>`; the render at :162-195 destructures `ring.value`, `ring.color`, `ring.max` only — `ring.label` is never read. The group has only a static `aria-label="Progress rings"` (:158). The doc (progress-ring.md:42) even says "for MultiProgressRing, use external labels."
- **Why:** A typed prop that does nothing is a dead/misleading API, and the multi-ring component conveys each metric purely by color with no accessible name per ring — a screen-reader user gets "Progress rings" and nothing else. The stories pass `label: 'Move'`/`'Exercise'`/`'Stand'` (stories:60-64) that vanish into the void.
- **Fix:** Either render the per-ring values accessibly (e.g. emit an `aria-label`/`<title>` per `motion.circle`, or a visually-hidden list of `{label}: {value}%`), or drop `label` from the type if it's genuinely external-only. Don't ship a prop that no-ops.

### [P1][I] `colorMap` is stringly-typed (`Record<string, string>`) decoupled from the prop union
- **Category:** types
- **Evidence:** progress-ring.tsx:9 `const colorMap: Record<string, string> = {`; consumed at :98 `stroke={colorMap[color]}` and :184 `stroke={colorMap[ring.color ?? 'default']}`.
- **Why:** The map key type isn't tied to the `color` union, so adding a color to the union (or the G3 rename above) won't trigger a type error if the map isn't updated, and a lookup miss silently yields `undefined` → no stroke. Source-of-truth drift waiting to happen.
- **Fix:** Type it `Record<NonNullable<ProgressRingProps['color']>, string>` (or a shared `RingColor` type) so the map and the prop union stay in lockstep.

### [P2][H] No forced-colors handling — ring is invisible in Windows High Contrast
- **Category:** a11y / state-coverage
- **Evidence:** progress-ring.tsx:89 track `stroke="var(--color-surface-raised-hover)"`, :98 value `stroke={colorMap[color]}` (a resolved color custom-prop). In `forced-colors: active`, authored `stroke` colors are not force-mapped by the UA the way `color`/`background` are, so both the track and fill can collapse to the same system color or disappear.
- **Why:** Rubric H lists forced-colors as a required state; the component renders a meaningful data viz that can vanish. No `@media (forced-colors)` fallback anywhere.
- **Fix:** Add a forced-colors fallback (e.g. `forced-color-adjust` handling, or `stroke` set to `CanvasText`/`Highlight` system colors under the media query) so track vs fill stay distinguishable.

### [P2][M2] `MultiProgressRing` rings animate with no stagger/differentiation
- **Category:** motion
- **Evidence:** progress-ring.tsx:179-191 — every ring uses the same `transition={prefersReducedMotion ? { duration: 0 } : springs.smooth}` with identical `initial`/`animate`, no per-index delay.
- **Why:** All concentric rings fill in perfect unison (uniform timing, M2). An Activity-ring-style display reads better with a small per-ring stagger so the eye tracks each metric; right now it's robotically synchronized.
- **Fix:** Add a small index-based delay (e.g. `transition={{ ...springs.smooth, delay: i * 0.06 }}`) gated behind the reduced-motion check.

### [P2][M2] Single-ring counter spring is hand-rolled instead of a named motion token
- **Category:** motion
- **Evidence:** progress-ring.tsx:60-67 — `animate(motionVal, ..., { stiffness: 100, damping: 30, type: 'spring' })` with comment "Intentionally slower than springs.gentle". The fill itself uses `springs.smooth` (:104) while the counter uses an unnamed inline spring.
- **Why:** Two different springs drive one visual event (ring fill + number count-up), and the counter's is a magic inline config outside the motion vocabulary. Comment acknowledges it's deliberate, so this is a soft flag — but a named token (or reusing `springs.gentle`) keeps the system one-vocabulary.
- **Fix:** Promote the count-up spring to a named entry in `lib/motion.ts` (e.g. `springs.count`) or reuse `gentle`, so the ring fill and counter can share/relate intentional tokens.

### [P3][F1] `showValue` boolean where a center slot could live
- **Category:** composability
- **Evidence:** progress-ring.tsx:39 `showValue?: boolean`, rendered at :107-117 as a fixed auto-percentage `<text>`.
- **Why:** The center is a natural slot (consumers often want "3/12", an icon, or a label instead of "%"). A boolean locks them into the auto percentage. Minor — the default is genuinely useful.
- **Fix:** Optionally accept `children` (or a `center` render prop) for the SVG center, keeping `showValue` as the convenience default. Not urgent.

### [P3][docs/G2] SVG colors via raw CSS-var strings rather than `stroke-*` utilities
- **Category:** drift
- **Evidence:** progress-ring.tsx:89,98,176,184 — `stroke="var(--color-surface-raised-hover)"` and `stroke={colorMap[color]}`.
- **Why:** TW4 ships `stroke-*` utilities (`stroke-accent-9`, etc.); using raw `var()` strings sidesteps the token utility layer. Legitimate for a dynamic per-instance value, but the *track* color is static and could be a class. Very minor; flagging for completeness only.
- **Fix:** Use `className="stroke-surface-raised-hover"` on the track `<circle>`; keep the dynamic value stroke as-is or map to `stroke-*` classes via a lookup.

## Composability gaps
- `showValue` boolean forecloses a center slot (F1) — no way to put `3/12`, an icon, or custom center content; consumer is stuck with auto `%`.
- `MultiProgressRing` is a flat array-prop component with a dead `label` field; per-ring content/labeling can't be composed (no slot, no children, no accessible name path).
- No `asChild` — correct here; it's a leaf SVG primitive, polymorphism doesn't apply (F2 not a gap).
- Does not (and should not) compose Card — it's a primitive, not a surface. F5 clean.

## Motion gaps
- Multi-ring fills are perfectly synchronized — no stagger to differentiate metrics (M2).
- Count-up uses a hand-rolled inline spring outside the named motion vocabulary while the fill uses `springs.smooth` — two un-related springs for one event (M2, soft).
- Reduced-motion: correctly handled on both components and the counter (M3 clean).
- Animation technique: animates `strokeDashoffset` + opacity, never layout props (M5 clean).
- No bounce/overshoot-by-default (M1 clean).

## Polish plan (ordered steps to reach the finish bar)
1. **Rename the color axis** to canonical taxonomy: `default → accent`, add `neutral`; default to `accent`. Update `colorMap`, both prop unions, story `argTypes`, doc, llms-full.txt. Ship as a breaking change with a changeset migration note. (G3)
2. **Fix `MultiProgressRing` labels**: render per-ring accessible names (`<title>`/`aria-label` per circle or a visually-hidden value list), or remove the dead `label` prop. (H)
3. **Tighten `colorMap` typing** to the color union so the map and props can't drift. (I)
4. **Add forced-colors fallback** so track vs fill stay distinguishable in High Contrast. (H)
5. **Stagger the multi-ring fills** (index delay, reduced-motion-gated) and promote the count-up spring to a named token. (M2)
6. *(Optional)* Offer a center `children`/slot on `ProgressRing` so consumers aren't locked into the auto-`%`. (F1)
7. Add a reduced-motion and/or forced-colors story to demonstrate the new state coverage.

## Clean (rubric dims that pass)
- **V1–V8 visual tells:** no accent rail, no double edge, no gradient text (center text is `fill-surface-fg` solid, :113), no raw indigo/violet palette (colors are `var(--color-*-9)` semantic tokens), no emoji, no blob/glass/glow, single radius (SVG, n/a), no pill spam.
- **V9 font:** uses `font-sans` + `text-ds-*` tokens, no hardcoded Inter/Geist (:113, sizeConfig fontSize uses `text-ds-*`).
- **M1/M3/M5 motion:** no bounce default, reduced-motion guarded (:47,61-67,104,190), transform/opacity + `strokeDashoffset` not layout props.
- **E1–E8 verbal:** doc and JSDoc are direct and clean — no em-dash tic abuse, no AI vocabulary, no hedging, no tricolons.
- **a11y baseline (single ring):** `role="progressbar"` + `aria-valuenow/min/max` + `aria-label` fallback `"{n}% progress"` (:76-79); value clamped (:51); tested (test:21-50).
- **Types:** `forwardRef` + `displayName` on both; `Omit<SVGAttributes, 'color'>` correctly avoids the native `color` collision; prop unions are real string unions (only `colorMap` internal is loose — see I).
- **Tests + stories + docs exist and match source** (conformance + 7 unit tests; 7 stories incl. zero/full edge cases; doc + llms-full prop table accurate to source).
- **F5:** correctly a primitive — does not re-roll a surface or fail to compose Card; nothing to compose.
