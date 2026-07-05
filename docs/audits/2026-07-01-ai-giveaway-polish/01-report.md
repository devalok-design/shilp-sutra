# AI-Giveaway + Polish Audit — Report

**Date:** 2026-07-01
**Scope:** every shipped component in `@devalok/shilp-sutra` — 124 audit units (ui 78, composed 30, shell 8, ai 6, motion 1, tokens 1).
**Method:** 124 per-component agents scored each unit against [`00-rubric.md`](./00-rubric.md) (Setu `anti-convergence.yaml` + web research + our best-practices) and wrote a findings file in [`findings/`](./findings/); 6 layer-critic agents then re-grepped each layer for missed tells and judged cross-component drift. Raw data: [`_parsed.json`](./_parsed.json), critic dump in the tool-results.

---

## Headline

**The repo is not full of "AI slop." It's under-finished.** Pure visual giveaways — the purple-gradient / glassmorphism / emoji-icon look — are rare: gradient text (V3) **zero**, framework palette as brand (V4) **one** (color-input presets), glass/blob/glow (V6) a handful, rounded-everything (V7) none. The DS already made the deliberate token/font/surface choices that keep it off the AI mean.

What's missing is the **finish bar** we set on Card + StatCard: composing base primitives instead of re-rolling them, one variant/surface/motion vocabulary, in-component reduced-motion, slots over corner-props, and full state coverage. That's where 1,000+ findings live — and it's exactly what reads as "not fully thought through" even when nothing looks purple.

**1,114 findings** — P0:18 · P1:369 · P2:489 · P3:238. **Average finish 3.28/5.**

| Layer | n | avg finish | P0 | P1 | P2 | P3 |
|---|---|---|---|---|---|---|
| tokens | 1 | **5.00** | 0 | 0 | 2 | 2 |
| ui | 78 | 3.49 | 7 | 200 | 287 | 143 |
| shell | 8 | 3.38 | 1 | 23 | 32 | 16 |
| motion | 1 | 3.00 | 2 | 3 | 4 | 4 |
| ai | 6 | 2.83 | 1 | 23 | 27 | 12 |
| composed | 30 | **2.77** | 7 | 120 | 137 | 61 |

Finish distribution: 5/5 ×7 · 4/5 ×42 · 3/5 ×54 · 2/5 ×21. **`composed` is the weakest layer** (60% re-roll a base primitive, 50% controlled-only). **tokens is above the bar** (OKLCH scales are algorithmically generated — the structural opposite of palette slop).

---

## The one tell that survived: the accent rail (V1)

The colored side-stripe on a card is, per every source, *the single most recognizable AI tell.* We killed it on Card in v0.44.0 — but it still ships as the **default** in five places, three of them advertised as features:

| Where | Evidence | Note |
|---|---|---|
| `ui/toast` + `ui/toaster` | `toast.tsx:191` `<div className={cn('w-1 … rounded-l-overlay-sm', config.accentClass)} />` | **Docs/tests/llms advertise it as intended.** Biggest single liability. |
| `ai/blocks` (×5 files) | `border-l-2 border-warning-7 pl-3` duplicated verbatim in block-table/confirm/error/success/text + asserted in 3 tests | One string, 5 copies → one `BlockShell` helper fixes all. |
| `composed/schedule-view` | `schedule-view.tsx:221` `border-l-[3px]` on **every event block** | Event already has full tinted bg — rail is pure tell. |
| `ui/chat` message | `message.tsx:130` mention = `border-l-2 border-l-accent-9 …` | Bubble variant at :98 has no rail — inconsistent within the file. |
| `composed/markdown-viewer` blockquote | `border-l-2` | **NOT a tell** — semantic blockquote indent, verified clean. |

---

## The 18 P0s (must-fix)

