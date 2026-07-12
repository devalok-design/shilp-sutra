# Wave 3 Audit — Data / Display

> Same rubric — internal DS compliance + benchmark vs shadcn/ui, Radix Themes, IBM Carbon, MUI/Material 3.
> **Special focus:** composition drift (memory flagged `StatCard`/`Card` re-rolling primitives).
> Scope: `Card`, `StatCard`, `Table`, `DataTable`, `Avatar`, `Progress`, `Skeleton`, `Pagination`.
> Date: 2026-07-12 · Method: source read + coverage check (all 8 docs+stories present ✓).

---

## Cross-cutting findings

### W3-0 — Composition drift status: mostly RESOLVED, two residuals 🟡 MEDIUM
The flagged `StatCard`/`Card` drift is **largely fixed** — `StatCard` now genuinely composes `<Card>`, `<CardContent>`, `<CardFooter>` and delegates `variant`/`size`/surface to it (`import { Card, CardContent, CardFooter, type CardSize } from './card'`). Good. Two residual re-rolls remain:

1. **StatCard reimplements a progress bar.** It defines an internal `ProgressBar` (`h-1 rounded-pill bg-surface-raised` + hand-wired `role=progressbar`/`aria-valuenow`) instead of composing the `<Progress size="sm">` component that already exists two files over. The `<Progress>` component even exports `progressIndicatorVariants` for exactly this reuse. Divergence risk: StatCard's bar has its own threshold color logic (`≥90 success, ≥70 warning`) that won't track changes to `Progress`.
2. **`SkeletonAvatar` drifts from `Avatar`** (see W3-1). A skeleton that doesn't match the real component's box is worse than no skeleton — it guarantees layout shift on load.

`DataTable` → `Table` composition is clean (DataTable renders the base `<Table>`). No drift there.

### W3-1 — Skeleton sub-components don't match the components they stand in for 🔴 HIGH (for a skeleton)
`Skeleton` ships 7 sub-components. Two size-mismatch the real thing:
- **`SkeletonAvatar`**: sizes `sm/md/lg/xl` = `h-8/h-10/h-12/h-16` (raw px). Real **`Avatar`**: sizes `xs/sm/md/lg/xl` = `h-ds-xs..h-ds-xl` (tokens). Different size *names* and different *values* → the placeholder is not the same box as the avatar it replaces.
- Meanwhile `SkeletonButton`/`SkeletonInput` correctly use `h-ds-sm/md/lg` tokens — so even *within Skeleton* the token discipline is split.

**Recommendation:** `SkeletonAvatar` should import `avatarVariants` (or its size map) so it's dimensionally identical to `Avatar` by construction. Same for any skeleton that mirrors a real component.

### W3-2 — Variable-driven spacing (Card + Table) is best-in-class ✅
`Card` sets `--card-spacing`/`--card-gap` once; container, slots, `CardBleed`, `CardAction`, `CardSection` all read the same pair — retune a whole card with one arbitrary property. `Table` mirrors it (`--table-py`/`--table-edge`) and **inherits `--card-spacing` when nested in a Card** so edge columns line up with the card's slots. **No reference DS (shadcn/RT/Carbon/MUI) has a card+table spacing system this coherent.** This plus the dev-time `warnOnUnwrappedTextChildren` guard makes Card the strongest single component audited so far. Keep and document as a pattern.

### W3-3 — Raw-px inside size maps (continuation of Wave 1 X-2) 🟡 MEDIUM
The exact pattern from Radio (Wave 1): the middle size uses a token, the edges use arbitrary px.
- `Avatar` status dot: `xs/md/xl` = `h-ds-*`, but `sm` = `h-[8px]`, `lg` = `h-[12px]`.
- `Avatar` badge: `text-[10px]`, `min-w-[16px]`, `leading-[16px]`.
- `Skeleton` avatar sizes (W3-1), `Table` `translate-y-[2px]`, `StatCard` sparkline `80×32` literals, `Progress` track `h-1/h-2/h-3`.
Folds into the X-2 audit-gate recommendation from Wave 1.

### W3-4 — SSR discipline correct ✅
`Table` and `Skeleton` are `// @server-safe` (pure, no client deps) — right call, they render server-side without a client boundary. `Card` is `'use client'` because its interactive branch uses framer-motion; the non-interactive branch pays that boundary too, but splitting it isn't worth the API complexity.

---

## Component scorecards

