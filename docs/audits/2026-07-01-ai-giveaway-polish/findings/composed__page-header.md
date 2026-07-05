# composed/page-header — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:4 P2:4 P3:2

PageHeader is visually restrained — no accent rail, no gradient, no double-edge, tokens throughout, one radius vocabulary, a real focus ring. It is NOT AI slop. But it falls short of the Card bar on two structural axes: it **re-rolls the Breadcrumb primitive** (hand-inlined SVG chevron + duplicated anchor/span class strings) that already exists as a composable family, and it exposes **bespoke content props** (`actions`, `title`, `subtitle`, `breadcrumbs`) where slots would compose better. It also ships **zero motion** and its **doc is factually wrong** in two places.

## Findings

### [P1][F5] Re-rolls the Breadcrumb primitive instead of composing it
- **Category:** composability / drift
- **Evidence:** page-header.tsx:36–77 — inlines `<nav aria-label="Breadcrumb">` with a hand-drawn `<svg ...><path d="M9 6l6 6l-6 6" /></svg>` chevron (41–55) and raw `<a className="text-ds-sm text-surface-fg-subtle transition-colors hover:... focus-visible:ring-2 ...">` / `<span>` (56–74), all duplicating class strings that live in `ui/breadcrumb.tsx`.
- **Why:** A full `Breadcrumb / BreadcrumbList / BreadcrumbItem / BreadcrumbLink / BreadcrumbPage / BreadcrumbSeparator` family already exists (ui/breadcrumb.tsx:96–104) with the same semantics, `asChild`, truncation, and an `Icon`-based `IconChevronRight` separator. PageHeader’s reimplementation is the exact drift StatCard fixed by composing Card — separator glyph, hover color, focus ring, and truncation can now diverge from the canonical breadcrumb.
- **Fix:** Render the breadcrumb array through the `Breadcrumb*` sub-components (map each crumb to `BreadcrumbItem` + `BreadcrumbLink`/`BreadcrumbPage`, interleave `BreadcrumbSeparator`). Deletes the inline SVG + duplicated classes and gets `<ol>`/`<li>` list semantics and `aria-current="page"` for free.

### [P1][A11Y/H] Breadcrumb nav uses no list semantics and no `aria-current`
- **Category:** a11y / state-coverage
- **Evidence:** page-header.tsx:37–77 — crumbs are laid out as bare `<a>`/`<span>` inside a flat `<nav>` with `React.Fragment` wrappers; there is no `<ol>/<li>`, and the current-page span (64–74) has no `aria-current="page"`.
- **Why:** WAI-ARIA breadcrumb pattern wants an ordered list and `aria-current="page"` on the leaf. The canonical `BreadcrumbPage` already sets `aria-current="page"` (breadcrumb.tsx:59); the re-roll drops it. This is a real (if minor) a11y regression versus composing the primitive.
- **Fix:** Fixed for free by [F5] — `BreadcrumbList` renders `<ol>`, `BreadcrumbItem` renders `<li>`, `BreadcrumbPage` sets `aria-current`.

### [P1][F1] Bespoke content props where slots would compose better
- **Category:** composability
- **Evidence:** page-header.tsx:11–17 — `title?`, `subtitle?`, `actions?: React.ReactNode`, `breadcrumbs?: Breadcrumb[]` are all injected into fixed regions. `actions` is a `ReactNode` dumped into a fixed `flex shrink-0` corner (100–102); `title`/`subtitle` are strings, so a consumer who wants a `<Badge>` next to the title, a two-line custom title, or a status dot must reach for `titleClassName` or drop the props entirely.
- **Why:** This is the Card-old-`accent-badge` pattern — content pushed through corner props instead of composable children. The Card bar exposes `<CardHeader>/<CardTitle>/<CardAction>` slots. PageHeader would benefit from a slot-based compound (`PageHeader.Title`, `PageHeader.Actions`) OR at minimum widening `title`/`subtitle` to `ReactNode`.
- **Fix:** Either (a) add a compound slot API alongside the convenience props, or (b) minimally widen `title?: React.ReactNode` and `subtitle?: React.ReactNode` (a *widening* — non-breaking) so richer content composes without `titleClassName` hacks.

