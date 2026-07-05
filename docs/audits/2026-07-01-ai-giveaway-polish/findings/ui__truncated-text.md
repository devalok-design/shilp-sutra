# ui/truncated-text — audit
**Finish score:** 4/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:1 P2:2 P3:2

This is a small, genuinely well-built layout/utility primitive. The component source is essentially AI-tell-clean: no gradients, no accent rail, no AI palette, no emoji, no glass/blur. It uses semantic tokens via `cn`, forwards a ref with a `displayName`, is polymorphic via `as`, and ships real a11y (full string kept as the accessible name, tooltip recovery gated on actual overflow). The findings below are mostly drift in the **story** and a couple of API-surface polish gaps — not visual slop in the rendered default.

## Findings

### [P1][G2/G4] Story `Box` uses a non-existent border token (`border-border-subtle`)
- **Category:** drift
- **Evidence:** truncated-text.stories.tsx:22 — `className="rounded-surface border border-border-subtle bg-surface-2 p-ds-04"` (also :70, the flex-row demo container)
- **Why:** There is no `--color-border-subtle` token (semantic.css defines `--color-surface-border-subtle`). The class compiles to nothing, so the demo border silently never renders, and it advertises a wrong vocabulary to anyone copying the story. Every sibling (chat.stories.tsx) correctly uses `border-surface-border`.
- **Fix:** Replace both occurrences with `border-surface-border-subtle` (or `border-surface-border` to match the chat stories). Confirm visually in Storybook.

### [P2][F2] Closed `as` union instead of `asChild`/polymorphic `as` with prop inference
- **Category:** composability
- **Evidence:** truncated-text.tsx:21 — `as?: 'span' | 'p' | 'div'`; used at :110 `const Tag = as as React.ElementType`
- **Why:** Three hardcoded tags can't render the `<a>`, `<h*>`, `<label>`, `<dt>`, or list-item a real consumer will eventually need (e.g. a truncated link in a nav row, a clamped `<h3>` card title). It's a layout primitive whose whole job is to be dropped into other elements, so it's a prime `asChild` candidate — let the parent own the tag, TruncatedText owns the truncation behavior. At minimum the union is arbitrarily narrow.
- **Fix:** Either add `asChild` (Slot) so consumers pass their own element, or widen `as` to `React.ElementType` with a generic prop-inferred signature. `asChild` is the cleaner fit here since the component renders exactly one element and merges className/ref.

### [P2][H] No `forced-colors` / RTL / `min-w-0` flex-row coverage in tests or stories beyond a single demo
- **Category:** state-coverage
- **Evidence:** truncated-text.test.tsx — asserts end/clamp/middle, overflow aria-label, tooltip toggle; no forced-colors, no RTL, no axe pass. stories has one `InFlexRow` demo but no clamp-overflow + tooltip-open visual state.
- **Why:** The rubric state matrix wants forced-colors and RTL demonstrated. Truncation behavior is direction-sensitive (end-ellipsis in RTL should clip the logical start), and the tooltip-open state isn't shown. Middle-mode binary-search result on resize is untested at the visual layer (Chromatic is the only backstop, but there's no story that forces the overflow+tooltip state statically).
- **Fix:** Add a `[dir="rtl"]` story for `mode="end"`, and a story (or play function) that forces overflow so the tooltip-open + clipped state is visible. Optionally an axe assertion in the test (`vitest-axe`) for the overflowing variant.

### [P3][E1] Em-dash as stylistic connector throughout JSDoc + doc
- **Category:** verbal-tell
- **Evidence:** truncated-text.tsx:18 — `keeps both ends (filenames, emails) — \`name…end.pdf\``; truncated-text.tsx:60 (`measures + JS-shortens but keeps...`); docs/components/ui/truncated-text.md:37–40 (9 em-dashes)
- **Why:** Rubric E1 bans `—` as a stylistic connector. Present here, but it is consistent house style across the exemplars (Card/StatCard JSDoc use it identically), so this is convergence-with-the-codebase, not a per-component giveaway. Flagging for completeness, not as an action item unless the whole codebase is being de-dashed.
- **Fix:** None component-specific. If a codebase-wide E1 sweep happens, this file participates; otherwise leave to match house voice.