**Accent-rail tells (4):** `ui/toast`, `ai/blocks` (×5), `composed/schedule-view`, `ui/chat`.
**Framework palette (1):** `ui/color-input` — `NAMED_PRESETS` lead with `#6366F1` Indigo / `#8B5CF6` Violet; stories default to `#6366F1`.
**Accessibility breaks (10):**
- `ui/split-button` — `role="menu"` panel with **no focus-move, no Arrow/Home/End, no trap/restore**. Keyboard-unreachable → broken ARIA contract.
- `composed/file-preview` — `role="slider"` on plain `<div>`s (volume/seek/scrub) with no `onKeyDown`.
- `composed/master-detail` — roving-focus `activeIndex` never derived from `selected` → keyboard nav starts on wrong item.
- `composed/activity-feed` — `<span role="button">` disclosure, no focus-visible ring.
- `composed/date-picker` — day cells 32×36px, triggers 36px, nav arrows 28px (all < 44px touch target).
- `ui/segmented-control` — `role="tablist"`/`tab` on a panel-less toggle (should be radiogroup/radio).
- `ui/badge-group` — clickable overflow pill, no `aria-label` / not keyboard-reachable.
- `shell/notification-preferences` — raw `<button>` delete wrapping a trash icon, no `aria-label`.
- (`ui/toast`, `ai/blocks` above also carry a11y sub-issues.)
**Motion unblockable for reduced-motion (2):** `composed/priority-indicator` (`scale:[1,1.1,1]` `repeat:Infinity`, no guard), `composed/avatar-group` (spotlight spread via CSS transform, no reduced-motion gate).
**Broken/dead code (2):** `ui/separator` — interpolated `linear-gradient(${deg}…)` arbitrary class the **TW4 static scanner can't emit** (`separator.js` ships `${l}` literally). `motion` stories — `<Fade open=>` (Fade never imported → ReferenceError), `<MotionSlide direction="bottom">` (union has no `bottom` → no-op + TS error), `variant="primary"/"secondary"` on Button. Three publish-gate-breaking story defects.

---

## Systemic cross-layer themes (where the finish gap actually is)

These are not isolated bugs — each is one discipline the codebase never uniformly adopted. Fix as **sweeps with shared helpers**, not per-file.

### 1. Re-roll instead of compose (F5) — the StatCard lesson, unlearned
The single largest gap between the codebase and the Card bar.
- **ui:** `autocomplete`/`number-input`/`color-input` re-roll Input; `alert-dialog`/`split-button` re-roll Button; `charts`/`data-table-card`/`file-upload`/`toaster` re-roll Card surface; `stat-flash` duplicates StatCard's chip **verbatim**.
- **composed:** **18 of 30 (60%)** — content-card, file-preview, activity-feed, status-badge, priority-indicator, avatar-group, date-picker, page-header, filter-bar, skeleton family, schedule-view, master-detail, …
- **shell:** the count-badge/status-dot shape hand-rolled **4 different ways** (h-4 vs h-5 vs h-[18px], error-9 vs accent-2).
- **ai:** 3 of 6 re-roll surface; **none composes `<Card>`**.

### 2. Controlled-only / non-canonical handlers (F6)
No shared controlled/uncontrolled hook, so every author reinvented it and half got it wrong.
- **ui (9):** autocomplete, combobox, color-input, number-input, pagination, segmented-control, split-button, stepper, tree-view — controlled-only, several use `onChange(value)`/`onSelect`/`selectedId` instead of `onValueChange` + `defaultValue`.
- **composed (15/30):** avatar-group, activity-feed, confirm-dialog, bulk-action-bar, date-picker, emoji-picker, form-section, filter-bar, multi-select-popover, member-picker, master-detail, inline-edit, rich-text-editor, rich-chat-input, simple-tooltip.

### 3. Motion has no single contract
- **In-component reduced-motion (M3) is near-universally absent.** Every overlay (Dialog, AlertDialog, Sheet, Popover, Select, Combobox, Tooltip, HoverCard, DropdownMenu) relies on a **consumer-mounted MotionConfig** — standalone, the entrance plays regardless. Button guards itself locally; overlays should too.
- **Bounce/overshoot by default (M1)** is the layer personality: avatar badge, badge-indicator, color-input swatches, radio dot, progress fill, stat-card delta, toast icons, dropdown-menu — plus `springs.bouncy` shipped as a *named token*. The Card bar wants overshoot only where it means something.
- **Infinite decorative pulses** (`repeat:Infinity`, hardcoded 2s/3s/500ms): 7+ across composed (deadline-indicator, schedule-view, priority-indicator ×2, recording-overlay ×2, empty-state), mostly unguarded. No shared idle-loop preset.
- **Animation tech is inconsistent:** Menubar Content uses CSS keyframes but SubContent uses framer; NavigationMenu uses a bespoke MutationObserver; Select/Combobox have no exit animation while Dialog/Sheet do; easing splits between `--ease-*` tokens (CSS) and ad-hoc arrays (`ui/lib/motion.ts:38`).

### 4. State coverage (H): forced-colors / RTL / reduced-motion untested
Near-universally absent from stories **and** tests across ~30 ui components and most of composed. This is a systemic story/test **convention** gap.

