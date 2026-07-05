# composed/extensions — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:4 P2:6 P3:2

Unit = the TipTap/ProseMirror editor extension primitives that back RichTextEditor:
`emoji-suggestion.tsx`, `emoji-node.tsx`, `emoji-data.ts`, `emoji-mart.d.ts`,
`file-attachment.tsx`, `mention-suggestion.tsx`, `slash-command.tsx`.

These are headless-ish editor plugins that render small floating popover surfaces
(listboxes) into `document.body` via `createRoot`. They are correctly scoped: no
per-component test/story/doc, no barrel export (peer-gated, imported per-file). The
surfaces themselves are the audit target — they are the "cards/bars" of this unit.

Overall these are clean of the loud AI tells (no accent rails, no gradient text, no
indigo palette, no emoji-as-icon-system, no glassmorphism). The gaps are token
re-rolls (hardcoded z-index, raw px/`h-4 w-4`), missing motion (entrance/exit and
reduced-motion), and a state-coverage hole (no empty/loading state on the async emoji
popover). Not at the Card bar, but not slop either.

## Findings

### [P1][G2] Hardcoded z-index `1400` instead of `--z-popover` token (×3)
- **Category:** drift
- **Evidence:**
  - `mention-suggestion.tsx:83` — `container.style.zIndex = '1400' // z-popover`
  - `slash-command.tsx:159` — `container.style.zIndex = '1400' // z-popover`
  - `emoji-suggestion.tsx:103` — `container.style.zIndex = '1400'`
- **Why:** `1400` is literally the value of `--z-popover` (`semantic.css:447`). The comment even says `// z-popover`. This is a re-rolled token — if the z-scale ever shifts, these three inline styles silently drift out of layer order.
- **Fix:** Set `container.style.zIndex = 'var(--z-popover)'` (works on inline style in modern browsers) or add the `z-popover` utility class to the rendered root and drop the inline z-index. Prefer applying the class to the listbox root (the `<div role="listbox">` already sits in `document.body`).

### [P1][G2] Raw `h-4 w-4` / `1.2em` / `text-[10px]` instead of icon-size + type tokens
- **Category:** drift / vocabulary
- **Evidence:**
  - `slash-command.tsx:128-129` — `className="flex h-4 w-4 ..."` and `<IconComp className="h-4 w-4" />` (raw 16px, not `h-ico-*`, and bypasses the Icon API)
  - `mention-suggestion.tsx:60` — `text-[10px] font-semibold text-accent-11` (arbitrary font size, not a `text-ds-*` token)
  - `emoji-suggestion.tsx:13,83` — `size = '1.2em'` / `size="1.25em"` raw em sizing for the sprite; `emoji-node.tsx:33` — `h-[1.2em] w-[1.2em]` arbitrary.
- **Why:** The sibling `file-attachment.tsx` uses the `Icon` API (`<Icon icon={IconFile} size="sm" />`) and `mention-suggestion` uses `h-ico-md w-ico-md` right next to the raw `h-4 w-4` — so the unit is inconsistent with itself. `slash-command` renders `cmd.icon` as a bare `ComponentType` with a hardcoded 16px box, skipping the design-system Icon sizing entirely.
- **Fix:** Slash: render the icon through `<Icon>` / `IconProvider` at `size="sm"` and use `h-ico-sm w-ico-sm` for the box. Mention avatar-initial: replace `text-[10px]` with the nearest `text-ds-xs`. Emoji `1.2em`/`1.25em` sprite sizing is arguably legitimate (it must track the surrounding text em-box, not a fixed token) — acceptable as a deliberate exception, but the `emoji-node.tsx` `h-[1.2em]` could be a named utility for consistency.

### [P1][M3/M4] Floating suggestion popovers have zero entrance/exit motion and no reduced-motion path
- **Category:** motion
- **Evidence:** `mention-suggestion.tsx:79-147`, `slash-command.tsx:155-220`, `emoji-suggestion.tsx:94-160` — `onStart` mounts the list with `root.render(...)` and `onExit`/Escape calls `root.unmount()` immediately. No `animate-popover-in`/`animate-popover-out`, no `AnimatePresence`, no transition of any kind.
- **Why:** The token system ships `--animate-popover-in` (150ms productive-entrance) and `--animate-popover-out` (100ms productive-exit) precisely for these surfaces (`animations.css:33-34`), and every other overlay in the DS animates. These pop in/out with a hard cut — the "missing feedback motion" tell (M4), and because there's no motion at all there's trivially no reduced-motion handling (M3). The Card bar is "intentional motion, reduced-motion respected."
- **Fix:** Apply `animate-popover-in` to the listbox root on mount; on exit, run `animate-popover-out` then unmount on `animationend` (or wrap the React tree in `AnimatePresence` + a motion.div using `motionProps`/`MotionConfig` so reduced-motion is honored automatically, matching how Card/StatCard consume `springs`/`tweens`). The keyframes already respect the DS motion system.