### [P1][M4/M3] Ships zero motion — no entrance, no feedback, no reduced-motion consideration
- **Category:** motion
- **Evidence:** page-header.tsx whole file — no `framer-motion` import, no `transition` on the title/breadcrumb links beyond `transition-colors` on the anchor (59). Card/StatCard both use `motion.*` + `springs`/`tweens` and honor reduced-motion via the shared motion system.
- **Why:** The finish bar (rubric §4) is *intentional* motion, not necessarily animation everywhere — but a page-top header that mounts on every route change is a natural place for a restrained fade/slide-in, and the breadcrumb links’ hover already has `transition-colors` so the intent exists but is inconsistent. As shipped, there is no entrance motion and, because there is none, no reduced-motion story either. This is a polish gap, not a tell.
- **Fix:** Optional restrained entrance (fade + small `y`) via the shared `tweens.fade` / `motionProps`, which routes through MotionConfig for reduced-motion — matching Card/StatCard. If motion is deliberately omitted, document that choice.

### [P2][J] Doc claims a behavior the component does not have ("Renders Breadcrumb internally")
- **Category:** docs
- **Evidence:** page-header.md:32 — "Renders **Breadcrumb** internally from the `breadcrumbs` array." and :34 — "renders as BreadcrumbPage, not a link ... render as BreadcrumbLink."
- **Why:** False. The component renders a bespoke `<nav>` + inline SVG + raw `<a>`/`<span>` (page-header.tsx:37–77); it does NOT use the `Breadcrumb*` components. Doc parity gate violation — describes behavior the source doesn’t implement. (Would become true if [F5] is applied.)
- **Fix:** Either implement [F5] so the doc is accurate, or correct the doc to say it renders a plain nav.

### [P2][J] Doc prop table is inaccurate (marks `title` required; omits `titleClassName` detail; wrong "Defaults")
- **Category:** docs
- **Evidence:** page-header.md:8 — `title: string` listed as if required, but source (page-header.tsx:12) is `title?: string` and it can be omitted (derived from breadcrumbs). :14 "Defaults: None" while there is derived-title fallback behavior (page-header.tsx:24–25).
- **Why:** Prop-table drift from source. Source wins.
- **Fix:** Mark all props optional; note the `title → last breadcrumb label` fallback as a default behavior; keep the extends-`HTMLAttributes` note.

### [P2][F5] Re-rolls the title/subtitle typography instead of composing `Text`
- **Category:** composability / vocabulary
- **Evidence:** page-header.tsx:84–91 hardcodes `text-ds-2xl font-semibold text-surface-fg` for the `<h1>`; :93–96 hardcodes `text-ds-md text-surface-fg-subtle line-clamp-2` for the subtitle.
- **Why:** A `Text` primitive with `heading-*` variants and an `as` prop exists (ui/text.tsx:67–72) and is the canonical way to render headings in the system. Hardcoding the type ramp here means the page-title style can drift from the `heading-*` scale. Lower severity than the breadcrumb re-roll because it’s only two utility strings, but same class of drift.
- **Fix:** Render the title as `<Text as="h1" variant="heading-...">` and the subtitle via `Text variant="body-md"`, so the type ramp is single-sourced.

### [P2][H] `subtitle` line-clamps to 2 with no title truncation, and no empty/RTL/forced-colors coverage in stories
- **Category:** state-coverage
- **Evidence:** page-header.tsx:94 `line-clamp-2` on subtitle; title `<h1>` has no clamp (long-title story relies on wrap). Stories (page-header.stories.tsx) cover Default/Subtitle/Breadcrumbs/Actions/Long/CustomClass but no empty-state (all props omitted), no RTL (breadcrumb chevron should mirror), no forced-colors.
- **Why:** The hand-drawn chevron `M9 6l6 6l-6 6` (page-header.tsx:53) is a right-pointing glyph that will NOT mirror in RTL (the canonical `IconChevronRight` via Icon would). Empty render (`resolvedTitle || subtitle || actions` all falsy) yields an empty bordered `<div>` — degenerate but not crashing.
- **Fix:** Fixed largely by [F5] (Icon-based separator mirrors). Add RTL + empty stories; consider whether an all-empty PageHeader should render nothing.

### [P3][G3] `titleClassName` escape-hatch prop instead of composition
- **Category:** composability / vocabulary
- **Evidence:** page-header.tsx:16 `titleClassName?: string`; story CustomTitleClass (stories:133–139) uses it to set `font-bold`.
- **Why:** A `xxxClassName` passthrough is a smell that the title should be a slot/`ReactNode` (see [F1]). Not harmful, but it’s the workaround that a slot would eliminate.
- **Fix:** Superseded by [F1] — if title becomes a `ReactNode`/slot, `titleClassName` can be deprecated.

