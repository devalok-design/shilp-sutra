# Phase 2 Batch 7 -- AI Layer Components Audit

**Date:** 2026-04-06
**Auditor:** Claude Opus 4.6
**Scope:** 14 AI/chat interface components

## Scoring Key

| Code | Meaning |
|------|---------|
| P | Pass |
| F | Fail -- needs fix |
| C | Conditional -- minor issue or improvement opportunity |
| N/A | Not applicable |

## Summary Table

| # | Component | WCAG 2.2 AA | APG Keyboard | API/DX | Test Quality | Bundle/SSR | Docs/Stories |
|---|-----------|-------------|-------------|--------|--------------|------------|-------------|
| 1 | AIConversation | P | P | C | P | C | P |
| 2 | CommandBar | P | P | P | P | C | P |
| 3 | BlockRenderer | P | P | C | P | C | P |
| 4 | AICommandProvider | N/A | N/A | P | P | C | C |
| 5 | DevadootIcon | P | N/A | P | F | C | P |
| 6 | BlockTable | P | C | C | P | C | C |
| 7 | ConfirmBlock | P | P | C | P | C | C |
| 8 | DividerBlock | P | N/A | C | C | C | C |
| 9 | ErrorBlock | P | P | C | P | C | C |
| 10 | InfoBlock | C | C | C | C | C | C |
| 11 | LoadingBlock | P | P | C | P | C | C |
| 12 | StatRowBlock | P | N/A | C | C | C | C |
| 13 | SuccessBlock | P | P | C | P | C | C |
| 14 | TextBlock | P | N/A | C | P | C | C |

**Totals:** 4 F, 12 C, across all dimensions. The main structural issues are (1) no test file for DevadootIcon, (2) no dedicated stories for any block sub-components, (3) no `@server-safe` annotations on any AI files (all use `'use client'` which is correct for framer-motion consumers, so this is expected), and (4) several blocks lack `forwardRef`/`displayName`.

---

## Per-Component Detail

---

### 1. AIConversation (`packages/core/src/ai/conversation.tsx`)

**A. WCAG 2.2 AA: P**
- `aria-live="polite"` on the scroll container (line 333) -- incoming messages announced to screen readers. Correct.
- Processing indicators have `role="status"` + `aria-busy="true"` + `aria-label` (lines 157, 192-196).
- Breathing dot animation respects `reducedMotion` -- dots not rendered at all when reduced (lines 199-212), text fallback "is thinking..." always present.
- Scroll-to-bottom pill has `aria-label="Scroll to latest response"`.

**B. APG Keyboard: P**
- Live region for incoming messages via `aria-live="polite"`.
- Processing state announced via `role="status"`.
- No keyboard navigation within message list (appropriate -- messages are read-only content, not interactive items).

**C. API/DX: C**
- No `forwardRef` -- `AIConversation` is a plain function component, not forwarding ref.
- No `displayName` set.
- Does accept `className` and uses `cn()`.
- Does NOT spread `...props` onto the root div.
- Types are exported (`AIConversationProps`).

**D. Test Quality: P**
- 2 test files: `conversation.test.tsx` (16 tests) + `ai-components.test.tsx` (7 conversation tests).
- `toHaveNoViolations()` in `ai-components.test.tsx` for mixed messages.
- Tests cover: user/assistant rendering, processing dots, processing steps, step statuses, onAction passthrough, context agent, prop override, maxHeight, empty state.
- Good coverage.

**E. Bundle/SSR: C**
- `'use client'` directive present (correct -- uses framer-motion, refs, effects).
- No `@server-safe` annotation (expected -- this component is inherently client-side).
- Imports `framer-motion` -- not tree-shakeable if unused, but this is a client-only component.

**F. Documentation: P**
- `conversation.stories.tsx` with `tags: ['autodocs', 'stable']`.
- 10 stories covering: SingleTurn, MultiTurn, Processing, ProcessingWithSteps, WithConfirmAction, WithUndoSuccess, WithErrors, LongConversation, WithAgentIcon, WithContextProvider.
- Excellent coverage of real-world scenarios.

---

### 2. CommandBar (`packages/core/src/ai/command-bar.tsx`)