### 1. Card — Internal A · External A+
The best component in the audit so far.
- ✅ Variable-driven spacing (W3-2), 4 elevation/border variants (never double-edge — "shadow ring is the edge"), `color` edge, `orientation` h/v, and the `CardBleed`/`CardAction`/`CardSection` composition kit. Dev warning for unwrapped text children. Tokenized throughout (`spacing-ds-05b` etc.).
- 🟡 Nothing material. (Interactive path forces `'use client'` on all Cards — acceptable trade.)
- **External:** shadcn Card is 6 styling-only divs — no size, orientation, or bleed. RT has Card + separate `Inset` (our `CardBleed`) — we fold it in and add orientation/action corners. MUI has `CardMedia`/`CardActionArea`/`CardActions`; we cover the same needs with `CardBleed`/`CardAction`/`CardSection` **plus** the variable spacing they lack. **Best-in-class — we lead all four.**

### 2. StatCard — Internal B+ · External A
- ✅ Composes Card (drift resolved), rich metric tile: delta + direction arrows, sparkline (animated SVG draw), progress-to-target, secondary label, `flash` entrance, `accentStyle` (none/icon/tint), href/onClick with proper button/link a11y semantics + keyboard activation, loading skeleton, `label`/`title` alias.
- 🟡 **W3-0 residual: reimplements `Progress` as internal `ProgressBar`** rather than composing it. Also a bespoke `Sparkline` (reasonable — no chart primitive exists yet, but note it as a candidate to extract if a second component needs sparklines).
- **External:** MUI/Carbon have no first-class stat/metric tile (you assemble one from Card). RT none. shadcn none. Our StatCard is a differentiator — nobody ships this. Cost: it's a 480-line feature bundle.

### 3. Table — Internal A · External A
- ✅ `@server-safe`, density axis, `striped`, `numeric` cell (right-align + tabular-nums), `TableRowActions` (hover **and keyboard-focus** reveal, stays in tab order — WCAG 1.4.13), variable edge alignment with Card. Comments show deliberate token fixes ("0.44-era port bug", "shadcn muted/50 mis-map"). Strong.
- 🟡 `translate-y-[2px]` raw (checkbox nudge); `bg-surface-base` for zebra/footer band — verify that's the intended step vs surface-raised.
- **External:** shadcn Table is static divs. RT has no table. Carbon `DataTable` and MUI `Table` are heavier out of the box — but our base `Table` is intentionally the primitive layer; DataTable is where we compete (below).

### 4. DataTable — Internal A− · External A
- ✅ TanStack Table + TanStack Virtual. Opt-in flags: sortable/filterable/globalFilter/paginated/selectable/toolbar/editable/expandable/virtualRows/column-pinning, plus a **mobile card view** (`mobileView`). Composes the base `<Table>`. Clean context split across 8 files (context/body/header/toolbar/pagination/bulk-actions/card). Column `meta.align`/`hideBelow` typed via module augmentation.
- 🟡 ~1900 LOC across 8 files — the largest surface in the DS. Depends on `@tanstack/react-table` + `@tanstack/react-virtual` (confirm both are declared peers/deps and appear in the peer-map generator — a phantom-bundled grid dep would bloat consumers; memory flags a similar @tiptap issue).
- **External:** This is the real MUI-`DataGrid` / Carbon-`DataTable` competitor. Feature-for-feature we're close to Carbon's DataTable and MUI DataGrid (community) — sorting, selection, pagination, editing, expansion, virtualization. **Mobile card view is something neither MUI DataGrid nor Carbon ships.** We're behind MUI DataGrid Pro only (column pinning we have, but not grouping/aggregation/tree-data). Strong position.

### 5. Avatar — Internal A− · External A
- ✅ Token sizes (`h-ds-xs..xl`), shape (circle/square/rounded) via context to Fallback, status dot (`role=img`+label, online pulses), role ring, badge (number/dot/custom, 99+ cap, `role=status`), loading skeleton, **deterministic djb2 color hash** for fallbacks, size-scaled fallback text. Thoughtful.
- 🟡 W3-3 status-dot raw px (`sm`/`lg`), badge `text-[10px]`/`min-w-[16px]`.
- **External:** shadcn Avatar = image+fallback only. RT Avatar has color/fallback but no status/badge/ring. MUI Avatar+Badge+AvatarGroup ≈ parity (we have `AvatarGroup` in composed). Deterministic color + role ring put us slightly ahead of MUI's defaults.

