# ai/conversation — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:5 P2:6 P3:2

## Findings

### [P1][F5] User + agent message surfaces re-roll Card instead of composing it
- **Category:** composability / drift
- **Evidence:** conversation.tsx:114 & 122 — `className="bg-surface-raised rounded-surface px-ds-05 py-ds-04"` (UserMessage); AssistantMessage (134-157) is a bare `<div>` with no surface at all.
- **Why:** This is exactly the drift StatCard fixed — a card-like message bubble hand-rolls surface + radius + padding instead of composing `<Card variant="flat">` / `<CardContent>`. The two message types also render on inconsistent surfaces (user = raised bubble, assistant = no bubble), and if the Card gap/padding vocabulary changes these bubbles silently drift.
- **Fix:** Render the user bubble as `<Card variant="flat">` (or a shared `MessageBubble` that composes Card) and let padding come from the size/gap model, not literal `px-ds-05 py-ds-04`.

### [P1][V14] Agent header is all-caps + tracked as the default label treatment
- **Category:** visual-tell
- **Evidence:** conversation.tsx:96 — `className="text-ds-xs font-semibold uppercase tracking-wider text-surface-fg-subtle"` in `AgentHeader`, rendered on *every* assistant turn and every processing indicator.
- **Why:** `uppercase tracking-wider` micro-caps eyebrow above every assistant message is the eyebrow-kicker/all-caps reflex (V12/V14) — it's the model-default way to make an agent name "look like a label." It repeats on every turn, so it's a default the component ships, not a one-off.
- **Fix:** Use type hierarchy (weight + muted color, sentence case) for the agent name; drop `uppercase tracking-wider`, or make it a single deliberate treatment, not per-turn.

