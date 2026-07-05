# ui/badge-group — audit
**Finish score:** 2/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:1 P1:4 P2:3 P3:1

BadgeGroup is a thin flex-wrap wrapper around `Badge` children with an optional `+N` overflow pill. It has no AI *visual* tells (no accent rail, no gradient, no glass, no emoji) — but it falls well short of the Card bar on composability and vocabulary: raw Tailwind spacing instead of DS tokens, a `size` prop that silently does nothing for the children it claims to size, a non-keyboard-accessible clickable overflow pill, an `onOverflowClick` bespoke handler with no slot escape hatch, and an overflow badge hardcoded to `variant="outline"` against the repo's soft-default preference.

## Findings

### [P0][H] Clickable overflow pill is not keyboard-accessible
- **Category:** a11y
- **Evidence:** badge-group.tsx:40-49 — `<Badge variant="outline" color="neutral" size={size ?? 'sm'} onClick={onOverflowClick}>+{overflowCount}</Badge>`
- **Why:** Passing `onClick` to `Badge` does make it a `<button>` (keyboard-OK) — BUT only when `onOverflowClick` is provided. When `onOverflowClick` is undefined the `+N` renders as a non-interactive `<span>`, which is correct. The real defect: when `onOverflowClick` IS set, the `+N` button has no accessible name beyond its visible text "+3" and no `aria-label` describing what it reveals (e.g. "Show 4 more"). A screen-reader user hears "plus 3, button" with no indication it expands hidden tags. There is also no `title`/tooltip listing the hidden items. For a control that hides content this is a broken affordance.
- **Fix:** When `onOverflowClick` is set, give the overflow Badge an explicit `aria-label` (e.g. ``aria-label={`Show ${overflowCount} more`}``); consider a `title` listing the hidden child labels. If `onOverflowClick` is NOT set but content is hidden, the hidden tags are silently dropped from the a11y tree — at minimum render a `title` so the count is explained.

### [P1][F1/F6] `onOverflowClick` is a bespoke handler with no slot / render-prop escape hatch
- **Category:** composability
- **Evidence:** badge-group.tsx:18 `onOverflowClick?: () => void`; badge-group.tsx:40-49 the overflow pill is hardcoded (`variant`, `color`, `size`, text all fixed)
- **Why:** The single most common real use (a Popover/Tooltip listing the remaining tags) is impossible — the consumer can only attach a click handler, they cannot control what the `+N` element *is*. No `renderOverflow`/`overflow` slot, no way to wrap it in a trigger. This is exactly the bespoke-prop-where-a-slot-belongs pattern Card fixed with `<CardAction>`.
- **Fix:** Add an `overflow?: (count: number, hidden: React.ReactNode[]) => React.ReactNode` render prop (or `renderOverflow`) so a consumer can return their own trigger/popover. Keep the current pill as the default render.

### [P1][I] `size` prop silently does nothing for the visible children — false API contract
- **Category:** types
- **Evidence:** badge-group.tsx:16 `size?: BadgeProps['size']`; only consumed at badge-group.tsx:44 `size={size ?? 'sm'}` on the overflow pill. Visible children (`visible` at line 34) are rendered untouched at line 39.
- **Why:** The prop name and type (`BadgeProps['size']`) strongly imply "size the badges in this group," and the `SharedSize` story (badge-group.stories.tsx:77-87, titled "SharedSize") reinforces that — but the children keep whatever size they were authored with; only the `+N` pill is sized. A consumer setting `size="xs"` on a group of default-`md` badges gets a mismatched-height `+N`. The prop is misleadingly named for what it does.
- **Fix:** Either (a) actually clone visible children to inject `size` (`React.cloneElement`), making the name honest; or (b) rename to `overflowSize` and document that children own their own size. (a) matches the story's stated intent.

### [P1][G2] Raw Tailwind numeric spacing instead of DS spacing tokens
- **Category:** drift
- **Evidence:** badge-group.tsx:8-12 — ``GAP_CLASSES = { tight: 'gap-1', default: 'gap-1.5', loose: 'gap-2' }``
- **Why:** `gap-1`/`gap-1.5`/`gap-2` are consumer-numeric Tailwind spacing (4/6/8px). CLAUDE.md's namespace rule is explicit: spacing is `--spacing-ds-*` to avoid collision with consumer numeric spacing. The exact DS equivalents already exist — 4px=`gap-ds-02`, 6px=`gap-ds-02b`, 8px=`gap-ds-03` (semantic.css:298-300). Every sibling (`Badge`, `Card`, `StatCard`) uses `gap-ds-*`; this file is the outlier.
- **Fix:** ``{ tight: 'gap-ds-02', default: 'gap-ds-02b', loose: 'gap-ds-03' }``.

### [P1][G5] Overflow pill hardcoded to `variant="outline"`
- **Category:** vocabulary
- **Evidence:** badge-group.tsx:42 `variant="outline"`
- **Why:** CLAUDE.md design preference: default to `variant="soft"` over `outline` for non-primary elements unless on a colored/raised bg or icon-dense toolbar. The `+N` chip sits inline among (typically) soft children — the Default/WithOverflow/ClickableOverflow stories all use `variant="soft"` children, so an `outline` `+N` reads as a different visual family next to them. Outline isn't justified here.
- **Fix:** Default the overflow pill to `variant="soft" color="neutral"`; expose it through the overflow slot (see F1) so consumers can override.

### [P2][H/F6] No empty / single-child / zero-overflow state handling shown or tested
- **Category:** state-coverage
- **Evidence:** badge-group.tsx:31-34 — `childArray.length` with no guard; tests (badge.test.tsx:116-144) cover only "all visible" and "overflow"; stories cover no empty case.
- **Why:** `max` greater than child count, `max={0}`, and zero children are all untested and undemoed. `max={0}` would render `+N` with N = total and zero visible — likely unintended but undocumented. The Card bar requires empty/edge states handled and shown.
- **Fix:** Add a guard/decision for `max <= 0`; add an empty-children and a `max >= total` story + test asserting no `+N` renders.

