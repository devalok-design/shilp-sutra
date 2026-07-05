# ui/autocomplete — audit
**Finish score:** 2/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:5 P2:4 P3:1

Autocomplete has clean ARIA combobox semantics, real keyboard nav, portal + Floating UI positioning, no gradient/accent-rail/emoji visual tells, and uses semantic tokens throughout. It is NOT AI slop. But it falls well short of the Card bar on **composability** (re-rolls the input instead of composing `Input`), **drift** (its input styling has diverged from the `Input` primitive), **docs parity** (the doc actively contradicts the source on FormField), and **vocabulary** (no `size`/`state` axes its sibling inputs all have).

## Findings

### [P1][F5] Re-rolls the input instead of composing the base `Input` primitive
- **Category:** composability / drift
- **Evidence:** autocomplete.tsx:208-227 — `<input ... className={cn('flex h-ds-md w-full rounded-control border border-surface-border-strong bg-surface-raised-hover px-ds-04 py-ds-03 font-sans text-ds-md ...')}`
- **Why:** This is the exact drift StatCard fixed by composing `<Card>`. The DS already has an `Input` primitive (input.tsx) that owns the surface/border/ring/size/state vocabulary; Autocomplete hand-rolls a parallel copy that will silently diverge.
- **Fix:** Render the field through `<Input role="combobox" .../>` (or expose the input via an `asChild`-style slot). Let `Input` own the box; Autocomplete owns the behavior + dropdown.

### [P1][G2] Re-rolled input tokens have already drifted from `Input`
- **Category:** drift
- **Evidence:** autocomplete.tsx:224 `focus-visible:ring-offset-[var(--border-focus-offset)]` vs input.tsx:19 `focus-within:ring-offset-2`; autocomplete has no `hover:bg-surface-raised-active` (input.tsx:18), no `has-[:read-only]` handling (input.tsx:21), and hardcodes `h-ds-md` instead of using the `size` CVA (input.tsx:25-30).
- **Why:** Two sources of truth for "what a DS text input looks like" already disagree on ring offset, hover, and read-only. This is the literal drift the audit exists to kill.
- **Fix:** Same as F5 — compose `Input`. The drift disappears for free.

### [P1][J] Doc contradicts the source on FormField consumption
- **Category:** docs
- **Evidence:** autocomplete.md:33 "**FormField:** Does NOT auto-consume FormField state. Set explicit error styling via className if needed." — but autocomplete.tsx:198-201 `const fieldCtx = useFormField(); const isError = fieldCtx.state === 'error'` and lines 216-218 wire `aria-invalid`, `aria-describedby`, `aria-required` straight from it.
- **Why:** The component DOES consume FormField; the doc tells consumers the opposite. A consumer reading the doc will hand-wire ARIA that the component already provides (double `aria-describedby`).
- **Fix:** Rewrite the doc line to state it consumes FormField for `aria-invalid`/`describedby`/`required`, and note the gap below (it does NOT paint the error border — see F-state finding).

### [P1][H] Reads FormField error state but never reflects it visually
- **Category:** state-coverage
- **Evidence:** autocomplete.tsx:199 `const isError = fieldCtx.state === 'error'` → only used for `aria-invalid` (line 216). The `className` (lines 222-227) has no `state === 'error' && 'border-error-7 ...'` branch, unlike input.tsx:164.
- **Why:** Screen-reader users are told the field is invalid; sighted users see an unchanged grey border. Incomplete error state — and inconsistent with `Input`, which colors the border red.
- **Fix:** When composing `Input`, pass `state={isError ? 'error' : undefined}` so the border + ring tokens come along. (Composing fixes this too.)