### 5. Bespoke corner-prop over slot (F1)
The layer defaults to corner-injection props rather than Card's slot model: avatar `badge`, banner `actions`, breadcrumb `separator`, combobox `renderOption`, data-table `emptyState`/`renderExpanded`/`bulkActions`, popover `title`, split-button `dropdownContent`, stat-card `icon`/`footer`, status-dot `label`, tree-view `actions`/`secondaryLabel`, content-card `headerActions`/`headerTitle`/`footer` (+ mixed slot+prop = F4).

### 6. Vocabulary drift (G3/G4)
- **Selector family shares no vocabulary:** Select has `variant`+`color`; Combobox has neither; Autocomplete has neither; SearchInput ships `xs` but docs claim `sm|md|lg`.
- **`color="default"` collision originates in the reference Card** (carries both `default` and identical `neutral` — G4 P3), then propagates to progress/select/switch/toggle.
- **composed non-canonical axes:** content-card `padding: default|compact|spacious`; priority-indicator `display: compact|full` (dead axis); filter-bar `size: xs|sm|md`; status-badge bakes semantics into `status`; file-preview `variant: light|dark`; bulk-action-bar/confirm-dialog truncate `color` to `accent|error`.

### 7. Token drift (G2)
Raw px/hex scattered (`text-[13px]`, `min-w-[140px]`, `top-[20%]`, `from-black/80`, `#D33163`); shell re-rolls badges with raw px; `ui/separator` P0 interpolated gradient. No dead **bare** TW4 utilities in source except separator (good).

### 8. Docs parity (J) + em-dash cadence (E1)
~10 composed docs assert behavior source contradicts (command-palette "fuzzy" is substring; deadline-indicator "doesn't live-update" — it does; page-header "renders Breadcrumb internally" — it doesn't; status-badge "built on ui/Badge" — it isn't; global-loading "auto-unmounts" — false). Shell docs carry **79 ` — ` em-dash connectors** (top-bar.md 23, sidebar.md 19). Story examples across composed teach the anti-pattern — raw `<button style={{background:'#6366F1'}}>` instead of `<Button variant="soft">`.

### 9. Touch targets < 44px
segmented-control (28/32/40), pagination (36), dialog close (24), banner dismiss (24), date-picker cells, tree-view rows, textarea `xs`, badge-group pill. No shared enforcement.

### 10. Types (I)
`React.FC` in alert-dialog, tooltip (root+provider), context-menu (root+sub); `BlockComponentProps<any>` in 4 ai files despite the generic already defaulting to `Record<string,unknown>`; `normalize-icon.tsx:59` `as any` in the shared icon helper; shell has 3 incompatible `user` shapes with stringly-typed `role?: string`.

---

## Worst offenders (finish 2/5)

`composed/file-preview` (18 findings — role=slider divs, CDN PDF worker, 4× re-roll, `variant=light|dark`), `composed/schedule-view` (most hard visual tells: V1 rail + V2 double-edge + unguarded pulse + `primary` color + raw px), `ui/split-button` (P0 broken menu a11y + re-rolls entire Button system), `ui/toast`+`ui/toaster` (accent rail advertised as feature + inert-enter + re-roll), `ui/color-input` (P0 palette + bounce swatches + re-roll input), `ui/chat`, `composed/content-card` (@deprecated yet ships every drift Card was built to kill — the textbook anti-Card), `composed/activity-feed`, `composed/master-detail`, `composed/status-badge`, `composed/loading-skeleton`+`page-skeletons` (wrong radius token, border-led double-edge vs elevation-led Card), `ai/blocks`, `ai/command-bar`, `ui/separator`, `ui/badge-group`, `ui/segmented-control`, `ui/autocomplete`, `ui/file-upload`, `shell/notification-preferences`.

## Best finished (the models to copy)

`ui/card` **5/5** (the bar), `ui/container`, `ui/aspect-ratio`, `ui/icon-context`, `ui/label`, `shell/link-context`, `tokens` — all 5/5. `command-palette` (composes Dialog + full ARIA combobox + real reduced-motion), `confirm-dialog` (inherits everything from AlertDialogContent → zero visual tells — the "compose the primitive" win), `ai/blocks` **motion subsystem** (every block reads `useMotion()`, branches on reduced-motion, no overshoot — the M3 bar), `shell/app-command-palette` (pure headless wrapper, renders no surface of its own).

**Note — even the reference has nits:** Card ships a redundant `default`+`neutral` color alias (G4 P3); its motion still relies on app MotionConfig (M3). Worth cleaning so the exemplar is unimpeachable.

---

See [`02-polish-plan.md`](./02-polish-plan.md) for the sequenced fix waves.
