# ui/text — audit
**Finish score:** 4/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:2 P2:3 P3:1

Text is a server-safe, token-bound typography primitive. The component source itself is clean of every visual/motion/structural AI tell — no gradients, no rails, no raw palette, no hardcoded fonts, intentional polymorphism with correct ref forwarding and a documented generic cast. The findings are concentrated in the **docs/make-kit layer** (token names that don't exist, drift from the CVA source) and a couple of polish gaps (label-plain + code variants missing from story/argTypes, JSDoc boilerplate closer).

## Findings

### [P1][J] make-kit doc uses non-existent color tokens (`text-fg-muted`, `text-fg`, `text-fg-subtle`)
- **Category:** docs / drift
- **Evidence:** make-kit/components/text.md:54 — `<Text variant="body-md" className="text-fg-muted">`; also :64, :65, :91, :137 (`text-fg-muted`, `text-fg`, `text-fg-subtle`). The real semantic token is `--color-surface-fg-muted` → `text-surface-fg-muted` (semantic.css:177). `--color-fg-muted` / `--color-fg` / `--color-fg-subtle` do **not** exist (grep returns no matches).
- **Why:** Every make-kit example that sets color would render with no color class applied — copy-paste produces broken output, and Rule line 137 prescribes the wrong token name as the canonical one.
- **Fix:** Replace `text-fg-muted` → `text-surface-fg-muted`, `text-fg` → `text-surface-fg`, `text-fg-subtle` → `text-surface-fg-subtle` throughout make-kit/components/text.md (the per-component doc at docs/components/ui/text.md and the component stories already use the correct `text-surface-fg-*` names — this is make-kit-only drift).

### [P1][J] per-component doc prop table omits 4 shipped variants + stale "Changes" history
- **Category:** docs
- **Evidence:** docs/components/ui/text.md:8 lists the full variant union including `label-plain-*` and `code` (good), but the example block (:20-23) uses `text-text-secondary` (line 22 — another dead token, real one is `text-surface-fg-muted`). The "Changes" section (:37-42) stops at v0.2.0 / "Initial release" — the `label-plain-*` and `code` variants are undocumented as additions. Story argTypes (text.stories.tsx:12-16) also omit `label-plain-*` and `code` from the `variant` options list.
- **Why:** Doc/story prop surface drifts from CVA source (text.tsx:7-30 ships 20 variants); `text-text-secondary` is a third dead-token variant in the doc example.
- **Fix:** Fix `text-text-secondary` → `text-surface-fg-muted` in docs/components/ui/text.md:22; add `label-plain-lg/md/sm` and `code` to the story `variant` argTypes options (text.stories.tsx:12-16) and to AllVariants.

### [P2][H] stories/argTypes don't demonstrate `label-plain-*` or `code` variants
- **Category:** state-coverage / docs
- **Evidence:** text.stories.tsx:28-52 `AllVariants` renders heading/body/label/caption/overline but never `label-plain-*` (4 variants) or `code`. argTypes options (:12-16) also omit them.
- **Why:** 5 of 20 public variants have no visual story — the publish-gate "story per public surface" is only partially met; designers/consumers can't see label-plain (the mixed-case label) or code rendering.
- **Fix:** Add a `label-plain-*` row and a `code` example to `AllVariants`; sync argTypes options to the full union.

### [P2][I] forwardRef typed to `HTMLElement` loses element-specific ref typing at impl
- **Category:** types
- **Evidence:** text.tsx:110 `React.forwardRef<HTMLElement, TextProps>`. The public `TextComponent` cast (:106-108) correctly preserves `ref?: React.ComponentPropsWithRef<T>['ref']`, so call sites are fine — but the impl-level `HTMLElement` is broader than the rendered element.
- **Why:** Minor — the public generic cast recovers correct typing (test at text.test.tsx:79-83 confirms `as="h1"` yields `HTMLHeadingElement`). Flagged only because the rubric calls out `HTMLElement` ref where a specific element is known; here the element is genuinely variable, so this is close to unavoidable. Low impact.
- **Fix:** Acceptable as-is (standard polymorphic pattern). Optionally document the intentional widening with a one-line comment; no functional change needed.

### [P2][E8/E5] JSDoc closer is filler boilerplate
- **Category:** verbal-tell
- **Evidence:** text.tsx:92 — `// These are just a few ways — feel free to combine props creatively!` (same boilerplate line appears in card.tsx:110 and stat-card.tsx:63, so it is a repo-wide JSDoc tic, not unique to Text).
- **Why:** Empty closer / engagement-bait register (E5) and it carries an em-dash used as a stylistic connector (E1). It adds nothing and reads as generated filler.
- **Fix:** Delete the trailing `// These are just a few ways…` comment from the JSDoc. (Repo-wide cleanup; flag here as the synthesis pass will dedupe across Card/StatCard/Text.)

### [P3][V14] `label-*` and `overline` are uppercase-by-default — verify this is the intended emphasis model
- **Category:** visual-tell (borderline / likely a choice)
- **Evidence:** text.tsx:20-25 — every `label-*` and `overline` variant appends `uppercase`. The make-kit doc (text.md:30-36) documents this as intentional and provides `label-plain-*` as the mixed-case escape hatch.
- **Why:** Rubric V14 flags all-caps-as-default-emphasis as a reflex, but here it is (a) gated by variant name, (b) documented as intentional, (c) given a non-uppercase sibling (`label-plain-*`). That makes it a deliberate choice, not a tell. Recorded for completeness, not as a defect.
- **Fix:** None. Keep as-is; the `label-plain-*` escape hatch is the correct design.

## Composability gaps
- **None material.** Text is a pure polymorphic primitive with `as` (its form of `asChild`/Slot — F2 satisfied), correct generic ref forwarding (F-pattern correct), no bespoke corner-props (F1 N/A), no compound-vs-slot confusion (F4 N/A), and nothing to controlled/uncontrolled (F6 N/A — stateless). It is itself the base primitive that Card/Alert/etc. compose, so F5 is inverted in its favor.
- Minor: `as` rather than `asChild`. For a typography element this is correct (it owns the rendered tag); no Slot merge needed. Not a gap.

## Motion gaps
- **None.** Text is `// @server-safe` (text.tsx:1) and intentionally ships **zero** motion — it's a static typography primitive with no interactive states. M1–M5 are all N/A: there is nothing to animate, no hover/press surface, no overlay, no layout animation. This is the correct call for a server-safe primitive (adding motion would force `'use client'` and break RSC use). Not a gap.

## Polish plan (ordered steps to reach the finish bar)
1. **Fix dead color tokens in docs (P1).** make-kit/components/text.md: `text-fg-muted`→`text-surface-fg-muted`, `text-fg`→`text-surface-fg`, `text-fg-subtle`→`text-surface-fg-subtle` (lines 54,64,65,91,137). docs/components/ui/text.md:22 `text-text-secondary`→`text-surface-fg-muted`.
2. **Sync story + argTypes to the 20-variant CVA source (P2).** Add `label-plain-lg/md/sm` and `code` to `AllVariants` and to the `variant` argTypes options in text.stories.tsx.
3. **Update per-component doc Changes log (P1).** Note when `label-plain-*` and `code` were added.
4. **Drop the JSDoc filler closer (P2, repo-wide).** Remove the `// These are just a few ways…` line from text.tsx:92 (and Card/StatCard in the same sweep).
5. Optional: one-line comment on the intentional `HTMLElement` ref widening (P3).

## Clean (rubric dims that pass)
- **A. Visual tells (V1–V8):** all clean. No accent rail, no double edge, no gradient text, no raw indigo/violet/slate palette, no emoji icons, no blob/glass/glow, single radius vocabulary (none used — it's text), no pill spam.
- **B. Visual reflexes (V9–V15):** V9 clean — uses `font-sans` + `--typo-*` semantic tokens (text.tsx:7-29) that resolve to `--text-ds-*` primitives (typography-semantic.css:25,61,103), NOT hardcoded Inter/Geist. No decorative numbering, no eyebrow default, no hero, no AI imagery.
- **C. Motion (M1–M5):** N/A — server-safe, zero motion by design.
- **D. Structural (S1–S4):** N/A — primitive, not a page/section.
- **E. Verbal:** mostly clean; only the shared JSDoc closer flagged (P2). JSDoc prose is direct and prescriptive otherwise.
- **F. Composability:** clean — see above.
- **G. Drift/vocabulary:** G1 N/A (no surface), G2 clean (all values are `--typo-*`/`--text-ds-*` tokens, no raw px/hex/dead-TW4 classes in source), G3 N/A (variant axis is a typography role taxonomy, not the solid/soft/outline axis — correct for this primitive), G4/G5 N/A.
- **H. State coverage:** N/A for a non-interactive primitive; semantic-HTML element mapping (text.tsx:39-60) is correct and tested (text.test.tsx:30-77).
- **I. Types:** strong — exported `TextProps`/`TextVariant`/`textVariants`, generic polymorphic component preserves `T`, `displayName` set (text.tsx:120), no `any`, no `React.FC`, no stringly-typed color. Only the impl-level `HTMLElement` ref noted (P2, near-unavoidable).
- **J. Docs parity:** variant union in docs matches source; the only failures are the dead color tokens and the missing label-plain/code story rows (flagged above).
