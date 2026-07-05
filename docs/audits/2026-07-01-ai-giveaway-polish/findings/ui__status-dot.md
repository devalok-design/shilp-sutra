# ui/status-dot — audit
**Finish score:** 4/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:3 P2:3 P3:1

StatusDot is a small, mostly-clean presentational component. No hard visual AI tells (no accent rail, no gradient text, no raw indigo/violet, no emoji, no glow). Tokens are semantic throughout and reduced-motion is respected. The gaps are vocabulary drift on the `variant`/`color` axes, a missing-slot composability gap on `label`, an em-dash connector in the auto aria-label, and incomplete docs/story/test coverage of the `ring` variant.

## Findings

### [P1][G3] `variant="filled"` is off the canonical taxonomy
- **Category:** vocabulary
- **Evidence:** status-dot.tsx:60 — `variant?: 'filled' | 'ring'`
- **Why:** Rubric G3 canonical `variant` axis is solid/soft/outline/ghost/link; `filled` is explicitly called out as a drift value. The dot's two modes are really fill-vs-edge, which the family already names `solid` (filled) and `outline` (ring/border).
- **Fix:** Rename to `variant?: 'solid' | 'outline'` (solid = current `filled`, outline = current `ring`), keeping the default as `solid`. Aligns with Badge/Button/Card edge-vs-fill vocabulary.

### [P1][G3/G4] `status` is used as the color axis instead of the canonical `color` axis
- **Category:** vocabulary / drift
- **Evidence:** status-dot.tsx:7,55 — `type Status = 'healthy' | 'warning' | 'critical' | 'neutral' | 'inactive'`; `status: Status` is the sole color driver via `dotColorMap`/`textColorMap`/`ringBorderColorMap`.
- **Why:** Sibling indicators (Badge, StatusBadge) drive color off the canonical `color` axis (`success/warning/error/info/neutral`). StatusDot invents a parallel domain enum (`healthy/critical/inactive`) that maps 1:1 onto those same semantic colors, so a consumer styling a "success" dot must learn a second vocabulary. G4 inconsistent-surface-vocabulary across a family.
- **Fix:** This is defensible as a deliberate domain alias (status semantics read better than raw color for presence indicators), but it should be documented as intentional and the mapping made explicit in the doc. At minimum keep `healthy↔success` naming consistent and avoid adding more bespoke status names. Consider exposing `color` as the underlying axis with `status` as a semantic alias layer.