### [P1][H] Async emoji popover has no loading/empty state — silent gap while data streams in
- **Category:** state-coverage
- **Evidence:** `emoji-suggestion.tsx:174-177` — `items: async ({ query }) => { const data = await loadEmojiData(set); return searchEmoji(data, query, 8) }`; `emoji-suggestion.tsx:67` — `if (!items.length) return null`.
- **Why:** `loadEmojiData` is an async fetch of a remote dataset (first `:` keystroke on a fresh set can take a network round-trip). During the await, `items` is empty → `EmojiList` returns `null` → the user types `:` and sees *nothing*, with no spinner, no "loading emoji…", and no "no results" message. Empty and loading are distinct states here and both render as a bare disappearance. Mention/slash are synchronous so they're fine, but they also return `null` on empty (acceptable for sync).
- **Fix:** Distinguish loading vs empty: while `loadEmojiData` is pending, render a small loading row (Spinner + "Loading emoji"); when the fetch resolves with zero matches, render a "No emoji found" row instead of `null`. Add `aria-busy` on the listbox while loading.

### [P2][M5] Popover position driven by animating inline `left`/`top` layout props
- **Category:** motion
- **Evidence:** `mention-suggestion.tsx:87-88, 110-111`; `slash-command.tsx:163-164, 183-184`; `emoji-suggestion.tsx:106-107, 124-125` — `container.style.left = ...; container.style.top = ...` reset on every `onUpdate`.
- **Why:** Positioning via `left`/`top` (rather than `transform: translate(...)`) is the layout-prop tell (M5) and thrashes layout as the caret moves. It's tolerable because it's not *animated* (instant reposition), but the DS convention is transform + a positioning lib.
- **Fix:** Position with `transform: translate(x, y)` on the container, or adopt the same floating-ui positioning the DS uses for Popover/DropdownMenu so anchoring, flipping, and collision are handled once (all three renderers duplicate the identical `clientRect → left/top` block).

### [P2][F5/structural] Three near-identical renderer implementations — no shared floating-popover primitive
- **Category:** composability / structural-tell
- **Evidence:** `createSuggestionRenderer` (`mention-suggestion.tsx:73-149`), `createSlashCommandRenderer` (`slash-command.tsx:149-221`), `createEmojiSuggestionRenderer` (`emoji-suggestion.tsx:93-161`) are ~95% copy-paste: same `createRoot`/`container`/`componentRef` lifecycle, same Escape-unmount, same `clientRect → left/top`, same `onExit` teardown.
- **Why:** This is the "re-rolling instead of composing the base primitive" gap (F5) at the plumbing layer. Each list also re-implements the same `role="listbox"` + arrow-key `useImperativeHandle` keyboard loop. Drift risk: the emoji renderer already diverged (its `onStart` omits the `// z-popover` comment and uses a slightly different structure). One would fix a bug in one and miss the other two.
- **Fix:** Extract a `createSuggestionPopoverRenderer<T>({ List })` helper and a `useSuggestionListKeyboard(items)` hook. All three extensions then supply only their row component. This is where the entrance/exit motion (M3/M4 above) and the token z-index (G2) would live once.

### [P2][H/a11y] Suggestion listboxes never set `aria-activedescendant` / roving focus
- **Category:** a11y / state-coverage
- **Evidence:** `mention-suggestion.tsx:44` `<div role="listbox">` with children `role="option" aria-selected={...}`, but the listbox itself has no `aria-activedescendant` and focus stays in the editor (the buttons are never focused; selection is visual via `aria-selected` + bg class).
- **Why:** With `role="listbox"`/`role="option"` the expected pattern is `aria-activedescendant` on the box pointing at the active option's `id`, so a screen reader announces the highlighted item as the user arrows through. Right now arrowing changes only a background color and `aria-selected`; nothing is announced because focus never moves and there's no activedescendant.
- **Fix:** Give each option a stable `id`, set `aria-activedescendant={activeOptionId}` on the listbox root, and ensure the listbox (or editor) is the focused element the AT tracks. Alternatively use `aria-live="polite"` to announce the selection.

