# Wave 4 Audit — Composed

> Same rubric. **Note on the external axis:** the four reference DS (shadcn/RT/Carbon/MUI) largely have **no "composed" tier** — PageHeader, FilterBar, EmptyState, CommandPalette, InlineEdit, StatusBadge, PriorityIndicator, ActivityFeed, ScheduleView are *app-level patterns*, not primitives. So for this wave the primary benchmark shifts to **"does it compose our own primitives cleanly, or re-roll them"** — internal composition discipline is the real test. Where a reference DS *does* have a peer (cmdk, MUI Chip, Carbon Tag) it's called out.
>
> Scope: all 29 files in `composed/`. Date: 2026-07-12 · Method: full read of 12 representative components + composition/hygiene greps across all 29 + heads of the large ones. Coverage: **all 29 have docs + stories ✓** (no gaps).

---

## Cross-cutting findings

### W4-1 — Reverse composition drift: composed components re-rolling primitives that exist 🔴 HIGH
Wave 3's drift was primitives re-rolling primitives. Here it's the mirror: *composed* components that should assemble `ui/` primitives sometimes rebuild them by hand.

| Component | Re-rolls | Should compose |
|---|---|---|
| **PageHeader** | breadcrumb (inline `<svg>` chevron + raw `<a>`/`<span>`), title `<h1>`, subtitle `<p>` | `Breadcrumb`, `Text`, `Icon`, `Link` — all exist in `ui/` |
| **StatusBadge** | full badge styling from scratch (own CVA: `bg-success-3 text-success-11`, own dot map) | `Badge` (has `color`, `variant`, `dot` already) — StatusBadge should be a thin domain-status→Badge mapper |
| **ScheduleView** | **everything** — 342 LOC, **zero `ui/` imports** | at minimum `Button`/`Icon`/surface tokens |
| **FilterMultiSelect** (in filter-bar) | trigger button + its own `triggerSizeClasses` map (copy of `comboboxTriggerVariants` sizes) | shared trigger styling |

**Counter-evidence the team is already self-correcting:** `ContentCard` is now `@deprecated` in favor of `Card` ("duplicated Card on the legacy per-slot-padding model … removed next major"). That's exactly the right response — the same lens should be turned on PageHeader and StatusBadge. **Recommendation:** rebuild StatusBadge on `Badge` and PageHeader on `Breadcrumb`/`Text`/`Icon`; audit ScheduleView for primitive reuse. These are the highest-value refactors in the wave.

### W4-2 — Design-preference violations (`outline` where `soft` is the house default) 🟡 MEDIUM
CLAUDE.md: *prefer `variant="soft"` over `variant="outline"` for non-primary Button actions.* Two composed components violate it:
- **ConfirmDialog** — the Cancel button is `variant="outline"`. Sitting next to a solid confirm, this is exactly the pairing the rule targets (soft reads warmer, still clearly secondary). *Also:* ConfirmDialog does a manual `{loading ? 'Processing...' : confirmText}` text swap instead of using `Button`'s built-in `loading` prop (which the primitive already handles with a spinner + `aria-busy`). Two misses in the DS's own reference confirm dialog.
- **ErrorBoundary** — `variant="outline"` on its retry/reset action.

**Recommendation:** switch both to `soft`; wire ConfirmDialog's confirm button to `loading={loading}`. These are the DS's own components teaching consumers the pattern — they should model it.

### W4-3 — `font-body` vs `font-sans` split 🟢 LOW
`ui/` uses `font-sans` universally. Six composed files (`status-badge`, `priority-indicator`, `member-picker`, `multi-select-popover`, `rich-chat-input`, `rich-text-editor`) use `font-body`. Both are defined in `@theme` and resolve to the **identical** Inter stack (`--font-sans` === `--font-body`), so nothing is broken — but it's two utility names for one thing, and a reader can't tell if a difference was intended. **Recommendation:** pick one (`font-sans`) and codemod the six; or document that they're deliberate aliases.

### W4-4 — Skeleton-composition layer inherits Wave 3's drift, amplified 🟡 MEDIUM
`loading-skeleton` (25 raw-px arbitraries) and `page-skeletons` (35) are the raw-px hotspots of the whole layer. They compose `Skeleton` but hardcode dimensions (`h-[…]`, `w-[…]`) to mimic specific components — the same layout-shift risk as W3-1's `SkeletonAvatar`, now spread across page-level scaffolds. **Recommendation:** these should derive dimensions from the components they stand in for (or from tokens), not from eyeballed pixels — folds into the W3-1 fix.

