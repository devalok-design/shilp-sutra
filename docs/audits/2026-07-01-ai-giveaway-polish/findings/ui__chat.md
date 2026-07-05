# ui/chat — audit
**Finish score:** 2/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:1 P1:6 P2:5 P3:2

Unit is a 7-primitive kit: `MessageList`, `Message` (compound), `SystemMessage`, `MessageInput`, `DateSeparator`, `UnreadSeparator`, `TypingIndicator`. Source under `packages/core/src/ui/chat/`. It composes real primitives (Avatar, Button, Textarea, Tooltip, Spinner, Icon) and has good a11y bones (`role="log"`/`aria-live`, keyboard send, reaction aria-labels). It falls short of the Card bar on two axes: (1) a literal **accent rail** on the mention highlight — the exact tell v0.44.0 killed on Card — and (2) **systematic token re-rolls**: a hardcoded `text-[13px]` body type scale and `/50 /60 /30` opacity-hacked color tokens instead of the `--text-ds-*` / semantic system.

## Findings

### [P0][V1] Accent rail on the mention-highlight message
- **Category:** visual-tell
- **Evidence:** `message.tsx:130` — `highlight === 'mention' && 'border-l-2 border-l-accent-9 bg-accent-2 pl-ds-03 rounded-control-inner'`
- **Why:** A colored 2px left stripe on a content row is *the* single most recognizable AI giveaway — the same `border-l-*` accent rail we deliberately removed from Card in v0.44.0. It ships by default whenever a consumer marks a message as a mention.
- **Fix:** Drop `border-l-2 border-l-accent-9`. The `bg-accent-2` tint already carries the emphasis (the bubble variant at `message.tsx:98` does mention-highlight with tint + padding and *no* rail — match that). If a stronger signal is wanted, lean on the tint depth or a leading `@` affordance, not a rail.

### [P1][G2] Hardcoded `text-[13px]` body/author type scale (bypasses `--text-ds-*`)
- **Category:** drift
- **Evidence:** `message.tsx:248` `text-[13px]` (author), `:251` `text-[11px]` (timestamp), `:268` `text-[13px]` (body), `:342`/`:350`/`:363` `text-[13px]` (editable body)
- **Why:** The DS ships `--text-ds-*` (e.g. `text-ds-sm`, `text-ds-xs`) precisely so components don't invent a px scale. Five literal `text-[13px]` plus a `text-[11px]` is a parallel type scale living only in this file — drift risk and a re-roll the audit explicitly flags (G2: hardcoded px instead of tokens).
- **Fix:** Map to the nearest DS tokens (`text-ds-sm` / `text-ds-xs` / `leading-ds-*`). If 13px is genuinely needed for chat density, add a `--text-ds-*` token rather than literals scattered across the file.

### [P1][G2] Opacity-hacked color tokens (`/50`, `/60`, `/30`) instead of semantic muted/subtle steps
- **Category:** drift
- **Evidence:** `message.tsx:76,251,353` `text-surface-fg-subtle/50`; `system-message.tsx:40` `text-error-11/60`, `:54` `bg-surface-raised-hover/30` `text-surface-fg-subtle/60`; `date-separator.tsx:38` `text-surface-fg-subtle/50`; `message-input.tsx:103,130` `text-surface-fg-subtle/50`; `message.tsx:99,131` `bg-warning-2/50`
- **Why:** The surface/text scale already encodes muted/subtle steps (`surface-fg-muted`, `surface-fg-subtle`). Diluting an already-subtle token by an arbitrary `/50` produces an off-ramp value with no token, fails forced-colors predictably, and is a model-default "just make it lighter" reflex.
- **Fix:** Use the next semantic step (`text-surface-fg-subtle` as-is, or add a dedicated `-faint` token) rather than `/50`. For the internal/mention tints, `bg-warning-2` / `bg-accent-2` are already the subtle steps — drop the `/50`.