### [P2][V11-adjacent] Slash-command group label is an uppercase-ish subtle kicker on every group
- **Category:** visual-tell (minor)
- **Evidence:** `slash-command.tsx:108-110` — `<div className="px-ds-03 py-ds-01 text-ds-xs font-medium text-surface-fg-subtle">{group.label}</div>` rendered above every group, plus a divider between groups (`:107`).
- **Why:** Borderline — grouped command menus legitimately label groups (this is the DropdownMenu/CommandPalette convention, not decorative). Not `uppercase tracking-*`, so it's not the hard eyebrow-kicker tell. Flagging only for parity: confirm this matches how `command-palette.tsx` renders section headers so the family shares one vocabulary. If CommandPalette uses a different header treatment, this drifts (G4).
- **Fix:** No change if it matches CommandPalette's group-header styling. If not, align them. (Verify against `composed/command-palette.tsx`.)

### [P2][G4] `bg-surface-overlay` vs `bg-surface-raised` inconsistency across the three popovers
- **Category:** drift / vocabulary
- **Evidence:**
  - emoji list root: `emoji-suggestion.tsx:70` — `bg-surface-overlay shadow-raised-hover`
  - mention list root: `mention-suggestion.tsx:44` — `bg-surface-overlay shadow-raised-hover`
  - slash list root: `slash-command.tsx:103` — `bg-surface-overlay ... shadow-floating`
  - but the *selected row* bg differs: emoji/mention use `bg-surface-raised` for the active row (`:80`, `:54`) while slash uses `bg-surface-raised-hover` (`:123`).