### [P1][M3] Breathing-dots + step-list active spinner have no reduced-motion story/guard parity, and dots vanish entirely under reduced motion
- **Category:** motion / state-coverage
- **Evidence:** conversation.tsx:215 — `{!reducedMotion && [0,1,2].map(...)}` gates the dots on reducedMotion, so under reduced motion the *only* processing signal is the "…is thinking" text. Meanwhile the step-list `active` spinner (StepStatusIcon, lines 61-71) uses `animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}` with **no reducedMotion guard at all**.
- **Why:** Inconsistent reduced-motion handling: the dots respect it (but by disappearing, losing feedback), the infinite spinner ignores it. An infinite `rotate` loop with no `prefers-reduced-motion` fallback is a motion tell and an a11y gap.
- **Fix:** Keep a static/pulse indicator for the dots under reduced motion (don't drop feedback). Guard the `active` step spinner with `reducedMotion` (swap the infinite rotate for a static icon or a token-driven fade). Route timing through the motion system rather than hardcoded `duration: 1, ease: 'linear'`.

### [P1][M1] Delta-arrow reflex is inherited via StatFlash/StatCard path but the pill uses raw springs; breathing-dot timing is hardcoded, not tokenized
- **Category:** motion
- **Evidence:** conversation.tsx:221-226 — breathing dots `transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.16 }}`; StepStatusIcon `duration: 1, ease: 'linear'` (line 66). Neither uses `durations.*`/`springs.*` from the motion lib.
- **Why:** Uniform/robotic hardcoded timings (M2) that bypass the duration scale. The rest of the file correctly uses `springs.snappy` / `durations.moderate01b`; these two loops are the exceptions.
- **Fix:** Express loop durations via `durations.*` tokens (or a named "thinking" tween) so they move with the system.

### [P1][I] `customBlocks` and `BlockComponentProps<any>` leak `any` into the exported prop surface
- **Category:** types
- **Evidence:** conversation.tsx:45 — `customBlocks?: Record<string, React.ComponentType<BlockComponentProps<any>>>`; also `types.ts:45` uses `<T = Record<string, unknown>>` default but the conversation prop hardcodes `any`.
- **Why:** `any` in an exported prop type defeats consumer type-checking on custom block components. The default generic (`Record<string, unknown>`) already exists and is the correct fallback.
- **Fix:** Use `BlockComponentProps` (no type arg → defaults to `Record<string, unknown>`) or `BlockComponentProps<Record<string, unknown>>` in the prop; keep `any` out of exported types.

### [P2][H] ScrollToBottomPill is a real `<button>` but also carries `role="button"` (redundant) and has no visible focus/hover feedback
- **Category:** a11y / state-coverage / motion
- **Evidence:** conversation.tsx:241-243 — `<motion.button role="button" aria-label="Scroll to latest response" className="... bg-accent-9 text-accent-fg ... shadow-floating">` — no `:focus-visible` ring, no `whileTap`/`whileHover`, no `focus-ring` utility.
- **Why:** `role="button"` on a native `<button>` is redundant (H). The pill is an interactive control with zero hover/press/focus feedback (M4) and no focus-visible ring — a state-coverage gap versus the Card bar.
- **Fix:** Drop `role="button"`; add the `focus-ring` utility + a `whileTap`/hover transition; ensure the ring survives forced-colors.

### [P2][V6] ScrollToBottomPill uses `shadow-floating` on a solid accent pill — verify it's not a glow tell
- **Category:** visual-tell
- **Evidence:** conversation.tsx:244 — `bg-accent-9 text-accent-fg ... rounded-pill ... shadow-floating`.
- **Why:** A colored floating element with a large shadow can read as the "glow chip" reflex (V6). It's a legit floating affordance (uses a shadow token, not a colored glow), so this is a check, not a hard tell — but confirm `shadow-floating` is neutral elevation, not a colored/glow shadow.
- **Fix:** If `shadow-floating` is a neutral elevation token, this is fine — leave as-is. If it tints accent, swap for a neutral elevation shadow.

### [P2][V5] Arrow glyph literal `'↓'` used as an inline icon instead of the Icon system
- **Category:** visual-tell / vocabulary
- **Evidence:** conversation.tsx:251 — `{'↓'} New response` (a Unicode down-arrow character rendered as the pill's leading icon).
- **Why:** A raw Unicode glyph standing in for an icon is a lightweight version of the "glyph-as-icon" reflex — the file already imports the lucide/tabler Icon API everywhere else (StepStatusIcon, AgentHeader), so this is inconsistent vocabulary.
- **Fix:** Use `<Icon icon={IconArrowDown} size="xs" />` for parity with the rest of the component.

### [P2][H] Empty state ships nothing — no placeholder when `messages=[]` and not processing
- **Category:** state-coverage
- **Evidence:** conversation.tsx:359-384 — when `messages` is empty and `isProcessing` is false, the scroll container renders only the `h-px` sentinel; there's no empty-state slot or affordance. Test at conversation.test.tsx:143 only asserts "renders without error."
- **Why:** The Card bar wants explicit empty-state handling. A conversation with no messages is a common real state (fresh thread); an invisible empty container is a polish gap.
- **Fix:** Add an optional `emptyState?: React.ReactNode` slot (or render a muted default) shown when there are no messages and nothing is processing.

### [P2][F1/F4] Fixed-order message rendering with no slots for message chrome (avatar, timestamp, per-turn actions)
- **Category:** composability
- **Evidence:** conversation.tsx:359-375 — messages are mapped internally into hardcoded `UserMessage`/`AssistantMessage`; `ConversationMessage.createdAt` (types.ts:33) is required but never rendered; there is no `renderMessage`/`components` override or slot for timestamps, avatars, or per-message actions.
- **Why:** All message presentation is bespoke and closed. Consumers can't customize a turn (e.g. show timestamps, add a copy button) without forking. The Card bar composes via slots; this composes via a closed switch.
- **Fix:** Expose a `components`/`renderUserMessage`/`renderAssistantMessage` override, or a slot-based message API. At minimum surface `createdAt` (it's required in the type but dead).

### [P2][state-coverage] `aria-live="polite"` on the whole scroll region will announce entire message trees, not deltas
- **Category:** a11y
- **Evidence:** conversation.tsx:346-349 — `<div ref={scrollRef} className="... overflow-y-auto" aria-live="polite">` wraps the full message list; the processing indicator separately sets `role="status" aria-busy`.
- **Why:** A large `aria-live` container re-announces the full subtree on any change and double-announces alongside the `role="status"` block. Live regions should wrap the incremental new content, not the whole history.
- **Fix:** Scope `aria-live` to a small region for the latest assistant turn / status line, not the entire scrollable history.

### [P3][I] `React.ComponentType<...>` handler typing is fine, but `AIConversationProps` isn't `forwardRef`-generic and ref is `HTMLDivElement` only
- **Category:** types
- **Evidence:** conversation.tsx:262 — `React.forwardRef<HTMLDivElement, AIConversationProps>`; no `displayName` issue (set at 393), but there's no way to pass through arbitrary container attrs (`...rest` to the outer div) — only `className` is accepted.
- **Why:** The outer container accepts only `className` (line 50), so consumers can't set `id`, `data-*`, `aria-label`, etc. on the root. Minor API surface gap.
- **Fix:** Extend `React.HTMLAttributes<HTMLDivElement>` (Omit conflicts) and spread rest onto the root div.

### [P3][docs] No per-component markdown doc for conversation
- **Category:** docs
- **Evidence:** `find packages/core/docs -iname "*conversation*"` → none. Story exists (`conversation.stories.tsx`) with autodocs, but no `docs/components/**/conversation.md`.
- **Why:** Docs parity gap — other components have per-component docs. Not a publish blocker if autodocs covers it, but below the Card bar's "tests + stories + docs" line.
- **Fix:** Add a per-component doc, or confirm autodocs is the intended single source for AI-layer components.

## Composability gaps
- **Re-rolls surface (F5):** UserMessage hand-rolls `bg-surface-raised rounded-surface px-ds-05 py-ds-04`; AssistantMessage has no surface. Neither composes `Card`. Message bubbles are the drift risk StatCard closed.
- **Closed message rendering (F1/F4):** internal `UserMessage`/`AssistantMessage` switch with no `renderMessage`/`components` slot; consumers can't add timestamps, avatars, or per-turn actions. `createdAt` is required in the type but never rendered.
- **No empty-state slot (H):** empty `messages` renders an invisible container; no `emptyState` prop.
- **`any` in custom-block type (I):** `Record<string, React.ComponentType<BlockComponentProps<any>>>` leaks `any` despite a correct default generic existing.
- **Root accepts only `className`:** can't pass `id`/`data-*`/`aria-*` to the container.

## Motion gaps
- **Infinite spinner has no reduced-motion guard (M3):** StepStatusIcon `active` state loops `rotate: 360` forever regardless of `reducedMotion` (conversation.tsx:63-70).
- **Reduced motion drops feedback (M3/M4):** breathing dots are entirely removed under reduced motion (line 215), leaving only text — should degrade to a static indicator, not vanish.
- **Hardcoded loop timings (M1/M2):** dots `duration: 1.4, ease: 'easeInOut'` and spinner `duration: 1, ease: 'linear'` bypass `durations.*`/`springs.*` tokens.
- **Pill has no press/hover/focus motion (M4):** ScrollToBottomPill has entrance/exit but no `whileTap`/hover and no focus-visible ring.

## Polish plan (ordered steps to reach the finish bar)
1. Compose `Card` for message bubbles: create a `MessageBubble` (or use `<Card variant="flat">`) so user/assistant turns share the surface, radius, and gap/padding vocabulary instead of literal `px-ds-05 py-ds-04`. Decide and document one surface story for user vs assistant turns.
2. Fix reduced-motion: guard the `active` step spinner; degrade breathing dots to a static/pulse indicator rather than removing them; route loop durations through `durations.*`.
3. De-tell the agent header: drop `uppercase tracking-wider`, express the label via weight + muted color; keep it as one deliberate treatment, not a per-turn eyebrow.
4. Type surface: replace `BlockComponentProps<any>` with the defaulted generic; extend the root to accept `HTMLAttributes` and spread rest.
5. Polish the pill: remove redundant `role="button"`, add `focus-ring` + `whileTap`, swap the `'↓'` literal for `<Icon icon={IconArrowDown} />`; confirm `shadow-floating` is neutral.
6. Add an `emptyState` slot and a message-rendering override (`components`/`renderMessage`); surface `createdAt`. Scope `aria-live` to the latest-turn region instead of the whole history.
7. Add a per-component doc (or confirm autodocs coverage is the intended source).

## Clean (rubric dims that pass)
- **V1 accent rail:** none. No colored left/top stripe on any surface.
- **V2 double edge:** message bubbles use bg-only (no border+shadow combo).
- **V3 gradient text:** none — no `bg-clip-text` on any heading/metric.
- **V4 framework palette:** uses semantic tokens (`accent-9`, `success-11`, `error-11`, `surface-*`), no raw indigo/violet/slate.
- **V7 rounded-everything:** uses `rounded-surface` / `rounded-pill` tokens, not `rounded-2xl/3xl`.
- **V8 pill-badge spam:** none in the component (status badges in stories are data-driven, legitimate).
- **G2 tokens:** spacing/radius/color all via `-ds-*` and semantic tokens; no raw px/hex/bare `shadow`/`rounded`.
- **G1 surface:** overlay-style scroll region on the page; message bubbles use `surface-raised` — acceptable for an inline thread (though see F5 for the compose-not-re-roll concern).
- **State coverage (partial):** processing (dots + steps), done/active/pending/error step states, agent-from-context, maxHeight, and empty-render-without-crash all tested. Auto-scroll + scroll-to-bottom pill with `AnimatePresence` enter/exit is well done.
- **Verbal tells:** JSDoc + story copy are clean — no em-dash tic, no AI-vocab, no contrastive negation. ("is thinking..." is a normal loading affordance.)
- **displayName / forwardRef:** present and correct.