### [P3][docs] Story action buttons use raw inline styles + hardcoded brand hex, not DS Button
- **Category:** docs / visual-tell (demo-only)
- **Evidence:** page-header.stories.tsx:53–79, 95–108 — `background: '#D33163'`, `border: '1px solid var(--color-surface-border-strong)'`, raw `<button>`.
- **Why:** Demo-only (not shipped in the component), so low severity, but the story models bad consumer behavior (hardcoded brand hex `#D33163`, hand-rolled button) instead of `<Button>` — and the CLAUDE.md preference is `variant="soft"` for the secondary "Export" action. Stories are a soft teaching surface.
- **Fix:** Use `<Button variant="soft">Export</Button>` + `<Button>Add Member</Button>` in the actions stories.

## Composability gaps
- Re-rolls `Breadcrumb*` (inline SVG chevron + duplicated anchor/span classes) instead of composing the existing family — the single biggest gap (F5).
- Content flows through bespoke corner props (`title`, `subtitle`, `actions`, `breadcrumbs`) rather than slots; `title`/`subtitle` are `string`, blocking rich content; `titleClassName` is the workaround this creates (F1).
- Re-rolls heading/subtitle typography instead of composing `Text` `heading-*` variants (F5).
- No `asChild` on the title (a consumer wanting the h1 to be a link/anchor for a section-landing pattern has no path) — minor.

## Motion gaps
- Zero entrance/exit motion; inconsistent with Card/StatCard which both animate mount. (M4)
- Because there is no motion, no reduced-motion path is exercised — acceptable only if the no-motion choice is deliberate and documented (M3).
- Breadcrumb links have `transition-colors` (page-header.tsx:59) but nothing else does — motion intent exists but is applied unevenly.

## Polish plan (ordered steps to reach the finish bar)
1. **Compose Breadcrumb.** Replace the inline `<nav>`/SVG/`<a>`/`<span>` (page-header.tsx:36–77) with `Breadcrumb → BreadcrumbList → BreadcrumbItem → BreadcrumbLink|BreadcrumbPage`, interleaving `BreadcrumbSeparator`. Fixes F5, the a11y list/`aria-current` gap, and RTL chevron mirroring in one move. (Note: this adds a `'use client'` dependency chain via `Breadcrumb`→`Icon`; verify the `// @server-safe` annotation still holds or drop it — Breadcrumb itself is `'use client'`.)
2. **Compose Text for title/subtitle.** Render `<Text as="h1" variant="heading-...">` + subtitle via `Text`.
3. **Widen content props / add slots.** Minimally widen `title`/`subtitle` to `ReactNode` (non-breaking widening); optionally add a compound `PageHeader.Actions`/`.Title` slot API. Deprecate `titleClassName`.
4. **Correct the doc.** Fix the false "Renders Breadcrumb internally" claim (or make it true via step 1), mark props optional, document the title-fallback default. Fix story actions to use `<Button variant="soft">` and drop the hardcoded `#D33163`.
5. **(Optional) restrained entrance motion** via shared `tweens.fade`/`motionProps` for reduced-motion parity with Card/StatCard, or document the no-motion decision.
6. **Add RTL + empty + forced-colors stories.**

## Clean (rubric dims that pass)
- **V1 accent rail:** none. Emphasis via type weight + a bottom border only (`border-b border-surface-border-strong`, page-header.tsx:31). Clean.
- **V2 double-edge:** single `border-b`, no shadow. Clean.
- **V3 gradient text / V4 framework palette (in source):** none — semantic tokens throughout (`text-surface-fg`, `text-surface-fg-subtle`, `ring-accent-9`). (The `#D33163` hex is story-only, flagged under P3.)
- **V5 emoji / V6 blob-glow / V7 rounded-everything:** none. Only `rounded-control-inner` on focus targets.
- **V8 pill spam / V10 decorative numbering / V12 eyebrow / V14 all-caps:** none.
- **G1 surface:** page-top chrome on the page background — correct, not a card; no surface-1 violation.
- **G2 tokens:** spacing (`gap-ds-05`, `pb-ds-06`, `gap-ds-02b`), radius, colors all tokenized; no bare `shadow`/`rounded`/`bg-gradient-to-*`/`w-[--var]`.
- **I types:** `forwardRef` + `displayName` present; ref typed to `HTMLDivElement`; `Breadcrumb` interface exported; no `any`, no `React.FC`, no stringly-typed enums.
- **E verbal:** JSDoc/doc prose free of em-dash tics, AI vocabulary, hedging (the doc’s factual *errors* are flagged under J, not verbal tells).
- **Focus ring:** breadcrumb links have a real `focus-visible:ring-2 focus-visible:ring-accent-9` (page-header.tsx:59) — not removed.
- **Tests:** solid coverage of title/subtitle/breadcrumbs/actions/fallback/className + `describeConformance`.