### [P1][F6] MessageInput is uncontrolled-only — no controlled `value`/`onChange` mode
- **Category:** composability
- **Evidence:** `message-input.tsx:40` `const [text, setText] = React.useState('')` — the text is purely internal; props expose only `onSubmit(text)`. No `value`, `defaultValue`, or `onChange`.
- **Why:** F6 controlled/uncontrolled gap. A consumer can't drive the field (restore a draft, clear externally, mirror to another surface, prefill a reply quote). Every real chat composer needs this; today they must reach for RichChatInput or fork.
- **Fix:** Add optional `value` + `onChange` (controlled) alongside the current uncontrolled default; fall back to internal state when `value` is undefined. Keep `onSubmit` as the submit semantic.

### [P1][G2] MessageAvatar duplicates Avatar sizing instead of fully delegating
- **Category:** drift
- **Evidence:** `message.tsx:163-198` — hand-rolled `w-5/h-5` `w-6/h-6` wrappers and a manual `rounded-pill bg-surface-raised-hover` icon chip, then *also* renders `<Avatar size={...}>` inside another fixed-width wrapper
- **Why:** F5/G2 — re-rolls avatar dimensions and an icon-chip surface that Avatar already owns. The size mapping (`sm→xs`, `md→sm`) and the manual circle are exactly the drift StatCard fixed by composing Card. Two sources of truth for "how big is a chat avatar."
- **Fix:** Delegate sizing to `Avatar`'s own size axis; render the icon case through `Avatar` (fallback slot or an `icon` affordance) rather than a bespoke `rounded-pill` chip.

### [P1][M3] TypingIndicator infinite bounce has no reduced-motion guard of its own
- **Category:** motion
- **Evidence:** `typing-indicator.tsx:33-41` — `animate={{ y: [0, -3, 0] }}` `transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}`
- **Why:** M3. A perpetual transform loop. It relies entirely on the consumer wrapping the app in `<MotionProvider reducedMotion="user">` (MotionConfig). With no provider, reduced-motion users get an endless bounce. The DS's own `withReducedMotion` helper and `useMotion()` exist for exactly this (used by ai/conversation, ai/devadoot-icon) but chat doesn't touch them.
- **Fix:** Read `useReducedMotion()` (or `useMotion().reducedMotion`) and render static dots (or none) when reduced; or gate the `repeat: Infinity` behind it. Don't assume the provider is present.

### [P1][J] Doc/source prop-name mismatch: `isLoadingMore` vs `loadingMore`
- **Category:** docs
- **Evidence:** `docs/components/ui/chat.md:20` `isLoadingMore: boolean` and example `:28` `isLoadingMore={loading}` — but source prop is `loadingMore` (`message-list.tsx:21,38`)
- **Why:** J docs parity — source wins. A consumer copy-pasting the documented example passes a prop that does nothing; the spinner never shows.
- **Fix:** Correct the doc to `loadingMore`.

### [P2][F1] MessageList `scrollToBottomSlot` is a dead reserved prop
- **Category:** composability
- **Evidence:** `message-list.tsx:24` `/** Custom scroll-to-bottom button (unused slot for future override) */ scrollToBottomSlot?` — destructured at `:41` but never rendered anywhere in the body
- **Why:** F1/types. A prop in the public type surface that does nothing is a contract lie; it implies an override point that isn't wired. "Unused slot for future" is a YAGNI tell.
- **Fix:** Either wire it (render in place of the built-in "N new" pill / a real scroll-to-bottom affordance) or remove it from the props until it's implemented.

### [P2][M2] Hardcoded magic-number motion timings instead of the duration scale
- **Category:** motion
- **Evidence:** `typing-indicator.tsx:37` `duration: 0.5`, `:39` `delay: i * 0.15`; `message.tsx:435` `transitionDelay: ${delay}ms` (default `delay = 100`); `message-input.tsx:47/104` `Math.min(..., 160)` / `maxHeight: 160`; `message-list.tsx:60` `< 40` / `:65` `< 100` scroll thresholds
- **Why:** M2 — the DS exposes a `durations` scale (`fast01..slow02`) and `springs`/`tweens` presets; chat reaches for raw seconds/ms in several spots. Inconsistent timing vocabulary across the family.
- **Fix:** Pull animation timings from `durations`/`tweens` where they map (the 0.5s loop ≈ `slow02` region; the 100ms reveal delay is a tween). Layout thresholds (40/100/160px) are layout constants, not motion — those are acceptable but worth a named const.

