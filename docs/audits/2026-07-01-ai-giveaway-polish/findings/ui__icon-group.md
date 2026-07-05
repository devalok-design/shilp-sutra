# ui/icon-group — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:1 P2:4 P3:2

A tiny layout primitive — `IconProvider` + a flex row that propagates `size`/`stroke` to child `<Icon>`s and optionally exposes a `toolbar` role. Zero visual AI tells (no rail, gradient, emoji, blob, framework palette). It reuses the canonical `IconSize`/`IconStroke` types rather than re-rolling an axis. The gaps are all on the Card-bar finish dimensions: raw Tailwind spacing instead of `gap-ds-*` tokens, no prop pass-through (`...rest`), a silently-ignored `label`, no `asChild`, and an a11y/doc tension around `role="toolbar"` on non-interactive icons.

## Findings

### [P1][G2] Raw Tailwind gap utilities instead of `gap-ds-*` spacing tokens
- **Category:** drift
- **Evidence:** icon-group.tsx:8-12 — `tight: 'gap-0.5', default: 'gap-1', loose: 'gap-2'`
- **Why:** The whole library spaces on the namespaced `--spacing-ds-*` scale (168× `gap-ds-03`, 145× `gap-ds-02`, etc.); these raw `gap-0.5/1/2` are off-scale and bypass the token system CLAUDE.md mandates (`p-ds-03`, not `p-3`). They happen to land near `gap-ds-01`(2px)/`gap-ds-02`(4px)/`gap-ds-03`(8px) but aren't bound to those tokens, so they won't track a scale change.
- **Fix:** Map `tight → gap-ds-01`, `default → gap-ds-02`, `loose → gap-ds-03` (verify the px equivalents in `tokens/semantic.css` / spacing scale; the doc claims 2/4/8px which matches ds-01/02/03).

### [P2][H] `role="toolbar"` on a group of non-interactive decorative icons is an a11y smell
- **Category:** a11y
- **Evidence:** icon-group.tsx:40-44 — `role={ariaRole}` with children that are `<Icon>` (aria-hidden by default, non-focusable); story Toolbar (icon-group.stories.tsx:45-57) ships exactly this: `role="toolbar"` wrapping bare `<Icon>`s with no buttons.
- **Why:** `role="toolbar"` promises a set of controls with roving-tabindex keyboard nav (arrow keys, focusable items). IconGroup adds no focus management and its children are decorative SVGs — a screen-reader user lands on an empty toolbar. The doc itself says IconGroup is "Not interactive… If you want a formatting toolbar (interactive), use ButtonGroup or ToggleGroup" (icon-group.md:31-34), directly contradicting the `role="toolbar"` API and the Toolbar story.
- **Fix:** Either drop the `role`/`label` props entirely (point consumers to ButtonGroup/ToggleGroup for real toolbars, per the doc), OR keep `role="toolbar"` only as an escape hatch and document that consumers must supply focusable children + own roving focus. Don't ship a `role="toolbar"` story built from decorative icons.

### [P2][F6/I] `label` is silently dropped unless `role="toolbar"` — quiet footgun
- **Category:** types
- **Evidence:** icon-group.tsx:43 — `aria-label={ariaRole ? label : undefined}`; the test even codifies it: icon-group.test.tsx:71-79 "does not set aria-label without toolbar role".
- **Why:** A consumer passing `label="Status icons"` to name the group gets nothing on the DOM and no warning — a documented-but-surprising silent no-op. The prop's existence implies it does something. JSDoc ("required when role is 'toolbar'") under-states that it's *ignored* otherwise.
- **Fix:** Apply `aria-label` whenever `label` is provided (`aria-label={label || undefined}`), independent of role — a named group is useful even without toolbar semantics. If the gating is deliberate, the prop type should express it (e.g. discriminated union: `role`+`label` together) rather than accepting+discarding it.

### [P2][F2/composability] No prop pass-through (`...rest`) — `id`, `data-*`, `aria-*`, event handlers all blocked
- **Category:** composability
- **Evidence:** icon-group.tsx:29-37 — props are fully destructured with no `...rest`; the conformance test must skip the `attrs` case: icon-group.test.tsx:16-18 "arbitrary HTML attrs are not forwarded by design."
- **Why:** Every sibling in the family (`Card`, `CardFooter`, even `IconButton`) extends `React.HTMLAttributes` and spreads `...props`. IconGroup can't take a `data-testid`, `id`, `aria-describedby`, `onClick`, or `style`. For a div-rendering layout primitive that's an unusual restriction and a composability cliff — consumers fall back to wrapping it in another div.
- **Fix:** `extends React.HTMLAttributes<HTMLDivElement>` and spread `{...rest}` onto the div after the explicit className/role/aria-label. Removes the `skip: ['attrs']` from conformance.