- **Why:** Three sibling popovers, two different elevation shadows (`shadow-raised-hover` vs `shadow-floating`) and two different active-row tints. Same conceptual surface, inconsistent vocabulary (G4). All are legitimate tokens (no re-roll), so this is polish, not a tell — but the Card bar is "surface vocabulary shared with its family."
- **Fix:** Pick one overlay shadow for all three suggestion popovers (they're the same layer) and one active-row token. `shadow-floating` + `bg-surface-raised-hover` active row is the more defensible pair for a floating menu; align emoji/mention to it (this falls out naturally from the shared-renderer extraction in F5).

### [P3][types] `as any` casts on the command payload
- **Category:** types
- **Evidence:** `slash-command.tsx:174, 193` — `command={(cmd) => props.command(cmd as any)}`; `slash-command.tsx:269` — `;(item as unknown as SlashCommand).action(editor)`.
- **Why:** `any`/`unknown as` in the command wiring defeats the typed `SlashCommand` contract. The TipTap `Suggestion` generic could carry `SlashCommand` so the cast disappears. Low blast radius (internal plumbing, not an exported prop) → P3.
- **Fix:** Type the `Suggestion<SlashCommand>` generic and `SuggestionProps<SlashCommand>` so `props.command` accepts a `SlashCommand` without the cast; drop the `as any`.

### [P3][docs/J] No story, test, or per-component doc for the extensions unit
- **Category:** docs / state-coverage
- **Evidence:** No `extensions/*.test.tsx`, `extensions/*.stories.tsx`, or `docs/components/**/extensions.md` exist (searched — none). The suggestion popovers' keyboard nav, empty/loading behavior, and a11y roles are entirely untested.
- **Why:** These render real interactive listboxes with arrow-key nav and portal lifecycle — exactly the surface that regresses silently. RichTextEditor may cover them transitively, but there's no direct coverage of the arrow-wrap logic, Escape teardown, or (missing) empty state. Publish-gate-wise these are peer-gated sub-primitives, so a standalone story is awkward, hence P3 not P2.
- **Fix:** At minimum add unit tests for the keyboard loop (arrow wrap, Enter selects, Escape unmounts) and the empty/loading rendering once the emoji loading state (finding above) exists. A Storybook story driving RichTextEditor with these extensions would demonstrate the popovers.

## Composability gaps
- **No shared floating-popover renderer** (F5): three copy-paste `create*Renderer` functions duplicate portal lifecycle, positioning, and Escape handling. Extract one generic helper.
- **No shared suggestion-list keyboard hook**: the arrow-up/down/Enter `useImperativeHandle` block is triplicated (emoji/mention/slash). Should be a `useSuggestionKeyboard(items, command)` hook.
- **`slash-command` icon is a bare `ComponentType`**, not the DS `IconInput` / `Icon` API used by `file-attachment` and `stat-card`. Slash-command icons bypass Icon sizing/context — inconsistent icon vocabulary within the same unit.
- **Positioning is hand-rolled** (`clientRect → left/top`) rather than composing the DS's floating/Popover positioning primitive — no flip/collision handling, and it's the M5 layout-prop tell.

## Motion gaps
- **No entrance/exit motion** on any of the three suggestion popovers despite `--animate-popover-in`/`--animate-popover-out` existing for exactly this (M4). Hard-cut mount/unmount.
- **No reduced-motion path** (trivially, since there's no motion) — but once motion is added it must route through the DS motion system so reduced-motion is honored (M3).
- **Position updates via `left`/`top` inline styles** rather than `transform` (M5) — layout thrash on caret move.
- `file-attachment.tsx:22` uses `transition-colors` for hover — the one place motion is present, and it's fine (feedback micro-transition, matches Card's `transition-shadow` pattern).

## Polish plan (ordered steps to reach the finish bar)
1. **Extract a shared `createSuggestionPopoverRenderer<T>({ List })`** + `useSuggestionKeyboard` hook; refactor emoji/mention/slash onto it (kills the triplication and gives one place for the next fixes). [F5]
2. In that shared renderer, **replace the inline `zIndex = '1400'`** with the `z-popover` utility class on the listbox root. [G2]
3. **Add `animate-popover-in` on mount and `animate-popover-out` before unmount** (or wrap in `AnimatePresence` via the DS motion system for automatic reduced-motion). [M3/M4]
4. **Switch positioning to `transform: translate(...)`** or adopt the DS Popover/floating-ui positioning. [M5]
5. **Add loading + empty states to the emoji popover** (Spinner while `loadEmojiData` awaits; "No emoji found" on zero matches; `aria-busy`). [H]
6. **Add `aria-activedescendant`** on all three listboxes with per-option `id`s so screen readers announce the highlighted item. [H/a11y]
7. **Route slash-command icons through the `Icon`/`IconProvider` API** and replace `h-4 w-4` with `h-ico-sm`; replace `text-[10px]` with `text-ds-xs`. [G2]
8. **Unify overlay shadow + active-row token** across the three popovers (`shadow-floating` + `bg-surface-raised-hover`). [G4]
9. **Type the `Suggestion<SlashCommand>` generic** to drop the `as any` casts. [types]
10. **Add keyboard-nav + empty-state unit tests** (and a RichTextEditor story exercising the extensions). [docs/J]

## Clean (rubric dims that pass)
- **V1 accent rail** — none. No colored left/top stripes anywhere.
- **V2 double edge** — clean: mention/emoji lists are elevation-led (`shadow` only, no border); `file-attachment` is border-led (`border`, no shadow); slash is elevation-led. Each picks one.
- **V3 gradient text** — none.
- **V4 default framework palette** — none; all colors are semantic tokens (`accent-*`, `surface-*`, `success/error-11`). `bg-accent-2`/`text-accent-11` on the mention avatar-initial are proper semantic tokens.
- **V5 emoji-as-icon-system** — the emoji feature renders *user-inserted* emoji (data-driven from a real dataset), not emoji as decorative icon slots. `file-attachment`/`slash` use lucide/tabler via the icon path. Clean.
- **V6 blob/glass/glow, V7 rounded-everything, V8 pill spam** — none. Radii use `rounded-control`/`rounded-surface`/`rounded-pill` (pill only on the avatar circle). No backdrop-blur, no glow shadows.
- **V9-V15 (fonts, decorative numbering, eyebrow, hero, all-caps, AI imagery)** — none applicable / none present.
- **E1-E8 verbal tells** — JSDoc on `createSlashCommandExtension` is plain and direct; no em-dash tics, no AI vocabulary, no hedging.
- **G1 surface layering** — these render into `document.body` as overlays and correctly use `bg-surface-overlay` (the overlay rule allows surface-1/overlay for popovers). `file-attachment` inline chip uses `bg-surface-raised` appropriately (it's a card-like inline element, not a page bg).
- **G3 variant-axis / G5 soft-vs-outline** — no CVA variant axes exposed here (these are extensions, not variant components); N/A.
- **F6 controlled/uncontrolled** — N/A (imperative TipTap plugins, no value prop surface).
- **Keyboard nav basics** — arrow up/down wrap correctly, Enter selects, Escape tears down; options are real `<button>`s (not `div onClick`). The gap is `aria-activedescendant`, not missing keyboard support.
- **XSS guard** — `file-attachment.tsx:15` sanitizes the href (`/^https?:\/\//` → else `#`) and sets `rel="noopener noreferrer"`. Good defensive default.
