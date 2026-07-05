# ui/toggle-group — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:3 P2:4 P3:2

ToggleGroup is a thin, mostly-clean wrapper over the vendored Radix Toggle Group primitive that
shares the `toggleVariants` CVA with the base `Toggle`. No hard AI tells (no accent rail, no
gradient, no framework palette, no emoji, no rounded-everything). The gaps are all polish /
composability / drift items: the press animation drifts from how the base `Toggle` does motion
and skips reduced-motion; the `color` axis the CVA supports is undocumented and unstoried; story
coverage is thin (3 stories, no sizes/colors/disabled/state matrix); and the doc prop table omits
real axes and uses a slightly off vocabulary.

## Findings

### [P1][M3] Press animation has no reduced-motion guard
- **Category:** motion
- **Evidence:** toggle-group.tsx:55 — `'active:scale-[0.95] transition-transform'`
- **Why:** CSS `active:scale` + `transition-transform` always animates; `prefers-reduced-motion` users still get the scale shrink. The base `Toggle` uses framer-motion `whileTap`, which the MotionConfig/reduced-motion system can disable.
- **Fix:** Either route the press feedback through framer-motion like `Toggle` (`whileTap={{ scale: 0.95 }} transition={springs.snappy}`) so it respects MotionConfig, or wrap the transition in a `motion-reduce:transition-none motion-reduce:active:scale-100` guard.

### [P1][M1/drift] Item press motion drifts from the base Toggle's motion model
- **Category:** motion / drift
- **Evidence:** toggle-group.tsx:55 (`active:scale-[0.95] transition-transform`) vs toggle.tsx:49-51 (`whileTap={{ scale: 0.95 }} transition={springs.snappy}`)
- **Why:** Same conceptual control (a toggle), two different press implementations and two different curves — CSS instant `transition-transform` (default ~150ms linear-ish) here vs a tuned `springs.snappy` on `Toggle`. A `ToggleGroupItem` and a standalone `Toggle` placed side by side will press differently. The CVA is shared but the motion is not.
- **Fix:** Lift the press feedback into the shared layer (a `motion.create(ToggleGroupPrimitive.Item)` with `whileTap`/`springs.snappy`, mirroring `Toggle`), so the group item and standalone toggle feel identical.

### [P1][F5/G2] Re-rolls press transform instead of composing the base Toggle's motion; arbitrary scale value
- **Category:** composability / drift
- **Evidence:** toggle-group.tsx:55 — `'active:scale-[0.95] transition-transform'`
- **Why:** The item re-implements its own press affordance rather than reusing the `Toggle` motion source of truth, and uses an arbitrary `scale-[0.95]` rather than a token/utility — the exact "re-roll instead of compose" risk StatCard was built to kill. If `Toggle`'s press feel changes, the group silently diverges.
- **Fix:** Share one press primitive between `Toggle` and `ToggleGroupItem` (extract the motion wrapper), so there is a single source of truth for the press interaction.

### [P2][H] Story + test state coverage is thin (no size / color / disabled-group / focus / forced-colors)
- **Category:** state-coverage
- **Evidence:** toggle-group.stories.tsx:13-59 — only `Default`, `Multiple`, `Outline`; no `size` (sm/md/lg), no `color` (accent/error/success/neutral), no disabled group, no selected/focus-visible demonstration, no RTL/forced-colors/reduced-motion.
- **Why:** The CVA exposes `size` (3) and `color` (4) axes plus a disabled state; none are shown in stories and only single-item `disabled` is tested. The Card bar requires the applicable state matrix demonstrated.
- **Fix:** Add stories: `Sizes` (sm/md/lg row), `Colors` (accent/error/success/neutral selected), `Disabled`, and a `Selected`/`focus-visible` showcase. Add a test asserting `color`/`size` propagate via context to items.

### [P2][J] Doc prop table omits the `color` axis and mislabels the variant set
- **Category:** docs
- **Evidence:** toggle-group.md:9-13 lists `variant: "default" | "outline"`, `size`, but no `color`; CVA in toggle.tsx:28-33 defines `color: accent | error | success | neutral` (default `accent`).
- **Why:** Docs-vs-source drift — the `color` axis (and its `accent` default) is entirely missing from the per-component doc, and "Defaults" (md:22) omits `color="accent"`. Source wins; doc is stale.
- **Fix:** Add `color: "accent" | "error" | "success" | "neutral" (propagated to items)` to both ToggleGroup and ToggleGroupItem prop lists and to the Defaults block.

### [P2][G3] `color="accent"` default but no `neutral`-first guidance; outline-only variant set
- **Category:** vocabulary
- **Evidence:** toggle.tsx:35-39 `defaultVariants: { variant: 'default', size: 'md', color: 'accent' }`; variant axis is `default | outline` only.
- **Why:** Two small vocabulary notes: (1) toggle's `variant` axis is `default | outline` — it lacks the canonical `soft` that CLAUDE.md prefers for non-primary surfaces, so consumers wanting a soft toggle bar have no option (the on-state already uses a soft `*-2` tint, so a `soft` resting variant would be coherent). (2) Not a hard tell, noting for family consistency.
- **Fix:** Consider adding a `soft` variant to `toggleVariants` for parity with the rest of the system; low priority. Document the `accent` default explicitly.

