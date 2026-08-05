# Finish-Bar v2 — Ranked Backlog (full DS, 125 components)

> **RE-VERIFIED 2026-08-04 against `origin/main` @ `7b242b89`.** Every status below
> was checked by reading the current source, not by trusting the previous text.
> Each item carries a `file:line` citation that proves its status, an honest size
> (**S** under an hour / **M** a focused session / **L** a rebuild or multi-session),
> and whether fixing it is **BREAKING** (removes/renames an export, or narrows a prop
> type — new ⊂ old is breaking per CLAUDE.md).
>
> The pre-re-verification version of this doc was **wrong in both directions**: it
> listed 12 items that had already shipped, prescribed the wrong fix for S2, and
> under-sized the work that genuinely remains. Statuses here are evidence-backed;
> where a claim's premise turned out not to hold, it is marked **STALE-PREMISE** with
> the reason rather than silently dropped.
>
> Systemic items first (fix once, DS-wide), then per-component below-bar work.
> Full per-component gap lists live in `findings/<layer>__<name>.md`.

## Summary

| Tier | DONE | OPEN | PARTIAL | STALE-PREMISE | Total |
|---|---|---|---|---|---|
| 🔴 P0 systemic | 1 | 0 | 1 | 1 | 3 |
| 🟠 P1 below-bar | 9 | 2 | 0 | 0 | 11 |
| 🟡 P1 doc↔source drift (S3) | 5 | 0 | 1 | 0 | 6 |
| 🟡 P2 per-component | 5 | 4 | 1 | 1 | 11 |
| 🟢 P3 polish / adoption | 0 | 4 | 0 | 0 | 4 |
| 🆕 Newly discovered (this pass) | 0 | 5 | 0 | 0 | 5 |
| **Total** | **20** | **15** | **3** | **2** | **40** |

Remaining work: **3 L · 9 M · 10 S**, plus 2 items gated on the next major.
Sweeps that came back clean (no new work) are listed at the bottom — read them
before opening a "token hygiene" branch, because three of the four are already fine.

## 🔴 P0 — systemic sweeps

- **S1 reduced-motion — PARTIAL. Size L. Non-breaking** (behavior changes only under
  `prefers-reduced-motion`).
  **Landed:** `useMotion()` now falls back to the OS preference when no provider is
  mounted — `motion/motion-provider.tsx:45-51` (#182 `c441b720`), plus per-component
  `useReducedMotion()` in 43 of the 90 framer-animating source files.
  **Not landed — the part the item actually named:** there is still no default
  `MotionConfig reducedMotion="user"`. The only `MotionConfig` in the DS is *inside*
  `MotionProvider` (`motion/motion-provider.tsx:38`), so framer's own reduce path is
  inert unless the consumer opts in — and `motion/check-motion-provider.ts` exists
  precisely because they often don't. Consequence: **47 source files animate
  regardless of `prefers-reduced-motion` by default**, including the DS's own motion
  primitive layer (see 🆕 N1). No lint rule either — the plugin ships 13 rules and
  none of them concern motion (`packages/eslint-plugin-shilp-sutra/src/rules/`).
  Caveat: the 47 is a file-level count; `ui/sidebar.tsx` reads as guarded because of
  `:186` but its `layoutId` spring at `:637` is not (see 🆕 N2), so the true component
  count is slightly higher.
  Note this also weakens the "motion fixed" claims in #226–#231: several of those
  fixes are phrased as "so MotionConfig governs it", which is only true with a
  provider mounted.

- **S2 dead `border-card-strong` — STALE-PREMISE. Do NOT sweep. No work.**
  The class was never swept to `border-card`; it was **defined** instead —
  `tokens/utilities.css:348` `@utility border-card-strong { border-color: var(--color-surface-border); }`
  landed in #182 (`c441b720`, same day as the audit). The 19 current call sites
  (`ai/command-bar.tsx`, `composed/command-palette.tsx`, `shell/notification-center.tsx:445`,
  `shell/top-bar.tsx:209`, `ui/code.tsx:40`, `ui/data-table-header.tsx:165`,
  `ui/data-table-pagination.tsx:41`) are **correct usage**, not violations. The
  original "11 files" count was also low. Anyone re-reading the old line and running
  the sweep would delete a working hairline.

- **shell/bottom-navbar a11y — DONE.** Composes the DS `Sheet`, inheriting focus trap,
  scroll lock, return-focus and `aria-modal` — `shell/bottom-navbar.tsx:22` (import),
  `:276-310` (`Sheet`/`SheetTrigger`/`SheetContent`), documented at `:7-8`. Shipped #184.

## 🟠 P1 — below-bar components

Nine of eleven shipped in the #226–#231 sweep (see `BelowBarBeforeAfter.stories.tsx`
for the before/after gallery). The two data-table internals were never touched.