### 6. Progress — Internal A · External A
- ✅ size (sm/md/lg), color (default/success/warning/error), `autoColor` threshold shifting, indeterminate (CSS keyframe, motion-reduce aware), `showLabel`, real width-animated determinate bar (`animate={{width}}` — a *legit* motion use, unlike the inert wrappers in Waves 1–2). Exports its variants for reuse (which StatCard should use — W3-0).
- 🟡 track heights `h-1/h-2/h-3` are raw-ish (tiny Tailwind scale — low concern).
- **External:** parity+ with all four. MUI adds a circular variant; we split that into `progress-ring` (separate component — reasonable). autoColor is a small edge.

### 7. Skeleton — Internal B · External A
- ✅ `@server-safe`, 7 presets (base + Avatar/Text/Button/Input/Chart/Image/Group), pulse/shimmer/none animations (motion-reduce aware), `SkeletonGroup` with `role=status`/`aria-busy` for the whole loading region, deterministic chart bar heights.
- 🔴 **W3-1: `SkeletonAvatar` size mismatch with `Avatar`** (different size names AND values → layout shift). 🟡 token split within Skeleton (Avatar sub raw px, Button/Input subs tokenized).
- **External:** shadcn Skeleton = 1 div. MUI Skeleton = text/circular/rect + wave/pulse. We ship far more presets — but MUI's `Skeleton` can auto-infer dimensions from children (`<Skeleton><Avatar/></Skeleton>`), which structurally avoids our W3-1 drift. Worth considering that pattern.

### 8. Pagination — Internal A · External A
- ✅ Token sizes (`h-ds-sm-plus`), `generatePagination` pure function (unit-testable, ellipsis logic), `PaginationNav` controlled convenience wrapper, `asChild` for framework links, `aria-current="page"`, full a11y (labels, sr-only "More pages"), 1-indexed documented.
- 🟡 `PaginationNav` has no page-size selector (Carbon's pagination does; DataTable's own pagination has one — so it exists in the system, just not in standalone `PaginationNav`).
- **External:** parity with shadcn (we added `generatePagination` + `PaginationNav`). MUI/Carbon parity; Carbon's built-in page-size select is the one gap.

---

## Wave 3 grade summary

| Component | Internal | External | Top defect |
|---|---|---|---|
| Card | A | **A+** | (none material) — best in audit |
| StatCard | **B+** | A | reimplements Progress bar (W3-0) |
| Table | A | A | `translate-y-[2px]`; verify zebra step |
| DataTable | A− | A | 1900 LOC; confirm tanstack peer-map |
| Avatar | A− | A | status-dot raw px |
| Progress | A | A | (minor track px) |
| Skeleton | **B** | A | SkeletonAvatar ≠ Avatar dims (W3-1) |
| Pagination | A | A | no page-size select in PaginationNav |

**Wave verdict:** The strongest wave yet on the *external* axis — `Card` leads all four references, `DataTable` competes with MUI DataGrid / Carbon DataTable and beats both on mobile card view, `StatCard` is a differentiator nobody else ships. The variable-driven Card+Table spacing (W3-2) is a genuine system-design achievement. Internal debts are narrow: (1) two composition residuals (StatCard→Progress, SkeletonAvatar→Avatar) where a component re-rolls something the DS already provides, (2) the same raw-px-in-size-maps hygiene issue from Waves 1–3. Nothing here is a design problem — it's reuse discipline.

---

## Recommended actions (ranked)

1. **W3-1 — Fix `SkeletonAvatar` to mirror `Avatar` sizing** (import `avatarVariants`). A skeleton that layout-shifts defeats its purpose. Highest correctness impact in the wave.
2. **W3-0 — StatCard should compose `<Progress>`** instead of its internal `ProgressBar`. Non-breaking; kills a divergence.
3. **DataTable — confirm `@tanstack/react-table` + `@tanstack/react-virtual` are in the peer-map** and not phantom-bundled (cross-check the derive-peer-map generator).
4. **Raw-px cleanup** (Avatar dot/badge, Table nudge, Progress track) — folds into Wave 1 X-2 audit-gate.
5. **Consider MUI's child-inferring Skeleton pattern** so skeletons can't drift from the components they replace.
6. **Add a page-size select to `PaginationNav`** (the logic already exists in DataTable's pagination).

> Next: **Wave 4 — Composed** (PageHeader — note the uncommitted working-tree changes — EmptyState, FilterBar, CommandPalette, StatusBadge, ContentCard, and the rest of `composed/`). Awaiting checkpoint.