### W4-5 — What's strong ✅
- **Surface-1 discipline: clean across all 29** (grep confirms zero `bg-surface-1` in composed — correct, these sit *on* the page as panels/cards → surface-2+).
- **Most of the layer composes exemplarily:** `ConfirmDialog` (AlertDialog+Button), `SimpleTooltip` (Tooltip), `FilterBar` (SearchInput/Select/Badge/Button/MultiSelectPopover), `avatar-group` (Avatar+Tooltip), `bulk-action-bar` (Badge/Button/Icon), `file-preview` (Badge/Button/Icon/Skeleton/TruncatedText).
- **ResponsiveModal is a model citizen** — it exists *specifically* to fix W2-2 (Dialog's mobile-fullscreen leaves dead space under short content), composes the dialog primitive, documents "an alternative to Dialog/Sheet, not a re-roll," and owns the fiddly bits (pinned header, `85dvh`/`90dvh` scroll body, drag-dismiss). This is the mature answer to the Wave-2 mobile-overlay inconsistency.
- **InlineEdit** is a well-executed bespoke (contentEditable, `role=textbox`, aria-label fallback to placeholder, paste-as-plain, Enter/Escape, select-all-on-focus) — no primitive exists for it, so hand-rolling is correct.
- **SSR:** `PageHeader` + `ContentCard` are `// @server-safe` (pure). Correct.

---

## Component scorecards (read in depth)

### PageHeader — Internal B · External A
- ✅ `@server-safe`, breadcrumb + title + subtitle + actions, `line-clamp-2` subtitle. The **uncommitted working-tree change** (`flex-wrap` + `min-w-0` on the header row and title column, `flex-wrap` on actions) is a **sound responsive-overflow fix** — lets the title truncate and actions wrap on narrow viewports instead of overflowing. Ship it.
- 🟡 W4-1: re-rolls Breadcrumb (inline SVG chevron, raw `<a>`/`<span>`), `<h1>`, `<p>` instead of `Breadcrumb`/`Text`/`Icon`/`Link`. Ironic for the component that most benefits from `Breadcrumb`, which exists.
- **External:** no reference DS ships a PageHeader — pure differentiator.

### StatusBadge — Internal B · External A
- ✅ Domain-status vocabulary (active/pending/approved/rejected/…), discriminated `status` XOR `color` union, morph animation, clickable variant, dot.
- 🟡 W4-1: reimplements Badge's entire color/variant styling rather than composing `<Badge>`. `h-[8px] w-[8px]` raw dot (md). `ref as any` twice.
- **External:** closest peer is Carbon `Tag` / MUI `Chip` (status coloring) — we match, but our own `Badge` already does this, so it's internal duplication not external gap.

### ContentCard — Internal A (as deprecated) · External —
- ✅ **Correctly `@deprecated`** pointing to `Card`. The right handling of drift. No action beyond removal-next-major (already tracked in MIGRATION.md).

### ConfirmDialog — Internal B+ · External A
- ✅ Composes AlertDialog + Button cleanly; consumer controls close; async `onConfirm`.
- 🟡 W4-2: Cancel is `outline` (should be `soft`); ignores Button's `loading` prop (manual text swap). The DS's own confirm dialog should model both.

### SimpleTooltip — Internal A− · External A
- ✅ Clean Tooltip composition, `asChild` trigger.
- 🟢 Mounts its own `TooltipProvider` — harmless but redundant now that `Tooltip` has `AutoProvider` (W2). Could drop it.

### FilterBar — Internal A− · External A
- ✅ Composes SearchInput/Select/Badge/Button/MultiSelectPopover; size propagated via context; `role="toolbar"`.
- 🟡 `FilterMultiSelect` re-rolls the trigger button with a local `triggerSizeClasses` map duplicating `comboboxTriggerVariants` sizing (W4-1, minor).

### PriorityIndicator — Internal A− · External A
- ✅ Domain component (LOW/MED/HIGH/URGENT, case-insensitive), Icon composition, urgent pulse, compact/full display. Uses category + semantic tokens.
- 🟢 `font-body` (W4-3).

### InlineEdit — Internal A · External A
- ✅ Strong bespoke (see W4-5). `document.execCommand('insertText')` is deprecated-but-functional; note for a future paste-handler rewrite. No primitive fits — correct to hand-roll.
- **External:** no DS ships inline-edit; differentiator.

### EmptyState — Internal A− · External A
- ✅ Icon composition + Devalok chakra fallback glyph, compact mode, float animation (reduced-motion aware), tokenized. `max-w-[280px]` raw (minor).
- **External:** shadcn added an EmptyState recently; MUI/Carbon none. We're ahead/parity.

### ResponsiveModal — Internal A · External A+
- ✅ See W4-5. The correct, self-aware fix for the Wave-2 mobile-overlay gap. Exemplary.

---

## The large components (characterized by composition + LOC; not line-audited)

| Component | LOC | Composes | Read |
|---|---|---|---|
| **CommandPalette** | 549 | Dialog, Icon, VisuallyHidden (+ own list/kbd nav) | composes correctly; peer is `cmdk` (shadcn uses it) — verify our hand-rolled kbd nav matches the same a11y bar as Combobox (same bespoke-a11y risk as W2 Combobox) |
| **RichTextEditor** | 728 | Button, Icon (+ TipTap) | TipTap-backed; confirm `@tiptap/*` peer-map status (memory flags @tiptap phantom-bundling) |
| **RichChatInput** | 1151 | Button, Icon, SplitButton (+ TipTap) | largest file in the DS; TipTap; `font-body` (W4-3). Same peer-map concern |
| **ActivityFeed** | 395 | Avatar, Button, Icon, Skeleton | composes well |
| **MasterDetail** | 298 | Button, Icon | composes |
| **MultiSelectPopover** | 309 | Icon, Popover, Spinner | composes; `font-body` |
| **ScheduleView** | 342 | **nothing** | 🔴 W4-1 — zero `ui/` imports, re-rolls all chrome. Biggest re-roll in the layer |
| **AvatarGroup** | 303 | Avatar, Tooltip | composes |
| **BulkActionBar** | 227 | Badge, Button, Icon | composes |
| **MarkdownViewer** | 253 | Button, Icon (+ remark) | composes; confirm `remark-gfm` peer (memory flags it missing) |
| **FilePreview** | 145 | Badge, Button, Icon, Skeleton, TruncatedText | composes well |
| **EmojiPicker** | 182 | Popover (+ frimousse) | composes; frimousse migration done (0.48) |
| **ErrorBoundary** | 216 | Button, Icon | composes; 🟡 W4-2 `outline` button |
| **MemberPicker** | 93 | Avatar | thin; fine |
| **FormSection** | 87 | Collapsible, Icon | composes |
| **LoadingSkeleton / PageSkeletons** | 202 / 192 | Skeleton | 🟡 W4-4 raw-px hotspots |
| **GlobalLoading / Confirm / Deadline / …** | small | 1–3 primitives | thin wrappers; fine |

---

## Wave 4 grade summary

| Area | Internal | External | Note |
|---|---|---|---|
| Exemplary composers (ResponsiveModal, InlineEdit, FilterBar, SimpleTooltip, ConfirmDialog*, avatar-group, file-preview) | A/A− | A+/A | the majority — clean primitive assembly |
| PageHeader, StatusBadge | **B** | A | re-roll primitives that exist (W4-1) |
| ScheduleView | **B−** | A | zero primitive reuse (W4-1) |
| Skeleton scaffolds (loading-skeleton, page-skeletons) | **B** | A | raw-px hotspots (W4-4) |
| ContentCard | A (deprecated) | — | correctly retired |
| Big editors (RichText/RichChat/CommandPalette) | A− | A | composed; peer-map + bespoke-a11y to confirm |

**Wave verdict:** The composed layer is the DS's app-oriented differentiator — most of these components have **no equivalent in shadcn/RT/Carbon/MUI**, so the DS competes by *owning the pattern*. The quality question is almost entirely internal: **does each composed component assemble our primitives or rebuild them?** Most do assemble (and ResponsiveModal is a genuinely mature example of solving a cross-layer problem the right way). The debts are (1) a handful of reverse-drift re-rolls — StatusBadge, PageHeader, ScheduleView — that should lean on `Badge`/`Breadcrumb`/`Text`/`Icon`, (2) the DS's own ConfirmDialog/ErrorBoundary not following the soft-over-outline house rule they should model, (3) the `font-body`/`font-sans` split, (4) skeleton raw-px continuing from Wave 3. Notably, `ContentCard`'s deprecation shows the team already knows how to handle drift — apply that same discipline to StatusBadge/PageHeader.

---

## Recommended actions (ranked)

1. **W4-1 — Rebuild StatusBadge on `Badge` and PageHeader on `Breadcrumb`/`Text`/`Icon`.** Highest-value; follows the `ContentCard` deprecation precedent. Audit ScheduleView for primitive reuse.
2. **W4-2 — Fix the DS's own reference components** to model house rules: ConfirmDialog + ErrorBoundary → `soft`; ConfirmDialog confirm button → `loading` prop.
3. **Confirm peer-map for the heavy deps** — `@tiptap/*` (RichText/RichChat), `remark-gfm` (MarkdownViewer). Memory flags both as peer-drift suspects; cross-check `derive-peer-map.mjs`.
4. **W4-4 — De-pixel the skeleton scaffolds** (loading-skeleton, page-skeletons) — derive from tokens/real components. Folds into W3-1.
5. **W4-3 — Unify `font-body` → `font-sans`** (codemod 6 files) or document the alias.
6. **CommandPalette — verify hand-rolled kbd nav** meets the same a11y bar (same risk class as Combobox, W2).

> Next: **Wave 5 — Shell + AI** (Sidebar, TopBar, BottomNavbar, NotificationCenter, CommandRegistry, AppCommandPalette + ai/: Conversation, CommandBar, BlockRenderer, AiCommandProvider, DevadootIcon). Final wave — will close with a cross-wave summary. Awaiting checkpoint.