### [P2][H/a11y] No `aria-label` requirement surfaced; stories model it but doc/types don't enforce
- **Category:** a11y / state-coverage
- **Evidence:** toggle-group.stories.tsx items all carry `aria-label`, but toggle-group.md gives no guidance that icon-only items need a label; ToggleGroup root has no labeling guidance.
- **Why:** Icon-only toggle items are the common case (the only stories are icon-only). Without `aria-label` they're unlabeled buttons. The component can't enforce it via types, so the doc must.
- **Fix:** Add a Gotcha: icon-only `ToggleGroupItem` requires `aria-label`; the group should have `aria-label`/`aria-labelledby`.

### [P3][F2] No `asChild` on ToggleGroupItem (minor — Radix passthrough already supports it)
- **Category:** composability
- **Evidence:** toggle-group.tsx:39-62 spreads `...props` to `ToggleGroupPrimitive.Item`, which supports `asChild`, but it isn't documented/typed as a feature.
- **Why:** Polymorphism is available via the underlying Radix `asChild` but undocumented, so consumers won't know they can render an item as a custom element. Not a defect, a discoverability gap.
- **Fix:** Mention `asChild` passthrough in the doc.

### [P3][types] Item/Group share one VariantProps type — `color` mismatch risk on override
- **Category:** types
- **Evidence:** toggle-group.tsx:64-67 — both `ToggleGroupProps` and `ToggleGroupItemProps` extend `VariantProps<typeof toggleVariants>`; fine, but the context default (toggle-group.tsx:14-16 `color: 'accent'`) duplicates the CVA default rather than deriving it.
- **Why:** The `accent`/`md`/`default` context defaults are hand-copied from `toggleVariants.defaultVariants`; if the CVA default changes, the context silently keeps the old default. Minor single-source-of-truth drift.
- **Fix:** Leave context values `undefined` and let `toggleVariants` apply its own defaults (item already does `variant ?? context.variant` then CVA fills the rest), or derive from the CVA config.

## Composability gaps
- **F5:** ToggleGroupItem re-rolls its press transform (`active:scale-[0.95] transition-transform`) instead of composing the base `Toggle`'s framer-motion press. Two implementations of one interaction; no shared source of truth.
- **F2:** `asChild` is available via the Radix primitive but undocumented — polymorphism is hidden.
- Context defaults duplicate `toggleVariants.defaultVariants` rather than deferring to the CVA (minor drift surface).
- No gaps on the slot model itself: ToggleGroup correctly uses children + context propagation (the right pattern for a variable-length set), not bespoke `items={[]}` props. This part is clean.

## Motion gaps
- **M3 (P1):** Press scale via CSS `active:scale-[0.95]` ignores `prefers-reduced-motion`; the base `Toggle`'s framer-motion `whileTap` respects MotionConfig — the item should too.
- **M1/drift (P1):** Press curve differs from `Toggle` (instant CSS transition vs `springs.snappy`). Same control, two feels.
- No entrance/exit motion (acceptable — items are persistent, not overlays). No layout-prop animation. Hover/selected color transitions are handled by `transition-colors` in the CVA (clean).

## Polish plan (ordered steps to reach the finish bar)
1. Unify press motion with the base `Toggle`: wrap `ToggleGroupPrimitive.Item` in `motion.create`, use `whileTap={{ scale: 0.95 }} transition={springs.snappy}`, drop `active:scale-[0.95] transition-transform`. This fixes M3 + M1 + F5 in one change.
2. Update the doc (`toggle-group.md`): add the `color` axis (+`accent` default) to both prop tables and the Defaults block; add Gotchas for icon-only `aria-label` and `asChild` passthrough.
3. Expand stories: `Sizes`, `Colors`, `Disabled`, and a selected/focus-visible showcase so the state matrix is demonstrated.
4. Add a test asserting `color` and `size` propagate from `ToggleGroup` to items via context (only `variant` path is implicitly covered today).
5. (Optional, low priority) Add a `soft` variant to `toggleVariants` for system vocabulary parity; let context defaults defer to the CVA instead of duplicating them.

## Clean (rubric dims that pass)
- **V1 accent rail:** none. **V2 double edge:** outline variant is border-only, default is bg-only; no border+shadow combo. **V3 gradient text:** none. **V4 framework palette:** uses semantic `accent/error/success` tokens, no raw indigo/violet/slate. **V5 emoji:** none. **V6 blob/glass/glow:** none. **V7 rounded-everything:** `rounded-control` token, single radius. **V8 pill spam:** none.
- **V9–V15 reflexes:** none (no hardcoded font, no decorative numbering, no eyebrow/hero/all-caps).
- **E1–E8 verbal:** doc/JSDoc copy is direct and prescriptive; no em-dash tics-as-connector beyond legitimate punctuation, no AI vocabulary, no meta-hedging.
- **F1 bespoke-prop:** correctly uses children + context, not an `items` array prop. **F4:** compound is appropriate for a variable-length set. **F6 controlled/uncontrolled:** Radix primitive supplies `value`/`defaultValue`/`onValueChange` — full controlled+uncontrolled support; passes.
- **G1 surface:** not a card surface; no surface-1 misuse. **G3 axes:** `variant`/`size`/`color` names are on the canonical taxonomy (minus a `soft` variant — noted as P2).
- **H focus-visible:** inherited from `toggleVariants` (`focus-visible:ring-2 ring-accent-9 ring-offset-2`), real button semantics from Radix, keyboard nav from Radix roving tabindex. **disabled:** `disabled:opacity-action-disabled disabled:pointer-events-none`.
- **I types:** `forwardRef` + `displayName` on both, ref types via `React.ElementRef`, no `any`, prop types exported. Clean.
- **M5:** no layout-prop animation.