- **composed/content-card — DONE** (the deprecate half). `@deprecated` JSDoc at
  `composed/content-card.tsx:59-63` pointing at `Card` + slots. The delete is a
  next-major scheduling decision, not outstanding work. **Size S when the major lands.
  BREAKING** (removes an export).
- **composed/bulk-action-bar — DONE** (#227). `role="toolbar"` at
  `composed/bulk-action-bar.tsx:119` with roving tabindex on the real `Button`s
  (`:131`, `:182`, `:195`), inline confirm `aria-live="assertive"` at `:147`,
  `forwardRef` at `:55`.
- **composed/avatar-group — DONE** (#226). Each avatar is a focusable labelled trigger
  with the focus-ring util — `composed/avatar-group.tsx:185,190`; overflow badge same
  at `:218,223`; composes `AvatarFallback` at `:163,230`.
- **composed/loading-skeleton + composed/page-skeletons — DONE** (#228).
  `role="status"` + `aria-busy` + sr-only label at `composed/loading-skeleton.tsx:13-17`
  and `composed/page-skeletons.tsx:10`.
- **composed/error-boundary — DONE** (#229). `role="alert"` at
  `composed/error-boundary.tsx:91`; react-error-boundary parity via `onError`
  (`:132`, `componentDidCatch` `:159`) and `resetKeys` (`:134`, `:165`); `fullPage`
  gate at `:18,70`.
- **composed/master-detail — DONE** (#230). Named listbox at
  `composed/master-detail.tsx:137`; detail pane `role="region" aria-live="polite"` at
  `:164`; selection ownership via `defaultSelected`/`onSelect` at `:27,29`.
- **composed/priority-indicator — DONE** (#185). Composes `ui/badge` —
  `composed/priority-indicator.tsx:9`.
- **ui/autocomplete — DONE** for everything the audit filed as P0/P1 (#186). Composes
  `Input` (`ui/autocomplete.tsx:10`, `:217`), uncontrolled `defaultValue` (`:33,92`),
  async `isLoading`/`loadingText` (`:43`, `:232`), matched-substring highlight (`:287`),
  `renderOption` slot (`:46`). Virtualization is still absent — but that was a P3
  adoption idea, not the P1 rebuild; it is tracked under P3 now, not here.
- **ui/file-upload — DONE** (#231). focus-ring on the `role="button"` drop zone at
  `ui/file-upload.tsx:316`; `scaleX` progress instead of `width` at `:374-376`;
  disabled leaves the tab order at `:304`.

- **ui/data-table-bulk-actions — OPEN, in full. Size M. Non-breaking.**
  Nothing from the finding landed. `role="toolbar"` at
  `ui/data-table-bulk-actions.tsx:40` with **no roving tabindex** — the toolbar role
  lies and the actions are a multi-stop tab run, the same class of defect #227 fixed
  in the sibling `composed/bulk-action-bar`. The clear button is a raw `<button>` with
  `p-ds-01`, no `focus-visible` ring and no `touch-target` (`:59-70`). Motion is
  `animate-in slide-in-from-bottom-2` with no fade, no exit and no reduced-motion
  guard (`:37`). Non-error actions use `variant="outline"` (`:50`) against CLAUDE.md's
  soft default. `label: string` (`:13`) and `color?: 'accent' | 'error'` (`:15`) are
  both narrower than needed — widening both is non-breaking and `BulkAction` **is**
  public via `ui/data-table.tsx:43`, so keep the direction. No test file exists.
- **ui/data-table-pagination — OPEN, in full. Size M. Non-breaking** (internal — not
  in `packages/core/package.json` `exports`).
  Raw native `<select>` at `ui/data-table-pagination.tsx:33-51` — 32px (`h-ds-sm`), no
  focus ring; raw prev/next `<button>`s at `:55-70` and `:79-94` — 32px, no
  `touch-target`, no `focus-ring`; page info at `:72-76` has no `aria-live`. No test.
  **Sub-premise now stale:** the `border-card-strong` at `:41` that the finding called
  a "dead class → borderless control" is a real utility since #182 — that specific fix
  is void, the a11y and cohesion items are not.

## 🟡 P1 — doc↔source drift (S3)

Five of six were closed by #223 (`a0c4c730`), one day after the audit. What remains is
a thinner set of residuals — all doc-only, all **S**, all **non-breaking**.

- **ui/search-input — DONE.** `docs/components/ui/search-input.md:34` now states
  plainly that Escape is *not* wired, and the size axis is corrected at `:8`.
  **Residual OPEN:** the JSDoc was never updated — `ui/search-input.tsx:19` still says
  "Sizes: `sm` | `md` | `lg`" while the type at `:13` is `'xs' | 'sm' | 'md' | 'lg'`.
  *Note:* the backlog previously filed "Escape-to-clear not wired; controlled-only
  clear" (`ui/search-input.tsx:57,63` — no internal state, so `defaultValue` +
  `onClear` renders no clear button) under S3. Those are **source behaviours, not doc
  drift**; they belong in search-input's api-composability P1s and are not closed.
- **ui/slider — DONE.** `docs/components/ui/slider.md:25,32` now correctly describe
  FormField a11y consumption, matching `ui/slider.tsx:81-84,94-96`.
  **Residual OPEN, newly caused by #245:** `slider.md:26` still claims "No label
  pairing via Label", which `ui/slider.tsx:118-120` (`aria-labelledby` from the
  FormField `labelId` for single-thumb) has made false.
- **shell/command-registry — DONE**, both halves. The phantom
  `register/unregister/search` API is gone from `shell/Introduction.mdx:31`; the false
  access-control implication is replaced at
  `docs/components/shell/command-registry.md:44` ("ORGANIZATIONAL split, not access
  control"). Source is 59 lines and contains no `isAdmin` (`shell/command-registry.tsx`).
- **shell/app-command-palette — PARTIAL. Size S. Non-breaking.** The role-case half is
  DONE: the example is `role: 'Admin'` (`docs/components/shell/app-command-palette.md:26`)
  matching the gate at `shell/app-command-palette.tsx:156-157`, with the footgun
  documented at `:45`. The stale-props half was never attempted — `app-command-palette.md:8-15`
  lists 8 props while 9 more ship: `searchResultGroups` (`shell/app-command-palette.tsx:70`),
  `searchResultsLabel` (`:78`), `open` (`:81`), `defaultOpen` (`:83`), `onOpenChange`
  (`:85`), `keybinding` (`:87`), `maxHeight` (`:89`), `emptyState` (`:91`),
  `footerHints` (`:93`). `SearchResult` omits `icon`/`rank`/`shortcut`/`href`
  (`:33,35,37,39`), and the `SearchResultGroup` interface (`:43-46`) plus the
  grouped-over-flat precedence at `:206` are undocumented entirely.
- **composed/simple-tooltip — DONE.** `docs/components/composed/simple-tooltip.md:27`
  now states it always mounts its own provider and does not inherit an ancestor's
  `delayDuration` — matching `composed/simple-tooltip.tsx:33`.
- **composed/rich-chat-input — DONE.** `onSubmit: (message: RichChatInputMessage) => void`
  matches source (`composed/rich-chat-input.tsx:87` ↔
  `docs/components/composed/rich-chat-input.md:12`); phantom `maxRows` gone; `inline`
  variant, the full `ChatToolbarItem` union and all 7 previously-omitted props now
  documented. **Residual OPEN:** the Changes log stops at v0.33.0
  (`rich-chat-input.md:103-112`) with the package at 0.56.0.

## 🟡 P2 — targeted, per-component

- **ui/switch — DONE** (#233). RTL thumb mirroring at `ui/switch.tsx:53-56`,
  `useReducedMotion()` at `:51`, `touch-target` at `:72`.
- **ui/tabs, ui/select, ui/stepper, ui/radio, ui/stat-card reduced-motion — OPEN.
  Size M as one batch (S each). Non-breaking.** S1 did **not** cover these: every one
  uses bare `motion.*`, which only reduces when a `MotionConfig` is in the tree.
  `ui/tabs.tsx:275,287` (`layoutId` springs) and `:321`; `ui/select.tsx:159-162`
  (scale+opacity spring); `ui/stepper.tsx:300-311` (`AnimatePresence` step slide);
  `ui/radio.tsx:92-98` (indicator scale spring); `ui/stat-card.tsx:288+`. Severity
  note: StatCard's `reveal` defaults to `false` (`ui/stat-card.tsx:236`), so only
  opt-in animation is unguarded there — the other four are always-on.
- **ui/split-button — OPEN. Size M. Non-breaking** (all additive). #234 fixed the
  **doc only** (`docs/components/ui/split-button.md`, 6 lines). Source still hand-rolls
  Button's vocabulary: `buttonVariants` is imported at `ui/split-button.tsx:6` and used
  solely for the `color` *type* at `:31`, while the halves compose local
  `getHalfClasses`/`heightClass`/`triggerPadding`/`radiusClass`/`dividerColor` maps
  (`:195-224`). No `loading`/`aria-busy`, no `touch-target`, ungated `active:scale`.
- **ui/skeleton — OPEN. Size M. Non-breaking.** Sub-components still re-roll the base
  instead of composing it: `SkeletonAvatar` (`ui/skeleton.tsx:103-118`) and
  `SkeletonButton` (`:201-219`) each emit their own `bg-skeleton-base` + local size map
  + `animationClasses`, and the shimmer recipe is defined twice — CVA at `:7` vs helper
  at `:78`. Sub-component roots still lack `aria-hidden`. (The *shimmer token* half of
  S6 did land in the sibling `composed/loading-skeleton` via #228; `ui/skeleton`'s own
  duplication did not.)
- **ui/spinner — DONE** (#232). Fires the documented `onComplete` explicitly on the
  reduced-motion path — `ui/spinner.tsx:103-109`.
- **ui/table forced-colors — DONE** (#233). `data-[state=selected]:forced-colors:outline
  forced-colors:outline-1` at `ui/table.tsx:111`.
- **ui/icon-button 44px touch target — DONE** (#232). `touch-target` applied to `sm`/`md`
  at `ui/icon-button.tsx:74-78`.
- **shell/sidebar 44px + nav landmark — STALE-PREMISE / MOOT.** The audited file,
  `packages/core/src/shell/sidebar.tsx` (`AppSidebar`), was **deleted** in #221
  (`1596a6fb remove(shell)!: delete AppSidebar`); `packages/core/src/shell/` no longer
  contains it. All nine `findings/shell__sidebar.md` items are void as written.
  **They did not go away, they moved** — see 🆕 N2 and N3. Do not re-open this line;
  open those.
- **ui/separator remove dead `variant` — PARTIAL.** #232 removed the **stories argType
  only** (`ui/separator.stories.tsx`, 4 lines). The prop still ships: declared at
  `ui/separator.tsx:17`, destructured as `variant: _variant` at `:26`, under a comment
  at `:15-16` that falsely asserts it "is removed in 0.45.0".
  Split this into two:
  - fix the lying comment — **Size S, non-breaking**, do it now;
  - remove the prop — **Size S, BREAKING** (deleting an optional prop narrows
    `SeparatorProps`; a consumer still passing `variant` fails `tsc`). Next major only.
- **shell/notification-preferences accessible names — DONE** (#234). Composed
  `aria-label`s on the row Select/Switch/delete at
  `shell/notification-preferences.tsx:217,237,245`.
- **ui/context-menu / ui/menubar Radix-twin drift — OPEN. Size M. Non-breaking.**
  The proposed shared module does not exist (`ui/lib/` has no `menu-classes.ts`).
  `ui/context-menu.tsx` contains **zero** occurrences of `hover:bg-surface-raised`,
  `active:`, `transition-colors`, `min-w-0 truncate` or `[&_svg]` sizing, all of which
  `ui/dropdown-menu.tsx` has (`:127,133,221,237,261`) — so items have no hover/active
  feedback, long labels overflow, and item icons are un-normalised. `ui/menubar.tsx`
  runs two animation systems in one file: `MenubarSubContent` is an unguarded framer
  scale-pop (`:117-149`) while `MenubarContent` uses the CSS `animate-popover-in/out`
  path (`:181`). `React.FC` wrappers still at `:16,37`.

## 🟢 P3 — polish / adoption ideas

All four confirmed OPEN — these are new-feature work, not defects. Nothing landed.

- **Async + virtualization across combobox / member-picker / multi-select-popover /
  command-palette — OPEN. Size L. Non-breaking.** Zero virtualization anywhere in
  `packages/core/src` (`grep -i "virtual|windowing|react-virtual"` → 0 hits). Note
  `ui/autocomplete` got the *async* half in #186; the windowing half is unbuilt
  everywhere.
- **Message actions + streaming text in ai/conversation — OPEN. Size L. Non-breaking.**
  There is no streaming API and no message-action surface; `stream` appears exactly
  once in the file, in prose — `ai/conversation.tsx:30` claims "support for streaming".
  That claim is itself doc drift (see 🆕 N5).
- **Per-block error boundary + streaming in ai/block-renderer — OPEN. Size M.
  Non-breaking.** No `ErrorBoundary` in `ai/block-renderer.tsx`; one bad block still
  takes the whole renderer down.
- **Marks / output / thumb-labels on ui/slider — OPEN. Size M. Non-breaking.** No
  `marks`, `<output>` or thumb-label affordance in `ui/slider.tsx`.

## 🆕 Newly discovered (this re-verification)

Same defect classes the audit found, in places it did not look.

- **N1 — `motion/primitives.tsx` has no reduced-motion guard. Size M. Non-breaking.**
  This is the exact fix site S1 named ("default `MotionConfig reducedMotion="user"` in
  the motion primitive") and it was never touched. The DS's own animation vocabulary —
  FadeIn / ScaleIn / PopIn / SlideIn / Reveal — passes `layoutId` and spring presets
  straight through with no guard (`motion/primitives.tsx:30,48,65,84,101,120,140,166,184,198`).
  Every consumer who reaches for the DS's blessed motion API gets unreduced motion by
  default. Highest-leverage single file for S1.
- **N2 — `ui/sidebar.tsx:637` `layoutId="sidebar-active-indicator"` is an unguarded
  layout spring. Size S. Non-breaking.** The `useReducedMotion()` at `:186` covers only
  the mobile drag panel. `findings/shell__sidebar.md` predicted this exactly ("the
  primitive's `layoutId` still lacks a `useReducedMotion` guard for any consumer using
  it non-`asChild`") and the backlog dropped the note. It matters more now than at
  audit time: with `AppSidebar` deleted, composing these primitives **is** the
  recommended path.
- **N3 — the surviving sidebar path still exposes no navigation landmark. Size S.
  Non-breaking.** `ui/sidebar.tsx:247,277,317` emit only `<aside aria-label="Sidebar">`
  (a complementary landmark); there is no `<nav>` / `role="navigation"` anywhere in the
  file, and the `sidebar-app` preset (`apps/site/public/r/sidebar-app.json`) adds none.
  Deleting `AppSidebar` relocated this defect onto the recommended path rather than
  fixing it.
- **N4 — the repo does not self-apply its own ESLint plugin. Size S. Non-breaking.**
  `eslint.config.js:25-29` registers `react-hooks`, `jsx-a11y` and `simple-import-sort`
  only. `@devalok/eslint-plugin-shilp-sutra` ships 13 rules including
  `no-deprecated-surface-token`, `no-bare-shadow`, `no-bg-gradient-to` and
  `no-css-var-bracket` — precisely the hygiene classes CLAUDE.md says rot silently
  because their audit gates are **release-only, not PR CI**. Self-applying moves four
  of those gates into PR CI for the cost of a config block, and stops this document
  from regenerating itself. Best leverage-to-cost ratio on the page.
- **N5 — `ai/conversation.tsx:30` documents streaming support that does not exist.
  Size S. Non-breaking.** A seventh member of the S3 doc-drift family, in the layer
  most likely to be read by an AI agent.

## Sweeps that came back CLEAN — no work here

Run these before opening any "token hygiene" branch; three of four need nothing.

- **Deprecated numbered surface tokens in components: 0 violations.** All 25 hits sit
  in files the gate excludes (`scripts/pre-publish-audit.mjs:466`): `.stories.tsx` ×24
  (`ai/command-bar.stories.tsx` 12, `ui/chat/chat.stories.tsx` 10,
  `ui/truncated-text.stories.tsx` 2) plus one comment at `tokens/semantic.css:159`.
  Cosmetic only — those stories still model `bg-surface-1`/`-2` to anyone reading
  Storybook source. **Size S, non-breaking, optional.**
- **Radius role tokens: clean against the gate.** 232 `rounded-control`, 102
  `rounded-pill`, 96 `rounded-surface`, 63 `rounded-control-inner`, 22
  `rounded-overlay-lg`. The only `rounded-ds-*` / `rounded-full` hits are in
  `tokens/forced-colors.stories.tsx`, explicitly allowlisted at
  `scripts/pre-publish-audit.mjs:526-529`. The 6 `rounded-xs`
  (`composed/diff.tsx:146,148,448,449`, `composed/rich-chat-input.tsx:153`,
  `composed/rich-text-editor.tsx:63` — all `<mark>` highlights) are TW4-native and not
  gate-banned.
- **TW4 dead syntax: 0.** No `w-[--var]`-form arbitrary values (every `[--x:…]` hit is
  a legal *property setter*, e.g. `ui/card.tsx:54-56`, `ui/table.tsx:15-17`). No
  `bg-gradient-to-*`. No `theme(spacing.N)`. No bare `shadow` class (the 4 textual hits
  are comments/prose).
- **Block-nested `function` declarations (the 0.49.3 Annex-B minify landmine): 0 across
  638 source files**, AST-verified (`@babel/parser` + `@babel/traverse`, matching
  `FunctionDeclaration` whose parent `BlockStatement` is not a function body). The
  `function` forms that remain are `forwardRef` callbacks and function-body-scoped
  helpers, neither of which hoists to `var`.

## Sequencing

1. **N4 — self-apply the ESLint plugin.** S, and it is the only item that stops the
   backlog from re-growing. Do it before any sweep.
2. **S1, at the site it names: `motion/primitives.tsx` (N1) + a default MotionConfig.**
   #182 fixed the DS *context*; framer's own reduce path is still opt-in, which is why
   47 files remain unguarded and why the #226–#231 "motion fixed" notes are conditional.
3. **The two data-table internals** (bulk-actions + pagination). The only genuinely
   open component-level a11y defects left: a `role="toolbar"` that lies, and 32px
   targets with no focus ring on the primary table nav. Both internal → non-breaking,
   no consumer coordination needed.
4. **Doc-drift residuals as one batch** (search-input JSDoc, slider label claim,
   app-command-palette prop table, rich-chat-input changelog, N5). 5 × S; these
   misinform agents through the MCP and llms.txt surfaces, which is the DS's
   distribution channel.
5. **P2 batch:** the five reduced-motion guards (falls out of step 2), split-button
   derive-from-`buttonVariants`, skeleton composition, context-menu/menubar shared
   class module.
6. **Next-major paperwork, decided now not scrambled later:** remove `Separator.variant`,
   delete `ContentCard`, and record both in `BREAKING.json`. Fix the lying separator
   comment today — it is non-breaking and it is actively wrong.
7. **Deprioritise P3.** Virtualization and ai/conversation streaming are both **L** and
   both new features, not defects. N2/N3 (sidebar landmark + layout spring) are **S**
   and are real a11y bugs on the recommended path — they outrank all of P3.

## Note on scope

The original conclusion holds and is if anything understated: **the DS is
fundamentally sound and this is a finish-and-consistency program, not a redesign.**
Twenty of forty items were already shipped before this re-verification ran, and two
more were premises that never held. What remains is one systemic motion gap, two
neglected internal components, a handful of doc residuals, and a dogfooding hole in
CI. Do not mass-rebuild.