### [P1][E1] Em-dash used as a connector in the default aria-label
- **Category:** verbal-tell
- **Evidence:** status-dot.tsx:72 — ``const autoAriaLabel = label ? `${label} — ${status}` : `Status: ${status}` ``
- **Why:** Rubric E1 bans `—` as a stylistic connector (the AI em-dash tic). This ships in the component default, so every unlabeled-override consumer gets it read aloud by a screen reader as "Healthy, em dash, healthy"-style phrasing.
- **Fix:** Use a colon or comma: `` `${label}: ${status}` `` (matches the existing `Status: ${status}` branch's punctuation).

### [P2][F1] `label` is a bespoke string prop where a child slot belongs
- **Category:** composability
- **Evidence:** status-dot.tsx:64,95-99 — `label?: string` rendered as `{label && <span>{label}</span>}`.
- **Why:** Rubric F1 — content injected via a fixed string prop instead of a composable child. A `string` label can't hold an icon, a `<code>` status code, a link, or formatted text; consumers needing that must abandon the prop and re-roll the layout. The doc even hints at `font-mono for status codes` (llms-full.txt:4199), which argues for richer children.
- **Fix:** Accept `children` as the label content (keep `label` as a convenience alias for the string case), or document `label` accepts `React.ReactNode`. Render whichever is provided in the label span.

### [P2][H/J] `variant="ring"` is untested and undemonstrated
- **Category:** state-coverage / docs
- **Evidence:** status-dot.test.tsx:7-10 (`describeConformance` passes no `variants`/`sizes`); status-dot.stories.tsx has no story exercising `variant="ring"`.
- **Why:** The conformance helper only smoke-tests variants when the list is passed (conformance.tsx:85). The `ring` branch (status-dot.tsx:74-75, `border-[1.5px]` + `bg-transparent`) ships with zero test or visual coverage — a regression there is invisible. Stories are a publish gate (CLAUDE.md).
- **Fix:** Pass `variants: ['filled','ring']` and `sizes: ['sm','md','lg']` to `describeConformance`, and add a `Variants` story showing filled vs ring side by side.

### [P2][J] llms-full.txt omits the `variant` prop entirely
- **Category:** docs
- **Evidence:** llms-full.txt:4175-4183 lists `status/size/pulse/label/labelClassName` — no `variant`. Source has `variant?: 'filled' | 'ring'` (status-dot.tsx:60).
- **Why:** Rubric J docs-parity: the AI-readable reference is missing a public prop, so agents/consumers won't discover the ring variant. Source wins.
- **Fix:** Add `variant: "filled" | "ring"` to the llms-full.txt Props block (and to llms.txt:634 cheat line). Also add it to the Storybook `argTypes`.

### [P3][G2] `border-[1.5px]` is an arbitrary value, not a token
- **Category:** drift
- **Evidence:** status-dot.tsx:75 — `border-[1.5px]`.
- **Why:** Rubric G2 — hardcoded width instead of a token. Minor (1.5px ring stroke has no DS border-width token today), but it's a raw literal in shipped default styling.
- **Fix:** Acceptable as-is given no border-width scale exists; if one is added, migrate. Low priority.

## Composability gaps
- `label` is a `string` prop, not a `ReactNode`/children slot (F1) — blocks icons, formatted status codes, links inside the label even though the doc suggests `font-mono` status codes.
- No `asChild`/Slot — defensible for a leaf presentational dot (F2 not really applicable; a status dot is not a polymorph target).
- Does not compose a base primitive — also fine here; it's a primitive itself, not re-rolling Card/surface (F5 clean).
- `pulse` is cleanly controlled-by-default (`pulse ?? status === 'healthy'`) — no controlled/uncontrolled gap (F6 clean).

## Motion gaps
- Reduced-motion IS respected: `motion-reduce:animate-none` on the ping (status-dot.tsx:90) — M3 clean.
- Uses Tailwind's built-in `animate-ping` (scale + opacity, transform-based) — not animating layout props, M5 clean.
- No bounce/elastic default — M1 clean.
- Minor (M4): the dot has no hover/press micro-feedback, but it's a non-interactive status glyph, so feedback motion isn't expected. Not a gap.
- Minor: pulse uses Tailwind's `animate-ping` rather than the DS framer-motion / `--duration-*` system used elsewhere (StatCard, Card). Consistent timing-scale adoption would be nice-to-have but `animate-ping` is the idiomatic ping; not flagged.

## Polish plan (ordered steps to reach the finish bar)
1. Fix the em-dash aria-label connector → colon (E1, P1, one-line change).
2. Rename `variant: 'filled' | 'ring'` → `'solid' | 'outline'` to match family vocabulary; keep `solid` default (G3). Treat as a breaking change per the narrowing/rename HARD RULE — note in CHANGELOG, or alias the old names for a deprecation window.
3. Decide + document the `status`-as-color-axis choice: either make it an explicit semantic alias over the canonical `color` axis, or document it as intentional in the doc/llms-full.txt (G3/G4).
4. Widen `label` to `ReactNode` (or accept `children`) so status codes/icons/links compose (F1).
5. Add `variant` to llms-full.txt + llms.txt + Storybook `argTypes`; add a `Variants` story (filled vs ring) and pass `variants`/`sizes` to `describeConformance` (J, state-coverage).

## Clean (rubric dims that pass)
- **V1–V8 visual tells:** no accent rail, no double edge, no gradient text, no raw indigo/violet/slate as brand (all semantic `*-9`/`*-11` tokens), no emoji icons, no blob/glass/glow, single radius vocabulary (`rounded-pill` correct for a dot), no pill-badge spam.
- **V9 font:** `font-sans` token, no hardcoded Inter/Geist.
- **G1 surface:** no surface usage — it's an inline glyph, no card-on-surface-1 risk.
- **G2 tokens:** colors/spacing/typography all tokenized (`bg-success-9`, `gap-ds-02`, `text-ds-sm`); only the 1.5px ring is a literal (P3).
- **M3 reduced-motion:** guarded.
- **I types:** `forwardRef` to `HTMLSpanElement`, `displayName` set, exported prop interface + exported `StatusDotStatus` type, no `any`, no stringly-typed `color?: string`.
- **H a11y:** `role="status"`, auto aria-label, consumer override honored (`ariaLabelProp ?? autoAriaLabel`); axe-clean via conformance.
- **Verbal (E2–E8):** JSDoc/doc copy is direct, no contrastive negation, no AI vocabulary, no hedging, no chatbot artifacts.
