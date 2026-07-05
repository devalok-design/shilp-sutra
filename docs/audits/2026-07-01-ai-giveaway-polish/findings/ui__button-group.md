# ui/button-group — audit
**Finish score:** 4/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:2 P2:3 P3:2

ButtonGroup is a presentational layout container that propagates Button props through context
and removes inner radii/borders on attached children. It is largely clean of AI visual/verbal
tells: no gradients, no accent rail, no emoji, no raw indigo/slate, semantic tokens throughout,
canonical variant/size/color axes. The gaps are polish-level: physical (non-logical) radius
geometry that breaks in RTL, index keys, a couple of hardcoded arbitrary opacities, and minor
doc/story drift.

## Findings

### [P1][H] RTL: position radius/border uses physical sides, not logical properties
- **Category:** a11y / state-coverage
- **Evidence:** button-group.tsx:54-72 — `return { borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRightWidth: 0 }` (and `borderBottomWidth` for vertical) in `getGroupPositionStyle`
- **Why:** In an RTL document the "first" button visually sits on the right, but this code always squares its *right* corners and drops its *right* border — so in RTL the merged seam lands on the wrong edge and the rounded ends are inverted. The rubric's state matrix requires RTL be handled (directional geometry must mirror).
- **Fix:** Emit logical properties — `borderStartStartRadius` / `borderStartEndRadius` / `borderEndStartRadius` / `borderEndEndRadius` and `borderInlineEndWidth` / `borderBlockEndWidth` — instead of physical `Top/Right/Bottom/Left`. These auto-mirror under `dir="rtl"`. (Note: Button consumes this via inline `style`, so the fix is localized to this helper.)

### [P1][V2] Attached default stacks a 1px border AND the divider/shadow rail per child (double-edge risk)
- **Category:** visual-tell
- **Evidence:** button-group.tsx:158-170 — `const needsDivider = i > 0 && variant !== 'outline'` injects a `w-px`/`h-px` colored div *between* children; meanwhile solid buttons already carry `shadow-raised` (button.tsx:60) and outline buttons carry `border`. For `outline` the inner border is collapsed via `borderRightWidth:0`, but for `solid` the injected divider sits on top of each button's own raised shadow ring.
- **Why:** V2 is about an element carrying both an edge and an elevation rail at once; the injected tonal divider re-introduces a seam line on solid buttons that already have a shadow ring, which can read as a double edge between segments. Borderline — it is gated by variant so it is a deliberate seam, not a reflexive rail — but worth confirming visually against the Card "elevation OR edge, never both" rule.
- **Fix:** Confirm in Storybook that the solid-variant divider doesn't compound with the per-button raised shadow into a visible double seam; if it does, drop the divider for `solid` (let the shadow ring delineate) or flatten segment shadows inside an attached group.

### [P2][M4] No hover/press z-elevation feedback transition on the divider seam; group has no motion of its own
- **Category:** motion
- **Evidence:** button-group.tsx:151 — `'[&>*:focus-within]:z-10 [&>*:hover]:z-10'` lifts the focused/hovered child via z-index but with no `transition`; the injected divider (lines 161-169) is static and does not hide when an adjacent button is hovered/active, so on solid/soft the seam stays visible over the hovered button's changed background.
- **Why:** The Card bar wants intentional micro-feedback. Here the seam can clash with a hovered segment's `hover:bg-*` (button.tsx:67-71) because the divider color is computed once from the group's resting color, not the hover color.
- **Fix:** Either hide the divider adjacent to the hovered/active segment, or accept it and document; at minimum the z-lift is instantaneous — fine for z-index, but verify no layout jump.

### [P2][G2] Hardcoded arbitrary opacities in divider color map
- **Category:** drift
- **Evidence:** button-group.tsx:101-106 — solid map uses `'bg-accent-11/20'`, `'bg-error-11/20'`, …, `'bg-neutral-8/30'`
- **Why:** The base colors (`accent-11`, `neutral-8`) are legitimate semantic token utilities, but the `/20` and `/30` alpha steps are magic numbers chosen by eye rather than a token. Two different alpha values (`/20` for chromatic, `/30` for neutral) with no documented rationale = the kind of one-off that drifts. Not raw Tailwind palette (V4 clean — `neutral-*` is exposed as `--color-neutral-*`).
- **Fix:** Either introduce a `--color-surface-border-on-fill` style token for the on-solid divider, or comment why `/20` vs `/30`. Low priority — it works and is gated.

### [P2][docs/J] Doc + story copy drift; doc omits `_stretch` internal and the divider behavior caveat
- **Category:** docs
- **Evidence:** button-group.stories.tsx:29 — comment "using the secondary variant" but `args: { variant: 'outline' }`; line 54 "inherit the primary variant" for a `variant="solid"` group. Doc button-group.md:40 says dividers are injected for "solid/soft/ghost" but source (line 158) injects for *every* non-outline variant including `link` (`variant !== 'outline'`).
- **Why:** Verbal drift ("secondary"/"primary" are not variant names in the canonical taxonomy — the axes are solid/soft/outline/ghost/link) and a source↔doc mismatch on which variants get dividers (source wins per the rubric).
- **Fix:** Drop "primary/secondary" language from story comments; correct the doc to "all attached non-outline variants" (or explicitly exclude `link`/`ghost` in source if a divider on a link group is unwanted).