### [P2][J] Doc/source contradiction: "Not interactive" vs. shipped `role="toolbar"` + Toolbar story
- **Category:** docs
- **Evidence:** icon-group.md:31-35 "IconGroup = static icon displays… Not interactive… use ButtonGroup or ToggleGroup, not IconGroup" — yet the component exposes `role="toolbar"` and the canonical story (icon-group.stories.tsx:45) is named `Toolbar` and renders one.
- **Why:** Docs and the public API disagree about whether toolbar is a supported use. Whichever is right, the other is stale (rubric J: source/intent must match docs).
- **Fix:** Pick one. If toolbar stays in the API, the doc must stop saying "not interactive / use ButtonGroup instead." If toolbar is discouraged, remove the prop and the Toolbar story.

### [P3][F2] No `asChild` / polymorphism — locked to `<div>`
- **Category:** composability
- **Evidence:** icon-group.tsx:40 — hardcoded `<div>`; no `asChild`/Slot.
- **Why:** A consumer may want the cluster to be a `<nav>`, `<ul>`, `<section>`, or to merge onto an existing element. Low value for a decorative row, but it's the Card-bar polymorphism dimension (F2) and the family pattern.
- **Fix:** Optional — add `asChild` via the vendored Slot, or at minimum allow `as`/forwarding so the element tag is consumer-controlled.

### [P3][G3] `gap` axis values `tight | default | loose` don't follow the canonical size taxonomy
- **Category:** vocabulary
- **Evidence:** icon-group.tsx:19 — `gap?: 'tight' | 'default' | 'loose'`
- **Why:** Minor. `gap` isn't one of the canonical CVA axes (variant/size/color/shape), so it's not strictly a G3 violation, but `tight/default/loose` is a one-off vocabulary not shared with siblings (most use the `size` scale or numeric spacing). Worth noting for family consistency, not worth churning the API alone.
- **Fix:** Leave as-is unless a family-wide spacing-prop convention is established; if so, align to it.

## Composability gaps
- No `...rest` spread → can't forward `id`, `data-*`, `aria-*`, `style`, or event handlers; diverges from `Card`/`IconButton` which extend `HTMLAttributes` (F2/structural).
- No `asChild`/polymorphism — element tag is locked to `<div>` (F2).
- `label` accepted but discarded unless `role="toolbar"` — prop semantics not expressible in the type (could be a discriminated union) (F6/I).
- Does compose the right base (`IconProvider`) and slots children correctly — no re-rolled surface/token drift beyond the gap utilities. F1/F5 clean.

## Motion gaps
- None applicable. IconGroup is an intentionally non-interactive, static layout primitive — M1–M5 (bounce/timing/reduced-motion/feedback/layout-animation) don't apply. The one caveat is the `role="toolbar"` API implying interactivity it doesn't back with focus/feedback (covered under H above), not a motion finding.

## Polish plan (ordered steps to reach the finish bar)
1. Swap raw `gap-0.5/1/2` for `gap-ds-01/02/03` (G2) and confirm px parity against the doc's 2/4/8.
2. Resolve the toolbar contradiction (H + J): decide whether IconGroup supports `role="toolbar"`; if yes, document the focus-management requirement and rebuild the Toolbar story with focusable children; if no, remove the `role`/`label` props and the story.
3. Apply `aria-label` whenever `label` is set (or model `role`+`label` as a discriminated union) so the prop is never a silent no-op (F6/I).
4. `extends React.HTMLAttributes<HTMLDivElement>` + spread `...rest`; remove `skip: ['attrs']` from the conformance test (F2).
5. (Optional, P3) Add `asChild`/Slot polymorphism for `<nav>`/`<ul>` semantics.

## Clean (rubric dims that pass)
- **A. Visual tells (V1–V8):** none — no accent rail, double edge, gradient text, framework palette, emoji icons, blob/glass/glow, rounded-everything, or pill spam.
- **B. Visual reflexes (V9–V15):** none — no hardcoded fonts, decorative numbering, eyebrow kickers, all-caps emphasis, or AI imagery; reuses `IconSize`/`IconStroke` from `icon-context`.
- **E. Verbal tells:** doc/JSDoc are direct and prescriptive — no em-dash tic, AI vocabulary, hedging, or filler.
- **F1/F5 composability:** correctly composes `IconProvider` and slots children; does not re-roll surface/padding/elevation.
- **I types:** `forwardRef<HTMLDivElement>` with `displayName`; props exported (`IconGroupProps`); no `any`, no `React.FC`, no stringly-typed enums (`role` is a literal, `gap` is a union).
- **H (the interactive parts that do apply):** the conditional `aria-label` is wired to role correctly per its own contract; default has no spurious role; tests cover gap classes, role presence/absence, and child rendering.