### [P3][docs/J] Doc "Gotchas" + "Composability" headers lean on bullet-list-of-bold-noun-phrases structure
- **Category:** docs
- **Evidence:** truncated-text.md:36–45 — `## Composability` / `## Gotchas` with `**Truncates AND recovers...**`, `**\`mode="middle"\` for identifiers:**`, `**The flexbox gotcha:**`, `**Don't truncate everything:**`
- **Why:** Borderline E8 (over-structuring / bold-lead bullet pattern). The content is genuinely useful and specific (not filler), and "Don't truncate everything" is a real prescriptive rule, so this is on the right side of the line. Noting only because the bolded-lead-in-every-bullet shape is a soft AI doc tell.
- **Fix:** None required — content is load-bearing. If tightening, drop the bold lead-ins on the two shortest bullets.

## Composability gaps
- **No `asChild` / element passthrough.** Closed `as: 'span' | 'p' | 'div'` union (truncated-text.tsx:21) blocks the realistic cases — a truncated link, a clamped heading, a `<label>`, a list item. This is the single biggest composability gap; the component exists to wrap other content but forces one of three tags and can't compose into a Link/heading without a wrapper element that defeats `min-w-0`/truncate.
- `children` is correctly constrained to `string` (it's measured and used as the accessible name) — this is a deliberate, documented narrowing (truncated-text.md:43), not a gap. Good call, leave it.
- No bespoke corner-props, no re-rolled surface, no compound/slot mixing — clean on F1/F3/F4/F5.

## Motion gaps
- **None, and that's correct.** TruncatedText ships zero motion. It's a static text-layout primitive; entrance/exit/feedback motion would be noise (M1–M5 all N/A). The only "animation" surface is the ResizeObserver-driven remeasure, which is layout logic, not motion. The tooltip it composes (`Tooltip`) owns its own entrance/exit and reduced-motion handling. No M3 violation because there's nothing animating in this file.

## Polish plan (ordered steps to reach the finish bar)
1. **Fix the story token drift (P1):** `border-border-subtle` → `border-surface-border-subtle` at truncated-text.stories.tsx:22 and :70. Verify the demo border now renders in Storybook.
2. **Add `asChild` (P2):** introduce Slot-based `asChild` so consumers can truncate inside their own `<a>`/`<h3>`/`<label>`; keep `as` for the simple case or deprecate it in favor of `asChild`. Document that `min-w-0` still applies to whatever element wins.
3. **Close state coverage (P2):** add an RTL story for `mode="end"`, a forced-overflow story that statically shows the clipped + tooltip-open state, and (optionally) a `vitest-axe` assertion on the overflowing variant.
4. **Optional doc tidy (P3):** trim bold lead-ins on the shortest Composability/Gotchas bullets; leave the em-dashes unless a codebase-wide E1 sweep runs.

## Clean (rubric dims that pass)
- **V1–V8 (visual tells):** none. No accent rail, no double edge, no gradient text, no indigo/violet/slate brand color, no emoji icons, no blob/glass/glow, no rounded-everything, no pill spam. The component emits only truncation/clamp utility classes + `cn(className)`.
- **V9–V15 (visual reflexes):** none. No hardcoded Inter/Geist, no decorative numbering, no eyebrow kicker, no hero, no all-caps default, no AI imagery.
- **M1–M5 (motion):** N/A and clean — no motion shipped (correct for a text primitive).
- **F1, F3, F4, F5, F6 (composability):** clean — no bespoke corner-props, not over-propped (7 props, all load-bearing), no compound/slot mixing, composes `Tooltip` rather than re-rolling it, `children: string` is a documented intentional constraint (no controlled/uncontrolled semantics apply).
- **G1, G3, G5:** clean in the *component source* — no surface-1 misuse (it's text, not a card; the surface lives in the demo Box only), no variant-axis taxonomy (no CVA axes here), no soft-vs-outline question. (G2/G4 drift is in the story only, flagged above.)
- **I (types/API):** clean — `forwardRef<HTMLElement>`, `displayName` set, no `any`, no `React.FC`, exported `TruncatedTextProps`, closed `TruncateMode` union, `title`/`children` precisely typed. The `as as React.ElementType` cast (truncated-text.tsx:110) is a minor internal cast, not an exported-API type hole.
- **H (a11y core):** strong — full string always kept as the accessible name (`aria-label` when overflowing, truncated-text.tsx:127), tooltip recovery only when actually clipped, SR-safe CSS truncation keeps full text in the DOM for end/clamp. Tested at truncated-text.test.tsx:66–88.
- **E2–E8 (verbal, minus E1):** clean — no contrastive negation, no AI-vocabulary words, no meta-hedging, no empty openers, no chatbot artifacts, no forced tricolon, no generic Overview/Summary headers.
- **J (docs parity):** prop table matches the source (mode/lines/as/tooltip/title/className/children), defaults match, the `as` union and `children: string` constraint are both documented accurately.
