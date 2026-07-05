# composed/page-skeletons — audit
**Finish score:** 2/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:4 P2:4 P3:1

## Findings

### [P1][F5] Re-rolls the Card surface by hand instead of composing `<Card>`
- **Category:** composability
- **Evidence:** page-skeletons.tsx:22 — `className="flex flex-col gap-ds-04 rounded-overlay-lg border border-surface-border-strong bg-surface-raised p-ds-05b"`; repeated at :35, :99, :141
- **Why:** This is the exact drift StatCard fixed — a card-shaped block hand-rolls surface + border + radius + padding instead of composing `<Card>`. The skeleton's whole job is to pre-echo the real UI, and the real UI is `<Card>` / `<StatCard>`; re-rolling guarantees the placeholder and the loaded state diverge on any Card change.
- **Fix:** Compose `<Card variant="outline">` (or `default`) for each tile/panel. If server-safe purity forbids the `'use client'` Card, extract Card's shape/surface classes into a shared server-safe class list both consume — single source of truth either way.

### [P1][G4] Radius vocabulary mismatch — cards use `rounded-overlay-lg` (Dialog radius), not `rounded-surface` (Card radius)
- **Category:** drift / vocabulary
- **Evidence:** page-skeletons.tsx:22, :35, :99, :141 all use `rounded-overlay-lg`. Per semantic.css:366 `--radius-surface (rounded-surface, 10px)` is "Card, Alert, Accordion, StatCard"; semantic.css:369 `--radius-overlay-lg (16px)` is "Dialog, AlertDialog, Sheet, BottomSheet".
- **Why:** These blocks stand in for Cards but are shaped like Dialogs (16px vs 10px). The skeleton mis-shapes the load-in, and it reads as reflexive rounded-everything rather than the deliberate Card shape.
- **Fix:** Use `rounded-surface` for card/panel tiles to match Card/StatCard. (Falls out for free if you adopt the F5 fix and compose `<Card>`.)