**A. WCAG 2.2 AA: P**
- `role="search"` on hero and inline containers (lines 733, 783).
- `role="combobox"` on input with `aria-expanded`, `aria-controls`, `aria-activedescendant`, `aria-autocomplete`, `aria-label` (lines 525-534).
- `role="listbox"` on results container with `aria-label="Command results"` (lines 605-608).
- `role="option"` + `aria-selected` on each command item (lines 652-653).
- Floating variant uses `DialogTitle` + `DialogDescription` via `VisuallyHidden` (lines 818-823).
- Clear button has `aria-label="Clear"` (line 565).
- Focus ring: `focus-visible:ring-2 focus-visible:ring-accent-9` on clear button.
- Reduced motion: all animations respect `isReduced`, falling back to `{ duration: 0 }`.

**B. APG Keyboard: P**
- Combobox pattern implemented correctly: ArrowDown/ArrowUp navigate, Enter selects, Escape closes/blurs.
- `aria-activedescendant` updates with `activeIndex`.
- Cmd/Ctrl+Enter always submits (bypasses command selection).
- ArrowUp recalls last query when no groups present.
- Global keybinding `mod+j` for floating variant.
- Scroll active item into view (line 368).

**C. API/DX: P**
- `forwardRef` used (line 222).
- `displayName` set (line 881).
- `className` accepted and merged with `cn()`.
- Props spread via `{...props}` on root element.
- Types exported (`CommandBarProps`, `CommandGroup`, `CommandItem`).

**D. Test Quality: P**
- 2 test files: `command-bar.test.tsx` (23 tests) + `ai-components.test.tsx` (12 tests).
- `toHaveNoViolations()` for both inline and hero variants.
- Tests cover: all 3 variants, submit, disabled, processing state, responded state, command filtering, empty state, keyboard navigation, arrow recall, Escape behavior, Cmd+Enter, aria-label, aria-expanded, placeholder.
- Thorough.

**E. Bundle/SSR: C**
- `'use client'` present (correct -- uses Dialog, framer-motion, effects, refs).
- Heavy imports: framer-motion, Dialog primitives, tabler icons. This is the largest AI component.

**F. Documentation: P**
- `command-bar.stories.tsx` with `tags: ['autodocs', 'stable']`.
- 12 stories: HeroIdle, HeroProcessing, HeroResponded, HeroInteractive, HeroWithCommandGroups, HeroPlaceholderRotation, InlineDefault, InlineInCard, FloatingDefault, FloatingWithCommands, Disabled, FullDashboard.
- Excellent real-world coverage including the full interactive dashboard demo.

---

### 3. BlockRenderer (`packages/core/src/ai/block-renderer.tsx`)

**A. WCAG 2.2 AA: P**
- Renders semantic HTML via child blocks (text, table, alert, etc.).
- Fallback block uses `Alert color="info"` which has `role="alert"`.
- Staggered animations respect `reducedMotion`.

**B. APG Keyboard: P**
- This is a container/router component. It delegates all interactivity to child blocks.
- No keyboard patterns needed at this level.

**C. API/DX: C**
- No `forwardRef` -- plain function component.
- No `displayName`.
- Accepts `className` and uses `cn()`.
- Does NOT spread props -- `BlockRendererProps` is a custom interface, not extending HTML element props.
- Types exported.

**D. Test Quality: P**
- 2 test files: `block-renderer.test.tsx` (9 tests) + `ai-components.test.tsx` (5 tests).
- `toHaveNoViolations()` present.
- Tests cover: text rendering, multiple blocks, onAction passthrough, custom blocks (prop and context), prop overrides context, fallback for unknown types, empty state, context onAction.

**E. Bundle/SSR: C**
- `'use client'` present (correct -- uses framer-motion).
- Imports all 9 built-in block components eagerly. If a consumer only uses text+error blocks, they still import table, confirm, loading, etc. Could be lazy-loaded, but this is a minor concern for a chat UI that will likely use all blocks.

**F. Documentation: P**
- `block-renderer.stories.tsx` with `tags: ['autodocs', 'stable']`.
- 15 stories: AllBlocks, TextBlock, TableBlock, ConfirmDefault, ConfirmDestructive, SuccessWithUndo, SuccessSimple, ErrorWithSuggestion, LoadingSkeleton, LoadingSteps, StatRow, CustomBlock, UnknownBlock, LowConfidence, WithProvider.
- Very thorough.