### [P2][H] EditableBody / clickable-card interactions lack visible focus-ring + 44px target
- **Category:** a11y
- **Evidence:** `message.tsx:360-378` editable display mode: `role="button" tabIndex={0}` with `hover:bg-surface-raised-hover` but **no** `:focus-visible` ring; the `cursor-pointer` row has no min touch target.
- **Why:** H — a focusable control with no focus-visible affordance fails keyboard-user visibility; the DS has a `focus-ring` utility for exactly this. Reaction buttons (`message.tsx:399`) and Message.Action (`:461`) are small icon hits (`px-ds-02`/`p-ds-02`) likely under the 44px touch target.
- **Fix:** Add the DS `focus-ring`/`focus-visible:ring` utility to EditableBody's button row and verify reaction/action hit areas meet the touch-target utility (or document the exception).

### [P2][V14] DateSeparator all-caps + wide tracking as the default label treatment
- **Category:** visual-tell
- **Evidence:** `date-separator.tsx:38` — `uppercase tracking-wider` on the date label by default; `unread-separator.tsx:14` default `label = 'NEW'` (all-caps) + `:19` no-case-control
- **Why:** V14 — all-caps + letter-spacing as default emphasis is a model reflex. "Today"/"Yesterday" forced to "TODAY"/"YESTERDAY" reads as decorative. Borderline (date dividers are a conventional place for it), so P2 not P1.
- **Fix:** Consider sentence-case with weight/color for hierarchy instead of `uppercase tracking-wider`; if all-caps stays, make it intentional and consistent with the rest of the type system rather than a per-component choice.