### [P1][V2] Double edge — 1px border AND surface on card tiles that don't match the real Card's elevation-led default
- **Category:** visual-tell / drift
- **Evidence:** page-skeletons.tsx:22 `border border-surface-border-strong bg-surface-raised` (no shadow). Card's default variant (card.tsx:27) is `border-transparent shadow-raised` — elevation-led, no visible border.
- **Why:** The real dashboard/project cards ship elevation-led (shadow ring is the edge, transparent border — make-kit rule #6). These skeletons ship border-led with `border-surface-border-strong`, so the placeholder's edge treatment doesn't match what loads in. It also picks the heaviest border token (`-strong`) on every tile.
- **Fix:** Match the surface the real card uses. If composing `<Card>` (F5), pass the same `variant` the loaded card uses (`default` for StatCard/dashboard tiles).

### [P1][G2] Hardcoded pixel dimensions instead of spacing/size tokens
- **Category:** drift
- **Evidence:** page-skeletons.tsx:26 `h-[12px] w-[80px]`, :28 `w-[64px]`, :36 `h-[20px] w-[128px]`, :46 `h-[12px] w-[32px]`, :78 `h-[24px] w-[112px]`, :103 `h-[20px] w-[64px]`, :143 `h-[20px] w-[192px]`, :158 `h-[12px] w-[96px]` — ~30 arbitrary `[Npx]` values across the file.
- **Why:** Skeleton bar sizes are laid out in raw px arbitrary values while heights elsewhere use tokens (`h-ds-04`, `h-ds-sm`). Mixed vocabulary; these placeholder dimensions drift from the type/spacing scale of the content they mimic and won't track token changes.
- **Fix:** Prefer `--spacing-ds-*` / `h-ds-*` / `w-ds-*` tokens for placeholder bars, or at minimum standardize on the `ds` scale so bar heights map to the text sizes they stand in for (label ≈ `text-ds-sm`, value ≈ `text-ds-3xl`).

### [P2][M4/M2] Skeleton animation is implicit and inconsistent — relies on `<Skeleton>`'s default pulse, no unified shimmer
- **Category:** motion / state-coverage
- **Evidence:** `shimmer` const at page-skeletons.tsx:7 is `'bg-surface-raised-hover'` — a color tint, NOT an animation, despite the name. Every `<Skeleton className={cn('...', shimmer)}/>` inherits Skeleton's default `animation="pulse"` (skeleton.tsx:15, `animate-pulse motion-reduce:animate-none`). The sibling `<Skeleton>` primitive offers a real `shimmer` sweep (skeleton.tsx:16-17) that these page skeletons never opt into.
- **Why:** The variable named `shimmer` produces no shimmer — it only recolors the pulse. Motion is uniform pulse throughout with no intentional differentiation, and the misleading name invites future edits to think shimmer is active. (Reduced-motion IS respected via the inherited default — good.)
- **Fix:** Rename the const to `skeletonTint` (or drop it — `bg-surface-raised-hover` overriding `bg-skeleton-base` is questionable; let Skeleton own its base). If a shimmer sweep is wanted, pass `animation="shimmer"` explicitly.

### [P2][G2] Overriding Skeleton's base fill with a surface token
- **Category:** drift
- **Evidence:** page-skeletons.tsx:7 `const shimmer = 'bg-surface-raised-hover'`, applied to every `<Skeleton>` via `cn(..., shimmer)`, overriding Skeleton's own `bg-skeleton-base` (skeleton.tsx:7).
- **Why:** There is a dedicated skeleton fill token (`--skeleton-base` / `--skeleton-shimmer`). These page skeletons discard it and paint bars with a surface-hover token, so the placeholder shade no longer tracks the skeleton token system and can mismatch other skeletons on the page.
- **Fix:** Drop the override and let `<Skeleton>` use `bg-skeleton-base`. If a lighter tint is needed on a raised card, adjust the skeleton token, not each call site.

### [P2][H] No group role / `aria-busy` / `aria-live` on the page-level loading regions
- **Category:** a11y / state-coverage
- **Evidence:** page-skeletons.tsx:15 outer `<div>` has no `role="status"`/`aria-busy`. `SkeletonGroup` (skeleton.tsx:351) exists precisely for this (`role="status" aria-busy="true"` + sr-only label) and is not used. Individual `<Skeleton>`s are `aria-hidden`, so a screen reader gets *nothing* during a full-page load.
- **Why:** A full-page route skeleton is the highest-value place for a busy announcement; silently rendering aria-hidden bars leaves AT users with no "loading" signal.
- **Fix:** Wrap each page skeleton's root in `SkeletonGroup` (or add `role="status" aria-busy="true"` + an sr-only "Loading dashboard…" label).

### [P2][J] Doc is inaccurate — claims "Built on LoadingSkeleton" but source only imports `ui/Skeleton`
- **Category:** docs
- **Evidence:** page-skeletons.md:25 "**Built on LoadingSkeleton + ui/Skeleton**"; :30 "compose LoadingSkeleton pieces". Source imports only `Skeleton` from `../ui/skeleton` (page-skeletons.tsx:5) — no LoadingSkeleton / CardSkeleton usage anywhere.
- **Why:** Docs describe a composition that doesn't exist; a consumer reading "built on LoadingSkeleton" is misled about how to extend/match these.
- **Fix:** Correct the doc to "assembled from `ui/Skeleton` primitives" (and, once F5 is fixed, "composes `<Card>`"). Also note the fixed 4-stat / 6-project / 5-property counts as gotchas.

### [P3][J] No story and no test for a public exported component
- **Category:** docs / state-coverage
- **Evidence:** No `page-skeletons.stories.tsx` and no `page-skeletons.test.tsx` exist (Glob found none). Three components are publicly exported (page-skeletons.tsx:188).
- **Why:** Stories are a stated publish gate (CLAUDE.md). Loading states are exactly what a visual/Chromatic story should lock in; there's no regression backstop for these layouts.
- **Fix:** Add a stories file (one story per skeleton, plus a dark + reduced-motion variant) and a light render/a11y test. Lower priority than the finish fixes above since these are static server components.

## Composability gaps
- Hand-rolls card surface (border + bg + radius + padding) three times instead of composing `<Card>` — the F5 drift StatCard was built to eliminate. Any Card finish change (radius, shadow, elevation-led edge) will silently desync the loading state.
- Layout is entirely fixed; only the outer `className` is customizable (documented). Acceptable for a page skeleton, but there is no slot/prop to tune counts (4 stats / 6 projects / 5 rows) so consumers whose real page differs get a mismatched placeholder. Consider optional `count`-style props or exposing the regional builders.
- Does not reuse the richer sibling primitives (`SkeletonAvatar`, `SkeletonText`, `SkeletonButton`, `SkeletonGroup`) that already encode these shapes; re-implements avatar stacks and text-line groups inline.

## Motion gaps
- `shimmer` const is a misnomer: it sets a color, not motion — the actual animation is Skeleton's inherited default `pulse`. Named intent and real behavior diverge.
- Uniform pulse across every element with no differentiation (M2) — acceptable for skeletons but not intentional; the real shimmer sweep available on `<Skeleton animation="shimmer">` is never used.
- Reduced-motion IS honored (inherited `motion-reduce:animate-none` from Skeleton default) — clean on M3.
- No entrance/exit motion on the skeleton→content swap is owned here (that's the consumer's), so not a gap for this unit.

## Polish plan (ordered steps to reach the finish bar)
1. **Kill the re-rolled surface (F5 + V2 + G4):** replace each hand-rolled card `<div>` with `<Card variant="…">` matching the real loaded card, or a shared server-safe surface-class constant. This fixes radius (→`rounded-surface`), edge treatment (→elevation-led), and single-source-of-truth in one move.
2. **Detokenize the bars (G2):** swap raw `[Npx]` widths/heights for `ds` size/spacing tokens mapped to the content each bar stands in for.
3. **Fix the fill + name (M4/G2):** rename/remove the `shimmer` const; let `<Skeleton>` use `bg-skeleton-base`; opt into `animation="shimmer"` explicitly if a sweep is desired.
4. **Announce loading (H):** wrap each root in `SkeletonGroup` or add `role="status" aria-busy` + sr-only label.
5. **Reuse siblings:** build the avatar stack / text lines from `SkeletonAvatar` / `SkeletonText` instead of inline bars.
6. **Docs + stories (J):** correct the "Built on LoadingSkeleton" claim; add a stories file (light/dark/reduced-motion) and a render/a11y test.

## Clean (rubric dims that pass)
- **V1 accent rail:** none. No colored left/top stripe on any tile.
- **V3 gradient text / V4 framework palette:** none. No `bg-clip-text`; no `indigo/violet/slate` — uses `surface-*`, `skeleton-*` tokens only.
- **V5 emoji / V8 pill spam / V10 numbering / V12 kicker:** none.
- **V6 blob/glass/glow:** none. Solid surfaces only.
- **G1 surface layering:** cards correctly on `bg-surface-raised` (surface-2), not surface-1.
- **G3 variant-axis drift:** no CVA here (pure layout), so no axis to drift.
- **M3 reduced-motion:** respected via inherited Skeleton default (`motion-reduce:animate-none`).
- **E1–E8 verbal tells:** doc + source comments are direct and clean; no em-dash tic in prose, no AI vocabulary, no meta-hedging.
- **I types:** clean — `forwardRef` + `displayName` on all three, typed `HTMLDivElement` refs, no `any`, prop interfaces exported.
- **Server-safe** correctly annotated (`// @server-safe`) and honored (no `'use client'`, no framer-motion import).