### [P3][structural] Index-based React keys on injected children
- **Category:** structural-tell
- **Evidence:** button-group.tsx:160 — `<React.Fragment key={i}>` and `getPosition(index)` keyed off array index
- **Why:** Index keys are fragile if the child list reorders or conditionally renders; standard React lint smell. Low impact here since groups are usually static, but it is the reflexive `key={i}` pattern.
- **Fix:** Prefer the child's own `key` when present (`child.key ?? i`).

### [P3][F6] Not a selection control — no toggle/segmented semantics (by design, noting for completeness)
- **Category:** composability
- **Evidence:** Whole file — ButtonGroup is purely visual grouping; there is no `value`/`defaultValue`/`onValueChange`, no `role="radiogroup"`/`aria-pressed` wiring.
- **Why:** This is correct for a generic button group, but consumers frequently reach for a "segmented control" (single-select, pressed state). The component name invites that expectation and there is no sibling that fills it. Not a defect in *this* unit; flag for the family roadmap.
- **Fix:** None here. Consider a separate `SegmentedControl` (or a `selectable`/`value` mode) rather than overloading ButtonGroup.

## Composability gaps
- **Tight coupling to Button via injected siblings + index position.** ButtonGroup filters `React.Children`, injects divider `<div>`s between them, and assigns first/middle/last by array index (button-group.tsx:129-176). This breaks if a consumer wraps a child (Tooltip-wrapped Button, a `<Fragment>` of two buttons, a conditionally-null child) — position detection and divider placement go wrong. A slot/data-attribute contract (child reads `data-bg-position`) would be more robust than positional index. (Mitigated: it does `filter(isValidElement)`, but a wrapper element still counts as one position and won't forward context to the inner Button.)
- **No `asChild` on the group wrapper.** Minor — the group renders a `<div role="group">`; consumers occasionally want it to be a `<nav>`/`<menubar>` or a `motion` element. Low priority.
- **Good:** context-based prop propagation with per-child override is the right pattern (button.tsx:277-283 resolves `variant ?? group.variant`), and it composes with SplitButton via the same context. This is genuinely composable, not bespoke-prop-driven — no F1/F4/F5 violations.

## Motion gaps
- **M3/M4 — none required at the group level.** ButtonGroup has no entrance/exit animation, which is correct for a layout container; per-segment feedback motion lives in Button (which is reduced-motion aware via `useReducedMotion`). No bounce-by-default, no animated layout props here.
- **One real gap (see P2/M4):** the z-lift on hover/focus (`[&>*:hover]:z-10`) is un-transitioned and the static divider doesn't react to an adjacent segment's hover background change. Not a tell, but short of the Card bar's "feedback that means something."

## Polish plan (ordered steps to reach the finish bar)
1. **RTL (P1/H):** rewrite `getGroupPositionStyle` to emit logical border-radius/width properties so attached groups mirror correctly under `dir="rtl"`. Add an RTL story + a forced-`dir` test asserting the squared corners flip.
2. **Divider/double-edge (P1/V2, P2/M4):** verify the solid-variant divider against the per-button raised shadow in Storybook; hide the divider adjacent to a hovered/active segment (or drop it for solid). Add hover/dark/forced-colors stories.
3. **Doc/story copy (P2/J):** remove "primary/secondary" variant language; fix the doc's divider-variant list to match `variant !== 'outline'` source behavior.
4. **Token hygiene (P2/G2):** replace the eyeballed `/20`/`/30` divider alphas with a named on-fill border token, or document the choice.
5. **Keys (P3):** use `child.key ?? i`.
6. **Family roadmap (P3/F6):** decide whether a single-select `SegmentedControl` should exist separately rather than letting consumers misuse ButtonGroup for toggles.

## Clean (rubric dims that pass)
- **V1 accent rail:** none. No `border-l-4`/colored stripe.
- **V3 gradient text / V4 framework palette:** none — all colors are semantic tokens (`accent-*`, `surface-border`, `neutral-*` exposed utilities), no indigo/violet/slate, no `bg-clip-text`.
- **V5 emoji / V6 blob-glass-glow / V7 rounded-everything / V8 pill spam:** none.
- **V9 fonts:** no hardcoded Inter/Geist; inherits Button's `font-sans` token.
- **E1–E8 verbal:** JSDoc/doc prose is direct, no em-dash tic as connector, no AI-vocabulary list words, no hedging/openers. (One story-comment vocabulary nit folded into J.)
- **G1 surface:** N/A — transparent layout wrapper, doesn't set a card surface; no surface-1 misuse.
- **G3 variant-axis taxonomy:** canonical — `variant` (solid/soft/outline/ghost/link), `color`, `size`, `shape` all delegate to ButtonProps; no `primary`/`filled`/`small` in the API.
- **G5 soft-vs-outline default:** group has no default variant (falls through to Button's own `solid`/`accent`); does not force `outline`. Fine.
- **I types:** `forwardRef<HTMLDivElement>` + `displayName` present; props extend `Omit<HTMLAttributes,'color'>` correctly resolving the CVA color conflict; no `any`, no stringly enums, no `React.FC`. Context value memoized.
- **H a11y (non-RTL):** `role="group"` set; `disabled` propagates via context; dividers `aria-hidden`; focus isolation via z-index so the ring isn't clipped. Conformance test + role/orientation/context tests present.
- **F1/F4/F5 composability:** composes Button via context, no bespoke corner-props, no re-rolled surface.