### [P3][G2] MessageActions floating toolbar uses raw `-top-2` / `z-10` instead of tokens
- **Category:** drift
- **Evidence:** `message.tsx:431` `'absolute -top-2 right-0 z-10'` and `:433` `duration-150`; bubble `max-w-[85%]` at `:106`
- **Why:** G3/G2 — `-top-2` is a raw Tailwind spacing step (not `-top-ds-*`), `z-10` bypasses the `z-layer` utility, `duration-150` is a literal not a `duration-*` name. Minor, but the surface-layering/z-layer system exists.
- **Fix:** Use `-top-ds-02` (or the tucked-corner pattern Card's `CardAction` uses), a `z-popover`/`z-layer` utility, and a named `duration-*`.

### [P3][V8] Story sprinkles a bespoke "Internal" pill inline instead of the Badge primitive
- **Category:** structural-tell
- **Evidence:** `chat.stories.tsx:264` — `<span className="rounded-pill bg-warning-3 px-1.5 py-0.5 text-[10px] ...">Internal</span>`
- **Why:** V8/G2 in story source — a hand-rolled pill with raw `px-1.5 py-0.5 text-[10px]` where the DS `Badge` exists. Story-only, so P3, but it models the wrong pattern for consumers reading docs.
- **Fix:** Use `<Badge color="warning" size="xs">Internal</Badge>` in the story.

## Composability gaps
- **MessageInput has no controlled mode** (F6) — `value`/`onChange` missing; uncontrolled-only `useState`. Biggest composability gap in the unit.
- **MessageList `scrollToBottomSlot` is declared but never rendered** (F1) — phantom slot.
- **MessageAvatar re-rolls Avatar sizing and an icon chip** (F5) rather than fully delegating to the `Avatar` primitive — two sources of truth for avatar dimensions.
- **Message.Actions only works nested inside Message root** (`group-hover/message`) — documented, but a hard coupling; a consumer wanting a persistent (non-hover) action bar has no prop to pin it open.
- **Avatar/Author/Content sub-components are plain functions, not `forwardRef`** (`message.tsx:154,209,232` etc.) — root is `forwardRef`, sub-parts aren't; ref access to a message body/avatar isn't possible. (I — minor.)

## Motion gaps
- **TypingIndicator infinite bounce has no own reduced-motion guard** (M3) — relies entirely on consumer MotionProvider; perpetual transform loop otherwise.
- **Raw timing magic numbers** (M2) — `0.5`s loop, `0.15`s stagger, `100`ms reveal delay, `duration-150` — not drawn from the `durations`/`tweens` scale the DS ships.
- **No focus/feedback motion on EditableBody button row** (M4-adjacent / H) — hover bg only, no focus-visible transition.
- Entrance motion itself is fine: `springs.snappy` (not bouncy/elastic) for message mount, `AnimatePresence` for list + "N new" pill, opacity for typing — no bounce-by-default tell (M1 clean). Animations are transform/opacity, not layout props (M5 clean), except the textarea auto-resize which animates `height` via direct style — acceptable (not a Framer layout-prop animation).

## Polish plan (ordered steps to reach the finish bar)
1. **Kill the accent rail** (P0/V1): remove `border-l-2 border-l-accent-9` from the flat mention highlight (`message.tsx:130`); keep the `bg-accent-2` tint, matching the bubble variant.
2. **Detox the type scale** (P1/G2): replace all `text-[13px]`/`text-[11px]` with `text-ds-sm`/`text-ds-xs` (+ `leading-ds-*`); add a `--text-ds-*` token if 13px chat density is genuinely required.
3. **Remove opacity hacks** (P1/G2): swap `text-surface-fg-subtle/50`, `text-error-11/60`, `bg-surface-raised-hover/30`, `bg-warning-2/50` for proper semantic steps (or add a `-faint` token).
4. **Add controlled mode to MessageInput** (P1/F6): optional `value`/`onChange`, internal state as fallback.
5. **Self-guard TypingIndicator motion** (P1/M3): `useReducedMotion()` → static dots when reduced.
6. **Fix the doc prop name** (P1/J): `isLoadingMore` → `loadingMore` in `chat.md`.
7. **Resolve `scrollToBottomSlot`** (P2/F1): wire it or remove it.
8. **Delegate MessageAvatar sizing to Avatar** (P1/F5); render icon case via Avatar, not a bespoke chip.
9. **Add focus-visible ring + verify touch targets** (P2/H) on EditableBody row, reaction buttons, Message.Action.
10. **Tokenize motion timings + z/offset** (P2-P3/M2,G2): pull from `durations`/`tweens`, use `z-layer`/`-top-ds-*`/`duration-*`.
11. **Story cleanup** (P3): use `Badge` instead of the hand-rolled "Internal" pill; reconsider all-caps date labels.

## Clean (rubric dims that pass)
- **V2 double-edge:** clean — bubbles use bg fill (no border+shadow); input box uses border (no shadow); MessageActions uses shadow-raised on a borderless surface.
- **V3 gradient text:** none. **V4 framework palette:** uses semantic `accent-*`/`success-*`/`error-*`/`warning-*` steps, no raw indigo/slate.
- **V5 emoji-as-icon-system:** clean in component source — uses Tabler via Icon/IconProvider. (Reaction emoji are user *content*, not an icon system; legitimate.)
- **V6 blob/glass/glow:** none. **V7 rounded-everything:** uses the radius vocabulary (`rounded-bubble` 24px is a real token for chat bubbles, `rounded-surface`, `rounded-control-inner`, `rounded-pill`).
- **M1 bounce-by-default:** clean — `springs.snappy`, not `bouncy`/`backOut`. **M5 layout-prop animation:** clean (transform/opacity).
- **E1–E8 verbal tells:** doc/JSDoc/stories are direct and prescriptive; no em-dash tic abuse (the `—` instances are real en/em usage in prose, not connector spam), no AI vocabulary, no meta-hedging.
- **H a11y baseline:** strong — `role="log"`+`aria-live="polite"`+`aria-relevant` on the list, keyboard send (Enter/Shift+Enter), reaction buttons have descriptive aria-labels, SystemMessage alert uses `role="alert"`, axe tests cover flat/bubble/input/list/system/typing.
- **I types:** no `any` in the public surface; `IconInput` used (not `color?: string`); root components `forwardRef` with `displayName`. (Sub-component forwardRef is a minor gap noted above, not a violation.)
- **J stories:** present and thorough (8 stories covering flat/bubble/grouped/states/editable/system/input/separators); doc exists with prop tables (one stale prop name, fixed in plan).
- **Surface usage:** stories correctly place the chat shell on `bg-surface-2` (card-level), MessageActions overlay on `surface-raised` — consistent with the layering rule. MessageInput's inner box on `surface-base` inside a `surface-2` panel is a deliberate inset-field treatment (acceptable).
