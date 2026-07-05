# composed/rich-chat-input — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:5 P2:7 P3:3

Scope audited: `rich-chat-input.tsx` (main) + `rich-chat-input/chat-toolbar.tsx` + siblings it ships by default (`reply-banner.tsx`, `recording-overlay.tsx`, `attachment-strip.tsx`, referenced `schedule-send.tsx`), plus `.test.tsx`, `.stories.tsx`, and `docs/components/composed/rich-chat-input.md`.

This is a large, genuinely-built component (voice, mentions, slash, schedule, emoji, streaming) — not AI slop. It's clean on the hard visual tells (no accent rail, no gradient text, no glass/blob, semantic tokens throughout). Where it falls short of the Card bar is **composability** (it re-rolls a lot of button/dropdown/surface primitives it should compose), **motion hygiene** (no reduced-motion in the main file; animates `height:auto` on layout), and **docs drift** (the shipped doc's prop table is materially wrong).

## Findings

### [P1][F5] Re-rolls buttons the DS already ships (Button/IconButton/Toggle)
- **Category:** composability
- **Evidence:** rich-chat-input.tsx:178-211 `SplitSendDropdown` hand-rolls a `<button>`; :874-888 formatting-toggle `<button>`; :892-904 emoji `<button>`; chat-toolbar.tsx:65-86 `ToolbarButton` hand-rolls a `<button>`; rich-chat-input.tsx:270-298 `BubbleBtn` a fourth hand-rolled button.
- **Why:** Four separate bespoke button implementations re-derive focus ring, touch-target, hover/active, disabled opacity that `Button`/`IconButton`/`ToggleButton` already own — the exact drift StatCard fixed by composing Card. State/pressed styling can silently diverge from the DS.
- **Fix:** Route icon/toggle buttons through `IconButton` (or a `Toggle` primitive) with `aria-pressed`; keep only the truly-custom label button (`Refine`) as a `Button` with `startIcon`.

### [P1][F1/F5] Emoji popover + SplitSendDropdown re-roll Popover/DropdownMenu surface
- **Category:** composability
- **Evidence:** rich-chat-input.tsx:194-209 dropdown panel = raw `absolute … rounded-surface bg-surface-overlay p-ds-02 shadow-floating z-popover` + manual outside-click effect (:167-174); :218-266 `EmojiPickerPopover` re-implements outside-click (:229-235) + Escape (:238-242) + Floating-UI positioning (:394-416).
- **Why:** The DS ships `Popover`/`DropdownMenu` with focus-trap, Escape, outside-click, portal, and positioning already solved. Re-rolling them means no focus management, no `aria-*` menu semantics, and three copies of outside-click logic that can drift. `SplitSendDropdown` options are `<button>`s with no `role="menuitem"`/roving focus.
- **Fix:** Build the send-options dropdown on `DropdownMenu`; anchor the emoji picker with `Popover`. Delete the bespoke outside-click/Escape/Floating-UI effects.

### [P1][G3] Variant axis is off the canonical taxonomy
- **Category:** vocabulary
- **Evidence:** rich-chat-input.tsx:94 `variant?: 'compact' | 'expanded' | 'minimal' | 'inline'`.
- **Why:** Canonical `variant` axis is solid/soft/outline/ghost/link. Here `variant` is a size/layout-envelope axis (min/max height, toolbar position) — collides with the DS meaning of `variant`. A consumer reading the API can't predict it.
- **Fix:** Rename to a layout axis, e.g. `layout="compact|expanded|minimal|inline"` (or `density`/`size`). If it must stay for back-compat, document it explicitly as a layout envelope, not a visual variant.

