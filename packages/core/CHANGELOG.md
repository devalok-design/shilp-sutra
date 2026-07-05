# @devalok/shilp-sutra

## 0.45.0

### Minor Changes

- [#95](https://github.com/devalok-design/shilp-sutra/pull/95) [`f5385b3`](https://github.com/devalok-design/shilp-sutra/commit/f5385b385a149167cf05f7a14d9f1991ed37ef0c) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - AI docs overhaul: hosted MCP live, mcp-manifest.json ships, llms-full.txt/llms-quick.txt removed (BREAKING for doc-path consumers)
  - **NEW hosted MCP at `https://shilp-sutra.devalok.in/mcp`** — six read-only tools (`find_component`, `get_component`, `get_tokens`, `get_setup`, `upgrade`, `search_docs`). Every tool takes a `version` param; pass your installed version for version-exact props/tokens/migration answers. Connect: `claude mcp add --transport http shilp-sutra https://shilp-sutra.devalok.in/mcp`. Docs are served from published npm tarballs, so this release (0.45.0) is the coverage floor; `upgrade(from, to)` accepts older `from` versions as the migration path in.
  - **NEW `mcp-manifest.json`** at the package root — machine-readable component/token reference (122 components, 709 props, 281 tokens; react-docgen prop shape; schema in `mcp-manifest.schema.json`). The MCP's data source and the preferred structured read for agents without it.
  - **`llms.txt` is now a ~2.5K-token router** (llmstxt.org format): what exists + where to get detail. Prop tables and examples no longer live in it.
  - **REMOVED `llms-full.txt` and `llms-quick.txt`.** Fallback chain for MCP-less agents: `llms.txt` router → `docs/components/<tier>/<name>.md` (~3K tokens per component) → `mcp-manifest.json`. Tooling reading the removed paths must switch. See MIGRATION.md.
  - AGENTS.md, the bundled Agent Skill, and recipes updated to the MCP-first priority order. Composition data (compound parts, composes-with relations, contexts, anti-patterns) now parses from doc Composability sections into the manifest (grammar: `docs/specs/mcp-manifest-standard.md`).

- [#95](https://github.com/devalok-design/shilp-sutra/pull/95) [`9439e83`](https://github.com/devalok-design/shilp-sutra/commit/9439e83f8fb168f68596cce8bddd9480fae37871) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Card spacing becomes one CSS variable; CardBleed + horizontal cards; StatCard size axis; padding-fight cleanups

  **Card (`ui/card`):**
  - The `size` axis now assigns `--card-spacing` / `--card-gap` CSS variables; the container, all slots, `CardAction` corner insets, and the new `CardBleed` negations read the same pair. Rendered spacing is unchanged (sm 16/8, md 20/12, lg 24/16). `CardSizeContext` and the per-size class lookup maps are gone — slots work by CSS inheritance. Retune any card with a single override: `className="[--card-spacing:var(--spacing-ds-07)]"`.
  - **Added `<CardBleed side>`** (`x` | `top` | `bottom` | `y` | `all`) — full-bleed escape hatch that negates `--card-spacing`, the shilp-sutra equivalent of Radix Themes' `Inset` / Polaris `Bleed`. `top`/`bottom` inherit the card radius for cover media; `x` escapes a slot's inset for edge-to-edge bands. Direct children of Card are already full-width — don't use `x`/`all` there.
  - **Added `orientation="horizontal"` + `<CardSection>`** — sanctioned horizontal media card: the root becomes a padding-less row, the media pane owns the left edge, and `CardSection` re-establishes the py/gap rhythm from the same variables.
  - **Added** dev-only warning when Card receives bare text or textual elements (`<p>`, `<span>`, headings…) as direct children — the [#1](https://github.com/devalok-design/shilp-sutra/issues/1) "card padding looks broken" footgun (direct children get no horizontal inset by design).

  Compat: rendered pixels are identical; consumer `className` overrides on slots keep winning via tw-merge. Only CSS targeting the old literal classes (`px-ds-05b` on slots, `top-ds-05b` on CardAction) needs to move to the variables.

  **StatCard (`ui/stat-card`):**
  - **Added `size` prop** (`sm | md | lg`, delegated to Card). `sm` tightens padding to 16px and steps the value down to `text-ds-2xl` — for dense KPI rows and narrow stat grids.
  - Internal rhythm is now flex gap instead of stacked margins; `footer` renders behind a full-width rule instead of an inset `border-t`; loading skeleton gets `aria-busy`.

  **Padding-fight cleanups:** `NotificationPreferences` header no longer double-gaps (stale `pb-ds-04` removed); `DataTableCards` mobile rows compose `<Card size="sm">` instead of a hand-rolled 12px bordered box; Card stories/JSDoc and the make-kit spacing/surfaces guides no longer model `p-*` overrides on Card.

- [#95](https://github.com/devalok-design/shilp-sutra/pull/95) [`13e6f5a`](https://github.com/devalok-design/shilp-sutra/commit/13e6f5a78f96a72f39ae82b00c5c591b0318be74) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Table: restore row separators, fix invisible hover, variable-driven density, card-edge alignment

  The original shadcn port had lost TableRow's `border-b` (rows rendered as an unseparated slab) and mis-mapped `hover:bg-muted/50` to `hover:bg-surface-raised` — the card background, so row hover was invisible on any table inside a Card. Fixed, plus a density pass benchmarked against Radix Themes / Carbon / Polaris / Mantine / MUI:
  - **Rows** regain a hairline separator (`border-surface-border-subtle`); hover is `surface-raised-hover`; selected stays `accent-3`.
  - **`density` prop on Table** (`compact | standard | comfortable`) sets `--table-py` → rows ≈ 29 / 37 / 45px (was 29 / 53 / 85 via DataTable's per-cell classes). Header height tracks density instead of a fixed 40px. DataTable forwards its existing `density` state; per-cell `cellPadding` context threading is gone.
  - **Edge alignment:** cells are `px-ds-04` interior; first/last cells read `--table-edge`, which inherits `--card-spacing` inside a Card — table columns line up with the card's header/footer slots. Standalone tables fall back to 12px.
  - **Header** drops to `text-ds-sm` medium muted — quieter than the data, per the cross-system consensus.
  - **`striped` prop** — opt-in zebra (faintest surface step); hairlines remain the default.
  - **Sweep:** sort-button + expander hover tokens fixed; expanded row is a `surface-base` recess; sticky header bg is `surface-raised`; raw `h-24` empty states replaced with `py-ds-07`.
  - **DataTableCards** (mobile) now `variant="outline"` — a phone screen of stacked shadow cards accumulates lift (make-kit dense-list rule).

  Visible default change: standard rows tighten from ~53px to ~37px.

- [#95](https://github.com/devalok-design/shilp-sutra/pull/95) [`638fc28`](https://github.com/devalok-design/shilp-sutra/commit/638fc28000aa3c15bb16e1e920f146dda83ca37a) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Table structural features: TableRowLink, TableRowActions, numeric cells, animated + accessible row expansion
  - **`TableRowLink`** (`ui/table-row-link`) — whole-row navigation as a **real anchor**: cmd/ctrl+click, middle-click, and "open in new tab" work, and screen readers announce a link — none of which `onClick`-on-row gives. Stretch pseudo-element is anchored to the cell (Safari ignores `position:relative` on `<tr>`) and clipped by the table root's new `overflow-x-clip`. Keyboard focus draws a row-level ring (`has-[[data-slot=row-link]:focus-visible]` on TableRow). `stretch={false}` = title-only link that keeps row text selectable.
  - **`TableRowActions`** — action cluster revealed on row hover with the full a11y contract: opacity reveal (never `display:none`) so buttons stay permanently tabbable, `:focus-within` reveals on keyboard entry, always visible on touch (`pointer-coarse`), and a `persist` prop for always-visible mode. Reveal animates with `duration-fast-01 ease-productive-standard`.
  - **`numeric`** boolean on `TableCell`/`TableHead` — right-align + tabular figures in one prop.
  - **Row expansion (DataTable)** — `aria-expanded` now on the toggle button (was missing), visually-hidden header for the expand column, chevron rotation on motion tokens, and the expanded row animates open/closed (height + opacity, `springs.smooth`) with a `useReducedMotion` self-guard; virtualized tables keep the instant reveal.

### Patch Changes

- [#95](https://github.com/devalok-design/shilp-sutra/pull/95) [`c3287fe`](https://github.com/devalok-design/shilp-sutra/commit/c3287fe8a6de108adefee1690e5294ae6aed58fc) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - ColorInput: replace the default preset palette. The old presets were the raw Tailwind-500 set (`#6366F1` indigo, `#8B5CF6` violet, `#3B82F6` blue, …) — the "AI framework-default palette" tell, mislabeled "color-blind accessible." New presets are derived from the design system's own OKLCH brand scales (led by red, not indigo/violet), so they read as one intentional family. Story/doc examples updated off the raw Tailwind hexes.

- [#95](https://github.com/devalok-design/shilp-sutra/pull/95) [`c3287fe`](https://github.com/devalok-design/shilp-sutra/commit/c3287fe8a6de108adefee1690e5294ae6aed58fc) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - FilePreview: the video seek, volume, and audio scrub controls are now keyboard-accessible. They were plain `<div role="slider">` with pointer handlers only — no keyboard, no forced-colors support (a WCAG break). They now compose a shared `MediaSlider` built on the Radix Slider primitive (Arrow / Home / End, focus ring, high-contrast), styled slim with a hover/focus-reveal thumb (white on the dark video overlay, accent on light). Users can now also drag to seek, not just click. (The audio bar's mouse-only hover-time tooltip was removed.)

- [#95](https://github.com/devalok-design/shilp-sutra/pull/95) [`c3287fe`](https://github.com/devalok-design/shilp-sutra/commit/c3287fe8a6de108adefee1690e5294ae6aed58fc) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Separator: deprecate the `variant` prop and its `gradient` / `gradient-left` / `gradient-right` values. They were decorative (our anti-convergence layer flags decorative dividers) and never actually rendered in production — the class interpolated a runtime value (`linear-gradient(${deg}…)`) that the Tailwind 4 scanner can't emit, so it shipped as `bg-transparent`. Separator now always renders a solid hairline. The `variant` prop still type-checks (renders solid) and is removed in 0.45.0.

- [#95](https://github.com/devalok-design/shilp-sutra/pull/95) [`c3287fe`](https://github.com/devalok-design/shilp-sutra/commit/c3287fe8a6de108adefee1690e5294ae6aed58fc) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - SplitButton: the dropdown is now keyboard-accessible. It previously rendered a hand-rolled floating panel (`role="menu"`, positioned with `@floating-ui/dom`) that had no focus management, no arrow/Escape handling, and no focus return — keyboard and screen-reader users couldn't operate it (a broken ARIA contract). It now composes the DS **Popover** primitive: focus moves into the panel on open, Escape and outside-click dismiss, focus returns to the trigger, and on mobile it opens as a bottom sheet. The `dropdownContent` / `open` / `onOpenChange` / `placement` API is unchanged (the trigger now reports `aria-haspopup="dialog"`). Full menu semantics with arrow-key item navigation (via DropdownMenu) are planned for 0.45.0.

- [#95](https://github.com/devalok-design/shilp-sutra/pull/95) [`9e92db4`](https://github.com/devalok-design/shilp-sutra/commit/9e92db489bded38dedca06a721c9d175f15e2ee5) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Table: footer + selected-hover fixes, rich-cell recipes
  - **TableFooter** background was `color-mix(surface-raised 50%)` — invisible on cards (same mis-mapped shadcn `muted/50` family as the row-hover bug). Now a `surface-base` band with a top hairline.
  - **Selected+hover** rows get an explicit step (`data-[state=selected]:hover:bg-accent-4`) — previously the hover and selected classes tied on specificity and stylesheet order decided.
  - **Cell recipes** documented in `table.md` + new `RichCells` / `SelectedRows` stories: user cell (avatar + truncating two-line identity — comfortable density only, per the industry two-line rule), tag group with `+N` overflow, money cells (consistent decimals; negatives never color-only), qualitative-numbers-stay-left, muted em-dash for empty values. Density→avatar mapping: compact = text only, standard = `xs`, comfortable = `xs`/`sm`.

- [#95](https://github.com/devalok-design/shilp-sutra/pull/95) [`c3287fe`](https://github.com/devalok-design/shilp-sutra/commit/c3287fe8a6de108adefee1690e5294ae6aed58fc) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Remove the residual colored accent-rail tell from Toast, AI blocks, Schedule-view, and Chat mentions — extending the v0.44.0 Card decision (a colored side-stripe on a surface is the single most recognizable AI-generated-UI tell). Status/emphasis is now carried by the DS's own subtle surface (`bg-{status}-2`) plus a typed icon, dot, or token.
  - **Toast/Toaster:** the colored left rail is off by default; status is carried by the typed icon + the status-colored timer bar, and error toasts gain a faint `bg-error-2` surface tint. Opt back into the rail with `toast.error(msg, { showAccent: true })`.
  - **AI blocks:** low-confidence blocks now render a faint `bg-warning-2` wash + a "Low confidence" chip (via a shared `BlockShell`) instead of a warning left rail.
  - **Schedule-view:** calendar events drop the `border-l-[3px]` rail in favor of a solid category dot before the title (color-blind-safe, survives forced-colors).
  - **Chat:** `highlight="mention"` no longer tints/rails the message row — the mention is carried by the in-content `@`-token; a `data-highlight` attribute remains as a styling hook.

## 0.44.1

### Patch Changes

- [#89](https://github.com/devalok-design/shilp-sutra/pull/89) [`1760ba6`](https://github.com/devalok-design/shilp-sutra/commit/1760ba661179b44e07f6993dc3991a7788a5f06c) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Add the missing `./ui/truncated-text` subpath export.

  0.44.0 shipped the new `TruncatedText` primitive in `dist/` and re-exported it
  from the package root (`@devalok/shilp-sutra` and `@devalok/shilp-sutra/ui`), but
  the granular subpath was never added to `package.json#exports`. As a result:

  ```ts
  import { TruncatedText } from '@devalok/shilp-sutra/ui/truncated-text'
  // -> Module not found, before 0.44.1
  ```

  Root-barrel imports were unaffected and continue to work. This patch restores
  parity with every other `./ui/*` component.

  To prevent recurrence, `pre-publish-audit.mjs` now gates on every flat
  `src/ui/*.tsx` component having a matching `./ui/<name>` subpath export (or an
  explicit barrel-only allowlist entry). The SSR smoke test iterates the exports
  map, so it now also imports `truncated-text` — closing the gap that let this slip.

## 0.44.0

<!-- breaking-summary:start -->

> ### ⚠️ Breaking in 0.44.0
>
> - `Card`: removed `accent` / `accentColor` (the colored edge-bar) — use `<CardAction>` for corner content or `color` for a tinted border.
> - `StatCard`: `surface` → `variant` (`raised`→`default`, `flat`→`outline`); now composes `<Card>`.
> - `ContentCard` deprecated — compose `Card` + slots directly (still ships; removal in a later minor).
>
> See [`MIGRATION.md`](../../MIGRATION.md) and `docs/recipes/upgrading.md` before bumping.

<!-- breaking-summary:end -->

### Minor Changes

- [#87](https://github.com/devalok-design/shilp-sutra/pull/87) [`7abf33d`](https://github.com/devalok-design/shilp-sutra/commit/7abf33d26c04871e5cf8dc1c74be6b8892451bca) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Card system overhaul: gap-model padding, composable corner slots, a truncation primitive, and an anti-convergence sweep.

  **Breaking**
  - `Card`: removed `accent` / `accentColor` (the decorative colored edge-bar). Use `<CardAction>` for corner content or `color` for a tinted border. A colored rail on a bordered, shadowed card is an AI tell (make-kit rule [#6](https://github.com/devalok-design/shilp-sutra/issues/6)).
  - `StatCard`: renamed `surface` → `variant`, widened to a 4-way scale (`default` | `elevated` | `outline` | `flat`). StatCard now composes `<Card>`, so surface/padding/elevation live in one place. `surface="raised"` → `variant="default"`, `surface="flat"` → `variant="outline"`.
  - `ContentCard` deprecated (`@deprecated` JSDoc) — compose `Card` + `CardHeader`/`CardContent`/`CardAction` directly. Still ships; removal in a later minor.

  **Added**
  - `<CardAction>` — composable corner slot (4 placements, size-aware inset, optional `tuck` to align an icon button's glyph to the content edge). `Card` is now `relative` to anchor it.
  - `StatCard` `deltaPlacement="block" | "inline"` — inline rides the value's baseline for compact dashboards.
  - `<TruncatedText>` — text primitive with `end` / `clamp` / `middle` truncation and overflow-aware tooltip recovery (tooltip only when actually clipped; full string is always the accessible name). Applied across ~25 file/email/user-text/nav sites.
  - `--text-ds-2xs` (9px) micro-type token.

  **Changed (no migration)**
  - `Card` uses a gap-model layout — the container owns vertical padding + inter-slot gap; slots own only horizontal padding, so adding/removing a slot can't unbalance the bottom edge.
  - Replaced colored left-rails with tinted rows in `master-detail`, chat mention highlights, and sidebar active state (anti-convergence).
  - 12 hand-rolled button sites now compose `<Button>`; chat inline-edit composes `<Textarea>`.
  - Long filenames/emails/user names/nav labels truncate with recovery instead of wrapping or silently clipping. Re-baseline Chromatic if you snapshot the DS.

## 0.43.0

<!-- breaking-summary:start -->

> ### ⚠️ Breaking in 0.43.0
>
> - Anti-convergence surface & elevation pass — components no longer stack a visible border and a drop shadow on the same element (the DS's own make-kit Guidelines rule [#6](https://github.com/devalok-design/shilp-sutra/issues/6): the shadow tokens already carry a 1px ring).
>
> See [`MIGRATION.md`](../../MIGRATION.md) and `docs/recipes/upgrading.md` before bumping.

<!-- breaking-summary:end -->

### Minor Changes

- [#82](https://github.com/devalok-design/shilp-sutra/pull/82) [`02d3826`](https://github.com/devalok-design/shilp-sutra/commit/02d3826fc82aff75a8f2a592b35cf38ff2aeec95) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Anti-convergence surface & elevation pass — components no longer stack a visible border and a drop shadow on the same element (the DS's own make-kit Guidelines rule [#6](https://github.com/devalok-design/shilp-sutra/issues/6): the shadow tokens already carry a 1px ring).

  **Breaking: `StatCard` `accent` prop removed.** The colored left-rail (`accent="success" | "error" | …`) is gone (it was the single most recognizable AI design tell — an accent rail on a rounded, shadowed card). Replace with the new accent system, or drop it (the `delta` already carries trend direction + colour):

  ```diff
  - <StatCard label="Revenue" value="$48k" accent="success" />
  + <StatCard label="Revenue" value="$48k" accentStyle="tint" />
  + <StatCard label="Revenue" value="$48k" icon={<IconCurrencyDollar />} accentStyle="icon" />
  ```

  **New — `StatCard` surface, accent & motion (all composable, all opt-in):**
  - `surface="raised" | "flat"` (default `raised`) — elevation-led (ring-in-shadow, no border) or border-led (border, no shadow).
  - `accentStyle="none" | "icon" | "tint"` (default `none`) + `iconFill="soft" | "solid"`.
  - `flash` + `flashSpeed` — opt-in entrance animation: a toned state glyph (`'up' | 'down' | 'goal' | 'record' | 'alert' | 'live'`, or `{ tone, icon }`) flashes, then settles to the metric's `icon`. Gated by `prefers-reduced-motion`.

  **New — `StatFlash` component.** The state→identity flash primitive used by StatCard's `flash`, exported standalone for use in list rows, badges, etc. Composable speed (`speed` preset + `holdMs` / `settleTransition` / `flashTransition` overrides).

  **Visual changes (non-breaking):**
  - Overlays (Dialog, AlertDialog, Popover, HoverCard, Dropdown/Context/Menubar menus, Select, Combobox, Autocomplete, NavigationMenu, Toast, ColorInput picker, SplitButton menu, DataTable bulk actions, floating Sidebar) drop their explicit `border`; the shadow's own ring carries the edge. `--shadow-floating` / `--shadow-overlay` ring strengthened (0.04 → 0.09); dark mode uses a light ring via the new `--shadow-edge-ring` token.
  - `Card` `default` / `elevated` are now ring-in-shadow (no border). Use `variant="outline"` for a border-led card.
  - `StatCard` base no longer stacks border + shadow.
  - `InputOTP` cells are border-led (dropped the redundant `shadow-raised`).

## 0.42.1

### Patch Changes

- [#80](https://github.com/devalok-design/shilp-sutra/pull/80) [`fb73847`](https://github.com/devalok-design/shilp-sutra/commit/fb73847bbea2ac496ec36f1552c93f621e4887c6) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Document the Figma Make kit shipped in 0.42.0:
  - `llms.txt` — new "NEW (v0.42.0)" entry pointing to `make-kit/` + the consumer setup walkthrough.
  - `AGENTS.md` — new "Figma Make" section so coding agents route users to the kit setup page when they ask about Figma Make.
  - README — Make-kit badge + section linking to https://shilp-sutra.devalok.in/figma-make.

  No code change. Tarball gains ~1 KB of docs.

## 0.42.0

### Minor Changes

- [#77](https://github.com/devalok-design/shilp-sutra/pull/77) [`c564477`](https://github.com/devalok-design/shilp-sutra/commit/c564477b247ffffef8e2ccb19660db694f49c219) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Ship Figma Make kit guidelines. New `make-kit/` directory in the published tarball at `node_modules/@devalok/shilp-sutra/make-kit/` containing:
  - `Guidelines.md` — top-level entry, product character + mandatory rules.
  - `setup.md` — install + provider tree + Vite config.
  - `foundations/` — 7 files (color, typography, spacing, surfaces, radius, motion, dark-mode, icons).
  - `components/overview.md` — catalog + decision trees across actions / inputs / overlays / feedback / nav / layout / data display.
  - `components/{button,card,input,dialog,badge,select,tabs,toast,form,table,dropdown-menu,popover,text,stack,icon}.md` — 15 component deep guides.

  Authored for Figma Make to consume when registering this package as a Make kit (per https://developers.figma.com/docs/code/bring-your-design-system-package/). Use these files as paste-in content when configuring the kit in Figma Make.

  New subpath exports: `@devalok/shilp-sutra/make-kit` → `Guidelines.md`, `@devalok/shilp-sutra/make-kit/*` → individual files.

  Smoke-tested in a fresh Vite 8 + React 19 + TW4 + framer-motion 12 app — build green, dev server clean, DS utilities emit. shilp-sutra is Figma Make kit eligible as of this release.

## 0.41.0

### Minor Changes

- [#72](https://github.com/devalok-design/shilp-sutra/pull/72) [`1bb9bd9`](https://github.com/devalok-design/shilp-sutra/commit/1bb9bd9bd6fb84672d0258c43233cf15907b86aa) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - feat(release): ship a machine-readable `BREAKING.json` manifest

  Closes the structured-data half of devalok-design/shilp-sutra#62. AI agents and migration tooling can now answer "what breaks between X and Y?" programmatically instead of parsing CHANGELOG prose.

  ### What ships
  - **`packages/core/BREAKING.json`** — manifest of every breaking change per version, categorised: `moved` (import-path change), `narrowed` (prop type accepts less), `removed`, `renamed`, `notes`. Populated with the full 0.40.0 data: all 27 barrel→subpath moves + the 17-component Icon API narrowing (`React.ReactNode` → `IconInput`), with peer-dep and eslint-rule cross-refs on each move.
  - **`packages/core/BREAKING.schema.json`** — canonical JSON Schema for the manifest. Editors auto-validate via `$schema`.
  - **Two new subpath exports** — `@devalok/shilp-sutra/BREAKING.json` and `@devalok/shilp-sutra/BREAKING.schema.json`. Consumers can `import manifest from '@devalok/shilp-sutra/BREAKING.json'`.
  - **Tarball ships both files** (added to `files[]`).

  ### What the publish mechanism enforces
  - **New pre-publish-audit gate** (`scripts/validate-breaking-manifest.mjs`) — runs as part of every release:
    - manifest structurally valid (required fields, allowed fields, array shapes)
    - every `moved.to` path resolves against the current `package.json#exports` (catches stale manifest entries pointing at non-existent subpaths)
    - **discipline check:** if the current version's CHANGELOG section contains a breaking signal (`feat!` / `**Breaking.`) AND the manifest has no entry for that version → audit fails. Mirrors the `/publish-release` narrowing-is-breaking checklist with tooling teeth.

  ### Consumer usage

  ```js
  import manifest from '@devalok/shilp-sutra/BREAKING.json'

  const fromV = '0.39.0'
  const toV = '0.40.0'
  // Versions between fromV+1 and toV
  const breaksInRange = Object.entries(manifest.versions).filter(
    ([v]) => v > fromV && v <= toV,
  )
  // breaksInRange.flatMap(([_, e]) => e.moved) → every import-path change to apply
  // breaksInRange.flatMap(([_, e]) => e.narrowed) → every type narrowing to inspect
  ```

  Recipes (`docs/recipes/upgrading.md`), `AGENTS.md`, `llms.txt`, and `llms-quick.txt` now route agents at the manifest first, prose second.

  ### Why minor, not patch

  New tarball-shipped file + two new subpath exports = new public API surface. Per `CONTRIBUTING.md → Versioning`, any new public surface is a real semver event → minor under 0.x.

  ### What this does NOT cover
  - The `migrate` CLI from [#62](https://github.com/devalok-design/shilp-sutra/issues/62) item [#5](https://github.com/devalok-design/shilp-sutra/issues/5) — deferred. The eslint plugin's `migration` preset already does the mechanical autofixes; a CLI wrapper that reads `BREAKING.json` is a future build.
  - Backfill of pre-0.40.0 breaking changes — added on demand, not retroactively (per the existing codemod policy).

### Patch Changes

- [#48](https://github.com/devalok-design/shilp-sutra/pull/48) [`513ea40`](https://github.com/devalok-design/shilp-sutra/commit/513ea408dbbc57c020c0777d60cf1c8b860120c3) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - docs(recipes): fix Next.js App Router cold-install friction surfaced by dogfood test

  A cold-install dogfood test against `pnpm create next-app@latest` on Next 16.2.6 + Turbopack + React 19.2 + pnpm 10.30 (2026-05-25) surfaced seven friction points in `install-next-app-router.md`. Recipe still worked end-to-end, but every friction point was a place an AI agent could trip naively. This release updates the recipe.

  ### What changed
  - **Added "Tested on" matrix** at the top of the recipe so agents know the exact stack we last verified against.
  - **`src/app/globals.css` is now listed as the priority-1 location** for the global CSS file (Next 14+ default; was priority-2 in the old recipe).
  - **§ 4b now explicitly tells agents to replace the entire scaffold `globals.css`**, not just append. The scaffold writes `:root` color vars, an `@theme inline` block linked to Geist font vars, a `prefers-color-scheme` block, and a `body { font-family: Arial }` block — any of which can silently override shilp-sutra tokens.
  - **§ 5 calls out Turbopack** as the Next 16 default and confirms `transpilePackages` is respected.
  - **§ 3 PostCSS step rewritten** to say "verify or create" — Next 14+ scaffolds the correct file. Agents were burning cycles re-creating it.
  - **§ 6 layout.tsx replacement now explicitly lists the scaffold lines to remove** — `next/font/google` Geist imports, the `${geistSans.variable}` className on `<html>`, and the `min-h-full flex flex-col` className on `<body>`. Naive agents kept the Geist imports running alongside shilp-sutra's fonts.
  - **§ 7 page.tsx replacement notes the scaffold's existing Vercel marketing layout** so agents know they're replacing real content.
  - **§ 8 gotchas adds three new entries**:
    - Scaffold's `body { font-family: Arial }` wins the cascade over shilp-sutra fonts if kept (most common silent break).
    - Auto-generated `pnpm-workspace.yaml` from pnpm 10+ — harmless standalone, broken inside a monorepo.
    - Auto-generated `AGENTS.md` from `create-next-app` uses `<!-- BEGIN:nextjs-agent-rules -->` markers; shilp-sutra's use `<!-- BEGIN:shilp-sutra-agent-rules -->` — they coexist, but worth knowing.

  ### Why patch, not minor

  Recipe content updates that clarify existing setup do not widen public API surface. They make the same recipe land successfully on more environments. No new exports, no behavior change, no new dependency.

## 0.40.1

### Patch Changes

- [#64](https://github.com/devalok-design/shilp-sutra/pull/64) [`9c91ca6`](https://github.com/devalok-design/shilp-sutra/commit/9c91ca6d804e97c96bdcf74c2303ad6469c73446) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - docs: correct the F-10 Icon API "non-breaking" label — it is a narrowing for `React.ReactNode` props

  The 0.40.0 changelog + `MIGRATION.md` described F-10 (Icon API unification) as **"Non-breaking. Type widening only. Every call site that compiled before keeps compiling."** That is wrong for the 14 components whose `icon` prop was previously `React.ReactNode`.

  `IconInput` is `React.ReactElement | React.ComponentType<{ className?; size? }> | null | undefined` — it **excludes** `string`, `number`, and iterables that `React.ReactNode` allows. So for any component that was on `ReactNode`, 0.40.0 is a type **narrowing**, not a widening. A consumer who stores icons in a `Record<string, React.ReactNode>` map or a `icon?: React.ReactNode` field and passes them to `CommandItem.icon`, `ActivityItem.icon`, or `Chat.Message.Avatar` fails `tsc` on 0.40.0 even though the runtime JSX is valid.

  Reported by the karm-v2 consumer agent (devalok-design/shilp-sutra#61) — 3 call sites broke. Build-time only, no runtime impact, trivial fix (retype the icon source to `React.ReactElement`), but the "non-breaking" label let an initial low-risk assessment form before the break was discovered.

  This patch corrects the wording in `MIGRATION.md → v0.40.0` and `llms.txt` to "mostly non-breaking, one narrowing" with the exact retype fix and affected props. No code change.

## 0.40.0

<!-- breaking-summary:start -->

> ### ⚠️ Breaking in 0.40.0
>
> - feat!: barrel peer-cliff cleanup — remove 12 hard-peer re-exports from `/ui`, `/composed`, `/ai`, `/ai/blocks` barrels
>
> See [`MIGRATION.md`](../../MIGRATION.md) and `docs/recipes/upgrading.md` before bumping.

<!-- breaking-summary:end -->

### Minor Changes

- [#57](https://github.com/devalok-design/shilp-sutra/pull/57) [`eb20cc0`](https://github.com/devalok-design/shilp-sutra/commit/eb20cc097cc09ed8bec7bd206acf9a86d2eed906) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - feat: F-10 — Icon API unification across 22 components (single `IconInput` type)

  **Non-breaking.** Type widening only. Every call site that compiled before keeps compiling.

  ## Why

  Before this release the design system had **6 distinct prop type signatures for the same conceptual "icon"** across 22+ icon-accepting components: `React.ReactElement`, `React.ReactNode`, `React.ReactNode | ComponentType<{className}>`, `ComponentType<{className}>`, `IconProps['icon']`, and (in Toast internals) `ForwardRefExoticComponent<any>`. Consumers had to memorize per-component conventions. Stories drifted. Five separate `iconSizeMap` declarations cropped up across component sources. Dual-detect logic was duplicated in EmptyState + StatCard. Twenty-three of twenty-five components silently ignored size context.

  ## What changed

  ### Foundation (new exports)

  ```ts
  import type { IconInput } from '@devalok/shilp-sutra/ui/lib/icon-input'
  import { normalizeIcon } from '@devalok/shilp-sutra/ui/lib/normalize-icon'

  type IconInput =
    | React.ReactElement
    | React.ComponentType<{ className?: string; size?: number | string }>
    | null
    | undefined

  function normalizeIcon(
    input: IconInput,
    fallbackSize?: IconSize,
  ): React.ReactNode
  ```

  `normalizeIcon` passes React elements through, wraps Tabler-shaped forwardRef refs in `<Icon icon={…} />` (so they participate in `IconContext`), and renders plain function components directly. Falls through to `null` for `null`/`undefined`. 16 vitest tests cover all branches + the type compatibility surface.

  ### Consumer-facing API: every icon prop accepts all four shapes

  ```tsx
  <Button startIcon={<Icon icon={IconPlus} />}>OK</Button>   // canonical
  <Button startIcon={<IconPlus />}>OK</Button>                // raw Tabler element
  <Button startIcon={IconPlus}>OK</Button>                    // component ref
  <Button startIcon={<span>+</span>}>OK</Button>              // custom node
  ```

  ### 22 components migrated

  | Layer          | Components                                                                                                                                                                                                           |
  | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | ui (P1)        | Button, IconButton                                                                                                                                                                                                   |
  | ui leaf (P2)   | Badge, Combobox, SegmentedControl, Stepper, StatCard, TreeItem (TreeNode.icon), OAuthButton (icon + linkedIcon)                                                                                                      |
  | chat + ai (P3) | Chat.Message.Avatar, Chat.Message.Action, Chat.SystemMessage, AIConversation (agent.icon), AICommandProvider (agent.icon), CommandBar (item.icon)                                                                    |
  | composed (P4)  | EmptyState (kill dual-detect), BulkActionBar (loosen from IconProps['icon']), ActivityFeed, CommandPalette                                                                                                           |
  | shell (P5)     | TopBar (UserMenuItem + TopBar.IconButton), Sidebar (NavItem + NavSubItem + footer.promo — three sites collapsed to one), BottomNavbar, AppCommandPalette (SearchResult.icon), CommandRegistry (CommandPageItem.icon) |

  ### Internals collapsed
  - 5 duplicate `iconSizeMap` declarations across Badge/Combobox/EmptyState/StatCard/etc. → one shared `<IconProvider size={token}>` pattern at each call site
  - 2 duplicate dual-detect branches (`isValidElement(icon) || '$$typeof' in icon`) → one shared `normalizeIcon()` helper
  - `React.createElement(icon, {className})` workarounds across EmptyState/StatCard → call through `normalizeIcon`

  ### Strict-to-loose newly-accepted call sites
  - `SegmentedControl options[*].icon` previously rejected `<IconX />` instantiated elements (only accepted bare component refs)
  - `BulkActionBar actions[*].icon` previously rejected non-Tabler nodes
  - `Chat.Message.Action.icon` previously required `IconProps['icon']` strict Tabler shape
  - All three now accept `IconInput`

  ### Tests
  - 16 new tests in `src/ui/__tests__/normalize-icon.test.tsx` covering all four input shapes, IconProvider context propagation, type compatibility, and the `React.isValidElement` vs forwardRef vs plain-function-component decision tree.
  - `src/composed/empty-state.test.tsx` rewritten to assert px-rendered sizing via `IconProvider` (the new contract) instead of className-based sizing (the old leak).

  ### Not in this patch
  - **Toast internal icons** (`TOAST_TYPE_CONFIG.icon`) keep their sonner ForwardRefExoticComponent shape. Internal config, not a consumer prop — out of scope.
  - **Stories cleanup** (remove `className="h-4 w-4"` overrides from `.stories.tsx`) — voluntary, behavior unchanged.
  - **`pre-publish-audit` Icon API gate** — deferred. The current test coverage + typecheck catches regressions for now.

  ## Closes
  - tbf-tracker F-10 (Icon API consistency) — full scope. Promoted from "accept both at edges" to deep three-layer unification (type alias + normalizer + per-component IconProvider).

  ## Migration checklist for consumers
  1. **Nothing required.** All existing call sites continue to compile.
  2. **Voluntary cleanup:** delete `className="h-4 w-4"` (or similar) overrides on icon prop usages — `IconProvider` now sizes correctly via context.
  3. **New API in your own wrappers:** import `IconInput` + `normalizeIcon` for components that accept icons-like props.

  See `MIGRATION.md → v0.40.0` for the full per-component before/after.

- [#57](https://github.com/devalok-design/shilp-sutra/pull/57) [`a2596bd`](https://github.com/devalok-design/shilp-sutra/commit/a2596bdb206502ac5dc868ca1fd764b77006ef6c) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - feat: F-18 `llms-quick.txt` + F-10 P7 stories cleanup + F-10 P8 Icon API audit gate + StatusBadge migration

  Three small wins finishing Wave 5.

  ## F-18 — `llms-quick.txt` ships in the npm tarball

  New file `packages/core/llms-quick.txt` (~4.5K tokens, 247 lines). Strict slice of `llms.txt` covering setup, peer-cliff matrix, hard constraints, Icon API contract, import-path cheatsheet, two-axis variant system, shadcn-difference table, top 30 components quick-ref, server-safe list, and the 13-symptom troubleshoot index. Fits in one Read call on every major AI agent (Claude Code, Cursor, Codex, Aider) without truncation.

  `AGENTS.md` updated to route agents to `llms-quick.txt` first, then `llms.txt` (~27K tokens), then `llms-full.txt` (~140K tokens) on demand.

  New pre-publish-audit gate `llms-quick.txt ≤ 15K tokens (≈60KB)` blocks future drift — if the slice creeps past the budget, the file loses its read-in-one-shot value and the audit forces a re-trim.

  ## F-10 P7 — stories cleanup

  Removed redundant `className="h-4 w-4"` icon overrides from stories that serve as docs:
  - `combobox.stories.tsx` — five `icon: <IconUser className="h-4 w-4" />` patterns simplified to `icon: <IconUser />`. `IconProvider` now sizes the icon from Combobox's size context, no className needed.
  - `Introduction.mdx` — Tabler icons section rewritten to teach the canonical `<Icon icon={X} />` shape + the IconInput contract (all four shapes work), replacing the old `<IconX className="h-4 w-4" />` recommendation.

  `toggle.stories.tsx`, `toggle-group.stories.tsx`, and other `.stories.tsx` files with `className="h-4 w-4"` were left alone — they pass icons as children (not as props), where className is the right escape hatch.

  ## F-10 P8 — pre-publish-audit Icon API gate

  New gate `Icon-prop components import normalize-icon`. Scans `src/{ui,composed,shell,ai}/**/*.{ts,tsx}` for any component declaring `icon`, `startIcon`, `endIcon`, `leftIcon`, or `rightIcon` as a prop. Requires that the file imports `normalize-icon` OR appears on an explicit allowlist.

  Allowlist (13 entries) covers:
  - Internal sonner pass-through (`toast.tsx`)
  - Type-only exports that don't render (`use-tree.ts`, `command-registry.tsx`, `ai-command-provider.tsx`)
  - Components forwarding icon props to another component that normalizes (`bulk-action-bar.tsx` → Button, `app-command-palette.tsx` → CommandPalette)
  - Internal Tabler config dicts (`error-boundary.tsx`, `priority-indicator.tsx`)
  - TipTap extension components with deliberately distinct shapes (`slash-command.tsx`, `rich-chat-input.tsx` ChatToolbarItem)
  - The `Icon` component itself and `IconButton` (routes through Button)

  Future component additions with an icon-shaped prop fail audit until either migrated or allowlisted with a reviewable comment.

  ## Plus — StatusBadge missed in Wave 5, migrated

  The audit gate caught `composed/status-badge.tsx` declaring `icon?: React.ReactNode` without going through `normalize-icon`. Migrated. `StatusBadge.icon` now takes `IconInput`; the trailing icon slot wraps in `<IconProvider size="xs">{normalizeIcon(icon)}</IconProvider>`. Consumer-facing call sites unchanged.

  ## Closes
  - tbf-tracker F-18 (`llms-quick.txt` for AI-agent read-cap fit)
  - tbf-tracker F-10 P7 (stories cleanup, voluntary surface)
  - tbf-tracker F-10 P8 (audit gate against drift)

  ## Skipped intentionally
  - **CLI (F-15)** — analysis showed ~25% of consumers benefit; the same engineering hours invested in F-18 / better recipes / Themer integration ship higher-leverage wins. Tracked for re-evaluation in 6 months once we have install telemetry.

  Wave 5 complete: F-10 (Icon API), F-11 (ESLint plugin), F-18 (quick file), F-22 (Toaster runtime warn) → subsumed by F-11's `prefer-per-component-import`, F-23 (TW3→TW4 codemod) → subsumed by F-11's autofix rules. F-15 (init CLI) deferred.

- [#57](https://github.com/devalok-design/shilp-sutra/pull/57) [`4c2b111`](https://github.com/devalok-design/shilp-sutra/commit/4c2b111174762b50d9a3c146c8c062bf0af0605c) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - feat(ui): add `OAuthButton` — brand-aware social/login buttons

  A purpose-built component for "Sign in with X" flows that previously had to be
  hand-assembled from `Button + IconBrandGoogle`. The Tabler-glyph approach had
  no shared copy convention across providers, no per-provider loading state, and
  no row pattern. This component bakes in the conventions that matter for
  conversion (brand colours, "Last used" hint, helper copy, iconOnly rows,
  linked-state for settings pages).

  New exports from `@devalok/shilp-sutra/ui/oauth-button`:
  - `OAuthButton` — composes on `Button`, inherits async/loading/sizes.
    - 13 providers: `google` `apple` `github` `microsoft` `x` `linkedin`
      `facebook` `discord` `slack` `gitlab` `sso` `email` `passkey`
    - `intent`: `continue` (default) / `signin` / `signup` drives the label.
    - `appearance`: `brand` (provider colour) / `outline` (DS neutral) /
      `dark` (unified Apple-style across all providers).
    - `icon` — drop in a brand-multicolour SVG to replace the default glyph.
    - `iconOnly` — square button with provider name kept in `aria-label`.
    - `compact` — short label (`"Google"` not `"Continue with Google"`).
      `aria-label` keeps the long form for screen readers. Good under an
      explicit "Or sign in with" divider.
    - `lastUsed` — inline right-edge pill rendered inside the button. The
      stronger conversion pattern is to combine this with `OAuthGroup`'s
      `reorderLastUsedFirst`, which promotes the provider to position 0.
    - `helperText` — reassurance copy below.
    - `data-provider` attribute for analytics.
    - **Dark-mode uniformity:** every brand appearance lands on the same DS
      surface in dark mode — brand identity comes from the glyph, not the
      background — so rows stay visually coherent.
  - `OAuthGroup` — stacked layout wrapper with consistent spacing.
    Optional `reorderLastUsedFirst` pulls a `lastUsed` child to position 0
    (Stripe-style ordering — a stronger conversion lever than a visual badge).
  - `OAuthDivider` — `or`-style horizontal rule between OAuth and email form.
  - `OAuthConnectionRow` — settings-page row representing a linked provider
    with Disconnect / (re-)Connect action.

  Default glyphs are sourced from `@tabler/icons-react` (already a peer dep).
  Pass `icon={<YourBrandSvg />}` to replace any glyph — useful when you want a
  provider's official multicolour mark from their own brand-guidelines page.

- [#57](https://github.com/devalok-design/shilp-sutra/pull/57) [`da368f0`](https://github.com/devalok-design/shilp-sutra/commit/da368f01bd62480a0a6896f1bad4b09f9d8d12ea) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - feat!: barrel peer-cliff cleanup — remove 12 hard-peer re-exports from `/ui`, `/composed`, `/ai`, `/ai/blocks` barrels

  **Breaking.** Twelve symbols that statically `import` optional peer dependencies have been removed from their parent barrels. Every symbol remains fully available via its per-component subpath. Search-and-replace migration is one line per symbol; full table in `MIGRATION.md` under `v0.40.0 — Barrel peer-cliff cleanup`.

  ## Why

  `peerDependenciesMeta.<peer>.optional = true` was a lie at the bundler level: barrels statically re-exported components whose source files contained top-level `import 'sonner'`, `import 'date-fns'`, `import { OTPInput } from 'input-otp'`, `import { useEditor } from '@tiptap/react'`, etc. Fresh consumer doing `import { Text } from '@devalok/shilp-sutra/ui'` without those peers installed → `Module not found: Can't resolve '<peer>'` at `next build` / `vite build` / `astro build`. Surfaced repeatedly across `tbf-tracker` (F-02), `hiring-platform`, and karm-v2.

  Tree-shaking can't drop a static import if the resolver fails first. Lazy-importing moves the failure to runtime, which is worse. Removing the barrel re-export is the only fix.

  ## What moved

  | Symbol family                                                                                                                                         | Old barrel          | New per-component subpath                                     | Peer pulled                                                       |
  | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------- |
  | `InputOTP*`                                                                                                                                           | `/ui`               | `/ui/input-otp`                                               | `input-otp`                                                       |
  | `toast`, `formatFileSize`, `Toast*`                                                                                                                   | `/ui`               | `/ui/toast`                                                   | `sonner`                                                          |
  | `Toaster`, `ToasterProps`                                                                                                                             | `/ui`               | `/ui/toaster`                                                 | `sonner`                                                          |
  | `DatePicker`, `DateRangePicker`, `DateTimePicker`, `TimePicker`, `CalendarGrid`, `MonthPicker`, `YearPicker`, `Presets`, `useCalendar` + all `*Props` | `/composed`         | `/composed/date-picker`                                       | `date-fns`                                                        |
  | `EmojiPicker`, `EmojiPickerPopover` + types                                                                                                           | `/composed`         | `/composed/emoji-picker`                                      | `@emoji-mart/data`, `@emoji-mart/react`                           |
  | `EmojiNode`, `EmojiNodeAttrs`                                                                                                                         | `/composed`         | `/composed/extensions/emoji-node` (**new subpath in 0.40.0**) | `@tiptap/*`                                                       |
  | `createEmojiSuggestion`                                                                                                                               | `/composed`         | `/composed/extensions/emoji-suggestion` (**new subpath**)     | `@tiptap/*`                                                       |
  | `FilePreview` + types                                                                                                                                 | `/composed`         | `/composed/file-preview`                                      | `react-pdf`, `react-zoom-pan-pinch`                               |
  | `MarkdownViewer` + types                                                                                                                              | `/composed`         | `/composed/markdown-viewer`                                   | `react-markdown`, `react-syntax-highlighter`, `remark-gfm`        |
  | `RichChatInput`, `AudioPlayer`, `AudioWaveform`, `useVoiceRecorder` + types                                                                           | `/composed`         | `/composed/rich-chat-input`                                   | `@tiptap/*`                                                       |
  | `RichTextEditor`, `RichTextViewer` + types                                                                                                            | `/composed`         | `/composed/rich-text-editor`                                  | `@tiptap/*`                                                       |
  | `BlockRenderer`, `BlockRendererProps`                                                                                                                 | `/ai`               | `/ai/block-renderer`                                          | `react-markdown`, `remark-gfm` (transitive via Text/Error blocks) |
  | `ErrorBlock`                                                                                                                                          | `/ai`, `/ai/blocks` | `/ai/blocks/error` (**new subpath**)                          | `react-markdown`, `remark-gfm`                                    |
  | `TextBlock`                                                                                                                                           | `/ai`, `/ai/blocks` | `/ai/blocks/text` (**new subpath**)                           | `react-markdown`, `remark-gfm`                                    |

  Seven other AI blocks (`BlockTable`, `ConfirmBlock`, `DividerBlock`, `InfoBlock`, `LoadingBlock`, `StatRowBlock`, `SuccessBlock`) are peer-cliff-free and stay in both `/ai` and `/ai/blocks` barrels.

  ## Per-chart subpaths added (non-breaking)

  New: `/ui/charts/area-chart`, `/ui/charts/bar-chart`, `/ui/charts/chart-container`, `/ui/charts/gauge-chart`, `/ui/charts/line-chart`, `/ui/charts/pie-chart`, `/ui/charts/radar-chart`, `/ui/charts/sparkline`. The `/ui/charts` barrel still works and still pulls all 9 d3-\* peers. Per-chart subpath pulls only the d3-\* peers that specific chart needs — `BarChart` = `d3-scale` + `d3-axis` + `d3-selection`; `PieChart`/`RadarChart` = `d3-shape` only. Documented in `llms.txt` as the preferred form for d3-conscious consumers.

  ## Build / packaging
  - `packages/core/vite.config.ts` — 8 new chart entries + 4 new ai/composed peer-cliff entries added to `explicitEntries`.
  - `packages/core/package.json#exports` — 12 new subpath entries (4 newly-added per-cliff + 8 per-chart).
  - No change to `peerDependenciesMeta` — peers stay `optional`. The lie was elsewhere.

  ## What didn't change
  - Component APIs, prop signatures, types, runtime behavior, default styles, accessibility.
  - Per-component subpaths that already existed in 0.39.x — consumers already importing per-component need zero changes.
  - Stories, tests, internal DS imports — all use relative paths, none were ever affected.

  ## Impact
  - `tbf-tracker` (fresh-consumer audit, 18 findings) — closes F-02 (`input-otp` cliff) + F-03 (per-chart subpaths). Other findings tracked separately.
  - `hiring-platform` — closes F-22 (silent sonner peer) docs angle; runtime warning still scheduled for Wave 4.
  - `karm-v2` 0.37→0.40 upgrade — uses `DatePicker`, `toast`, `Toaster`, `MarkdownViewer`, `RichTextEditor`. Estimated 80-120 line touchpoints; mostly one-line `from '@devalok/shilp-sutra/composed'` → `'@devalok/shilp-sutra/composed/date-picker'` etc. Migration recipe in MIGRATION.md.

- [#57](https://github.com/devalok-design/shilp-sutra/pull/57) [`5605a76`](https://github.com/devalok-design/shilp-sutra/commit/5605a760663f6d4dfaf69d7c8d7aaf0b0240cb2a) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - feat: polymorphic types for `Text`, `Stack`, `Container` — element-specific attrs now typecheck

  Components with an `as` prop now widen their accepted props based on the
  rendered element. Previously the `as` prop accepted any element at runtime
  but TypeScript only allowed props of the default element (`<p>` for `Text`,
  `<div>` for `Stack` + `Container`).

  ## Before

  ```tsx
  import { Text } from '@devalok/shilp-sutra/ui/text'

  // Runtime: works. TypeScript: ERROR.
  ;<Text as="label" htmlFor="email">
    Email
  </Text>
  //                ^^^^^^^ Property 'htmlFor' does not exist on type
  //                        '... & Omit<ComponentPropsWithRef<"p">, ...>'.
  //                        Did you mean 'for'?
  ```

  Same shape for `<Stack as="ul" role="list">`, `<Container as="main" aria-label>`.

  ## After

  All `as`-prop components now use a polymorphic type signature that preserves
  the generic across the call site. Element-specific attrs (`htmlFor` on
  `<label>`, `href`/`target` on `<a>`, `aria-label` on `<nav>`, etc.) typecheck
  correctly.

  ```tsx
  <Text as="label" htmlFor="email">Email</Text>      // OK
  <Text as="a" href="/x" target="_blank">link</Text> // OK
  <Stack as="ul" role="list">items</Stack>           // OK
  <Stack as="nav" aria-label="primary">items</Stack> // OK
  <Container as="main" aria-label="main">…</Container> // OK
  ```

  Default behavior unchanged — `<Text>`, `<Stack>`, `<Container>` without `as`
  keep their original element + accept original attrs.

  ## Why not just use the generic at the impl?

  `React.forwardRef` can't keep a generic parameter live across its return
  type — at the call site, `T` would be erased to the default. Fix is the
  standard polymorphic-component cast pattern (Radix, Mantine, Chakra all use
  the same shape):

  ```ts
  type TextComponent = <T extends React.ElementType = 'p'>(
    props: TextProps<T> & { ref?: React.ComponentPropsWithRef<T>['ref'] }
  ) => React.ReactElement | null

  const TextImpl = React.forwardRef<HTMLElement, TextProps>(...)
  const Text = TextImpl as unknown as TextComponent
  ```

  Runtime: identical. Types: strictly wider.

  ## Files
  - `packages/core/src/ui/text.tsx` — `TextComponent` cast added; `as?: React.ElementType` → `as?: T`.
  - `packages/core/src/ui/stack.tsx` — `StackComponent` cast added.
  - `packages/core/src/ui/container.tsx` — `ContainerComponent` cast added.
  - `packages/core/src/ui/__tests__/polymorphic-types.test.tsx` — new
    11-test typetest suite using Vitest's `expectTypeOf` covering `<label>`,
    `<a>`, `<nav>`, `<ul>`, `<main>`, `<section>`. Includes a
    `@ts-expect-error` regression check that `htmlFor` on `<p>` (the default
    for `<Text>`) still errors — we widen, we don't break.

  ## Breaking

  None. Strictly accepts more valid code. Existing code that typechecks today
  keeps typechecking.

  ## Closes
  - tbf-tracker F-01 — `<Text as="label" htmlFor="...">` and
    `<Stack as="ul">` now typecheck.

- [#57](https://github.com/devalok-design/shilp-sutra/pull/57) [`7eb7799`](https://github.com/devalok-design/shilp-sutra/commit/7eb77993cd4e12437b8fab75ca4fc73a752b3cfc) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - feat: Wave 4 — agent-friendly install experience

  Three changes that make the package easier to onboard for both human developers and AI coding agents (Codex, Cursor, Copilot, Aider, Claude Code, Windsurf, …):

  ## AGENTS.md ships inside the npm tarball

  The repo-root `AGENTS.md` is now copied into the package at publish time and is available to consumers at `node_modules/@devalok/shilp-sutra/AGENTS.md`. The 25+ tools that auto-discover `AGENTS.md` from a project root (Codex, Cursor, Copilot, Aider, Windsurf, Devin, Jules, Gemini CLI, Zed, Warp, JetBrains Junie, …) will now also find ours alongside the recipes.

  AGENTS.md is reframed as purely consumer-facing: "how to use shilp-sutra in a downstream app". Maintainer-internal docs (build pipeline, audit gates, internal patterns) stay in the repo-root `CLAUDE.md` and are not shipped.

  > Anthropic Claude Code doesn't auto-load AGENTS.md yet — symlink it (`ln -s AGENTS.md CLAUDE.md`) or copy the contents into your own CLAUDE.md so the same rules apply.

  Files: `packages/core/package.json#files` now includes `AGENTS.md`; `packages/core/scripts/copy-root-docs.mjs` copies repo-root AGENTS.md → `packages/core/AGENTS.md` at build time (gitignored, identical to the existing MIGRATION.md flow).

  ## `agents` field per npm-agentskills convention

  `packages/core/package.json` now declares an `agents` field per the [npm-agentskills](https://github.com/onmax/npm-agentskills) spec:

  ```json
  {
    "agents": {
      "skills": [{ "name": "shilp-sutra", "path": "./skill" }]
    }
  }
  ```

  Consumers running `pnpm dlx @codemcp/agentskills export` (or `pnpm dlx agentskills export --target claude`) will auto-discover the bundled skill and copy it into `.claude/skills/`, `.cursor/skills/`, `.github/skills/`, etc. No package-specific install command needed — opt into the emerging cross-tool convention.

  The existing manual paths (`cp -r node_modules/@devalok/shilp-sutra/skill ~/.claude/skills/shilp-sutra` and the curl installer) still work and are documented as fallbacks in the README.

  ## Pretty postinstall welcome banner

  `packages/core/scripts/welcome.mjs` (new) prints a Devalok-branded ASCII-lotus + setup hint when consumers install the package for the first time per major.minor:

  ```
  ╭───────────────────────────────────────────────────────────────╮
  │         ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀                 │
  │         ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⠟⠹⣧⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀                 │
  │              … (13-row Braille lotus) …                       │
  │                                                               │
  │   ✦  @devalok/shilp-sutra  0.40.0                             │
  │      Tailwind 4 design system · 110+ components · RSC-safe    │
  │                                                               │
  │   ▸ Setup recipe (pick your framework):                       │
  │     node_modules/@devalok/shilp-sutra/docs/recipes/           │
  │                                                               │
  │   ▸ Theme it in 30 seconds:                                   │
  │     https://shilp-sutra.devalok.in/themer                     │
  │                                                               │
  │   ▸ Wire your AI agent (Claude Code / Cursor / Codex):        │
  │     cp -r node_modules/@devalok/shilp-sutra/skill \           │
  │        ~/.claude/skills/shilp-sutra                           │
  │                                                               │
  │   Disable this banner: SHILP_SUTRA_NO_WELCOME=1               │
  │                                                               │
  │   Built by Devalok · devalok.in                               │
  ╰───────────────────────────────────────────────────────────────╯
  ```

  ### Safety guards (all silent failures, never throws)
  - `process.env.CI` set → silent
  - `process.env.SHILP_SUTRA_NO_WELCOME=1` → opt-out
  - `process.env.NO_COLOR` → strip ANSI
  - `process.stdout.isTTY === false` → silent (piped builds, Docker)
  - `npm_config_loglevel === 'silent'` → silent
  - `INIT_CWD` absent OR inside the package itself → silent (dev install)
  - Sentinel `node_modules/.shilp-sutra-welcomed` carries the version → re-fires only on version change
  - Terminal narrower than 70 cols / shorter than 28 rows → falls back to 6-line compact banner
  - Try/catch wraps everything → consumer install can never break because of this script

  ### Preview mode for maintainers

  `node packages/core/scripts/welcome.mjs --preview` (or `--compact`) bypasses all guards. Used to verify rendering before publish.

  ### Note for pnpm consumers

  Modern `pnpm` blocks postinstall scripts on dependencies by default for supply-chain safety. First-time pnpm consumers will see:

  ```
  WARN  postinstall scripts blocked — run `pnpm approve-builds` to allow
  ```

  …then the banner appears on the next install. `npm`/`yarn`/`bun` consumers see it immediately. This is the modern pnpm contract — same shape as `esbuild`, `sharp`, `husky`, etc.

  ## Updated troubleshoot.md

  New symptom entry: `Cannot find module 'sonner' / 'input-otp' / 'date-fns' / '@tiptap/react' / …`. Table maps each Wave-2 peer-cliff component to the install command. Counts ticked: 13 symptoms total (was 12).

  `<Toaster />`'s JSDoc also gained an ⚠ peer-required callout — IDE hover shows the `pnpm add sonner` hint inline.

  ## What this patch does NOT include
  - **F-22 runtime warning when Toaster mounts without sonner** — not achievable. `toaster.tsx` static-imports sonner, so if the peer is missing the file never loads and runtime code never runs. Replaced with louder JSDoc + the new troubleshoot table above.
  - **Consumer AGENTS.md mutation (F-17)** — deferred to Wave 5 init CLI. No file mutation in postinstall.

  ## Closes
  - tbf-tracker F-08a (ship AGENTS.md in tarball)
  - tbf-tracker F-08b (postinstall hint — implemented as pretty banner)
  - tbf-tracker F-16 (skill discoverability — via npm-agentskills convention)
  - hiring-platform F-22 (sonner peer surface — JSDoc + troubleshoot, runtime warn not possible)

### Patch Changes

- [#57](https://github.com/devalok-design/shilp-sutra/pull/57) [`f63e869`](https://github.com/devalok-design/shilp-sutra/commit/f63e8698f325ae7ecfef600c538f686092716d67) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - docs(recipes/llms/skill/AGENTS): close docs drift surfaced by three downstream consumer audits

  Three independent consumer audits against 0.39.0 landed in the last 48 hours
  (`tbf-tracker`, `hiring-platform`, `karm-v2` [#44](https://github.com/devalok-design/shilp-sutra/issues/44)). None reported runtime or
  type bugs — every finding was a documentation gap, a stale claim, or an AI
  agent following a doc rule that produced no-op churn. This patch fixes the
  documentation-only subset. No component code, types, runtime behavior, peer
  deps, or exports changed — safe to install over 0.39.0 with zero consumer
  edits.

  **Recipes** (`packages/core/docs/recipes/`)
  - All six install recipes (Next App Router, Next Pages, Vite, Astro, Remix,
    TanStack Start) now carry a `2a. Optional peer dependencies` table with
    exact `pnpm add` commands for `d3-*` (charts), `@tanstack/react-table` +
    `@tanstack/react-virtual` (DataTable), `date-fns` (date pickers), `@tiptap/*`
    (RichTextEditor), `input-otp`, `react-pdf` + `react-zoom-pan-pinch`
    (FilePreview), `react-markdown` + `react-syntax-highlighter`
    (MarkdownViewer), `@tabler/icons-react`. The README's "Optional Peer
    Dependencies" section existed but the per-framework recipes never linked
    to it — AI agents following the recipe linearly only discovered missing
    peers at the first `next build` failure.
  - `install-next-app-router.md` §1 — dropped stale "OR `pages/` exists with
    only `_app`/`_document`" clause. `create-next-app@16+` no longer scaffolds
    `pages/` for App Router projects.
  - `install-next-app-router.md` §8 — `p-3` vs `p-ds-03` rule reworded. DS
    spacing tokens (`p-ds-04`) and TW4 numeric scale (`p-4`) coexist by design
    per `tokens/semantic.css:68` — both are valid. The previous "use p-ds-04,
    not p-4" framing was pushing consumers (and their AI agents) into
    churn-PR territory. Explicitly say "do NOT mass-codemod" now.

  **`llms.txt`** (`packages/core/llms.txt`)
  - New "IMPORT PATH CHEATSHEET" section enumerating the exact subpath for
    every component whose import path is NOT the kebab-case of its name
    (`FormField` → `ui/form`, `AppSidebar` → `shell/sidebar`, charts barrel,
    date-picker family, AI primitives, motion primitives, hooks). Fresh AI
    agents no longer have to guess and hit a TS error before learning the
    truth.
  - `IconButton` entry rewritten to make the `icon=` prop vs `children`
    constraint loud: type omits `children` deliberately, raw
    `<IconButton><Icon /></IconButton>` is a TS error, correct form is
    `<IconButton icon={<Icon icon={X} />} aria-label="…" />`. Surfaced by
    hiring-platform's "discovery cost: I tried `children` first" note.
  - `toast` entry rewritten to spell out the positional signature
    `toast.success(message, options?)`. Previously implied object-first API
    (Mantine / Chakra-style), which hiring-platform reporter assumed and got
    wrong. Concrete examples for `success`, `error` with `description`,
    `promise`, `upload`. Reminder that calls without a mounted `<Toaster />`
    are no-ops.

  **Root docs**
  - `README.md`: troubleshoot.md tagline `8 most common breakages` → `12 most
common` (file actually has 12 `## Symptom:` headers).
  - `AGENTS.md`: line 64 "barrel will fail in RSC contexts" rewritten. With
    all peers installed Next 16 honours each per-file `"use client"` and the
    barrel works in RSC — what it does fail on is the peer-dep cliff
    (`input-otp` in `src/ui/index.ts:49`, etc.). New wording covers both:
    "Per-component imports keep RSC fast AND avoid peer-dep cliffs … the
    barrel forces hard peers to be installed AND inflates the client bundle.
    Existing barrel usage is not an emergency." Closes karm-v2 [#44](https://github.com/devalok-design/shilp-sutra/issues/44) sub-A.
  - `AGENTS.md`: line 65 "Use `p-ds-04`, not `p-4`" rewritten — explicit
    coexistence stance, "do NOT mass-codemod". Matches the design intent in
    `tokens/semantic.css:68`. Closes karm-v2 [#44](https://github.com/devalok-design/shilp-sutra/issues/44) sub-B.
  - `AGENTS.md`: troubleshoot tagline → "twelve most common breakages" with
    matching list (Tailwind tokens, framer-motion duplicates,
    `transpilePackages`, CSS import order, dark mode, RSC errors, font 404s,
    hydration, missing optional peer deps, bare `shadow`, missing
    `<Toaster />`, Storybook MCP 404).

  **Agent Skill** (`skills/shilp-sutra/SKILL.md` + bundled
  `packages/core/skill/SKILL.md`)
  - `metadata.version` `0.38.0` → `0.39.0` to match shipped package version.
    Skill had drifted one release behind.
  - Description "eight most common breakages" → "twelve most common".
  - New `scripts/sync-skill-version.mjs` chained into `pnpm version-packages`
    (`changeset version && node scripts/sync-skill-version.mjs`). Future
    changeset bumps now auto-update both skill source and bundled copy.

  **CI gate** (`scripts/pre-publish-audit.mjs`)
  - New gate: `skill/SKILL.md metadata.version matches
packages/core/package.json#version`. Checks both
    `skills/shilp-sutra/SKILL.md` (source) and `packages/core/skill/SKILL.md`
    (build artifact). Blocks future drift recurrence.

  **Investigated, no code change needed**
  - `hiring-platform` reported "Button height is more than Input height in
    comparable sizes". Verified via Playwright @2x against fresh storybook
    build: heights identical at every size (xs=28, sm=32, md=40, lg=48) and
    border-radii identical (`rounded-control` = 6px everywhere). Both
    components use the same `h-ds-*` and `rounded-control` semantic role
    tokens — confirmed across source, fresh build, and pixel measurements.
    Original observation was against a stale local storybook-static built
    before commit `e698df94` (shape-presets radius unification). Closed
    without code change.

  **What this patch does NOT cover** (tracked for 0.40.0 / 0.41.0)
  - Build / packaging: F-02 (barrel `input-otp` static-export drop), F-03
    (per-chart d3 split) → Wave 2.
  - Type system: F-01 (polymorphic Text/Stack generic loss) → Wave 3.
  - Agent integration: F-08a/b (ship AGENTS.md in tarball, postinstall hint,
    optional managed-block injection into consumer AGENTS.md), F-22
    (`<Toaster />` runtime warning when sonner missing) → Wave 4.
  - DX tooling: F-10 (icon API consistency), F-11 (eslint plugin — now
    open-question per F-19 coexistence stance), F-15 (init CLI), F-18
    (`llms-quick.txt` split), F-23 (TW3→TW4 codemod) → Wave 5.

  Each remaining finding will be its own changeset.

## 0.39.0

### Minor Changes

- [#46](https://github.com/devalok-design/shilp-sutra/pull/46) [`df0589c`](https://github.com/devalok-design/shilp-sutra/commit/df0589c186b0f671d4dd84e60029e97340f1899e) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - feat(skill): ship as an [Agent Skill](https://agentskills.io)

  Adds a bundled Anthropic Agent Skill at `skills/shilp-sutra/` (and inside the npm tarball at `node_modules/@devalok/shilp-sutra/skill/`) so AI coding agents — Claude Code, Cursor, Codex, Aider, and anything else that speaks the Agent Skills open standard — can load shilp-sutra's setup playbooks, component API, theming cookbook, RSC import patterns, and troubleshoot tree on demand.

  **Why:** Consumers reported that the design system was hard to onboard onto — you had to drill into each Storybook section to discover what was available, and there was no single drop-in for AI agents. The skill is one install away from full coverage:

  ```bash
  curl -fsSL https://raw.githubusercontent.com/devalok-design/shilp-sutra/main/skills/shilp-sutra/install.sh | bash
  ```

  **Layout:**
  - `skills/shilp-sutra/SKILL.md` — entry, navigation, hard constraints (~135 lines)
  - `skills/shilp-sutra/references/` — bundled cheatsheet (`components.md`), full reference (`components-full.md`), six setup playbooks, brand customization, RSC matrix, troubleshoot tree
  - `skills/shilp-sutra/install.sh` — one-liner installer (sparse fetch from GitHub)
  - `skills/shilp-sutra/README.md` — marketplace listing for skills.sh-style directories
  - `skills/shilp-sutra/LICENSE` — MIT

  **Single source of truth:** `scripts/build-skill.mjs` regenerates `skills/shilp-sutra/references/` from `packages/core/llms.txt`, `packages/core/llms-full.txt`, and `packages/core/docs/recipes/*.md`. The pre-publish audit gates on drift (`build-skill.mjs --check`) and on spec compliance (name format, description ≤1024 chars, body ≤500 lines per [agentskills.io](https://agentskills.io/specification)), so the skill cannot ship out of sync.

  **npm tarball:** `packages/core/scripts/copy-skill.mjs` runs in the post-build pipeline and copies the skill tree into `packages/core/skill/`. Declared in `files[]`, so `cp -r node_modules/@devalok/shilp-sutra/skill ~/.claude/skills/shilp-sutra` works after any `pnpm add @devalok/shilp-sutra`.

  **No runtime changes.** Package exports, peer deps, and CSS/component APIs are unchanged.

- [#46](https://github.com/devalok-design/shilp-sutra/pull/46) [`df0589c`](https://github.com/devalok-design/shilp-sutra/commit/df0589c186b0f671d4dd84e60029e97340f1899e) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - feat(tokens, ui): semantic radius roles + `[data-shape]` shape presets

  **Why:** Roundness is a brand axis (sharp = technical, rounded = consumer). Until now consumers could nudge individual `--radius-ds-*` primitives, but the components themselves baked in ad-hoc per-size radii — Button md (10px) was rounder than Button sm (6px), Input lg (10px) was rounder than Button lg (16px) at the same height, SegmentedControl's "pill" wasn't actually pill, Tooltip drifted from the rest of the overlay tier. This release makes radius role-based and consumer-customizable in one shot.

  **What's new:**
  1. **Eight semantic radius role tokens** in `packages/core/src/tokens/semantic.css` — `--radius-control`, `--radius-control-inner`, `--radius-surface`, `--radius-overlay-sm`, `--radius-overlay`, `--radius-overlay-lg`, `--radius-pill`, `--radius-bubble`. Components reference these, never the primitive `--radius-ds-*` scale.
  2. **Three shape presets** via `[data-shape]` attribute — set on `<html>` or any subtree:
     - `sharp` — 2/4/6 px (technical, dev-tool feel — Vercel/Linear/terminal)
     - `slightly-rounded` (the default if no attribute is set) — 6/10/16 px (modern SaaS — shadcn/Stripe)
     - `rounded` — 10/16/24 px (friendly, consumer — iOS/Notion)
  3. **Per-token overrides still work.** Consumers can override any role token globally or scoped:
     ```css
     :root {
       --radius-control: 4px;
     }
     .checkout {
       --radius-control: 8px;
       --radius-surface: 20px;
     }
     ```
  4. **Pre-publish audit gate.** `pre-publish-audit.mjs` now fails publish if any `rounded-ds-*` or bare `rounded-full` leaks back into `src/ui/**/*.tsx`. Use the role tokens. The gate is scoped to `src/ui/` only; `composed/` and `shell/` migration is the next release.

  **Breaking visual changes (no API breaks):** all changes are class-name swaps in the source; component prop APIs are unchanged. But consumers WILL see these on upgrade:

  | Component                | Before                | After                                | Why                                                     |
  | ------------------------ | --------------------- | ------------------------------------ | ------------------------------------------------------- |
  | Button md                | 10px                  | 6px                                  | Killed per-size radius scaling — same role, same radius |
  | Button lg                | 16px                  | 6px                                  | Same as above                                           |
  | Button icon-lg           | 10px                  | 6px                                  | Same as above                                           |
  | Input lg                 | 10px                  | 6px                                  | Now matches Button lg (was inconsistent)                |
  | Tabs trigger (contained) | 10px                  | 6px                                  | Now matches Button (was inconsistent)                   |
  | SegmentedControl item    | 10px                  | 9999px                               | Renamed pill is now actually pill                       |
  | Menubar trigger          | 2px                   | 6px                                  | Now matches DropdownMenu item (was inconsistent)        |
  | Autocomplete listbox     | 6px                   | 10px                                 | Now matches Popover/DropdownMenu (was inconsistent)     |
  | ChatMessage bubble       | rounded-ds-2xl (24px) | rounded-bubble (24px → preset-aware) |
  | Everything else          | unchanged             |

  **If you preferred the chunkier old look:** set `data-shape="rounded"` on your app root to get the v0.38-era feel back for big controls. Or override `--radius-control: 10px` to keep that one value at the old size.

  **Migration:**

  ```diff
  - <html lang="en">
  + <html lang="en" data-shape="slightly-rounded">  <!-- optional, this is the default -->
  ```

  To go sharp:

  ```diff
  - <html lang="en">
  + <html lang="en" data-shape="sharp">
  ```

  **Files touched:** semantic.css (tokens + 3 preset blocks), 100+ source files migrated across `src/ui/`, `src/composed/`, `src/shell/`, `src/ai/`, `src/motion/` (~480 replacements via `scripts/migrate-radius-roles.mjs`), 7 component tests updated to match new class names, `apps/site/` fully migrated and now sets `data-shape="slightly-rounded"` on `<html>`, pre-publish-audit.mjs gate covers the whole package, customize-brand.md recipe rewritten, new Storybook story `Foundations/Shape Presets`.

  **Coverage:** complete adoption across the published package. Token showcase stories (`forced-colors.stories.tsx`, `FoundationsShowcase.tsx`) are intentionally allowlisted — they demonstrate the primitive scale and must continue to render at fixed values.

- [#46](https://github.com/devalok-design/shilp-sutra/pull/46) [`df0589c`](https://github.com/devalok-design/shilp-sutra/commit/df0589c186b0f671d4dd84e60029e97340f1899e) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - feat: public-launch release — Agent Skill + marketing site

  **Agent Skill (`@devalok/shilp-sutra`):** a fully bundled [Agent Skills](https://agentskills.io)-compatible skill ships in the npm tarball at `node_modules/@devalok/shilp-sutra/skill/` and in the repo at `skills/shilp-sutra/`. AI coding agents — Claude Code, Cursor, Codex, Aider, and any other tool that speaks the open standard — can install once and load setup playbooks, component APIs, theming patterns, and troubleshooting on demand:

  ```bash
  # Personal install
  curl -fsSL https://raw.githubusercontent.com/devalok-design/shilp-sutra/main/skills/shilp-sutra/install.sh | bash

  # Or, after installing the package:
  cp -r node_modules/@devalok/shilp-sutra/skill ~/.claude/skills/shilp-sutra
  ```

  The skill is **built from** the package's own documentation (`llms.txt`, `llms-full.txt`, `docs/recipes/`) by `scripts/build-skill.mjs`. Pre-publish audit gates on drift (`build-skill.mjs --check`) and on spec compliance (name format, description ≤1024 chars, body ≤500 lines per [agentskills.io](https://agentskills.io/specification)), so the skill cannot ship out of sync.

  **Marketing + docs site (shilp-sutra.devalok.in):** a Next.js 15 + Tailwind 4 site eats its own dog food — built entirely from shilp-sutra components. Hosted on Railway. Includes:
  - Landing page with framework-aware install snippets and the Agent Skill one-liner front-and-centre
  - `/components` — browseable index of all 119 components, parsed from `docs/components/*.md`, grouped by layer (UI primitives / composed / shell), with search and filter
  - `/docs/[slug]` — rendered recipes from `packages/core/docs/recipes/` (single source of truth — site reads the same files that ship in the tarball)
  - Dark mode, OKLCH brand tokens, framer-motion animations
  - Storybook stays at `devalok-design.github.io/shilp-sutra` for now; will move to a subpath in v2

  **No runtime changes to the package.** Component APIs, peer deps, and CSS unchanged. This release is additive: skill bundle + new docs surface.

  **Site repo layout:**

  ```
  apps/site/                  # Next 15 marketing/docs site (deploys to Railway)
  skills/shilp-sutra/         # Anthropic-format Agent Skill (ships in npm tarball as skill/)
  scripts/build-skill.mjs     # regenerates skill/references/ from source
  packages/core/scripts/copy-skill.mjs  # copies skill into packages/core/skill/ at build
  railway.toml                # Docker build config for the site service
  ```

## 0.38.0

### Minor Changes

- [#41](https://github.com/devalok-design/shilp-sutra/pull/41) [`db68ada`](https://github.com/devalok-design/shilp-sutra/commit/db68ada99bb33ca95c9a3cc050ed918536816b2b) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - **v0.38.0 — Deprecation sweep (8 breaking removals)**

  Removes all APIs deprecated since v0.29.0–v0.37.0. Migrate using the [v0.38 migration guide](https://github.com/devalok-design/shilp-sutra/blob/main/MIGRATION.md#v0380--deprecation-sweep).

  > **Note on bump magnitude:** these are breaking changes shipped as a `minor` bump per the pre-1.0 semver convention codified in [`CONTRIBUTING.md` § Versioning & Breaking Changes](https://github.com/devalok-design/shilp-sutra/blob/main/CONTRIBUTING.md#versioning--breaking-changes). Once we hit 1.0, equivalent removals will require a `major` bump.

  **Breaking changes:**
  - `Alert`: removed `variant="filled"` → use `variant="solid"`
  - `Banner`: removed `action` prop → use `actions`
  - `Input`: removed `startIcon` / `endIcon` props → use `startSection` / `endSection`
  - `Input`: removed `inputVariants` export → use `inputWrapperVariants`
  - `SegmentedControl`: removed `variant="accent"` → use `variant="solid"`
  - `ResponsiveOverlay`: removed component → use `Dialog` or `Sheet` directly
  - `./tailwind` export: removed (was a no-op stub since 0.37.0) → use CSS-first setup
  - `./hooks/use-toast` export: removed → import `toast` from `@devalok/shilp-sutra`

  **Dependency bumps (no consumer API changes):**
  - TipTap `^3.22.3` → `^3.22.5`
  - `@tabler/icons-react` `^3.41.1` → `^3.42.0`

- [#41](https://github.com/devalok-design/shilp-sutra/pull/41) [`db68ada`](https://github.com/devalok-design/shilp-sutra/commit/db68ada99bb33ca95c9a3cc050ed918536816b2b) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - **Doc-driven AI-agent setup for public release**

  Ships a complete recipes catalog + governance baseline so any AI coding agent (Claude Code, Cursor, Copilot, Codex, Aider) can install and configure shilp-sutra in any consumer project just by reading the bundled docs.

  **Added:**
  - **`AGENTS.md`** at the repo root — Next.js convention. Tells agents to read `llms.txt` + `docs/recipes/` before writing code, with managed `<!-- BEGIN/END:shilp-sutra-agent-rules -->` markers so consumers can layer their own notes without conflict.
  - **`packages/core/docs/recipes/`** ships in the npm package (added to `files`). Reachable from a consumer's `node_modules/@devalok/shilp-sutra/docs/recipes/` with no network round-trip:
    - `index.md` — recipe catalog with framework picker
    - `install-next-app-router.md` — full step-by-step for Next.js 13+ App Router
    - `install-next-pages.md` — Next.js Pages Router
    - `install-vite.md` — Vite + React (also covers React Router)
    - `install-astro.md` — Astro with React islands
    - `install-remix.md` — Remix v2 + Vite
    - `install-tanstack-start.md` — TanStack Start
    - `customize-brand.md` — token override cookbook (color, radius, font, spacing, dark-mode pairings, forced-colors, per-route theming)
    - `server-components.md` — full RSC-safety matrix per layer + import patterns
    - `troubleshoot.md` — decision tree for the 8 most common breakages
  - **`SECURITY.md`** — vulnerability disclosure policy with severity-based timelines and provenance verification instructions. Reports route to `shilp-sutra@devalok.in`.
  - **`CODE_OF_CONDUCT.md`** — Contributor Covenant 2.1 adoption.
  - **`.github/CODEOWNERS`** — review routing to `@devalok-design/shilp-sutra` for high-blast-radius paths (release.yml, pre-publish-audit.mjs, tokens, AI docs).
  - **`.github/ISSUE_TEMPLATE/`** — three GitHub form templates (bug-report, feature-request, ai-agent-feedback) plus a `config.yml` with contact links to SECURITY.md, troubleshoot.md, Storybook, and AGENTS.md.
  - **`packages/core` package.json metadata** — `keywords` (24 SEO terms), `author`, `homepage`, `bugs`. Improves npm discovery.
  - **`packages/brand` package.json metadata** — same hygiene fields.
  - **README.md badges** — npm version, monthly downloads, minzip bundle size, license, sigstore provenance, Storybook, AGENTS.md.
  - **CONTRIBUTING.md "Versioning & Breaking Changes" section** — codifies semver discipline (patch / minor / pre-1.0-major handling), the deprecation policy (one-minor-window before removal, runtime warning + JSDoc + CHANGELOG entry), the changeset requirement for any tarball-shipped surface change, and the explicit list of what counts as public API.

  **Changed:**
  - **`packages/core/llms.txt`** — adds a "QUICK SETUP (AI agents — start here)" block immediately after the intro, pointing agents to the framework-specific recipe in `docs/recipes/`. Existing setup playbook content unchanged below.
  - **`README.md`** — adds a "Setup recipes (per framework)" section linking to all six install recipes plus customization and troubleshooting guides. Removes the stale `@devalok/shilp-sutra/tailwind` package-export row (the JS preset was removed in 0.38). Replaces the package description's "Tailwind preset" suffix with "Tailwind 4 CSS-first tokens".

  **Why minor (not patch):**

  The `files` array now ships `docs/recipes/` to consumers. Existing patch-level changesets only ship code or documentation already in `dist/`; this is the first time a top-level docs tree is part of the npm tarball, which is a meaningful surface change for tooling that scans installed packages.

  **Out of scope:**
  - The `shilp-sutra-cli` init/doctor/info package — deferred until doc-driven setup proves insufficient (see project plan: doc-driven first, CLI second).
  - Marketing/docs site, starter-template repos, per-component bundle-size budgets, public a11y conformance page. Tracked separately for later phases.

  **For consumers:**

  No code changes required. Existing apps continue to work. To opt into the AI-agent contract, add a root `AGENTS.md` to your project — see `node_modules/@devalok/shilp-sutra/llms.txt` for the suggested content (or copy this repo's `AGENTS.md` and adapt).

  **For maintainers:**

  The `CODEOWNERS` file routes reviews to the `@devalok-design/shilp-sutra` GitHub team (<https://github.com/orgs/devalok-design/teams/shilp-sutra>). Vulnerability reports go to `shilp-sutra@devalok.in` (set up as an alias to the maintainer inbox).

## 0.37.1

### Patch Changes

- [`b9103ec`](https://github.com/devalok-design/shilp-sutra/commit/b9103ec07f7733060265280517fd52e8c93f3e53) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - **docs:** comprehensive sweep of every component doc — Composability sections, prop accuracy, and a new publish gate that prevents drift.

  Most of the work is in `docs/components/**/*.md` (which ships in the npm bundle via the `files` array) and `llms-full.txt` (the compiled AI-agent reference, also shipped). No component APIs change.

  **What changed for consumers:**
  - **Every one of the 119 component docs now has a `## Composability` section** — covers required providers, context cascade, sibling/companion components, alternatives, router/framework integration. AI agents reading `llms-full.txt` get richer guidance on how pieces fit together, not just props + defaults.
  - **Prop accuracy fixes on 11 components:** Alert (added `size`, documented `solid` variant), Card (added `color` / `size` / `accent` / `accentColor`), Combobox (`size`), NumberInput (`size` + `state`), Select (`variant` + `color`, size expanded to `xs`), Sidebar (SidebarMenuButton's `variant` / `size` / `isActive` / `tooltip` / `asChild`), Slider (`size` + `color`), Tabs (TabsList `size` + `orientation`), Text (full variant list enumerated), Textarea (`xs` size), Toggle (`color`). These props existed in source but weren't documented — consumers had to read the `.tsx` to find them.
  - **Composability deepening** on 26 context-heavy components — Card (size cascade), ButtonGroup (position-aware radius, focus isolation), Form (FormField auto-consumption by Input/Textarea/NumberInput/InputOTP; explicit for Checkbox/Radio/Switch/Slider), Icon (IconProvider cascade), Sidebar (SidebarProvider state model + three-provider setup), DataTable (server vs client mode switching), etc.
  - **InputOTP** — Props section finally lists `maxLength`, `value`, `onChange`, `onComplete`, `pattern`, `state`, `size` (was "standard input-otp props"). Documented the InputOTPSizeContext cascade.

  **New publish gate:** `scripts/audit-component-docs.mjs --check` runs in `pre-publish-audit.mjs`. Fails the publish on any HIGH drift between a component's CVA source and its Props-section axes. Medium flags (TS-only props the script can't see) stay advisory.

- [`b9103ec`](https://github.com/devalok-design/shilp-sutra/commit/b9103ec07f7733060265280517fd52e8c93f3e53) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - **fix(InlineEdit):** forward `aria-label` / `aria-labelledby` to the `role="textbox"` span.

  InlineEdit renders `role="textbox"` on an inner span but previously spread all props to the outer wrapper `<div>` — so any `aria-label` consumers passed never reached the element that actually needed the accessible name. axe flagged it as "ARIA input fields must have an accessible name"; the existing a11y test even had a rule-disable workaround for this.

  **Fix:**
  - Intercept `aria-label` and `aria-labelledby` from props before spreading to the wrapper; apply them to the textbox span.
  - Fall back to `placeholder` as the aria-label when neither is provided — screen readers always get a meaningful name.
  - Skip entirely in `readOnly` mode (no `role="textbox"` to label).

  **Migration:** no breaking changes. Consumers already passing `aria-label` will now see it on the correct element; consumers relying on the previous (broken) behavior had nothing to rely on — the label was silently dropped.

  Discovered during the `describeConformance` adoption audit (2026-04-21).

## 0.37.0

### Minor Changes

- [`bb1b680`](https://github.com/devalok-design/shilp-sutra/commit/bb1b680c6daf90e7a53c2be78a0cdff2d1fad8e1) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Restore every utility-class mapping dropped in the TW3 JS-preset → TW4 @theme migration. This fixes visible regressions in Avatar (collapsed to text), StatusDot, Badge, Alert, SplitButton, Accordion, Collapsible, Progress, Spinner, Stepper, and any component using `w-ds-*` / `h-ds-*` sizing, `bg-neutral-*`, `bg-surface-1..4`, step-6 status colors, `animate-accordion-*` / `animate-collapsible-*` / `animate-popover-*` / `animate-timer-bar` / `animate-shake`, `border-focus`, `opacity-action-*`, `max-w-layout*`, or `bg-gradient-brand*`.

  **Root cause:** the old TW3 preset (514 lines of `theme.extend` mapping) was deleted during the TW4 migration. Its replacement — TW4 `@theme` CSS variables — only emits utilities for tokens in namespaces TW4 knows about (`--color-*`, `--spacing-*`, `--text-*`, etc.). Any preset entry whose mapping didn't fit a TW4 namespace was silently lost; the `var()` still exists in `:root` but no utility class is generated. TW4 silently drops unknown utilities, so typecheck/lint/tests/build/smoke all pass while visual output is broken.

  **What's restored:**
  - `--color-neutral-{1..12}` aliased into @theme (enables `bg-neutral-*`, `border-neutral-*`)
  - `--color-surface-{1,2,3,4}` aliased for CLAUDE.md surface-layering rule (`bg-surface-1..4`)
  - `--color-{error,success,warning,info}-6` added (SplitButton soft, StatusDot)
  - `--amber-bright-6` primitive added (was missing entirely — warning step-6 would resolve to empty)
  - `--color-overlay` + `--color-disabled` promoted from internal :root into @theme (`bg-overlay`, `bg-disabled`, `text-disabled`)
  - `--spacing-ds-{xs,xs-plus,sm,sm-plus,md,lg,xl}` added — named component sizes driving `w-ds-*` / `h-ds-*` / `min-w-ds-*` / `min-h-ds-*` (fixes Avatar, Button, Input collapse)
  - `--spacing-ico-{sm,md,lg,xl}` added — icon sizes
  - Responsive layout spacing `--spacing-{page-x,page-y,section-gap,card-gap,stack-gap}` corrected (media overrides had `-ds-` prefix but @theme had bare)
  - `@utility` blocks for `border-ds-{sm,md,lg}`, `border-focus`, `opacity-action-{hover,selected,disabled,focus,active}`, `max-w-layout`, `max-w-layout-body`, `bg-gradient-brand`, `bg-gradient-brand-dark`
  - 12 custom `--animate-*` keyframes + timings ported from old preset to tokens/animations.css (accordion-down/up, collapsible-down/up, progress-indeterminate, skeleton-shimmer, caret-blink, timer-bar, popover-in/out, processing-ants-ambient/working/urgent/march/svg, shake)
  - `tw-animate-css ^1.4.0` added to `dependencies` and `@import`ed in shilp-sutra.css (provides `animate-in`, `fade-in-*`, `zoom-*`, `slide-*-from-*` for Radix enter/exit animations)
  - Missing `./ui/split-button` subpath export added to package.json

  **Regression gate:** new `scripts/audit-compiled-css.mjs` runs AFTER the consumer smoke and verifies every DS utility-class pattern referenced in `packages/core/src/**` emits a rule in the compiled consumer CSS. The expanded smoke-consumer page now renders every primitive (Avatar, StatusDot, Badge, Alert, Accordion, Collapsible, Progress, Spinner, SplitButton, Stepper, form controls), so the audit exercises the full class surface. Wired into `release.yml` as a publish-blocking step for both Turbopack and Webpack variants. If a future refactor drops another token mapping, this gate fails the publish.

  Full audit log: `docs/audits/2026-04-20-0.37-token-gap.md`.

  **Consumer impact:** no-code upgrade from 0.37.0-next.1 to 0.37.0-next.2. Visual regressions in Avatar, animations, and any other affected component are fixed on upgrade.

- [#33](https://github.com/devalok-design/shilp-sutra/pull/33) [`e1f24dd`](https://github.com/devalok-design/shilp-sutra/commit/e1f24ddd285db13bbe275dc2ebef04a773a2152d) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Tailwind 4 CSS-first migration. Setup-only breaking release — component APIs are unchanged. See [MIGRATION.md](./MIGRATION.md#v0370--tailwind-4-css-first-migration) for the full guide.

  ### BREAKING
  - **JS preset removed.** `tailwind.config.ts` with `presets: [shilpSutra]` no longer works. Tokens ship as TW4 `@theme` CSS via a single import:

    ```css
    @import 'tailwindcss';
    @import '@devalok/shilp-sutra/css';
    ```

    The old `./tailwind` export is a deprecated no-op stub that logs a dev-mode `console.warn`; scheduled for removal in 0.38.

  - **`framer-motion` is now a required peerDependency** (`^12.0.0`). Module-scoped React contexts (`MotionConfig`, `LayoutGroup`, `AnimatePresence`) break silently when two copies resolve — making framer-motion a peer forces the consumer to control the version and pnpm to dedupe. Install: `pnpm add framer-motion`.
  - **`sonner` is now an optional peerDependency** (`^2.0.0`). Install only if you render `<Toaster />`: `pnpm add sonner`.
  - **`tailwindcss` peer tightened to `^4.0.0`** (was `^3.4.0 || ^4.0.0`). 0.37 is TW4-only.
  - **`use-sync-external-store` moved to `dependencies`** (from optional peer). Auto-installed transitively; no consumer action needed.
  - **Source class modernization** — our source migrated; consumers whose own code uses TW3-era patterns should update:
    - `w-[--var]` → `w-(--var)`
    - `theme(spacing.N)` → literal value
    - `bg-gradient-to-*` → `bg-linear-to-*`
    - bare `shadow` → explicit (e.g., `shadow-raised`)
  - **Token namespaces:** spacing is `--spacing-ds-*` (generates `p-ds-03`), typography is `--text-ds-*` / `--leading-ds-*`. Z-layers (`z-popover`, etc.) and named durations (`duration-fast-01`) are generated via `@utility` blocks since TW4 has no `--z-*` / `--duration-*` auto-namespaces.
  - **Dark mode:** `@custom-variant dark (&:where(.dark *));` — identical behavior to TW3's `darkMode: 'class'`.

  ### Added
  - New export `@devalok/shilp-sutra/css` — the single consumer entry for TW4 setup.
  - New token files at `packages/core/src/tokens/`: `shilp-sutra.css`, `utilities.css`, `variants.css`, `base.css`, `animations.css`.
  - Next 15 + Webpack smoke consumer at `tests/smoke-consumer-next15/` — complements the existing Next 16 + Turbopack variant. Both wired into the release workflow.
  - MIGRATION.md at repo root — new v0.37 section with before/after globals, collision examples, dark-mode sanity check, framer-motion single-copy verification, troubleshooting table.
  - 10 council-gated pre-publish audit checks: peer-vs-dep correctness, tailwindcss peer range, `exports` types-first ordering, bare `shadow` detection, MIGRATION.md presence + 0.37 section, README TW3 residue, dist Node-builtin leak, Next 15 smoke fixture presence.
  - Chromatic visual-regression gate in release.yml (runs pre-RC, blocks on undiffed visual changes).
  - Rollback drill procedure in `docs/rollback.md`.

  ### Changed
  - Build externalization: `framer-motion` and `sonner` are now external (were chunked). Eliminates duplicate-copy risk.
  - `engines.node` floor dropped. Phase 0 spike made the `process.getBuiltinModule` bridge unnecessary.
  - `publishConfig.provenance: true` — every 0.37 publish carries an SLSA attestation visible on npmjs.com.
  - `.github/workflows/release.yml` wired to OIDC trusted publishing and gated on `pre-publish-audit.mjs` + `consumer-smoke-test.mjs` + Chromatic.

  ### Removed
  - Repo-root `tailwind.config.ts`.
  - `docs/MIGRATION.md` (moved to repo root).
  - `rolldown-runtime` CJS bridge patch in `inject-use-client.mjs` (Phase 0 eliminated the need).

### Patch Changes

- [`d4dbbee`](https://github.com/devalok-design/shilp-sutra/commit/d4dbbeecfe57ec20d75d0b082265831af3cd9050) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Restore the full animation utility surface that was silently dropped in 0.37.0-next.0.

  **The bug:** when the JS preset was removed during the TW4 migration, two things went missing:
  1. **`tailwindcss-animate` utilities** (`animate-in`, `animate-out`, `fade-in-0`, `zoom-in-75/95`, `slide-in-from-top/bottom/left`, `slide-out-to-*`, etc.) — used by every Radix primitive (Dialog, Popover, Tooltip, HoverCard, Select, DropdownMenu, ContextMenu, AlertDialog, Sheet, Toast, etc.) for enter/exit animations. Without them, overlays snap in/out with no motion. Avatar's fade-in on image load also goes silent.
  2. **Custom DS animations** (`animate-accordion-down`/`-up`, `animate-collapsible-down`/`-up`, `animate-progress-indeterminate`, `animate-skeleton-shimmer`, `animate-caret-blink`, `animate-timer-bar`, `animate-popover-in`/`-out`, `animate-processing-ants-*`) — their `@keyframes` + `@theme --animate-*` entries existed in the old preset but weren't ported to `tokens/animations.css` during the migration.

  **The fix:**
  - Added `tw-animate-css ^1.4.0` to core `dependencies` (TW4-native rewrite of tailwindcss-animate by the same author).
  - `@import "tw-animate-css"` in `tokens/shilp-sutra.css` so consumers get the full `animate-in`/`fade-*`/`slide-*`/`zoom-*` surface automatically.
  - Ported all 11 custom DS keyframes + `@theme --animate-*` entries from the deleted preset to `tokens/animations.css`. Each references the same timing + easing the preset used (`var(--duration-slow-02)`, `var(--ease-productive-standard)`, etc.), so the motion character is identical to 0.36.

  **Verification:** consumer smoke test (Next 16 + Turbopack) now compiles `animate-in`, `animate-skeleton-shimmer`, `animate-progress-indeterminate`, `animate-caret-blink`, `slide-in-from-bottom`, `zoom-in-75`, and peers into the generated CSS. Previously all of these emitted zero rules.

  **Consumer impact:** existing `animate-*` class names work again without any code change. If you're on `0.37.0-next.0` and seeing broken avatars / motion, upgrading to `0.37.0-next.1` is a no-code fix.

## 0.37.0-next.1

### Minor Changes

- [`bb1b680`](https://github.com/devalok-design/shilp-sutra/commit/bb1b680c6daf90e7a53c2be78a0cdff2d1fad8e1) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Restore every utility-class mapping dropped in the TW3 JS-preset → TW4 @theme migration. This fixes visible regressions in Avatar (collapsed to text), StatusDot, Badge, Alert, SplitButton, Accordion, Collapsible, Progress, Spinner, Stepper, and any component using `w-ds-*` / `h-ds-*` sizing, `bg-neutral-*`, `bg-surface-1..4`, step-6 status colors, `animate-accordion-*` / `animate-collapsible-*` / `animate-popover-*` / `animate-timer-bar` / `animate-shake`, `border-focus`, `opacity-action-*`, `max-w-layout*`, or `bg-gradient-brand*`.

  **Root cause:** the old TW3 preset (514 lines of `theme.extend` mapping) was deleted during the TW4 migration. Its replacement — TW4 `@theme` CSS variables — only emits utilities for tokens in namespaces TW4 knows about (`--color-*`, `--spacing-*`, `--text-*`, etc.). Any preset entry whose mapping didn't fit a TW4 namespace was silently lost; the `var()` still exists in `:root` but no utility class is generated. TW4 silently drops unknown utilities, so typecheck/lint/tests/build/smoke all pass while visual output is broken.

  **What's restored:**
  - `--color-neutral-{1..12}` aliased into @theme (enables `bg-neutral-*`, `border-neutral-*`)
  - `--color-surface-{1,2,3,4}` aliased for CLAUDE.md surface-layering rule (`bg-surface-1..4`)
  - `--color-{error,success,warning,info}-6` added (SplitButton soft, StatusDot)
  - `--amber-bright-6` primitive added (was missing entirely — warning step-6 would resolve to empty)
  - `--color-overlay` + `--color-disabled` promoted from internal :root into @theme (`bg-overlay`, `bg-disabled`, `text-disabled`)
  - `--spacing-ds-{xs,xs-plus,sm,sm-plus,md,lg,xl}` added — named component sizes driving `w-ds-*` / `h-ds-*` / `min-w-ds-*` / `min-h-ds-*` (fixes Avatar, Button, Input collapse)
  - `--spacing-ico-{sm,md,lg,xl}` added — icon sizes
  - Responsive layout spacing `--spacing-{page-x,page-y,section-gap,card-gap,stack-gap}` corrected (media overrides had `-ds-` prefix but @theme had bare)
  - `@utility` blocks for `border-ds-{sm,md,lg}`, `border-focus`, `opacity-action-{hover,selected,disabled,focus,active}`, `max-w-layout`, `max-w-layout-body`, `bg-gradient-brand`, `bg-gradient-brand-dark`
  - 12 custom `--animate-*` keyframes + timings ported from old preset to tokens/animations.css (accordion-down/up, collapsible-down/up, progress-indeterminate, skeleton-shimmer, caret-blink, timer-bar, popover-in/out, processing-ants-ambient/working/urgent/march/svg, shake)
  - `tw-animate-css ^1.4.0` added to `dependencies` and `@import`ed in shilp-sutra.css (provides `animate-in`, `fade-in-*`, `zoom-*`, `slide-*-from-*` for Radix enter/exit animations)
  - Missing `./ui/split-button` subpath export added to package.json

  **Regression gate:** new `scripts/audit-compiled-css.mjs` runs AFTER the consumer smoke and verifies every DS utility-class pattern referenced in `packages/core/src/**` emits a rule in the compiled consumer CSS. The expanded smoke-consumer page now renders every primitive (Avatar, StatusDot, Badge, Alert, Accordion, Collapsible, Progress, Spinner, SplitButton, Stepper, form controls), so the audit exercises the full class surface. Wired into `release.yml` as a publish-blocking step for both Turbopack and Webpack variants. If a future refactor drops another token mapping, this gate fails the publish.

  Full audit log: `docs/audits/2026-04-20-0.37-token-gap.md`.

  **Consumer impact:** no-code upgrade from 0.37.0-next.1 to 0.37.0-next.2. Visual regressions in Avatar, animations, and any other affected component are fixed on upgrade.

### Patch Changes

- [`d4dbbee`](https://github.com/devalok-design/shilp-sutra/commit/d4dbbeecfe57ec20d75d0b082265831af3cd9050) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Restore the full animation utility surface that was silently dropped in 0.37.0-next.0.

  **The bug:** when the JS preset was removed during the TW4 migration, two things went missing:
  1. **`tailwindcss-animate` utilities** (`animate-in`, `animate-out`, `fade-in-0`, `zoom-in-75/95`, `slide-in-from-top/bottom/left`, `slide-out-to-*`, etc.) — used by every Radix primitive (Dialog, Popover, Tooltip, HoverCard, Select, DropdownMenu, ContextMenu, AlertDialog, Sheet, Toast, etc.) for enter/exit animations. Without them, overlays snap in/out with no motion. Avatar's fade-in on image load also goes silent.
  2. **Custom DS animations** (`animate-accordion-down`/`-up`, `animate-collapsible-down`/`-up`, `animate-progress-indeterminate`, `animate-skeleton-shimmer`, `animate-caret-blink`, `animate-timer-bar`, `animate-popover-in`/`-out`, `animate-processing-ants-*`) — their `@keyframes` + `@theme --animate-*` entries existed in the old preset but weren't ported to `tokens/animations.css` during the migration.

  **The fix:**
  - Added `tw-animate-css ^1.4.0` to core `dependencies` (TW4-native rewrite of tailwindcss-animate by the same author).
  - `@import "tw-animate-css"` in `tokens/shilp-sutra.css` so consumers get the full `animate-in`/`fade-*`/`slide-*`/`zoom-*` surface automatically.
  - Ported all 11 custom DS keyframes + `@theme --animate-*` entries from the deleted preset to `tokens/animations.css`. Each references the same timing + easing the preset used (`var(--duration-slow-02)`, `var(--ease-productive-standard)`, etc.), so the motion character is identical to 0.36.

  **Verification:** consumer smoke test (Next 16 + Turbopack) now compiles `animate-in`, `animate-skeleton-shimmer`, `animate-progress-indeterminate`, `animate-caret-blink`, `slide-in-from-bottom`, `zoom-in-75`, and peers into the generated CSS. Previously all of these emitted zero rules.

  **Consumer impact:** existing `animate-*` class names work again without any code change. If you're on `0.37.0-next.0` and seeing broken avatars / motion, upgrading to `0.37.0-next.1` is a no-code fix.

## 0.37.0-next.0

### Minor Changes

- [#33](https://github.com/devalok-design/shilp-sutra/pull/33) [`e1f24dd`](https://github.com/devalok-design/shilp-sutra/commit/e1f24ddd285db13bbe275dc2ebef04a773a2152d) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Tailwind 4 CSS-first migration. Setup-only breaking release — component APIs are unchanged. See [MIGRATION.md](./MIGRATION.md#v0370--tailwind-4-css-first-migration) for the full guide.

  ### BREAKING
  - **JS preset removed.** `tailwind.config.ts` with `presets: [shilpSutra]` no longer works. Tokens ship as TW4 `@theme` CSS via a single import:

    ```css
    @import 'tailwindcss';
    @import '@devalok/shilp-sutra/css';
    ```

    The old `./tailwind` export is a deprecated no-op stub that logs a dev-mode `console.warn`; scheduled for removal in 0.38.

  - **`framer-motion` is now a required peerDependency** (`^12.0.0`). Module-scoped React contexts (`MotionConfig`, `LayoutGroup`, `AnimatePresence`) break silently when two copies resolve — making framer-motion a peer forces the consumer to control the version and pnpm to dedupe. Install: `pnpm add framer-motion`.
  - **`sonner` is now an optional peerDependency** (`^2.0.0`). Install only if you render `<Toaster />`: `pnpm add sonner`.
  - **`tailwindcss` peer tightened to `^4.0.0`** (was `^3.4.0 || ^4.0.0`). 0.37 is TW4-only.
  - **`use-sync-external-store` moved to `dependencies`** (from optional peer). Auto-installed transitively; no consumer action needed.
  - **Source class modernization** — our source migrated; consumers whose own code uses TW3-era patterns should update:
    - `w-[--var]` → `w-(--var)`
    - `theme(spacing.N)` → literal value
    - `bg-gradient-to-*` → `bg-linear-to-*`
    - bare `shadow` → explicit (e.g., `shadow-raised`)
  - **Token namespaces:** spacing is `--spacing-ds-*` (generates `p-ds-03`), typography is `--text-ds-*` / `--leading-ds-*`. Z-layers (`z-popover`, etc.) and named durations (`duration-fast-01`) are generated via `@utility` blocks since TW4 has no `--z-*` / `--duration-*` auto-namespaces.
  - **Dark mode:** `@custom-variant dark (&:where(.dark *));` — identical behavior to TW3's `darkMode: 'class'`.

  ### Added
  - New export `@devalok/shilp-sutra/css` — the single consumer entry for TW4 setup.
  - New token files at `packages/core/src/tokens/`: `shilp-sutra.css`, `utilities.css`, `variants.css`, `base.css`, `animations.css`.
  - Next 15 + Webpack smoke consumer at `tests/smoke-consumer-next15/` — complements the existing Next 16 + Turbopack variant. Both wired into the release workflow.
  - MIGRATION.md at repo root — new v0.37 section with before/after globals, collision examples, dark-mode sanity check, framer-motion single-copy verification, troubleshooting table.
  - 10 council-gated pre-publish audit checks: peer-vs-dep correctness, tailwindcss peer range, `exports` types-first ordering, bare `shadow` detection, MIGRATION.md presence + 0.37 section, README TW3 residue, dist Node-builtin leak, Next 15 smoke fixture presence.
  - Chromatic visual-regression gate in release.yml (runs pre-RC, blocks on undiffed visual changes).
  - Rollback drill procedure in `docs/rollback.md`.

  ### Changed
  - Build externalization: `framer-motion` and `sonner` are now external (were chunked). Eliminates duplicate-copy risk.
  - `engines.node` floor dropped. Phase 0 spike made the `process.getBuiltinModule` bridge unnecessary.
  - `publishConfig.provenance: true` — every 0.37 publish carries an SLSA attestation visible on npmjs.com.
  - `.github/workflows/release.yml` wired to OIDC trusted publishing and gated on `pre-publish-audit.mjs` + `consumer-smoke-test.mjs` + Chromatic.

  ### Removed
  - Repo-root `tailwind.config.ts`.
  - `docs/MIGRATION.md` (moved to repo root).
  - `rolldown-runtime` CJS bridge patch in `inject-use-client.mjs` (Phase 0 eliminated the need).

## 0.36.1

### Patch Changes

- [#31](https://github.com/devalok-design/shilp-sutra/pull/31) [`daad9c4`](https://github.com/devalok-design/shilp-sutra/commit/daad9c4d89afdc9165edb05d3caf9c59116e2207) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - **Fix TW4 codemod regressions (resolves [#30](https://github.com/devalok-design/shilp-sutra/issues/30)).**

  The TW 3→4 migration in 0.34.0 left several class-name artifacts that slipped past our gates. 0.36.1 repairs all of them and adds pre-publish-audit coverage so the same class of bug can't ship again.
  - **RichChatInput + RichTextEditor (`[#30](https://github.com/devalok-design/shilp-sutra/issues/30)`, runtime-breaking):** `[[&_mark]:rounded-sm_mark]:rounded-xs` — a garbled nested arbitrary variant — was emitted as invalid CSS by the codemod and crashed Turbopack on every page load for TW4 consumers. Replaced with the intended `[&_mark]:rounded-xs`.
  - **BarChart, LineChart, Stepper (silent a11y regression):** `focus-visible:outline-none` escaped the rename to `outline-hidden`. In TW4, `outline-none` also strips the outline under `forced-colors: active`, which meant the 0.36.0 forced-colors feature had **no focus indicator** on these components in Windows high-contrast mode. Now all three use `outline-hidden` and focus renders correctly under forced-colors.
  - **SegmentedControl (silent visual shift):** `shadow-sm` in TW4 renders as TW3's bare `shadow` (one step larger). Migrated to `shadow-raised` for semantic consistency.
  - **Stepper:** `flex-shrink-0` → `shrink-0` (TW4 spelling).
  - **Sidebar menu button:** three `:!size-8` / `:!p-ds-03` / `:!p-0` used TW3's leading-`!` important prefix; now use TW4's trailing `class!` form.

  **Process hardening** — the `pre-publish-audit.mjs` script now includes a **Tailwind 4 Migration Hygiene** section:
  - **HARD GATES**: fails publish on doubled-bracket arbitrary variants (`[[&_x]:class_x]:class` — the exact pattern from [#30](https://github.com/devalok-design/shilp-sutra/issues/30)) or any stray `outline-none`.
  - **ADVISORIES**: warns on `rounded-sm` / `shadow-sm` / `blur-sm` / `backdrop-blur-sm` (silently-shifted meaning in TW4), TW3 `flex-shrink-*` / `flex-grow-*`, and TW3 `:!prefix` important syntax.

  `.github/workflows/release.yml` also gains `workflow_dispatch` so future publish re-runs don't require a throwaway commit.

## 0.36.0

### Minor Changes

- [#26](https://github.com/devalok-design/shilp-sutra/pull/26) [`e61fd3c`](https://github.com/devalok-design/shilp-sutra/commit/e61fd3c0118714d5424379eaf7af733731d3fcc6) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - **Forced-colors (Windows high-contrast) support.** Added `@media (forced-colors: active)` block in `semantic.css` that maps every semantic color token to system keywords (Canvas, CanvasText, Highlight, HighlightText, LinkText, GrayText, Mark, ButtonText, VisitedText). Applies to both light and dark themes — forced-colors is orthogonal to theme. Also adds belt-and-suspenders focus-ring outline (Highlight) and forced visible borders on interactive elements so ghost/link buttons remain perceivable. Decorative grain (`[data-grain]`) is hidden, skeleton shimmer freezes. Zero runtime impact when forced-colors is inactive.

  **FormField auto-wires Label + Input ids.** `FormField` now publishes an `inputId` via context. `Label` reads `htmlFor` from it, `Input` reads `id` from it, unless either is explicitly set on the child. Eliminates manual id-juggling and a whole class of Label-input mismatch bugs.

  **Toast error variants announce assertively.** `toast.error()` now renders `role="alert"` + `aria-live="assertive"` + `aria-atomic="true"` so screen readers interrupt speech on errors. Other toast types remain `role="status"` + `aria-live="polite"`. Upload toasts go assertive only when a file fails.

  **Dev-mode warning for missing `<Toaster />`.** `toast()` called without a mounted `Toaster` now logs a one-time console warning pointing to the fix. Production-silent.

  **Button processing ants no longer drift outside the button.** The marching-ant overlay was sizing its SVG + rect against the wrapper via `calc(100% - 2px)`, which could diverge from the button's actual rendered size during width transitions and async-feedback icon swaps — producing a visible gap between the button edge and the ants' outline. Now measured directly from `btnEl.offsetWidth/offsetHeight` with a ResizeObserver keeping it locked.

  **Alert solid-variant body-text legibility.** Fixed two compounding bugs: body text was hardcoded to `text-surface-fg-muted` (grey), overriding the CVA's foreground on solid variants; and solid compound variants all used `text-accent-fg` instead of the matching per-color `-fg` token. Warning in particular was silently broken — white-on-amber fails contrast, dark-text-on-amber is the right pairing. Now uses per-color `text-{info|success|warning|error}-fg` on solid/filled variants, and skips the muted body override there.

  **Per-color `-fg` tokens on non-accent status backgrounds.** Button async success/error states, BottomNavbar notification badge, and TopBar item badge now use `text-error-fg` / `text-success-fg` instead of `text-accent-fg`. No visible change today (all `-fg` tokens resolve to the same near-white), but brand-swap-safe — an override of `--color-accent-fg` won't silently mis-color error badges.

  **vitest testTimeout 15s → 30s.** Sequential-file execution plus accumulated jsdom pressure on tiptap + axe tests at the tail of a full run was grazing the 15s wall. Isolated runs finish under 1s; real regressions still hit the new ceiling.

  **Documentation cleanup.** Fixed six `data-table-*.md` stub files that shipped literal bash template headers to `llms-full.txt` (`# $(echo $f | sed ...)`). Reconstructed `packages/core/CHANGELOG.md` entries for 0.33.x–0.35.0 (was frozen at 0.33.0). Removed fake Button `variant="default"` / `"destructive"` aliases from the llms Props block (removed in 0.32.0). Updated README component counts (60+/14/7 → 78/29/8 + AI tier) and tech stack. Added Badge `truncate` prop to docs.

  **Design preference codified.** `variant="soft"` is now the Devalok default over `variant="outline"` for non-primary Button actions. Captured in CLAUDE.md, llms.txt, and llms-full.txt.

  **Forced-colors verification story.** New `Foundations → Forced Colors → Component Matrix` in Storybook with a solid-bg legibility sub-section showing every status color × every component (Button, Badge, BadgeIndicator, counter pills, checkables) side-by-side.

  **CI: bundle budget excludes sourcemaps.** The 5MB bundle-size gate was measuring `dist` including `.map` files (~5.4MB of sourcemaps alone). Now measures runtime JS + CSS + types only, reporting sourcemaps separately for transparency.

> See the root [CHANGELOG.md](../../CHANGELOG.md) for detailed per-release notes.
> This file is the Changesets-generated summary shipped alongside releases.

## 0.35.0

### Minor Changes

- World-Class Audit wave 1–5: dark-mode contrast fix, responsive clamp() typography, letter spacing, surface-fg-subtle darkening, size/color axes on Combobox/NumberInput/Slider/InputOTP/Toggle, Tabs `orientation="vertical"`, Stepper `onStepClick`, AlertDialog `responsive`, Chart keyboard a11y + `ariaDescription`, typography composite utilities (text-heading-xl/text-body-md/etc.), layout/link/duration tokens, `useFormField` wired into 8 components, Autocomplete portal, NotificationCenter mobile Sheet, 136+ new tests + coverage thresholds.

### Breaking

- `MessageList` prop `isLoadingMore` → `loadingMore`.
- `AppCommandPalette` Karm defaults removed — use `CommandRegistryProvider`.
- `NumberInput` shape: pill → rounded rectangle.
- `Alert.variant="filled"` deprecated → use `"solid"` (alias still works).
- `SegmentedControl.variant="accent"` deprecated → use `"solid"` (alias still works).
- `@floating-ui/dom`, `@tiptap/*`, `prosemirror-state` now bundled (moved to devDeps).

## 0.34.1

### Patch Changes

- Upgrade Vite 7 → 8 (Rolldown bundler) + @vitejs/plugin-react 6 (Oxc). SSR safety patch for Rolldown CJS interop.

## 0.34.0

### Minor Changes

- Tailwind CSS 4, TypeScript 6, ESLint 10, tailwind-merge 3.5, react-zoom-pan-pinch 4 — full toolchain upgrade

## 0.33.2

### Patch Changes

- Upgrade TypeScript 6.0.2, ESLint 10, typescript-eslint 8.58.1, react-zoom-pan-pinch 4 (peer dep)

## 0.33.1

### Patch Changes

- Bump all safe patch/minor dependencies: React 19.2.5, Storybook 10.3.5, Vitest 4.1.4, framer-motion 12.38, @floating-ui/dom 1.7.6, @tabler/icons-react 3.41.1, esbuild 0.28, jsdom 29, and more

## 0.33.0

### Minor Changes

- Custom EmojiNode with spritesheet rendering, SplitButton component, schedule send, ButtonGroup rebuild, RichChatInput v2 enhancements, TipTap v3 upgrade