---

### 4. AICommandProvider (`packages/core/src/ai/ai-command-provider.tsx`)

**A. WCAG 2.2 AA: N/A**
- Pure context provider, renders no DOM.

**B. APG Keyboard: N/A**
- No interactive elements.

**C. API/DX: P**
- Clean context API with `useAICommand()` hook.
- Stable memoization of context value.
- `EMPTY_BLOCKS` constant avoids re-renders from `{}` default.
- Types exported (`AICommandProviderProps`, `AICommandContext`).

**D. Test Quality: P**
- 2 test files: `ai-command-provider.test.tsx` (2 tests) + `ai-components.test.tsx` (3 tests).
- Tests cover: context provided to children, null outside provider, agent name propagation.

**E. Bundle/SSR: C**
- `'use client'` present. This is a React context provider -- it could technically be server-safe since `React.createContext` works in RSC. However, since it's always used with client components, `'use client'` is not harmful.

**F. Documentation: C**
- No dedicated story file. It appears in other stories (Conversation `WithContextProvider`, BlockRenderer `WithProvider`) but has no `autodocs` page of its own.
- Types are exported from `index.ts`.

---

### 5. DevadootIcon (`packages/core/src/ai/devadoot-icon.tsx`)

**A. WCAG 2.2 AA: P**
- `aria-hidden="true"` on the SVG (line 77, reduced motion) and on the wrapping `<span>` (line 105, full motion). Correct -- this is a decorative icon used alongside text agent names.
- Reduced motion: static SVG fallback with no animation (lines 70-85).
- Gradient animations, glow pulse, and scale/shake all only in full-motion path.

**B. APG Keyboard: N/A**
- Decorative icon, not interactive.

**C. API/DX: P**
- `React.memo` used (performance-sensitive animated component).
- `displayName` set (line 213).
- Accepts `className`, `size`, `state` props.
- Uses `React.useId()` for unique gradient/filter IDs (SSR-safe).
- Types exported (`DevadootIconProps`, `DevadootState`).

**D. Test Quality: F**
- **No test file exists.** Searched `__tests__/devadoot-icon*` -- no results.
- No axe test.
- This component has complex state-dependent behavior (4 animation states) that should have at least basic render tests and an axe scan.

**E. Bundle/SSR: C**
- `'use client'` present (correct -- uses framer-motion extensively).
- Uses `useMotionValue`, `useTransform`, `animate` from framer-motion -- heavy dependency for an icon.

**F. Documentation: P**
- `devadoot-icon.stories.tsx` with `tags: ['autodocs', 'stable']`.
- 7 stories: Idle, Processing, Responded, Error, AllStates, Sizes, Interactive, InCommandBar.
- Good coverage of all visual states.

---

### 6. BlockTable (`packages/core/src/ai/blocks/block-table.tsx`)

**A. WCAG 2.2 AA: P**
- Uses semantic `<Table>` components (TableHeader, TableBody, TableRow, TableHead, TableCell).
- `aria-sort` on sortable column headers (lines 107-112).
- Sort direction indicators use `aria-hidden="true"`.
- `<TableCaption>` for table description.

**B. APG Keyboard: C**
- Sortable headers are clickable but use `<TableHead>` (which is a `<th>`), not a `<button>`. Users can click to sort, but `<th>` is not natively focusable or keyboard-activatable.
- **Issue:** Sortable column headers should be wrapped in buttons or use `tabIndex={0}` + `onKeyDown` for Enter/Space. Currently keyboard-only users cannot sort columns.

**C. API/DX: C**
- `React.memo` used.
- No `forwardRef`, no `displayName`.
- Does NOT accept `className` prop -- the wrapper div has hardcoded classes.
- Types are exported via `index.ts`.

**D. Test Quality: P**
- `block-table.test.tsx` (9 tests).
- Covers: column headers, row data, caption, badge variant, number alignment, sortable click cycling (asc/desc), role="table", empty rows, empty columns.
- No axe test (minor gap -- the underlying Table component likely has its own).

**E. Bundle/SSR: C**
- `'use client'` present (correct -- uses framer-motion, state).

**F. Documentation: C**
- No dedicated story file. Covered by `block-renderer.stories.tsx` TableBlock story.
- Adequate but not standalone.

