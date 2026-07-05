# shell/app-command-palette — audit
**Finish score:** 4/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:2 P2:4 P3:2

AppCommandPalette is a thin, **headless data-shaping wrapper** over `composed/CommandPalette`. It renders no
surface, no color, no motion of its own — it maps `SearchResult`/`CommandRegistry` data into the base
component's `groups` prop and forwards controlled/uncontrolled state, keybinding, maxHeight, emptyState, and
footerHints straight through. That architecture is exactly the "compose, don't re-roll" bar (F5 clean). All the
visual/motion surface lives in `command-palette.tsx` (audited separately). Findings here are almost entirely
API/vocabulary/docs; the one motion/state note is inherited from the base and only relevant because this wrapper
introduces the `isSearching` semantics.

## Findings

### [P1][G3] `entityType` is a free-form `string`, and `user.role` is stringly-typed with capitalized magic values
- **Category:** types / vocabulary
- **Evidence:** app-command-palette.tsx:29 `entityType: string`; :157 `isAdminProp ?? (user?.role === 'Admin' || user?.role === 'SuperAdmin')`; command-registry.tsx interface `role?: string`.
- **Why:** `entityType` drives icon/grouping semantics but is untyped, so `'TASK'` vs `'task'` vs `'Task'` all typecheck and silently diverge; admin detection hinges on exact-case string literals (`'Admin'`, `'SuperAdmin'`) that aren't a named union, so a `role: 'admin'` (as the doc example itself shows, line 27 of the doc) silently fails to grant admin.
- **Fix:** Export a `type EntityType = 'TASK' | 'PROJECT' | 'USER' | ...` union (or at minimum document it), and either a `UserRole` union or make admin detection case-insensitive. The doc/code role-case mismatch (below, J) is a direct symptom.

### [P1][F6] Two overlapping ways to inject search data + a `title`/`label` style split with the sibling; `onSearch`/`onSearchResultSelect` split is fine but undocumented as the controlled contract
- **Category:** composability / vocabulary
- **Evidence:** app-command-palette.tsx:67-70 `searchResults?` AND `searchResultGroups?` with :206 "Grouped results take precedence"; StatCard uses `label`/`title` aliases, this uses `title` (SearchResult.title) — minor family inconsistency.
- **Why:** Two mutually-exclusive props for the same slot (flat vs grouped results) with silent precedence is a mild composability smell — a consumer passing both gets one silently ignored. It's documented in a code comment but not in the public doc's prop table.
- **Fix:** Keep both (the ergonomics are real) but document the precedence in the `.md` prop table, and consider a dev warning when both are passed. Not worth a breaking change.

### [P2][H] `isSearching` loading state has no `aria-busy`/`aria-live`; async result swap is silent to AT
- **Category:** state-coverage / a11y
- **Evidence:** app-command-palette.tsx:237 `label = isSearching ? 'Searching...' : 'Search Results'` — the only manifestation of loading is a group *label string*. No `aria-busy` on the listbox, no `aria-live` region announcing "N results" when async results arrive. The base `command-palette.tsx:384` listbox has no `aria-busy` binding either.
- **Why:** Rubric H: "loading with no `aria-busy`; async with no `aria-live`." A screen-reader user typing a query gets no spoken feedback that a search is running or that results updated.
- **Fix:** Thread `isSearching` down as `aria-busy` on the results container, and add an `aria-live="polite"` status node ("Searching…" / "N results") — ideally in the base so all consumers benefit.

### [P2][H] No empty/zero-results distinction for the *searching-but-empty* case
- **Category:** state-coverage
- **Evidence:** app-command-palette.tsx:221 `if (searchResults.length === 0) return []` — when a search is in progress with no results yet, the search group simply vanishes and the base falls back to the generic `emptyMessage` "No results found. Try a different search term." (line 269). There is no "Searching…" empty state; `isSearching` only relabels a group that only exists once results arrive.
- **Why:** During the loading window the UI reads as "no results" rather than "still searching" — a subtle but real state-coverage gap the `isSearching` prop implies it handles but doesn't.
- **Fix:** When `isSearching && searchResults.length === 0`, emit a placeholder group (or a loading emptyState) so the palette shows a searching affordance rather than the failure message.

### [P2][J] Doc prop table is stale vs source (drift)
- **Category:** docs
- **Evidence:** app-command-palette.md:8-18 omits shipped public props: `searchResultGroups`, `searchResultsLabel`, `open`, `defaultOpen`, `onOpenChange`, `keybinding`, `maxHeight`, `emptyState`, `footerHints`. The `SearchResult` shape in the doc (line 17) is missing `icon`, `rank`, `shortcut`, `href` (all present in source :32-39). Example uses `role: 'admin'` (line 27) which the code's `'Admin'`/`'SuperAdmin'` check (:157) would NOT treat as admin.
- **Why:** Rubric J: per-component doc missing/stale prop table; example that contradicts the source is worse than omission — a consumer copying it gets no admin pages.
- **Fix:** Regenerate the prop table from source; fix the example to `role: 'Admin'` (or make detection case-insensitive and note it).