### [P1][E1/E5] Verbal tells in JSDoc + doc
- **Category:** verbal-tell
- **Evidence:** autocomplete.tsx:56 `// These are just a few ways — feel free to combine props creatively!` (em-dash connector E1 + engagement-bait closer E5); em-dash-as-connector also at tsx:33-34 ("known ahead of time (client-side filtering only).** ... while `<Combobox>`"), tsx:41 "object (or null), not just the string value" (E2-adjacent contrastive), and the doc/JSDoc lean on `—` as a stylistic connector throughout.
- **Why:** "feel free to combine props creatively!" is boilerplate AI filler (it's copy-pasted across Card/StatCard JSDoc too) and the em-dash tic is the #1 prose giveaway.
- **Fix:** Delete the "feel free to combine" closer. Replace connector em-dashes with periods/parens.

### [P2][G3] No `size`/`state`/`variant` axes — vocabulary gap vs the input family
- **Category:** vocabulary
- **Evidence:** autocomplete.tsx:58-67 props are `options/value/onValueChange/placeholder/emptyText/disabled/className/id` — no `size`, no `state`. Compare Input (`size: xs|sm|md|lg`, `state: error|warning|success`) and Combobox/Select which carry these.
- **Why:** Autocomplete can't be sized to match a `size="sm"` form row, and can't be put in an explicit error state. Inconsistent control vocabulary across the selector family.
- **Fix:** Add `size` (xs/sm/md/lg) and `state` axes, ideally inherited by composing `Input`.

### [P1][F6] Controlled-only selection; no uncontrolled / `defaultValue`
- **Category:** composability
- **Evidence:** autocomplete.tsx:58-61 — supports `value?: AutocompleteOption | null` + `onValueChange` but no `defaultValue`. The `query` text state is internal, but a consumer who wants an initial selection without owning state has no path.
- **Why:** F6 controlled/uncontrolled gap — the rest of the DS form controls support both modes.
- **Fix:** Add `defaultValue?: AutocompleteOption | null`; initialize internal selected state from it when `value` is undefined.

### [P2][structural] Dead no-op cleanup effect
- **Category:** structural-tell
- **Evidence:** autocomplete.tsx:144-148 — `React.useEffect(() => { return () => { /* Option selected — close and blur handled by relatedTarget check */ } }, [])` — the cleanup body is an empty comment.
- **Why:** Leftover scaffolding that does nothing; reads like an AI stub that was never removed. The comment even describes logic that lives elsewhere.
- **Fix:** Delete the effect entirely.

### [P2][H] No `aria-disabled` mirror / disabled path leaves dropdown openable via keyboard intent
- **Category:** a11y / state-coverage
- **Evidence:** autocomplete.tsx:221 `disabled={disabled}` (native, good) but `handleKeyDown` (tsx:168-196) and `onFocus`/`onChange` don't guard on `disabled`. Native `disabled` blocks focus/typing so this is mostly inert, but there's no `aria-disabled` and no story/test proving keyboard can't open it while disabled.
- **Why:** Relies entirely on the native attribute; no defense-in-depth and no test coverage of disabled keyboard behavior.
- **Fix:** Early-return from `handleKeyDown`/`onFocus`/`onChange` when `disabled`; (composing Input also standardizes this).

### [P3][docs] `id` / `className` documented as required-ish without optionality markers
- **Category:** docs
- **Evidence:** autocomplete.md:7-15 — `placeholder: string`, `emptyText: string`, `disabled: boolean`, `className: string`, `id: string` listed without `?` while the type (tsx:62-67) marks them all optional.
- **Why:** Minor prop-table inaccuracy vs source.
- **Fix:** Mark optional props with `?` to match the type.

## Composability gaps
- **Does not compose `Input`** (F5) — re-rolls the entire text-field surface, the single biggest finish gap here. StatCard→Card is the model to follow.
- **No `asChild` / input slot** (F2) — consumers can't swap in a custom input (e.g. one with a leading search icon via `Input`'s `startSection`). The whole `Input` section API (start/end sections, sizes, states) is unreachable.
- **No uncontrolled mode** (F6) — `value` controlled-only, no `defaultValue`.
- **No `size`/`state` axes** (G3) — can't match sibling form controls.
- **No way to render a custom option** — `filtered.map` renders bare `option.label` (tsx:295); no render-prop / `renderOption` slot for icons, secondary text, grouping. Combobox-class components usually expose this.

## Motion gaps
- **Reduced-motion: covered at system level, not locally.** The component has no `useReducedMotion` guard, but all motion runs through framer-motion `motion.*` under the global `MotionConfig reducedMotion="user"` (motion/motion-provider.tsx:39), which zeroes transitions. Acceptable as a system choice — NOT flagged P1 — but note it silently degrades if a consumer renders Autocomplete outside `MotionProvider`.
- **No press/active feedback on options** (M4-adjacent) — options have hover (`bg-accent-3` via highlight) and a color transition (tsx:281) but no pressed state. Minor.
- **Stagger on the listbox is fine** — items keyed by `option.value` (tsx:275) persist across filters, so `staggerChildren` (tsx:14) runs once on open, not on every keystroke. No M2 robotic-timing issue. Easing tokens (`springs.snappy`, `tweens.fade`) are the DS tokens — clean, no M1 bounce-by-default.

## Polish plan (ordered steps to reach the finish bar)
1. **Compose `Input`** for the text field (kills F5, G2, the H error-border gap, and the disabled-guard gap in one move). Pass `role="combobox"`, the aria-* props, `state={isError ? 'error' : undefined}`, and forward `size`.
2. **Add `size` and `state` axes** (G3) — inherited from the composed `Input`.
3. **Add `defaultValue` / uncontrolled selection** (F6).
4. **Fix the doc** (J): correct the "Does NOT auto-consume FormField" line, mark optional props with `?`, and document that it now colors the error border.
5. **Strip verbal tells** (E1/E5): delete the "feel free to combine props creatively!" closer; de-em-dash the JSDoc.
6. **Delete the dead cleanup effect** (tsx:144-148).
7. (Optional, P3) add a `renderOption` slot for custom option content.

## Clean (rubric dims that pass)
- **V1–V8 visual tells:** none. No accent rail, no gradient text, no double-edge (overlay uses `shadow-raised-hover` only, no border), no indigo/violet raw palette, no emoji, no blob/glass, no rounded-everything (uses `rounded-control`/`rounded-overlay`), no pill spam.
- **V9 font:** `font-sans` token, not hardcoded Inter.
- **G1 surface:** dropdown uses `bg-surface-overlay` (tsx:260) — correct per the MANDATORY layering rule (overlays are surface-1 family). Input uses `bg-surface-raised-hover`. No surface drift.
- **G2 (partial):** spacing/radius/color all tokenized (`px-ds-04`, `rounded-control`, `bg-accent-3`, `z-popover`) — no raw px/hex, no dead TW3 idioms.
- **a11y core:** real `role="combobox"` + `aria-expanded`/`aria-autocomplete`/`aria-controls`/`aria-activedescendant`/`role="listbox"`/`role="option"`/`aria-selected`; `focus-visible:ring` (not `focus:`); axe-clean test (test:160). Keyboard nav (Arrow/Enter/Esc) implemented and tested.
- **I types:** no `any` in the public surface, `forwardRef` + `displayName`, exported `AutocompleteProps`/`AutocompleteOption`, `onValueChange` (correct non-input handler name, not `onChange`).
- **M1/M2:** motion uses DS easing tokens, no bounce-by-default, no uniform-robotic timing.
- **J (partial):** story exists with `stable` tag and a play-test; covers default/preselected/disabled/empty/controlled.