---

### 7. ConfirmBlock (`packages/core/src/ai/blocks/confirm.tsx`)

**A. WCAG 2.2 AA: P**
- Uses `<Button>` component which has proper focus styles and target sizes.
- Destructive variant applies error color for visual distinction.
- Collapsible rationale uses Radix Collapsible (accessible expand/collapse).

**B. APG Keyboard: P**
- Both Confirm and Cancel are `<Button>` components -- natively focusable and activatable.
- Collapsible trigger is a `<button>` -- keyboard accessible.

**C. API/DX: C**
- `React.memo` used.
- No `forwardRef`, no `displayName`.
- No `className` prop.

**D. Test Quality: P**
- `confirm.test.tsx` (11 tests).
- Covers: button rendering, confirm/cancel actions, description, destructive styling, rationale expand/collapse, low confidence indicator.
- Thorough for a block component.

**E. Bundle/SSR: C**
- `'use client'` present (imports Collapsible which is client-side).

**F. Documentation: C**
- No dedicated story. Covered by `block-renderer.stories.tsx` ConfirmDefault and ConfirmDestructive.

---

### 8. DividerBlock (`packages/core/src/ai/blocks/divider.tsx`)

**A. WCAG 2.2 AA: P**
- Uses `<Separator>` which renders `role="separator"` (Radix primitive).
- No contrast or target size concerns.

**B. APG Keyboard: N/A**
- Non-interactive element.

**C. API/DX: C**
- `React.memo` used.
- No `forwardRef`, no `displayName`.
- No `className` prop.
- Ignores all data in `_props` (expected -- divider has no data).

**D. Test Quality: C**
- `divider.test.tsx` (2 tests).
- Only tests: separator element rendered, no crash.
- **Missing:** No axe test. Very minimal coverage. Could test reduced motion path.

**E. Bundle/SSR: C**
- `'use client'` present (uses framer-motion).

**F. Documentation: C**
- No dedicated story. Appears in `block-renderer.stories.tsx` AllBlocks composite story.

---

### 9. ErrorBlock (`packages/core/src/ai/blocks/error.tsx`)

**A. WCAG 2.2 AA: P**
- Wraps content in `<Alert color="error">` which renders `role="alert"` -- immediate screen reader announcement. Correct for error messages.
- Error color provides strong visual distinction.

**B. APG Keyboard: P**
- `role="alert"` ensures errors are announced without requiring focus.
- No interactive elements (suggestion is text-only).

**C. API/DX: C**
- `React.memo` used.
- No `forwardRef`, no `displayName`.
- No `className` prop.
- Uses `react-markdown` for message rendering (handles markdown in error messages).

**D. Test Quality: P**
- `error.test.tsx` (7 tests).
- Covers: role="alert", title, message, suggestion presence/absence, low confidence border, error color.
- Good.

**E. Bundle/SSR: C**
- `'use client'` present (imports react-markdown which is client-side).

**F. Documentation: C**
- No dedicated story. Covered by `block-renderer.stories.tsx` ErrorWithSuggestion and `conversation.stories.tsx` WithErrors.

---

### 10. InfoBlock (`packages/core/src/ai/blocks/info.tsx`)

**A. WCAG 2.2 AA: C**
- Uses `<Alert color="info">` which renders `role="alert"`.
- **Concern:** Info messages are not typically urgent enough to warrant `role="alert"` (which triggers assertive-style announcements in many screen readers). `role="status"` would be more appropriate for informational messages. However, since this comes from the Alert component's default behavior, it's consistent with the DS Alert API -- the issue is architectural, not specific to InfoBlock.

**B. APG Keyboard: C**
- Same concern as above -- `role="alert"` is technically too aggressive for info messages. APG recommends `role="alert"` for errors/warnings, `role="status"` for informational.

**C. API/DX: C**
- `React.memo` used.
- No `forwardRef`, no `displayName`.
- No `className` prop.
- Simplest block -- just wraps Alert.

**D. Test Quality: C**
- `info.test.tsx` (3 tests).
- Covers: role="alert" (tests what exists, even if the role choice is debatable), message text, info color.
- **Missing:** No axe test. Could use one.

**E. Bundle/SSR: C**
- `'use client'` present (minimal, but Alert imports from ui which is client-marked).