### [P1][M3] No reduced-motion guard in the main component's animations
- **Category:** motion
- **Evidence:** rich-chat-input.tsx:1019-1114 all send/mic/recording button swaps are `motion.div` scale/opacity with no `useReducedMotion`; reply-banner.tsx:19-24 and attachment-strip.tsx:37-42 animate with no reduced-motion guard. Only recording-overlay.tsx:33 uses `useReducedMotion`.
- **Why:** Section C M3: animation with no `prefers-reduced-motion` guard is a tell. The overlay respects it but the rest of the component ignores it — inconsistent within one unit. (Note: if the app wraps in `MotionConfig reducedMotion="user"` this is mitigated, but the component can't assume that.)
- **Fix:** Gate the button-swap and banner/strip entrances behind `useReducedMotion()` (or rely on a documented MotionConfig contract and state it).

### [P1][M5] Animates `height: auto` (layout prop) on banners + attachment strip
- **Category:** motion
- **Evidence:** reply-banner.tsx:20-24 `initial={{ height: 0 }} animate={{ height: 'auto' }}`; attachment-strip.tsx:38-42 same; contrast with the main file's own toolbar which correctly uses a CSS `grid-template-rows 0fr→1fr` transition (rich-chat-input.tsx:820-824, 962-965).
- **Why:** M5: animating layout props (height) instead of transform triggers layout on every frame; the component already demonstrates the better `grid-rows` technique two zones away, so this is inconsistent.
- **Fix:** Use the same `grid-rows-[0fr]→[1fr]` CSS technique (or framer `layout`) for ReplyBanner/AttachmentStrip entrance, matching the toolbar zones.

### [P2][J] Doc prop table is materially wrong (drift from source)
- **Category:** docs
- **Evidence:** rich-chat-input.md:12 documents `onSubmit: (html, plainText) => void` but source is `onSubmit: (message: RichChatInputMessage) => void` (rich-chat-input.tsx:89); md:15 lists variants `compact|expanded|minimal` (missing `inline`, tsx:94); md:16 documents `maxRows: number` which does not exist in props; md:34 lists ChatToolbarItem `'attach'` which is not in the union (chat-toolbar.tsx:268-272); md omits `charCountDisplay`, `onSchedule`, `sendOptions`, `actionButton`, `emojiSet`, `onVoiceRecord`, `onTranscribe`, `replyTo`, `isStreaming` shape.
- **Why:** J: doc prop table must match source; source wins. `onSubmit` signature drift will make every consumer's first call fail typecheck against the doc. `maxRows` and `attach` are invented.
- **Fix:** Regenerate the prop table from the interface; document `RichChatInputMessage`; add the four variants; drop `maxRows`/`attach`.

### [P2][H] Custom buttons drop `disabled` wiring; toggle uses no shared disabled state
- **Category:** state-coverage
- **Evidence:** rich-chat-input.tsx:874-888 (formatting toggle) and :892-904 (emoji) have no `disabled` handling — when the whole input is `disabled` these inline buttons stay active; SplitSendDropdown (:178-211) also ignores `disabled`. Only `ChatToolbar` threads `disabled` (chat-toolbar.tsx:62-63).
- **Why:** Disabled state is only partially covered; the composer can be `disabled` yet the emoji/format toggles remain clickable.
- **Fix:** Thread `disabled` into the inline action buttons (another reason to use `IconButton`, which handles it).

### [P2][H] `SplitSendDropdown` menu items lack menu semantics / keyboard nav
- **Category:** a11y
- **Evidence:** rich-chat-input.tsx:196-207 options render as plain `<button>` inside a `<div>` with a text `<p>` header; no `role="menu"`/`role="menuitem"`, no arrow-key roving focus, no focus return.
- **Why:** H: keyboard nav missing on a menu; screen readers won't announce it as a menu.
- **Fix:** Use `DropdownMenu` (covers this) or add `role=menu/menuitem` + arrow-key handling.

### [P2][G2] Raw arbitrary values instead of tokens in several spots
- **Category:** drift
- **Evidence:** rich-chat-input.tsx:185 `w-5` (send-options chevron width); :195 `min-w-[200px]`; reply-banner/others use `h-ds-xs-plus` consistently but chat-toolbar.tsx:91 `h-4 w-px` divider; emoji fallback rich-chat-input.tsx:245 `h-[350px] w-[352px]`; attachment-strip.tsx:67 `h-12 w-12`, :111 `max-w-[120px]`. Several are annotated as intentional (comments at :193, attachment-strip :66/:110), which is a legitimate choice; the un-annotated ones (`w-5`, `h-4`) are the drift.
- **Why:** G2: bare px where a spacing/size token exists. The annotated ones are defensible; the un-annotated `w-5`/`h-4` are reflexive.
- **Fix:** Map `w-5`→a `ds` size or match the chevron to `h-ds-xs-plus w-ds-xs-plus`; `h-4 w-px` divider → a token height. Leave the annotated component-specific sizes.

### [P2][F6] Editor content is not controllable (no controlled/uncontrolled parity)
- **Category:** composability
- **Evidence:** rich-chat-input.tsx:92 `content?: string` is documented "Initial HTML content (not reactive — use for message editing)"; there is no `value`/`onChange` or `onValueChange`. Message editing (updating `content` after mount) silently does nothing.
- **Why:** F6: controlled/uncontrolled gap. For a message-edit flow (a stated use case) the consumer can't push new content in.
- **Fix:** Either support a reactive `value` + `onValueChange` path, or rename `content` → `defaultContent` and document the uncontrolled-only contract clearly.

### [P2][F2] Custom label toolbar button can't polymorph
- **Category:** composability
- **Evidence:** chat-toolbar.tsx:47-87 `ToolbarButton` renders a hardcoded `<button>`; the `Refine` story (stories:400-403) uses it for an action, but there's no `asChild` for a link/menu-trigger use.
- **Why:** F2: a button-like primitive consumers will want to polymorph (e.g. wrap a `DropdownMenu.Trigger`) has no `asChild`.
- **Fix:** Compose `Button`/`IconButton` (which have the Slot pattern) instead of a raw element, or add `asChild`.

### [P2][state] Streaming stop button hardcodes `color="error"` and lacks `aria-busy`
- **Category:** state-coverage
- **Evidence:** rich-chat-input.tsx:1045 stop button is `color="error"`; the composer sets no `aria-busy` on the region while `isStreaming`, and there's no `aria-live` announcing "AI is responding".
- **Why:** H: loading/async with no `aria-busy`/`aria-live`. The stop affordance is visual-only for AT users.
- **Fix:** Add `aria-busy={isStreaming}` to the composer region and an `aria-live` status; reconsider whether "stop" must read as error-red (it's a neutral cancel).

### [P3][V4] Story fixtures use raw `#6366F1` (indigo) placeholders
- **Category:** visual-tell
- **Evidence:** stories:91 `placehold.co/200x200/6366F1/ffffff`; :303 same; :147 `1a1a2e`. Not shipped in the component — story-only upload placeholders.
- **Why:** V4 is about brand/accent color; these are demo image URLs, not component styling, so low severity — but `6366F1` is the archetypal AI indigo and reads as a tell in the gallery.
- **Fix:** Swap the placeholder color to a brand/neutral hex for polish; not load-bearing.

### [P3][E1] Em-dash-as-connector in shipped JSDoc/comments
- **Category:** verbal-tell
- **Evidence:** many `—` used as stylistic connectors in comments/JSDoc, e.g. rich-chat-input.tsx:106-107 `"…return text to insert into the editor. If null is returned, the audio is attached as a voice note."` (doc string) and pervasive `// ── X ──` section banners; md:71-80 uses `—` connectors.
- **Why:** E1: em-dash tic. This is internal/JSDoc not marketing copy, so P3, but the audit flags the reflex.
- **Fix:** Optional — these are dev-facing; low priority. Tighten the shipped `.md` (consumer-facing) if anywhere.

### [P3][docs] Doc "Changes" section stops at v0.33.0
- **Category:** docs
- **Evidence:** rich-chat-input.md:90-101 last entry v0.33.0; the source now has `inline` variant, `toolbar` ReactNode custom mode, transcribe, sendOptions — none logged.
- **Why:** Stale changelog in the per-component doc.
- **Fix:** Bring the doc Changes section current.

## Composability gaps
- Four hand-rolled `<button>` implementations (SplitSendDropdown trigger, formatting toggle, emoji trigger, BubbleBtn) + a fifth (`ToolbarButton`) instead of composing `Button`/`IconButton`/`Toggle`. This is the StatCard-vs-Card lesson unlearned. [F5]
- Emoji popover and send-options dropdown re-roll surface + outside-click + Escape + Floating-UI positioning that `Popover`/`DropdownMenu` already own (three separate outside-click effects). [F1]
- `content` is initial-only — no controlled `value`/`onValueChange`, so the documented "message editing" use case can't update after mount. [F6]
- Custom toolbar buttons have no `asChild`. [F2]
- `variant` name is overloaded as a layout axis, off the canonical variant taxonomy. [G3]

## Motion gaps
- No `useReducedMotion` in the main file; only `RecordingOverlay` respects it. The many button-swap animations and the reply/attachment banners ignore reduced-motion. [M3]
- `ReplyBanner` and `AttachmentStrip` animate `height: auto` (layout prop) while the toolbar zones in the same file correctly use CSS `grid-rows 0fr→1fr` — inconsistent, and the height version thrashes layout. [M5]
- Button-swap durations are uniform `durations.moderate01` across recording/streaming/send/mic (rich-chat-input.tsx:1026,1043,1056,1081,1094,1107) — acceptable but not differentiated by importance (minor M2).

## Polish plan (ordered steps to reach the finish bar)
1. **Fix the doc drift (P2/J) first** — regenerate the prop table from the interface: correct `onSubmit` signature, add `inline` variant, drop `maxRows`, drop `attach` from `ChatToolbarItem`, document `RichChatInputMessage` + the newer props. This is the highest-impact, lowest-risk fix and it's a publish gate.
2. **Compose DS primitives for buttons** — replace the five bespoke `<button>`s with `IconButton`/`Toggle`/`Button`, threading `disabled`. Kills [F5], the partial-disabled [H], and un-tokenized `w-5`/`h-4` in one pass.
3. **Replace bespoke popovers** — build send-options on `DropdownMenu` (fixes [F1] + menu-semantics [H]) and anchor the emoji picker on `Popover`; delete the three outside-click/Escape/Floating-UI effects.
4. **Motion hygiene** — add `useReducedMotion` gating to the main file's animations; convert ReplyBanner/AttachmentStrip to the `grid-rows` CSS transition already used for the toolbar. [M3, M5]
5. **Rename the layout axis** — `variant` → `layout` (or document it as a layout envelope) to stop colliding with the canonical variant taxonomy. [G3]
6. **Streaming a11y** — add `aria-busy`/`aria-live` on the composer during `isStreaming`. [H]
7. **Controlled content** — decide controlled vs uncontrolled; either add `value`/`onValueChange` or rename to `defaultContent`. [F6]
8. Swap the indigo `6366F1` story placeholders for a brand/neutral hex. [V4]

## Clean (rubric dims that pass)
- **V1 accent rail:** none. No colored left/top stripe anywhere.
- **V2 double edge:** the composer container uses border-only (rich-chat-input.tsx:766) without a competing drop shadow; overlays use `shadow-floating` without a border. OK.
- **V3 gradient text:** none.
- **V6 blob/glass/glow:** none. No backdrop-blur default, no glow shadows.
- **V7 rounded-everything:** uses `rounded-surface`/`rounded-control`/`rounded-pill` vocabulary, not `rounded-2xl/3xl`.
- **V5 emoji-as-icon:** the emoji feature is a real product feature (emoji-mart + spritesheet), not decorative emoji-as-icon; all UI icons are Tabler via the `Icon` API. Clean.
- **V8 pill-badge spam / V10-V14:** none in source or stories.
- **G1 surface layering:** overlays use `bg-surface-overlay` (rich-chat-input.tsx:195,251, chat-toolbar not a surface); recording overlay uses `bg-surface-raised-hover`; composer border on a subtle-bordered bar — consistent with the layering rule (this is shell-chrome input, not a card). No `bg-surface-1` misuse.
- **G2 (mostly):** color/spacing tokens used pervasively (`text-surface-fg*`, `bg-accent-*`, `gap-ds-*`, `px-ds-*`); the arbitrary values that remain are annotated as component-specific (attachment thumbnail, dropdown min-width) — legitimate choices. Only `w-5`/`h-4` are un-annotated.
- **M1 bounce-by-default:** button swaps use plain tween scale/opacity, no overshoot spring; `springs.bouncy` is not used here. Clean.
- **M4 feedback motion:** hover/active/focus transitions present on interactive elements; overlays have enter/exit. Present.
- **E2-E8 verbal:** no contrastive negation, no AI-vocabulary words, no meta-hedging, no chatbot artifacts in shipped copy.
- **I types:** `forwardRef` + `displayName` present (rich-chat-input.tsx:344,1137); props typed via a real interface extending `HTMLAttributes`; `RichChatInputMessage` exported; no `any` in the public surface; `onSubmit` uses a structured message type (good). Clean.
- **H (partial):** solid a11y baseline — `role="region"`/`role="toolbar"`/`role="status"`/`role="list"` with labels, `aria-pressed` on toggles, `aria-live` on recording overlay, keyboard Enter/Shift-Enter/Mod-Enter, Escape to cancel, axe test present and passing. Strong overall; gaps noted above are incremental.
- **J stories:** 20 stories covering all variants, streaming, char-limit modes, voice, reply, schedule, custom toolbar, mobile — comprehensive. (Doc prop-table drift is the only docs failure.)
