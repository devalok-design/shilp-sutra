# composed/filter-bar — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:5 P2:4 P3:2

FilterBar is functionally solid — real `role="toolbar"`, controlled/uncontrolled search, semantic tokens throughout, no gradient/blob/emoji tells. But it falls short of the Card bar in three structural ways: (1) `FilterSelect`/`FilterMultiSelect` take **bespoke data-shaped props** (`label`/`value`/`options`) instead of composing the real `Select`/`MultiSelectPopover` via slots, so consumers can't reach the underlying primitives; (2) `FilterMultiSelect` **hand-rolls a trigger button** that literally re-copies `SelectTrigger`'s CVA size classes rather than composing the real trigger (drift risk StatCard's pattern exists to prevent); (3) motion is unguarded (`springs.bouncy` count badge, no reduced-motion) and the size axis (`xs/sm/md`) diverges from the canonical `xs/sm/md/lg/xl`.

## Findings

### [P1][F1] FilterSelect / FilterMultiSelect are bespoke-prop wrappers, not slot compositions
- **Category:** composability
- **Evidence:** filter-bar.tsx:96-104 — `FilterSelectProps { label; value; onValueChange; options: {value;label}[]; allLabel }`; filter-bar.tsx:141-147 — `FilterMultiSelectProps { label; value; onValueChange; options }`
- **Why:** Both flatten a whole primitive into a fixed data shape. A consumer who wants a grouped Select, an item with an icon, a custom `SelectItem`, or MultiSelectPopover's `groups`/`renderItem`/`onSearch`/`maxSelections` cannot — the wrapper hides every escape hatch of the thing it wraps. This is the exact "bespoke props where a slot belongs" the Card bar rejects.
- **Fix:** Either expose `children` + re-export the primitive parts scoped to the bar (e.g. let consumers drop a real `<Select>`/`<MultiSelectPopover>` as a child, styled via context), or add a `renderTrigger`/`slots` escape and forward `options` as `SelectItem` children. At minimum, spread `...selectProps`/`...popoverProps` through so the underlying API isn't amputated.

### [P1][F5] FilterMultiSelect re-rolls the Select trigger instead of composing it
- **Category:** composability / drift
- **Evidence:** filter-bar.tsx:165-169 — `triggerSizeClasses = { xs:'h-ds-xs-plus text-ds-sm px-ds-02', sm:'h-ds-sm text-ds-sm px-ds-03', md:'h-ds-md text-ds-md px-ds-04' }` — byte-for-byte the same strings as `SelectTrigger`'s CVA (select.tsx:59-62); filter-bar.tsx:178-206 hand-builds a `<button>` with `rounded-control border bg-surface-raised-hover ... hover:bg-surface-raised-active`.
- **Why:** Copy-pasted trigger styling drifts the moment SelectTrigger's tokens change (this is precisely the divergence StatCard→Card composition was built to kill). The bespoke button also invents its own resting background (`bg-surface-raised-hover` at rest — a hover token used as a default state) that no other trigger uses, so the multi-select trigger looks subtly different from the sibling FilterSelect trigger.
- **Fix:** Compose the real trigger. Reuse `SelectTrigger`'s CVA (export a shared `triggerVariants`) or render a `Button`/`IconButton` as the MultiSelectPopover child so size + surface tokens live in one place. Don't maintain a parallel size map.

### [P1][G3] Size axis `xs | sm | md` diverges from the canonical size taxonomy
- **Category:** vocabulary
- **Evidence:** filter-bar.tsx:26 — `type FilterBarSize = 'xs' | 'sm' | 'md'`; FilterBar default `size = 'sm'` (filter-bar.tsx:56). Canonical axis is `xs/sm/md/lg/xl` (rubric G3); SearchInput itself supports `xs|sm|md|lg` (search-input.tsx:12) and SelectTrigger supports `xs|sm|md|lg` (select.tsx:59-63).
- **Why:** The bar caps at `md` while both children it drives (`SearchInput`, `SelectTrigger`) support `lg`. A consumer wanting an `lg` filter row can't get one, and the truncated axis is a vocabulary inconsistency inside its own family.
- **Fix:** Widen `FilterBarSize` to at least `xs|sm|md|lg` to match the controls it propagates to; keep `sm` default. Add the `lg` branch to `triggerSizeClasses` (or, better, delete that map per F5).

### [P1][M3] Unguarded `springs.bouncy` on the multi-select count badge — no reduced-motion
- **Category:** motion / a11y
- **Evidence:** filter-bar.tsx:192-198 — `<motion.span key={count} initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={springs.bouncy}>`; `springs.bouncy` is `damping: 15` = visible overshoot (motion.ts:27, "celebration feedback"). No `useReducedMotion()` in this file (Badge/Button guard their own, but this inline motion element does not).
- **Why:** Every count change bounces with celebration-tier overshoot on a mundane filter counter (M1 bounce-by-default), and it animates unconditionally under `prefers-reduced-motion` (M3). The two motion primitives it reaches for (`springs.bouncy` at :196, `springs.snappy` via imports) are the celebratory ones, not the productive-UI ones.
- **Fix:** Downgrade the count animation to `springs.snappy`/a short opacity+scale fade, and gate it: `const prefersReduced = useReducedMotion(); transition={prefersReduced ? { duration: 0 } : springs.snappy}`. Reserve `bouncy` for genuine celebration.

### [P1][H] FilterMultiSelect trigger button has no visible focus-visible ring
- **Category:** a11y / state-coverage
- **Evidence:** filter-bar.tsx:180-187 — the `<button>` className has only `hover:bg-surface-raised-active` for state; no `focus-visible:ring-*` / `focus-visible:outline` anywhere (contrast: SelectTrigger error variant includes `focus-visible:ring-error-9`, select.tsx:55).
- **Why:** Keyboard users get no focus affordance on the multi-select trigger — a hard state-coverage gap. The sibling `FilterSelect` inherits SelectTrigger's ring; this hand-rolled one doesn't, so the two triggers behave differently under keyboard.
- **Fix:** Add the DS focus-ring utility (`focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-*` or the shared `focus-ring` utility) to the trigger — or eliminate it via F5 by composing the real trigger which already has it.

### [P2][H] Active-filter accent border is the only "filtered" affordance — no count/aria signal on FilterSelect
- **Category:** state-coverage / a11y
- **Evidence:** filter-bar.tsx:121 — `isFiltered && 'border-accent-7'`; filter-bar.tsx:184 — `count > 0 ? 'border-accent-7'`. Doc claims this as the feature (filter-bar.md:58). No `aria-*` conveys "this filter is active" to AT; it's a color-only signal.
- **Why:** Active state communicated purely by a 1px accent border is easy to miss and invisible to screen readers / forced-colors users. Rubric H flags color-only state + forced-colors loss.
- **Fix:** Pair the border with a non-color cue (the multi-select already has a count Badge — good; FilterSelect has nothing). Consider `aria-label` augmentation ("Status, filtered") or a subtle dot/weight change so it survives forced-colors.

### [P2][F6] Search is controlled-only — no uncontrolled `defaultSearchValue`
- **Category:** composability
- **Evidence:** filter-bar.tsx:41-43 — `searchValue?: string` + `onSearchChange?` only; the input renders only when `onSearchChange` is provided (filter-bar.tsx:70), and passing `searchValue` without a handler silently hides the input.
- **Why:** No uncontrolled mode (F6). More surprising: providing `searchValue` alone (a plausible "just show me a search box" call) renders nothing, with no type error — a quiet footgun.
- **Fix:** Support an uncontrolled `defaultSearchValue`, or decouple "show the search input" from "is it controlled" (e.g. a `search?: boolean` / always-render + optional handler). Document the coupling if kept.

### [P2][F3] FilterBar mixes controlled-search props with a slot model on one flat component
- **Category:** composability
- **Evidence:** filter-bar.tsx:39-49 — FilterBar owns `searchValue/onSearchChange/searchPlaceholder/onClearAll/size` AND takes `children` for filters. Search + Clear-all are baked in as fixed corners; only the middle is slotted.
- **Why:** Half-compound: the search field (left) and Clear-all button (right) are hard-coded regions the consumer can't reorder, replace, or restyle, while the middle is open. It's the "fixed-order regions as props" smell (F4-adjacent) — a real slot model would let search/clear be children too.
- **Fix:** Consider `<FilterBar.Search>` / `<FilterBar.ClearAll>` slot parts (context-sized) so all three regions compose uniformly; keep the prop shorthand as sugar over them.

### [P2][G2] MultiSelect trigger uses a hover-state token as its resting background
- **Category:** drift
- **Evidence:** filter-bar.tsx:181 — resting className includes `bg-surface-raised-hover`, then :182 `hover:bg-surface-raised-active`. Per CLAUDE.md surface layering, `surface-raised-hover`/`-active` are hover/active states, not defaults.
- **Why:** Using the hover token at rest means the control looks pre-hovered and its real hover (`-active`) reads as the pressed state — a surface-vocabulary misuse specific to this hand-rolled button.
- **Fix:** Rest on `bg-surface-raised` (or the input control surface used by SelectTrigger), hover to `-hover`, active to `-active`. Resolved for free if F5 composition lands.

### [P3][I] `triggerSizeClasses` typed as `Record<string, string>` loses size-key safety
- **Category:** types
- **Evidence:** filter-bar.tsx:165 — `const triggerSizeClasses: Record<string, string> = {...}` keyed by the three sizes but typed as open `string`.
- **Why:** No compile-time guarantee the map covers every `FilterBarSize`; when the axis widens (see G3) a missing key won't be caught. Minor, but it's the kind of gap that let the `md`-cap slip.
- **Fix:** `Record<FilterBarSize, string>` (moot if F5 removes the map).

### [P3][J] Doc omits FilterBar's `className` passthrough and the "searchValue-without-handler hides input" gotcha
- **Category:** docs
- **Evidence:** filter-bar.md:12-18 lists FilterBar props but not `className`/rest-spread; the F6 coupling (input hidden unless `onSearchChange` present) is undocumented as a gotcha.
- **Why:** Minor parity gap; the silent-hide behavior is the sort of thing that generates a support question.
- **Fix:** Add `className` + note the search-handler coupling to the Gotchas list.

## Composability gaps
- **F1 (biggest):** `FilterSelect`/`FilterMultiSelect` are data-shape wrappers (`label`/`value`/`options`) that amputate the wrapped primitive — no access to grouped items, custom `SelectItem`s, icons, or MultiSelectPopover's `groups`/`renderItem`/`onSearch`/`maxSelections`/`emptyMessage`.
- **F5:** `FilterMultiSelect` re-rolls the Select trigger (copied size classes at :165-169, hand-built `<button>` at :178) instead of composing `SelectTrigger`/`Button` — parallel styling that will drift.
- **F3/F4:** FilterBar hard-codes search + Clear-all as fixed regions while slotting only the middle — a partial compound. No slot parts for the two ends.
- **F6:** search is controlled-only (no `defaultSearchValue`); `searchValue` without `onSearchChange` silently renders nothing.
- No `asChild` on the FilterBar container (P3-tier; toolbar is unlikely to polymorph, so not flagged as a finding).

## Motion gaps
- **M1/M3:** count Badge uses `springs.bouncy` (celebration overshoot, damping 15) unconditionally on every count change with no `useReducedMotion` guard (filter-bar.tsx:192-198).
- **M4:** the hand-rolled multi-select trigger has a color transition but no focus-visible feedback (see H); FilterSelect trigger (real Select) is fine.
- No entrance/exit motion on the bar itself — acceptable for a persistent toolbar, not flagged.

## Polish plan (ordered steps to reach the finish bar)
1. **Compose the trigger (F5/G2/H):** replace the hand-built button + `triggerSizeClasses` with a real `SelectTrigger`-style trigger or a `Button`/`IconButton` as MultiSelectPopover's child, inheriting size, resting surface, and focus-ring from the primitive. Deletes findings F5, G2, H, and the P3 types nit.
2. **Open the escape hatches (F1):** forward the underlying primitive props (`groups`, `renderItem`, `onSearch`, `maxSelections`, custom `SelectItem` children) or accept a `children`/`slots` API so consumers aren't boxed into `options: {value,label}[]`.
3. **Fix motion (M1/M3):** downgrade the count animation to `springs.snappy` + `useReducedMotion()` guard.
4. **Align the size axis (G3):** widen `FilterBarSize` to `xs|sm|md|lg` to match SearchInput/SelectTrigger.
5. **Uncontrolled + decouple search (F6):** add `defaultSearchValue` or a `search` boolean so `searchValue` alone doesn't silently hide the input.
6. **Slot the ends (F3/F4):** optional — add `<FilterBar.Search>`/`<FilterBar.ClearAll>` context-sized parts, keeping current props as sugar.
7. **State affordance (H):** give active FilterSelect a non-color cue and/or `aria` so "filtered" survives forced-colors and AT.
8. **Docs (J):** document `className` passthrough + the search-handler coupling gotcha.

## Clean (rubric dims that pass)
- **V1–V8 (visual tells):** no accent rail, no double edge, no gradient text, no raw indigo/violet/slate as brand (all `accent-*`/`surface-*` semantic tokens), no emoji icons (real Tabler icons via Icon API), no blob/glass/glow, no rounded-everything (`rounded-control`/`rounded-pill` only), no pill spam (single count Badge, meaningful).
- **V9–V15:** no hardcoded Inter/Geist, no decorative numbering, no eyebrow kicker, no all-caps default (the only `uppercase` is in MultiSelectPopover group headers, not this unit), no AI imagery.
- **E1–E8 (verbal):** doc + JSDoc are direct and clean — no em-dash tic beyond legitimate use, no AI vocabulary, no meta-hedging, no chatbot artifacts, no placeholders. Story data uses real-sounding names, not "Lorem"/emoji.
- **G1 (surface):** correct layering — `bg-surface-raised` controls, `bg-surface-overlay` popover; no surface-1 card violation.
- **H (a11y baseline):** real `role="toolbar"` + `aria-label="Filters"`; SearchInput and Clear-all Button are real interactive elements with keyboard support; MultiSelectPopover has full listbox roles + arrow-key nav + `aria-activedescendant`.
- **I (types, mostly):** `forwardRef` + `displayName` present; no `any`; `onValueChange` (correct non-input handler name) used throughout; props exported.
- **F6 (partial):** search IS controlled correctly via `searchValue`/`onSearchChange` (the gap is only the missing uncontrolled mode).
- **J (mostly):** doc exists, prop tables match CVA/source, story + test present with real assertions and `describeConformance`.
