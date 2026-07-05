# ui/toggle — audit
**Finish score:** 4/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:2 P2:3 P3:1

Toggle is a thin, well-built wrapper over the vendored Radix `@primitives/react-toggle`. It composes the base primitive (no re-rolled surface), uses semantic tokens throughout, has zero AI visual/verbal tells, and ships a clean conformance-backed test suite + a full story matrix. The gaps are polish-tier: a missing reduced-motion guard on its tap animation (the one real reflex), an incomplete `color` axis vs the canonical taxonomy, no `asChild`, and a missing per-component doc.

## Findings

### [P1][M3] whileTap scale has no reduced-motion guard
- **Category:** motion
- **Evidence:** toggle.tsx:48-54 — `<MotionToggleRoot ref={ref} whileTap={{ scale: 0.95 }} transition={springs.snappy} ...>`
- **Why:** Every press animates a transform with no `prefers-reduced-motion` respect; the rubric's M3 hard tell. The established in-repo pattern is `useReducedMotion()` (button.tsx:292) / `prefersReducedMotion` (badge.tsx:257) gating the motion value — Toggle skips it, so it's the lone interactive control in the family that ignores the user's OS setting.
- **Fix:** `const prefersReduced = useReducedMotion()` then `whileTap={prefersReduced ? undefined : { scale: 0.95 }}` (mirror Button/Badge). `springs.snappy` itself is fine (damping 30, no overshoot) — only the guard is missing.

### [P1][G3] color axis missing `warning` and `info`
- **Category:** vocabulary
- **Evidence:** toggle.tsx:28-33 — `color: { accent, error, success, neutral }`
- **Why:** Canonical color taxonomy (rubric G3) is `accent / neutral / success / warning / error / info`. Toggle ships only 4 of 6 — `warning` and `info` are absent, so a consumer color-coding a toolbar can't express a warning toggle without a className escape hatch. Sibling components carry the full set (Card has accent/error/success/warning/info/neutral; toggle.test.tsx:11 only asserts the 4 it has).
- **Fix:** Add `warning: 'data-[state=on]:bg-warning-2 data-[state=on]:text-warning-11'` and `info: 'data-[state=on]:bg-info-2 data-[state=on]:text-info-11'` to the `color` variants; extend the test `colors` array and the `ColorVariants` story to match.

### [P2][F2] no `asChild` / Slot polymorphism
- **Category:** composability
- **Evidence:** toggle.tsx:43-55 — renders `MotionToggleRoot` only; no `asChild` branch (cf. button.tsx:209,357 which supports it).
- **Why:** Toggle is a button-like control; consumers occasionally want it to render as a link or a custom element (e.g. a toggle that is also a router link). The underlying Radix Toggle primitive supports `asChild`, but the motion wrapper here doesn't thread it, so the capability is lost. Lower severity than Button's because polymorphic toggles are rarer.
- **Fix:** Either thread `asChild` through to `TogglePrimitive.Root` (note: `motion.create` + Slot needs the motion element to wrap the slotted child, or drop the motion wrapper when `asChild`), or document that polymorphism isn't supported. At minimum decide deliberately rather than by omission.

### [P2][G2] story icon uses raw `h-4 w-4` instead of the Icon API / token sizes
- **Category:** drift
- **Evidence:** toggle.stories.tsx:40-42 — `<IconBold className="h-4 w-4" />`
- **Why:** The DS has an Icon API (`<Icon icon={...} size="sm" />`, used in stat-card.tsx:292) and ds size tokens; hardcoding `h-4 w-4` in the canonical "WithIcon" example teaches consumers the non-DS path and won't track if the icon size scale changes. Story-source only (not shipped component default), so P2.
- **Fix:** Use `<Icon icon={IconBold} size="sm" />` in the WithIcon story so the reference example models the DS Icon API.

### [P2][J] no per-component doc + no doc/llms parity check
- **Category:** docs
- **Evidence:** no file at `packages/core/docs/components/**/toggle.md` (Glob: no matches); no `toggle.md` anywhere in repo.
- **Why:** Rubric J / publish gate expects a per-component doc with an accurate prop + variant table. Toggle has a story (autodocs) but no standalone doc, so the prop surface (variant/size/color, the missing warning/info) isn't documented anywhere the make-kit/llms pipeline can pick up authoritatively.
- **Fix:** Add the per-component doc (or confirm autodocs is the agreed source) and ensure the variant table lists the real CVA axes once warning/info are added.

### [P3][H] hover-state color tokens only cover default/outline, not per-`color` hover
- **Category:** state-coverage
- **Evidence:** toggle.tsx:18-22 — hover is `hover:bg-surface-raised-hover` on both variants; the `color` axis only paints `data-[state=on]` (pressed), not hover.
- **Why:** Hover on an unpressed colored toggle is neutral grey regardless of `color`. Defensible (neutral hover, colored selected) and arguably intentional, but it means the `color` prop has no effect until pressed — worth a deliberate note rather than leaving ambiguous. Not a tell.
- **Fix:** None required if intentional; consider documenting "color applies to the pressed/on state only" in the doc/JSDoc.