### [P2][docs] Story titles leak internal ticket/priority tags ("P0 #1", "P1 #5", "P2 #10")
- **Category:** docs / verbal-tell (structural)
- **Evidence:** app-command-palette.stories.tsx:211 `name: 'Consumer-Owned Routing (P0 #1)'`, :223 `'Grouped Search Results (P0 #2)'`, :255, :290, :299, :371, :387, :400 — internal severity/issue-number bookkeeping surfaced as public Storybook story names.
- **Why:** These are internal audit artifacts (like unfilled `[placeholders]`, E6-adjacent) exposed in the shipped Storybook autodocs. They mean nothing to a consumer and read as leaked process noise.
- **Fix:** Rename to plain descriptive titles ("Consumer-Owned Routing", "Grouped Search Results", …); drop the `(P0 #n)` suffixes.

### [P3][V5] Story mock data uses no emoji, but relies on generic filler snippets; acceptable
- **Category:** visual-tell (borderline / clean)
- **Evidence:** app-command-palette.stories.tsx:25-60 mock results use real tabler icons and plausible domain copy ("Fix login redirect bug", "Sprint 14 Retrospective"). No emoji-as-icon, no gradient tells.
- **Why:** Noted only to confirm the story is clean of V5/V3/V15; the mock copy is realistic, not "diverse team at laptop" filler.
- **Fix:** None.

### [P3][types] `metadata?: Record<string, unknown>` is an untyped escape hatch on the public `SearchResult`
- **Category:** types
- **Evidence:** app-command-palette.tsx:31 `metadata?: Record<string, unknown>`.
- **Why:** Fine as an opaque pass-through, but it's a public API surface with no shape; consumers can't discover what goes in it. Low priority — it's genuinely open-ended.
- **Fix:** Leave as-is or make `SearchResult<TMeta = Record<string, unknown>>` generic if a typed metadata channel is ever wanted.

## Composability gaps
- **Clean on F5 (the big one):** wrapper composes `composed/CommandPalette` and does NOT re-roll surface/overlay/motion — it's pure data-shaping. This is the StatCard-composes-Card pattern applied correctly at the shell layer.
- **F2 (asChild):** N/A — this renders no polymorphic DOM element of its own; it forwards `ref`/`...props` to the base's `DialogContentRaw`. Correct.
- **F6 (controlled/uncontrolled):** Fully covered — `open`/`defaultOpen`/`onOpenChange` all forwarded (:81-85, :271-273). Good.
- **F1:** `extraGroups`, `searchResults`, `searchResultGroups` are data props, not corner-slot props — appropriate for a headless wrapper (the *rendering* slots like `emptyState`/`footerHints` are correctly ReactNode/config and forwarded). No bespoke-corner-prop tell.
- Minor: dual `searchResults`/`searchResultGroups` inputs with silent precedence (see F6 finding) — ergonomic, not broken.

## Motion gaps
- **None owned by this component.** AppCommandPalette declares zero motion; all entrance/exit/feedback motion lives in `command-palette.tsx`, which correctly guards with `useMotion().reducedMotion` (command-palette.tsx:179, :297-299) — M3 clean by inheritance.
- One inherited note (score against the base, not here): the base staggers item entrance with `delay: itemIndex * 0.03` (command-palette.tsx:434). For a *search-results* list that re-renders on every keystroke via this wrapper's `onSearch`, that per-item stagger can re-fire on each query change (M2 uniform-timing / re-animate-on-update). Not this file's defect, but this wrapper is the component that feeds it rapidly-changing lists, so it's the trigger.

## Polish plan (ordered steps to reach the finish bar)
1. Regenerate `app-command-palette.md` prop table + `SearchResult` shape from source; fix the `role: 'admin'` → `'Admin'` example (or make admin detection case-insensitive). (P2/J)
2. Rename the eight `(P0 #n)`/`(P1 #n)`/`(P2 #n)` story titles to plain descriptive names. (P2/docs)
3. Add `aria-busy` (from `isSearching`) + an `aria-live="polite"` results-count status; emit a "Searching…" placeholder group when `isSearching && results.length === 0`. Ideally push into the base so all consumers get it. (P2/H ×2)
4. Type `entityType` (and optionally `user.role`) as a named union, or make admin detection case-insensitive; document the `searchResults` vs `searchResultGroups` precedence. (P1/G3, F6)

## Clean (rubric dims that pass)
- **A. Visual tells (V1–V8):** none — component renders no surface, color, radius, gradient, or accent rail of its own. The one search-result fallback icon is a real lucide/tabler icon via the Icon API (:11, :115), not an emoji.
- **B. Visual reflexes (V9–V15):** none owned here. No hardcoded fonts, kickers, hero, all-caps, or AI imagery in source. (Base uses semantic tokens throughout.)
- **C. Motion (M1–M5):** no motion owned; base respects reduced-motion. M3 clean.
- **E. Verbal tells (E1–E8):** JSDoc + code comments are plain and direct — no em-dash tic in prose, no AI vocabulary, no meta-hedging. (The `.md` doc is also clean of E-class tells.) The one caveat is the *story titles* (flagged above), not prose.
- **F5 / composability core:** composes the base primitive; single source of truth for rendering. This is the finish-bar behavior.
- **G1 (surface):** N/A — no surface rendered; the base uses `bg-surface-overlay` correctly for the palette overlay.
- **G2 (tokens):** no raw px/hex/shadow in this file; all styling delegated.
- **I (types, mostly):** proper `forwardRef` + `displayName` (:131, :284); ref typed to `HTMLDivElement`; props extend `ComponentPropsWithRef<'div'>` with `Omit<'onSearch'>`; no `any`, no `React.FC`. Only nits are the stringly-typed `entityType`/`role` (flagged G3) and the open `metadata` (P3).
- **J (stories/tests exist):** story + test both present; test is axe-clean and covers pass-through props + both routing modes.