**F. Documentation: C**
- No dedicated story. Appears in `block-renderer.stories.tsx` AllBlocks.

---

### 11. LoadingBlock (`packages/core/src/ai/blocks/loading.tsx`)

**A. WCAG 2.2 AA: P**
- `role="status"` + `aria-busy="true"` + `aria-label` on all three modes (skeleton, steps, fallback) -- lines 67-69, 91-94, 128.
- `<span className="sr-only">Loading</span>` / `<span className="sr-only">Processing</span>` for screen reader text.
- Skeleton bars use `aria-hidden="true"`.
- Spinner has `aria-hidden="true"`.
- Animations respect `reducedMotion` via `useMotion()`.

**B. APG Keyboard: P**
- `role="status"` ensures loading state is announced in polite mode.
- No interactive elements.

**C. API/DX: C**
- `React.memo` used.
- No `forwardRef`, no `displayName`.
- No `className` prop.
- Supports 2 modes: skeleton lines and processing steps.

**D. Test Quality: P**
- `loading.test.tsx` (11 tests).
- Covers: skeleton count, role/aria-busy, last skeleton width, full-width skeletons, step labels, step role/aria-busy, step styling, spinner/done/error/pending icons.
- Very thorough.

**E. Bundle/SSR: C**
- `'use client'` present (uses framer-motion, Skeleton).

**F. Documentation: C**
- No dedicated story. Covered by `block-renderer.stories.tsx` LoadingSkeleton and LoadingSteps.

---

### 12. StatRowBlock (`packages/core/src/ai/blocks/stat-row.tsx`)

**A. WCAG 2.2 AA: P**
- Delegates to `<StatCard>` which handles its own a11y.
- Layout is flex-wrap with sensible min-width.
- Animations respect `reducedMotion`.

**B. APG Keyboard: N/A**
- Non-interactive display component.

**C. API/DX: C**
- `React.memo` used.
- No `forwardRef`, no `displayName`.
- No `className` prop.
- Returns `null` for empty stats (correct).

**D. Test Quality: C**
- `stat-row.test.tsx` (5 tests).
- Covers: labels, values, change/delta, missing change, empty array.
- **Missing:** No axe test.

**E. Bundle/SSR: C**
- `'use client'` present (uses framer-motion, StatCard).

**F. Documentation: C**
- No dedicated story. Covered by `block-renderer.stories.tsx` StatRow.

---

### 13. SuccessBlock (`packages/core/src/ai/blocks/success.tsx`)

**A. WCAG 2.2 AA: P**
- Uses `<Alert color="success">` with `role="alert"` -- appropriate for success confirmation messages.
- Undo button has descriptive `aria-label` with countdown: `"Undo action, N seconds remaining"` (line 75).
- Countdown ring SVG has `aria-hidden="true"`.
- Animations respect `reducedMotion`.

**B. APG Keyboard: P**
- Undo button is a `<Button>` -- natively focusable and keyboard-activatable.
- Time-limited but accessible -- the aria-label includes remaining time.

**C. API/DX: C**
- `React.memo` used.
- No `forwardRef`, no `displayName`.
- No `className` prop.
- Clever countdown ring using SVG strokeDashoffset animation.

**D. Test Quality: P**
- `success.test.tsx` (8 tests).
- Covers: title/message, success icon, undo button presence/absence, undo action callback, timeout expiry (fake timers), undoable false, blockId passthrough.
- Good timer testing.

**E. Bundle/SSR: C**
- `'use client'` present (uses framer-motion, state, effects).

**F. Documentation: C**
- No dedicated story. Covered by `block-renderer.stories.tsx` SuccessWithUndo, SuccessSimple.

---

### 14. TextBlock (`packages/core/src/ai/blocks/text.tsx`)

**A. WCAG 2.2 AA: P**
- Renders markdown as semantic HTML via `react-markdown` + `remark-gfm`.
- Prose styles include accessible link colors (`prose-a:text-accent-11 prose-a:underline`).
- Low confidence indicator via `border-l-2 border-warning-7` -- visual cue.

**B. APG Keyboard: N/A**
- Non-interactive (links rendered by markdown are natively keyboard-accessible).