## Composability gaps
- **No `asChild`** (F2) — can't polymorph to a link/custom element though the underlying Radix primitive supports it. (P2 above.)
- **No JSDoc / typedoc block** on `Toggle` or `ToggleProps` (contrast Card/StatCard, which carry rich `@example` JSDoc). The component is self-explanatory but the family standard is a documented prop surface; `ToggleProps` (toggle.tsx:58) is exported but undocumented.
- Otherwise composes cleanly: it builds on `TogglePrimitive.Root` rather than re-rolling a button surface (no F5 drift), and controlled/uncontrolled both work (test covers `pressed`, `defaultPressed`, `onPressedChange` — F6 clean, and it correctly uses `onPressedChange`/`pressed`, not `onChange`/`value`).

## Motion gaps
- **M3 (P1):** `whileTap={{ scale: 0.95 }}` (toggle.tsx:50) has no `useReducedMotion` guard — the only real motion defect. Pattern to copy exists in button.tsx:292 and badge.tsx:257.
- **M1:** Clean — `springs.snappy` (stiffness 500 / damping 30) is critically-ish damped, no bounce/overshoot. Appropriate for a press micro-interaction.
- **M2:** Clean — single press transition, no robotic-uniform-timing problem (only one animation).
- **M4:** Feedback motion present (press scale) + CSS `transition-colors duration-fast-01` for hover/state color (toggle.tsx:14). Good.
- **M5:** Clean — animates `scale` (transform), not layout props.

## Polish plan (ordered steps to reach the finish bar)
1. **M3:** Add `const prefersReduced = useReducedMotion()` and gate `whileTap={prefersReduced ? undefined : { scale: 0.95 }}` (mirror Button/Badge). Highest priority — it's the one shipped reflex.
2. **G3:** Add `warning` + `info` to the `color` CVA axis using the `bg-{color}-2 / text-{color}-11` pattern already established for the existing three semantic colors; extend test `colors` and the `ColorVariants` story.
3. **F2:** Decide `asChild` deliberately — implement it (Slot-threaded) or document the non-support. Don't leave it by omission.
4. **Docs/JSDoc (J):** Add a `@example`-bearing JSDoc block on `Toggle` matching the Card/StatCard family standard, and the per-component doc with the corrected variant/color table.
5. **G2:** Switch the WithIcon story to `<Icon icon={IconBold} size="sm" />` so the reference example uses the DS Icon API.

## Clean (rubric dims that pass)
- **V1–V8 visual tells:** all clean. No accent rail, no double edge (transparent bg + hover bg, or single border on outline — never border+shadow together), no gradient text, no `indigo/violet/slate` framework palette (uses `accent/error/success` semantic scales), no emoji icons, no blob/glass/glow, single `rounded-control` radius, no pill-badge spam.
- **V9–V15 visual reflexes:** clean. No hardcoded font (no font-family at all — inherits), no decorative numbering, no eyebrow/all-caps-default in the component (story labels are functional, not decorative kickers).
- **E1–E8 verbal tells:** clean — there is almost no prose; no em-dash tic, no AI vocabulary, no meta-hedging in source/test/story.
- **G1 surface:** correct — toggle is an inline control, uses `bg-transparent` + `surface-raised-hover` on hover; not a card-on-surface-1 violation.
- **G2 tokens (component):** clean — `rounded-control`, `h-ds-*`, `px-ds-*`, `text-ds-*`, `duration-fast-01`, `ease-productive-standard`, `disabled:opacity-action-disabled` are all DS tokens; no raw px/hex/bare-shadow. (The only raw-class instance is in story source, flagged P2 above.)
- **G3 variant/size axes:** `variant` (default/outline) and `size` (sm/md/lg) are on-taxonomy; only `color` is incomplete (flagged P1).
- **H state coverage:** focus-visible ring present (`focus-visible:ring-2 ring-accent-9 ring-offset-2`), disabled handled (`disabled:pointer-events-none disabled:opacity-action-disabled` + native disabled), pressed via `data-[state=on]`, keyboard nav inherited from Radix button semantics. Test covers default/pressed/defaultPressed/disabled/no-toggle-when-disabled.
- **I types:** clean — `forwardRef` with proper `React.ElementRef<typeof TogglePrimitive.Root>`, `displayName` set, `ToggleProps` exported, no `any`, no `React.FC`, no stringly-typed enums.
- **F5/F6 composability core:** composes the base primitive (no re-rolled surface); controlled + uncontrolled both supported with correct `pressed`/`onPressedChange` semantics.
- **Tests + stories:** present and on `describeConformance` (toggle.test.tsx:8), full variant/size/color/pressed/disabled story matrix.