### [P2][J] No dedicated test file and no per-component doc
- **Category:** docs
- **Evidence:** no `badge-group.test.tsx` (coverage lives in badge.test.tsx:116-144, only 2 cases); `Glob packages/core/docs/components/**/badge-group*` → none.
- **Why:** Below the publish-gate bar: `gap`/`size`/`onOverflowClick` behaviors are untested; there's no prop-table doc. The 2 inherited tests don't exercise `gap`, `size`, `onOverflowClick`, or accessibility.
- **Fix:** Add `badge-group.test.tsx` covering gap classes, overflow click firing, size propagation (post-fix), and axe. Add a per-component doc or fold into the Badge doc with an accurate prop table.

### [P2][F2] No `asChild` / polymorphism and no `forwardRef`
- **Category:** composability
- **Evidence:** badge-group.tsx:23 `export function BadgeGroup(...)` — plain function component, no `React.forwardRef`; renders a fixed `<div>` (line 38) with no ref forwarding and no `...props` spread for native attributes.
- **Why:** Consumers can't attach a `ref`, can't pass through `data-*`/`aria-*`/`role` (e.g. `role="list"` with `role="listitem"` children would be the semantically correct markup for a tag list), and can't render as a different element. `displayName` is set (line 54) but there's no ref to name. Sibling `Badge`/`Card` both `forwardRef` + spread `...props`.
- **Fix:** Convert to `React.forwardRef<HTMLDivElement, ...>`, spread `...props` onto the wrapper, and consider list semantics (`role="list"`).

### [P3][M4] No motion on overflow appearance/removal
- **Category:** motion
- **Evidence:** badge-group.tsx:38-50 — plain `<div>` + conditional `+N`; no `AnimatePresence`/transition.
- **Why:** Card/StatCard/Badge all have intentional entrance/feedback motion (Badge dot pulse, StatCard delta spring). When children cross the `max` threshold the `+N` pops in/out with no transition — a small finish gap, not a tell. The visible-child *flex-wrap reflow* would also benefit from a `layout` transition, but that's optional.
- **Fix:** Wrap the `+N` in `AnimatePresence` with a scale/opacity transition consistent with Badge's dot (`springs.snappy`), reduced-motion respected.

## Composability gaps
- **No overflow slot/render-prop (F1):** `onOverflowClick` is the only hook; the `+N` element's variant/color/size/content are all fixed. The realistic "popover of remaining tags" use case is unbuildable.
- **`size` doesn't reach children (I/F6):** prop implies group sizing but only sizes the `+N` pill; either clone children or rename.
- **No `forwardRef`, no `...props` spread, no `asChild` (F2):** can't ref it, can't pass native/aria attributes, can't get list semantics.
- **Does not expose the hidden children to the consumer:** when overflowing, the sliced-off children just vanish; no callback argument or slot receives them, so a consumer can't show them anywhere.

## Motion gaps
- **M4:** No entrance/exit transition on the `+N` overflow pill as it crosses the threshold (siblings all animate).
- No `layout` transition on the flex-wrap children when the set changes (optional polish).
- No motion to flag for reduced-motion since there is currently no motion at all — but any added motion must be reduced-motion-guarded per the system (Badge uses `useReducedMotion`).

## Polish plan (ordered steps to reach the finish bar)
1. **G2 fix (cheap, isolated):** swap `gap-1/1.5/2` → `gap-ds-02/02b/03`.
2. **F2:** convert to `forwardRef<HTMLDivElement>`, spread `...props`, optionally add `role="list"`.
3. **I + F1:** decide the `size` contract — clone visible children to inject `size` so the name is honest — and add an `overflow?: (count, hidden) => ReactNode` render prop; default render is a `variant="soft" color="neutral"` pill (G5).
4. **P0 a11y:** give the default overflow pill an `aria-label`/`title` describing the hidden count/items; ensure it stays a real `<button>` when interactive.
5. **State coverage:** guard `max <= 0`; add empty / `max >= total` / single-child handling.
6. **M4:** wrap `+N` in `AnimatePresence` with `springs.snappy`, reduced-motion-guarded.
7. **Tests + docs (J):** add `badge-group.test.tsx` (gap classes, overflow click, size propagation, axe) and an accurate prop table doc.

## Clean (rubric dims that pass)
- **V1–V8 visual tells:** none. No accent rail, no double edge, no gradient text, no raw indigo/violet brand palette, no emoji icons, no blob/glass/glow, no rounded-everything, no pill spam (the `+N` is a single meaningful pill).
- **V9–V15 reflexes:** none — no hardcoded fonts, no decorative numbering, no eyebrow kicker, no all-caps default, no AI imagery.
- **S1–S4 structural / E1–E8 verbal:** n/a — trivial source, no prose; the one story label `gap="{gap}"` is functional, not marketing copy. No em-dash tic, no AI vocabulary.
- **G1 surface:** correct — it's a layout wrapper, no surface of its own (no `bg-surface-1` misuse).
- **G3 variant-axis:** the `gap` axis (`tight/default/loose`) is a layout knob, not a CVA variant axis, so it doesn't have to match the solid/soft/outline taxonomy; it's reasonably named.
- **M1/M2/M3/M5:** no bounce-by-default, no robotic timing, no layout-prop animation (no animation at all — gap is M4 above).
- **I (partial):** no `any`, no `React.FC`, no stringly-typed color; `size` is typed off `BadgeProps['size']` (good single source) — the issue is behavior, not the type.