**C. API/DX: C**
- `React.memo` used.
- No `forwardRef`, no `displayName`.
- No `className` prop (uses hardcoded prose styles).

**D. Test Quality: P**
- 2 test files: `text.test.tsx` (6 tests) + `ai-components.test.tsx` (4 tests).
- `toHaveNoViolations()` in ai-components.test.tsx.
- Covers: plain text, bold, links, inline code, low/high confidence styling.
- Note: `text.test.tsx` does NOT mock react-markdown (it renders real markdown), while `ai-components.test.tsx` mocks it. Both approaches provide value.

**E. Bundle/SSR: C**
- `'use client'` present (imports react-markdown which is ESM-only client dep).

**F. Documentation: C**
- No dedicated story. Covered by `block-renderer.stories.tsx` TextBlock story with rich markdown.

---

## Cross-Cutting Issues

### Issue 1: No `forwardRef`/`displayName` on 11 of 14 components

Only `CommandBar` and `DevadootIcon` use `forwardRef`+`displayName`. The remaining 12 components (`AIConversation`, `BlockRenderer`, `AICommandProvider`, and all 9 blocks) are plain function components without ref forwarding or display names.

**Impact:** Medium. `forwardRef` enables consumer ref attachment (useful for focus management, scroll-to, measuring). `displayName` improves React DevTools debugging.

**Recommendation:** Add `forwardRef` + `displayName` to `AIConversation` and `BlockRenderer` (likely to be ref-targeted by consumers). Block components are less likely to need refs but would benefit from `displayName` for debugging.

### Issue 2: No test file for DevadootIcon

**Impact:** High. This is a complex animated component with 4 states, reduced motion fallback, and dynamic SVG gradients. It has zero test coverage.

**Recommendation:** Create `__tests__/devadoot-icon.test.tsx` with at minimum:
- Renders without crashing for each state (idle, processing, responded, error)
- `aria-hidden="true"` is present
- Reduced motion fallback renders static SVG
- axe violation scan

### Issue 3: No dedicated stories for block sub-components

All 9 blocks (text, table, confirm, success, error, info, loading, divider, stat-row) are only covered as composite stories within `block-renderer.stories.tsx`. None have their own story files.

**Impact:** Low. The block-renderer stories provide good visual coverage. However, individual story files would make Storybook navigation cleaner and enable per-block props exploration via controls.

**Recommendation:** Low priority. The current coverage via block-renderer stories is adequate for the individual blocks since they're primarily used through BlockRenderer.

### Issue 4: InfoBlock uses `role="alert"` for informational messages

The Alert component always renders `role="alert"`, which is assertive. For info-level messages, `role="status"` would be more appropriate per APG guidance. This is an Alert component concern, not specific to InfoBlock.

**Impact:** Low for most users. Could be mildly annoying for screen reader users if many info blocks appear in sequence.

**Recommendation:** Consider adding a `role` prop to the Alert component (default `"alert"`, option `"status"`) and use `role="status"` in InfoBlock.

### Issue 5: BlockTable sortable headers lack keyboard access

Sortable column headers respond to `onClick` on `<th>` elements but lack `tabIndex`, `role="button"`, or keyboard event handlers. Keyboard-only users cannot sort the table.

**Impact:** Medium. Users relying on keyboard-only navigation cannot access the sort functionality.

**Recommendation:** Wrap sortable header content in a `<button>` element, or add `tabIndex={0}`, `role="button"`, and `onKeyDown` (Enter/Space) to sortable `<th>` elements.

### Issue 6: No `@server-safe` annotations

No AI components have `@server-safe` annotations. All have `'use client'` directives. This is correct -- every AI component uses either framer-motion, React state/effects/refs, or client-only dependencies (react-markdown). None are server-safe.

**Impact:** None. The `'use client'` directives are correct.

---

## Priority Ranking

| Priority | Issue | Effort |
|----------|-------|--------|
| P1 | Create DevadootIcon test file | Small |
| P2 | Add keyboard support to BlockTable sortable headers | Small |
| P2 | Add `forwardRef` + `displayName` to AIConversation, BlockRenderer | Small |
| P3 | Add `displayName` to all block components | Trivial |
| P3 | Consider `role="status"` option for Alert / InfoBlock | Medium (API change) |
| P4 | Dedicated story files for individual blocks | Low priority |
