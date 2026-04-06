# Phase 2 Batch 5 -- Composed Layer Audit

**Date**: 2026-04-06
**Auditor**: Claude Opus 4.6
**Scope**: 35 composed components (packages/core/src/composed/)
**Scoring**: P = Pass, F = Fail, C = Conditional (has caveats)

---

## Summary Table

| # | Component | WCAG | Keyboard | API/DX | Tests | Bundle/SSR | Docs | Overall |
|---|-----------|------|----------|--------|-------|------------|------|---------|
| 1 | ActivityFeed | P | C | P | P | P | P | C |
| 2 | AvatarGroup | P | C | P | P | P | P | C |
| 3 | BulkActionBar | C | F | C | C | P | P | C |
| 4 | CommandPalette | P | P | P | P | P | P | P |
| 5 | ConfirmDialog | P | P | P | P | P | P | P |
| 6 | ContentCard | P | P | P | P | P | P | P |
| 7 | DeadlineIndicator | C | P | C | P | P | P | C |
| 8 | EmojiPicker | C | C | C | C | P | P | C |
| 9 | EmptyState | P | P | P | P | P | P | P |
| 10 | ErrorBoundary | P | P | P | P | P | P | P |
| 11 | FilePreview | C | C | P | C | P | P | C |
| 12 | FilterBar | P | C | P | P | P | P | C |
| 13 | FormSection | P | P | C | C | P | P | C |
| 14 | GlobalLoading | P | P | P | C | P | P | C |
| 15 | InlineEdit | C | P | C | C | P | P | C |
| 16 | LoadingSkeleton | P | P | P | P | P | P | P |
| 17 | MarkdownViewer | P | P | C | C | P | P | C |
| 18 | MasterDetail | C | C | P | C | P | P | C |
| 19 | MemberPicker | P | P | P | P | P | P | P |
| 20 | MultiSelectPopover | P | P | P | P | P | P | P |
| 21 | PageHeader | P | P | P | P | P | P | P |
| 22 | PageSkeletons | P | P | P | P | P | P | P |
| 23 | PriorityIndicator | P | P | P | P | P | P | P |
| 24 | ResponsiveOverlay | P | P | C | C | P | P | C |
| 25 | RichTextEditor | C | C | P | C | P | P | C |
| 26 | ScheduleView | C | C | P | P | P | P | C |
| 27 | SimpleTooltip | P | P | P | P | P | P | P |
| 28 | StatusBadge | P | P | P | P | P | P | P |
| 29 | DatePicker | P | P | P | P | P | P | P |
| 30 | DateRangePicker | P | P | P | C | P | P | C |
| 31 | DateTimePicker | P | C | P | C | P | P | C |
| 32 | MonthPicker | P | C | P | P | P | P | C |
| 33 | YearPicker | P | C | P | P | P | P | C |
| 34 | TimePicker | P | C | P | C | P | P | C |
| 35 | CalendarGrid | P | P | P | C | P | P | C |

**Summary**: 14 full Pass, 21 Conditional, 0 Fail

---

## Per-Component Detail

### 1. ActivityFeed

**Source**: `packages/core/src/composed/activity-feed.tsx`
**Test**: `activity-feed.test.tsx` (19 tests)
**Story**: `activity-feed.stories.tsx`

**A. WCAG**: P
- Uses `<time>` element with `dateTime` for temporal info
- Action button with `role="button"`, `tabIndex`, `onKeyDown` (Enter/Space) when detail is expandable
- Color-coded dots use semantic tokens (success-9, error-9 etc.)

**B. Keyboard**: C
- Expandable detail items properly handle Enter/Space
- **Issue**: No focus management on "Show all" or "Load more" -- after click the focus may be lost as new items animate in
- No roving tabindex for navigating between items

**C. API/DX**: P
- forwardRef, displayName, className + cn(), props spread
- Well-typed interfaces exported (ActivityItem, GroupLabels, ActivityFeedProps)
- renderItem callback for custom rendering

**D. Tests**: P
- axe test, rendering, empty state, loading, compact mode, truncation, load more, groupBy, custom labels
- renderItem coverage including mixed rendering

**E. Bundle/SSR**: P -- `'use client'` correct (uses framer-motion, useState)

**F. Docs**: P -- Story exists

---

### 2. AvatarGroup

**Source**: `packages/core/src/composed/avatar-group.tsx`
**Test**: `avatar-group.test.tsx` (20+ tests)
**Story**: `avatar-group.stories.tsx`

**A. WCAG**: P
- `role="group"` with `aria-label` showing user count
- Overflow badge: `<button>` with `aria-label` when interactive, `role="img"` with `aria-label` when static
- Tooltip for each avatar with name

**B. Keyboard**: C
- Container has `tabIndex={0}` with onFocus/onBlur for hover expansion
- **Issue**: Individual avatars are not focusable independently when `showTooltip={false}` -- they are `<div>` elements, not buttons. Only the overflow badge is a button.
- When tooltips are enabled, `TooltipTrigger` wraps each avatar making them activatable

**C. API/DX**: P
- forwardRef, displayName, CVA for size variants
- Comprehensive props: size, max, showTooltip, borderColor, onOverflowClick, renderAvatar, expandDirection, expandAmount

**D. Tests**: P
- axe tests across sizes and states, overflow click, renderAvatar, indicators, ring classes, border variants, size parity

**E. Bundle/SSR**: P -- `'use client'` correct

**F. Docs**: P -- Story exists

---

### 3. BulkActionBar

**Source**: `packages/core/src/composed/bulk-action-bar.tsx`
**Test**: `bulk-action-bar.test.tsx` (6 tests)
**Story**: `bulk-action-bar.stories.tsx`

**A. WCAG**: C
- Has `role="toolbar"` and `aria-label` with count
- Clear selection button has `aria-label="Clear selection"`
- **Issue**: No `aria-live` region to announce when the bar appears/disappears with selection changes

**B. Keyboard**: F
- **Critical**: Uses `createPortal` to document.body but implements NO keyboard trap or focus management
- No toolbar keyboard pattern (APG: arrow keys move between buttons in toolbar)
- Inline confirmation dialog has no focus management -- Confirm/Cancel buttons are not auto-focused
- No Escape key handler to dismiss the bar

**C. API/DX**: C
- No forwardRef -- uses function component directly
- No displayName
- className prop available but limited

**D. Tests**: C
- Tests rendering, clear button, select all, inline confirmation
- **Missing**: No axe test, no keyboard navigation test

**E. Bundle/SSR**: P -- `'use client'` correct (uses createPortal)

**F. Docs**: P -- Story exists

---

### 4. CommandPalette

**Source**: `packages/core/src/composed/command-palette.tsx`
**Test**: `command-palette.test.tsx` (20+ tests)
**Story**: `command-palette.stories.tsx`

**A. WCAG**: P
- `role="combobox"` on input with `aria-expanded`, `aria-controls`, `aria-activedescendant`, `aria-autocomplete="list"`
- `role="listbox"` on results with `aria-label`
- `role="option"` on each item with `aria-selected`
- VisuallyHidden title and description for dialog
- Reduced motion support via `useMotion()` hook

**B. Keyboard**: P
- ArrowUp/Down for navigation with wrap-around
- Enter to select and close
- Escape to close
- Scroll active item into view
- Global keybinding (mod+k) with customizable bindings
- Multiple keybinding support

**C. API/DX**: P
- forwardRef, displayName, className + cn(), props spread
- Controlled/uncontrolled open state
- Customizable keybinding, maxHeight, footerHints, emptyState, renderLabel, filterValue

**D. Tests**: P
- axe tests (open and closed), filtering, enter/select, custom keybinding, disabled keybinding, multiple keybindings, ReactNode labels, filterValue, renderLabel, custom empty state, maxHeight, footer hints, shortcut display

**E. Bundle/SSR**: P -- `'use client'` correct

**F. Docs**: P -- Story exists

---

### 5. ConfirmDialog

**Source**: `packages/core/src/composed/confirm-dialog.tsx`
**Test**: `confirm-dialog.test.tsx` (7 tests)
**Story**: `confirm-dialog.stories.tsx`

**A. WCAG**: P
- Uses AlertDialog primitives which enforce ARIA pattern
- AlertDialogTitle, AlertDialogDescription present

**B. Keyboard**: P -- Inherits from AlertDialog (Escape close, tab trap, auto-focus)

**C. API/DX**: P
- forwardRef, displayName, className spread
- Clean controlled API: open, onOpenChange, onConfirm, loading

**D. Tests**: P
- Renders title/description, custom labels, confirm/cancel clicks, loading state, closed state

**E. Bundle/SSR**: P -- `'use client'` correct

**F. Docs**: P -- Story exists

---

### 6. ContentCard

**Source**: `packages/core/src/composed/content-card.tsx`
**Test**: `content-card.test.tsx` (8 tests)
**Story**: `content-card.stories.tsx`

**A. WCAG**: P -- Semantic structure, no interactive issues

**B. Keyboard**: P -- No interactive behavior (passive container)

**C. API/DX**: P
- forwardRef, displayName, CVA variants (variant, padding)
- header/headerTitle/headerActions/footer compound layout
- `@server-safe` annotation

**D. Tests**: P
- Children, headerTitle, headerActions, footer, custom header, className, axe tests for all variants

**E. Bundle/SSR**: P -- `// @server-safe` -- no browser APIs, no state

**F. Docs**: P -- Story exists

---

### 7. DeadlineIndicator

**Source**: `packages/core/src/composed/deadline-indicator.tsx`
**Test**: `deadline-indicator.test.tsx` (7 tests)
**Story**: `deadline-indicator.stories.tsx`

**A. WCAG**: C
- Uses color to indicate urgency (success/warning/error tokens)
- **Issue**: No `aria-label` or `role="status"` on the element -- screen readers only get the text content which is helpful, but the urgency semantics are color-only
- Tooltip shows absolute time when in relative mode

**B. Keyboard**: P -- Non-interactive element, tooltip via SimpleTooltip

**C. API/DX**: C
- No forwardRef -- plain function component
- No displayName
- Props spread correctly, className supported

**D. Tests**: P
- Tests all color thresholds, overdue states, icon, string deadline input

**E. Bundle/SSR**: P -- `'use client'` correct (uses setInterval, Date.now)

**F. Docs**: P -- Story exists

---

### 8. EmojiPicker

**Source**: `packages/core/src/composed/emoji-picker.tsx`
**Test**: `emoji-picker.test.tsx` (2 tests)
**Story**: `emoji-picker.stories.tsx`

**A. WCAG**: C
- Wraps third-party `@emoji-mart/react` which has its own a11y
- Skeleton loading state during lazy load
- **Issue**: No explicit ARIA labels on the picker wrapper

**B. Keyboard**: C
- Relies entirely on emoji-mart's built-in keyboard navigation
- No custom keyboard handling
- Popover variant closes on select (good)

**C. API/DX**: C
- No forwardRef, no displayName
- Clean props but thin wrapper -- all a11y depends on the third-party lib

**D. Tests**: C
- Only 2 tests: renders without crashing, trigger renders
- **Missing**: No axe test, no selection test, no keyboard test
- Heavy deps mocked so tests only verify mounting

**E. Bundle/SSR**: P -- `'use client'`, lazy-loaded with Suspense, SSR-safe theme detection

**F. Docs**: P -- Story exists

---

### 9. EmptyState

**Source**: `packages/core/src/composed/empty-state.tsx`
**Test**: `empty-state.test.tsx` (15 tests)
**Story**: `empty-state.stories.tsx`

**A. WCAG**: P
- Semantic heading (h3) for title
- Description in `<p>` tag
- Icon has appropriate sizing classes
- DevalokChakraIcon has `aria-hidden="true"`

**B. Keyboard**: P -- Passive display component; action slot can hold interactive elements

**C. API/DX**: P
- forwardRef, displayName, className + cn()
- Handles icon as ReactNode or ComponentType
- iconSize prop with sensible defaults (sm when compact)

**D. Tests**: P
- axe tests (3 variants), title, description, action, custom icon, component-type icon, className, iconSize across all variants

**E. Bundle/SSR**: P -- `'use client'` (uses framer-motion for animation)

**F. Docs**: P -- Story exists

---

### 10. ErrorBoundary / ErrorDisplay

**Source**: `packages/core/src/composed/error-boundary.tsx`
**Test**: `__tests__/error-boundary.test.tsx` + `__tests__/error-display.test.tsx` (17 tests)
**Story**: `error-boundary.stories.tsx`

**A. WCAG**: P
- ErrorDisplay uses semantic headings (h2), status code display
- Icon with descriptive title/class
- Try Again button is properly labeled

**B. Keyboard**: P
- Try Again button is a standard `<Button>`
- ErrorBoundary catches and displays; no custom keyboard needs

**C. API/DX**: P
- ErrorDisplay: forwardRef, displayName, className + cn(), props spread
- ErrorBoundary: class component (correct for error boundary pattern)
- Custom fallback render prop for ErrorBoundary
- Error parsing: status, message, stack from various shapes

**D. Tests**: P
- Tests all error statuses (404, 403, 500, generic), message formats (Error, string, object), Try Again button, stack trace (dev/prod), ref forwarding, ErrorBoundary catch/render

**E. Bundle/SSR**: P -- `'use client'` correct

**F. Docs**: P -- Story exists

---

### 11. FilePreview

**Source**: `packages/core/src/composed/file-preview.tsx`
**Test**: `file-preview.test.tsx` (5 tests)
**Story**: `file-preview.stories.tsx`

**A. WCAG**: C
- Volume slider has `role="slider"` with `aria-label`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Download link accessible
- **Issue**: Mute button uses short aria-label with "(M)" keyboard hint -- adequate but could be more descriptive
- **Issue**: Fullscreen toggle lacks visible label (icon-only)

**B. Keyboard**: C
- Volume slider has `tabIndex={0}` but uses pointer events only -- no keyboard increment/decrement with arrow keys
- Play/pause, mute buttons are standard `<button>` elements
- **Issue**: Zoom controls (ZoomIn/Out/Reset) are Buttons but image pan requires mouse
- **Issue**: PDF page navigation buttons are present but no keyboard shortcut for page turn

**C. API/DX**: P
- No forwardRef but has className + cn(), props spread
- Auto-detects file type from URL/mimeType
- Error callback prop
- File info display (name, size)

**D. Tests**: C
- Tests file name/size, download link, image auto-detect, explicit type, className
- **Missing**: No axe test, no keyboard test, no error state test, no volume slider test
- Heavy deps (react-pdf, react-zoom-pan-pinch) mocked

**E. Bundle/SSR**: P -- `'use client'` correct

**F. Docs**: P -- Story exists

---

### 12. FilterBar

**Source**: `packages/core/src/composed/filter-bar.tsx`
**Test**: `filter-bar.test.tsx` (8 tests)
**Story**: `filter-bar.stories.tsx`

**A. WCAG**: P
- `role="toolbar"` with `aria-label="Filters"`
- Uses SearchInput which has proper ARIA
- Select uses ui/select with built-in a11y

**B. Keyboard**: C
- Toolbar role present but **no arrow key navigation between filter controls** (APG toolbar pattern)
- Individual controls (SearchInput, Select, Button) have their own keyboard support
- FilterMultiSelect trigger is a plain `<button>` which is keyboard accessible

**C. API/DX**: P
- Context-based size propagation to children
- Compound pattern: FilterBar, FilterSelect, FilterMultiSelect
- Clean prop interfaces

**D. Tests**: P
- Toolbar role, search input conditional rendering, typing, children, clear all button, className

**E. Bundle/SSR**: P -- `'use client'` correct

**F. Docs**: P -- Story exists

---

### 13. FormSection

**Source**: `packages/core/src/composed/form-section.tsx`
**Test**: `form-section.test.tsx` (6 tests)
**Story**: `form-section.stories.tsx`

**A. WCAG**: P
- Collapsible trigger is a button (via CollapsibleTrigger)
- Title/description use semantic spans with font-semibold differentiation

**B. Keyboard**: P -- Collapsible trigger is keyboard accessible via underlying Collapsible primitive

**C. API/DX**: C
- No forwardRef, no displayName
- Props: title, description, collapsible, defaultOpen
- Uses Collapsible primitives when collapsible

**D. Tests**: C
- Title, description, children, className, collapsible mode rendering
- **Missing**: No axe test, no collapsible toggle test (clicking to collapse), no keyboard test

**E. Bundle/SSR**: P -- `'use client'` correct

**F. Docs**: P -- Story exists

---

### 14. GlobalLoading

**Source**: `packages/core/src/composed/global-loading.tsx`
**Test**: `__tests__/global-loading.test.tsx` (2 tests)
**Story**: `global-loading.stories.tsx`

**A. WCAG**: P
- `role="progressbar"` with `aria-label="Page loading"`, `aria-hidden` when not loading, `aria-valuetext="Loading"` when loading

**B. Keyboard**: P -- Non-interactive element

**C. API/DX**: P
- forwardRef, displayName, className + cn(), props spread

**D. Tests**: C
- Only 2 axe tests (loading/not loading)
- **Missing**: No test for the actual progress bar behavior, transition states, className

**E. Bundle/SSR**: P -- `'use client'` correct (uses refs, state)

**F. Docs**: P -- Story exists

---

### 15. InlineEdit

**Source**: `packages/core/src/composed/inline-edit.tsx`
**Test**: `inline-edit.test.tsx` (7 tests)
**Story**: `inline-edit.stories.tsx`

**A. WCAG**: C
- Uses `role="textbox"` and `contentEditable` which is semantically correct
- `tabIndex={0}` for focus when not readOnly
- **Issue**: No `aria-label` or associated label -- the placeholder text is only shown as visual text content, not as a proper label attribute
- Saving state shows spinner but no `aria-busy` attribute

**B. Keyboard**: P
- Enter to save (commit)
- Escape to cancel (reverts text)
- Focus selects all text
- maxLength enforced on input
- Paste handler strips rich content (plain text only)

**C. API/DX**: C
- No forwardRef -- function component
- No displayName
- Props: value, onSave, placeholder, textClassName, readOnly, maxLength, saving

**D. Tests**: C
- Tests value rendering, placeholder, contentEditable, readOnly, saving, textClassName, className
- **Missing**: No axe test, no keyboard tests (Enter/Escape), no commit/cancel test

**E. Bundle/SSR**: P -- `'use client'` correct

**F. Docs**: P -- Story exists

---

### 16. LoadingSkeleton (Card, Table, Board, List)

**Source**: `packages/core/src/composed/loading-skeleton.tsx`
**Test**: `loading-skeleton.test.tsx` (15 tests)
**Story**: `loading-skeleton.stories.tsx`

**A. WCAG**: P -- Decorative skeletons, no interactive content

**B. Keyboard**: P -- Non-interactive

**C. API/DX**: P
- All 4 variants: forwardRef, displayName, className + cn()
- `@server-safe` annotation
- Configurable: rows, columns, cardsPerColumn, showAvatar

**D. Tests**: P
- axe tests for all 4 variants, rendering, customization props, className, ref forwarding, props spread

**E. Bundle/SSR**: P -- `// @server-safe`, no browser APIs

**F. Docs**: P -- Story exists

---

### 17. MarkdownViewer

**Source**: `packages/core/src/composed/markdown-viewer.tsx`
**Test**: `markdown-viewer.test.tsx` (9 tests)
**Story**: `markdown-viewer.stories.tsx`

**A. WCAG**: P
- Headings have IDs for anchor linking
- Images have `alt` attribute (falls back to empty string)
- Links have proper `rel="noopener noreferrer"` and `target="_blank"`
- Tables use semantic `<th>` and `<td>`

**B. Keyboard**: P
- Copy button on code blocks is a standard Button
- Anchor links on headings are focusable with href

**C. API/DX**: C
- No forwardRef, no displayName
- Props: content, compact, allowHtml, linkTarget

**D. Tests**: C
- Tests paragraph, headings (h1, h2), links, code block, inline code, list, blockquote, compact, className
- **Missing**: No axe test, no table rendering test, no copy button test

**E. Bundle/SSR**: P -- `'use client'` correct (lazy-loads syntax highlighter)

**F. Docs**: P -- Story exists

---

### 18. MasterDetail

**Source**: `packages/core/src/composed/master-detail.tsx`
**Test**: `master-detail.test.tsx` (5 tests)
**Story**: `master-detail.stories.tsx`

**A. WCAG**: C
- List has `role="listbox"` with `tabIndex={0}`
- ListItem has `role="option"` with `aria-selected`
- **Issue**: No `aria-label` on the listbox
- Back button on mobile has proper label via text content

**B. Keyboard**: C
- ArrowUp/Down on list fires `onNavigate` callback -- but actual focus management is left to the consumer
- **Issue**: No roving tabindex -- the listbox itself gets focus, but individual options don't get programmatic focus on arrow key
- **Issue**: No Enter/Space to select an item from the list (only click)

**C. API/DX**: P
- Compound pattern: MasterDetail.List, MasterDetail.Detail, MasterDetail.ListItem
- Context-based mobile detection
- emptyState, onNavigate, masterWidth, breakpoint props

**D. Tests**: C
- Tests list/detail rendering, option role, active item, desktop mode
- **Missing**: No axe test, no keyboard navigation test, no mobile mode test

**E. Bundle/SSR**: P -- `'use client'` correct (uses matchMedia, state)

**F. Docs**: P -- Story exists

---

### 19. MemberPicker

**Source**: `packages/core/src/composed/member-picker.tsx`
**Test**: `member-picker.test.tsx` (7 tests)
**Story**: `member-picker.stories.tsx`

**A. WCAG**: P -- Delegates to MultiSelectPopover which has search ARIA

**B. Keyboard**: P -- Via MultiSelectPopover (arrow keys, Enter)

**C. API/DX**: P
- forwardRef, displayName
- Thin wrapper over MultiSelectPopover with member-specific rendering (avatars, initials)

**D. Tests**: P
- axe tests (closed, open, empty), trigger, opening, selection, search filtering, avatar initials

**E. Bundle/SSR**: P -- `'use client'` correct

**F. Docs**: P -- Story exists

---

### 20. MultiSelectPopover

**Source**: `packages/core/src/composed/multi-select-popover.tsx`
**Test**: `multi-select-popover.test.tsx` (8 tests)
**Story**: `multi-select-popover.stories.tsx`

**A. WCAG**: P
- Search input has `aria-label="Search"` and `aria-activedescendant`
- Items are buttons (implicit role)
- Check icon has visual indication

**B. Keyboard**: P
- ArrowUp/Down with wrap-around on search input
- Enter to toggle selection from focused item
- Scroll focused item into view
- Debounced async search support

**C. API/DX**: P
- forwardRef, displayName
- Flat items or grouped items with section headers
- Custom renderItem, async onSearch, maxSelections, emptyMessage

**D. Tests**: P
- Trigger, opening, search, filtering, empty message, selection, deselection, maxSelections, grouped items

**E. Bundle/SSR**: P -- `'use client'` correct

**F. Docs**: P -- Story exists

---

### 21. PageHeader

**Source**: `packages/core/src/composed/page-header.tsx`
**Test**: `page-header.test.tsx` (11 tests)
**Story**: `page-header.stories.tsx`

**A. WCAG**: P
- `<nav aria-label="Breadcrumb">` for breadcrumbs
- Chevron separators are SVGs (no role, just visual)
- `<h1>` for title
- Breadcrumb links have focus-visible ring styles

**B. Keyboard**: P -- Links and buttons are natively focusable

**C. API/DX**: P
- forwardRef, displayName, className + cn()
- `@server-safe` annotation
- Title auto-derived from last breadcrumb if not provided
- titleClassName prop

**D. Tests**: P
- axe tests (4 variants), title, subtitle, breadcrumbs nav, breadcrumb links, auto-derived title, actions, className, titleClassName

**E. Bundle/SSR**: P -- `// @server-safe`, no browser APIs, no state

**F. Docs**: P -- Story exists

---

### 22. PageSkeletons (Dashboard, ProjectList, TaskDetail)

**Source**: `packages/core/src/composed/page-skeletons.tsx`
**Test**: `page-skeletons.test.tsx` (10 tests)
**Story**: `page-skeletons.stories.tsx`

**A. WCAG**: P -- Decorative skeleton content

**B. Keyboard**: P -- Non-interactive

**C. API/DX**: P
- All 3: forwardRef, displayName, className
- `@server-safe` annotation

**D. Tests**: P
- axe tests for all 3, rendering, structural counts, className, ref forwarding

**E. Bundle/SSR**: P -- `// @server-safe`

**F. Docs**: P -- Story exists

---

### 23. PriorityIndicator

**Source**: `packages/core/src/composed/priority-indicator.tsx`
**Test**: `priority-indicator.test.tsx` (11 tests)
**Story**: `priority-indicator.stories.tsx`

**A. WCAG**: P
- Compact mode uses `title` attribute for icon-only display
- Color-coded with icon differentiation (not color-only)
- Background color + icon shape provide redundant encoding

**B. Keyboard**: P -- Non-interactive display

**C. API/DX**: P
- forwardRef, displayName, CVA variants
- Accepts both uppercase and lowercase priority strings

**D. Tests**: P
- All 4 priority levels, case normalization, compact mode, SVG icon, className, axe tests for all priorities in both display modes

**E. Bundle/SSR**: P -- `'use client'` correct (framer-motion for urgent pulse)

**F. Docs**: P -- Story exists

---

### 24. ResponsiveOverlay

**Source**: `packages/core/src/composed/responsive-overlay.tsx`
**Test**: `responsive-overlay.test.tsx` (4 tests)
**Story**: `responsive-overlay.stories.tsx`

**A. WCAG**: P
- Delegates to Dialog or Sheet which have full ARIA patterns
- Title and Description in both paths

**B. Keyboard**: P -- Via Dialog/Sheet primitives

**C. API/DX**: C
- No forwardRef, no displayName
- Props: open, onOpenChange, title, description, breakpoint, className

**D. Tests**: C
- Title rendering, children, description, closed state
- **Missing**: No axe test, no mobile mode test (Sheet path)

**E. Bundle/SSR**: P -- `'use client'` correct (matchMedia)

**F. Docs**: P -- Story exists

---

### 25. RichTextEditor

**Source**: `packages/core/src/composed/rich-text-editor.tsx`
**Test**: `rich-text-editor.test.tsx` (10 tests)
**Story**: `rich-text-editor.stories.tsx`

**A. WCAG**: C
- Toolbar buttons have `aria-pressed` state
- Toolbar buttons have `title` attribute (hover label)
- Link form has `aria-label="Edit link URL"`
- **Issue**: Toolbar buttons are bare `<button>` elements with no `aria-label` -- they rely on `title` only, which is not reliably announced by screen readers
- **Issue**: No `role="toolbar"` on the toolbar container

**B. Keyboard**: C
- Toolbar buttons are focusable
- **Issue**: No APG toolbar pattern (no arrow key navigation between toolbar buttons)
- Link input handles Escape to cancel
- Tiptap handles content editing keyboard shortcuts (Ctrl+B, etc.)
- Emoji picker button present

**C. API/DX**: P
- forwardRef, displayName (via function name)
- Extensive props: content, onChange, toolbar whitelist, mentions, onImageUpload, onFileUpload
- RichTextViewer export for read-only mode
- Editor ref exposed for imperative control

**D. Tests**: C
- Renders, toolbar buttons, hides toolbar when not editable, onChange, className, axe test, toolbar whitelist
- **Missing**: No keyboard tests, no content editing tests, no link/image/file tests
- Tiptap is hard to test in jsdom -- the tests are reasonable for the environment

**E. Bundle/SSR**: P -- `'use client'` correct, heavy deps chunked separately (tiptap chunk)

**F. Docs**: P -- Story exists

---

### 26. ScheduleView

**Source**: `packages/core/src/composed/schedule-view.tsx`
**Test**: `schedule-view.test.tsx` (7 tests)
**Story**: `schedule-view.stories.tsx`

**A. WCAG**: C
- `role="region"` with descriptive `aria-label`
- Time column is `aria-hidden="true"` (good)
- Slot buttons have `aria-label` with time range
- Event buttons have `aria-label` with title + time range
- **Issue**: No `role="grid"` on the calendar grid layout -- events within day columns lack grid semantics

**B. Keyboard**: C
- Events are `<button>` elements (focusable)
- Time slots are `<button>` elements (focusable)
- **Issue**: No arrow key navigation between time slots or days (APG grid pattern)
- **Issue**: Current time indicator has `pointer-events-none` which is correct but the pulsing animation has no reduced-motion alternative

**C. API/DX**: P
- forwardRef, displayName
- Props: view, date, events, onEventClick, onSlotClick, startHour, endHour, slotDuration

**D. Tests**: P
- Day/week view aria labels, time column hours, event rendering, onEventClick, className, axe test

**E. Bundle/SSR**: P -- `'use client'` correct

**F. Docs**: P -- Story exists

---

### 27. SimpleTooltip

**Source**: `packages/core/src/composed/simple-tooltip.tsx`
**Test**: `__tests__/simple-tooltip.test.tsx` (2 tests)
**Story**: `simple-tooltip.stories.tsx`

**A. WCAG**: P -- Delegates to Tooltip primitives

**B. Keyboard**: P -- Via Tooltip (focus trigger shows tooltip)

**C. API/DX**: P
- forwardRef (to trigger button), displayName
- Clean wrapper: content, side, align, delayDuration

**D. Tests**: P
- Trigger rendering, axe test

**E. Bundle/SSR**: P -- `'use client'` correct

**F. Docs**: P -- Story exists

---

### 28. StatusBadge

**Source**: `packages/core/src/composed/status-badge.tsx`
**Test**: `status-badge.test.tsx` (24 tests)
**Story**: `status-badge.stories.tsx`

**A. WCAG**: P
- Dot has `aria-hidden="true"`
- Clickable variant renders as `<button type="button">`
- Non-clickable renders as `<span>`
- Color + dot provide redundant encoding (not color-only)

**B. Keyboard**: P -- Button variant is natively focusable

**C. API/DX**: P
- forwardRef, displayName, CVA variants
- Discriminated union: StatusBadgeWithStatus | StatusBadgeWithColor
- onClick triggers button rendering with auto-chevron
- Custom icon prop

**D. Tests**: P
- Extensive: default status, all statuses, custom label, dot visibility, className, specific status class checks, clickable/non-clickable, custom icon, color variants, axe across all statuses, size variants

**E. Bundle/SSR**: P -- `'use client'` correct

**F. Docs**: P -- Story exists

---

### 29. DatePicker

**Source**: `packages/core/src/composed/date-picker/date-picker.tsx`
**Test**: `__tests__/date-picker.test.tsx` (6 tests)
**Story**: `date-picker.stories.tsx`

**A. WCAG**: P
- Trigger button has `aria-label` with current value or placeholder
- Focus-visible ring on trigger
- CalendarGrid has `role="grid"` with `aria-label="Calendar"`

**B. Keyboard**: P -- Via CalendarGrid (arrow keys, Home/End, Enter/Space, month navigation)

**C. API/DX**: P
- forwardRef, displayName
- Props: value, onChange, formatStr, minDate, maxDate, disabledDates
- View drill-down: days -> months -> years

**D. Tests**: P
- Trigger, placeholder, axe, ref, className, formatted date display

**E. Bundle/SSR**: P -- `'use client'` correct

**F. Docs**: P -- Story exists

---

### 30. DateRangePicker

**Source**: `packages/core/src/composed/date-picker/date-range-picker.tsx`
**Test**: `__tests__/date-range-picker.test.tsx` (4 tests)
**Story**: `date-picker.stories.tsx`

**A. WCAG**: P
- Trigger has `aria-label` with range or placeholder
- Focus-visible ring

**B. Keyboard**: P -- Via CalendarGrid

**C. API/DX**: P
- forwardRef, displayName
- Props: startDate, endDate, onChange, presets, numberOfMonths, minDate, maxDate, disabledDates

**D. Tests**: C
- Trigger, axe, ref, className
- **Missing**: No range selection test, no preset test, no multi-month test

**E. Bundle/SSR**: P -- `'use client'` correct

**F. Docs**: P -- Story exists

---

### 31. DateTimePicker

**Source**: `packages/core/src/composed/date-picker/date-time-picker.tsx`
**Test**: `__tests__/date-time-picker.test.tsx` (4 tests)
**Story**: `date-picker.stories.tsx`

**A. WCAG**: P
- Trigger has `aria-label` with selected datetime or placeholder
- Time selects have `aria-label` for Hour, Minute, AM/PM

**B. Keyboard**: C
- CalendarGrid has full keyboard support
- **Issue**: Time `<select>` elements are native HTML selects which are keyboard accessible, but the dropdown interaction differs across platforms

**C. API/DX**: P
- forwardRef, displayName
- Props: value, onChange, timeFormat (12h/24h), minuteStep, minDate, maxDate, disabledDates

**D. Tests**: C
- Trigger, axe, ref, className
- **Missing**: No time selection test, no AM/PM toggle test, no combined date+time test

**E. Bundle/SSR**: P -- `'use client'` correct

**F. Docs**: P -- Story exists

---

### 32. MonthPicker

**Source**: `packages/core/src/composed/date-picker/month-picker.tsx`
**Test**: `__tests__/month-picker.test.tsx` (5 tests)
**Story**: `date-picker.stories.tsx`

**A. WCAG**: P -- Month buttons with disabled state styling

**B. Keyboard**: C
- Month buttons are native `<button>` elements (focusable)
- **Issue**: No grid keyboard navigation (arrow keys) -- Tab moves between buttons sequentially
- **Issue**: No `role="grid"` on the month grid

**C. API/DX**: P
- forwardRef, displayName, className + cn(), props spread

**D. Tests**: P
- Month buttons rendered, axe, ref, className, props spread

**E. Bundle/SSR**: P -- `'use client'` correct

**F. Docs**: P -- Story exists (within date-picker.stories.tsx)

---

### 33. YearPicker

**Source**: `packages/core/src/composed/date-picker/year-picker.tsx`
**Test**: `__tests__/year-picker.test.tsx` (5 tests)
**Story**: `date-picker.stories.tsx`

**A. WCAG**: P -- Year buttons with disabled state

**B. Keyboard**: C
- Same issues as MonthPicker: no grid keyboard navigation
- **Issue**: No arrow key nav, no `role="grid"` on year grid

**C. API/DX**: P
- forwardRef, displayName, className + cn(), props spread

**D. Tests**: P
- Year buttons rendered, axe, ref, className, props spread

**E. Bundle/SSR**: P -- `'use client'` correct

**F. Docs**: P -- Story exists (within date-picker.stories.tsx)

---

### 34. TimePicker

**Source**: `packages/core/src/composed/date-picker/time-picker.tsx`
**Test**: `__tests__/time-picker.test.tsx` (4 tests)
**Story**: `date-picker.stories.tsx`

**A. WCAG**: P
- Trigger has `aria-label` with selected time or placeholder
- Time columns in a `role="group"` with `aria-label="Time picker"`
- Individual buttons have `aria-label` ("3 hours", "15 minutes")
- `aria-selected` on active items

**B. Keyboard**: C
- Time buttons are native `<button>` elements
- **Issue**: No scroll column keyboard navigation -- scrolling long lists (60 minutes) requires Tab through every button
- Disabled state properly handled

**C. API/DX**: P
- forwardRef, displayName
- Props: value, onChange, format (12h/24h), minuteStep, secondStep, showSeconds, disabled

**D. Tests**: C
- Trigger, axe, ref, className
- **Missing**: No hour/minute selection test, no AM/PM test, no showSeconds test

**E. Bundle/SSR**: P -- `'use client'` correct

**F. Docs**: P -- Story exists

---

### 35. CalendarGrid

**Source**: `packages/core/src/composed/date-picker/calendar-grid.tsx`
**Test**: `__tests__/calendar-grid.test.tsx` (3 tests)
**Story**: Part of date-picker.stories.tsx

**A. WCAG**: P
- `role="grid"` with `tabIndex={0}` and `aria-label="Calendar"`
- `role="columnheader"` for weekday headers
- `role="gridcell"` on each day button
- `aria-label` with full date format ("Wednesday, March 4, 2026")
- `aria-selected` on selected/range-edge dates
- `aria-disabled` on disabled dates
- Previous/Next month buttons with `aria-label`
- Switch to month/year view button with `aria-label`

**B. Keyboard**: P
- ArrowLeft/Right: move by day
- ArrowUp/Down: move by week
- Home: start of month
- End: end of month
- Enter/Space: select date
- Focus management: `focusDate()` function navigates months and focuses target
- `tabIndex` managed: -1 for disabled/out-of-month, 0 for in-month

**C. API/DX**: P
- forwardRef, displayName
- Comprehensive: currentMonth, selected, rangeStart/End, hoverDate, events, disabledDates, minDate/maxDate, hidePrevNav/hideNextNav

**D. Tests**: C
- Event dots rendering, dot capping at 3, no dots when no events
- **Missing**: No axe test, no keyboard navigation test, no range selection test, no disabled date test
- The CalendarGrid tests only cover the event dot feature -- core calendar behavior is untested directly

**E. Bundle/SSR**: P -- `'use client'` correct

**F. Docs**: P -- Covered within date-picker stories

---

## Cross-Cutting Issues

### 1. Missing `forwardRef` / `displayName` (7 components)

The following components lack forwardRef and/or displayName:

| Component | forwardRef | displayName |
|-----------|-----------|-------------|
| BulkActionBar | No | No |
| DeadlineIndicator | No | No |
| EmojiPicker | No | No |
| FilterBar (compound) | No | No |
| FormSection | No | No |
| InlineEdit | No | No |
| MarkdownViewer | No | No |

**Impact**: Medium -- consumers cannot attach refs to these, React DevTools shows anonymous components.

### 2. Keyboard Navigation Gaps (APG patterns)

**High priority** -- These composed components have complex interaction patterns but lack APG keyboard navigation:

| Component | Missing Pattern |
|-----------|----------------|
| BulkActionBar | Toolbar arrow-key nav, Escape dismiss, focus management |
| RichTextEditor | Toolbar arrow-key nav (`role="toolbar"`) |
| FilterBar | Toolbar arrow-key nav |
| MasterDetail | Listbox roving tabindex, Enter/Space to select |
| ScheduleView | Grid arrow-key nav between days/times |
| MonthPicker | Grid arrow-key nav |
| YearPicker | Grid arrow-key nav |
| TimePicker | Column scroll keyboard nav |
| FilePreview | Volume slider arrow-key increment |

### 3. Missing `axe` Tests (7 components)

| Component | Has axe test? |
|-----------|--------------|
| BulkActionBar | No |
| DeadlineIndicator | No |
| FilePreview | No |
| FormSection | No |
| InlineEdit | No |
| MarkdownViewer | No |
| CalendarGrid | No |

### 4. SSR Annotations

All 35 components correctly use either `'use client'` or `// @server-safe`. The server-safe annotations are on:
- ContentCard
- LoadingSkeleton (Card, Table, Board, List)
- PageHeader
- PageSkeletons (Dashboard, ProjectList, TaskDetail)

These correctly have no browser APIs, no useState/useEffect, no event handlers.

### 5. Test Coverage Thin Spots

Several components have tests that only cover happy-path rendering without testing key interaction paths:

- **DateRangePicker**: No range selection test
- **DateTimePicker**: No time picker interaction test
- **TimePicker**: No hour/minute selection test
- **CalendarGrid**: Only event dot tests, no core calendar behavior
- **FilePreview**: No media playback tests
- **RichTextEditor**: No content editing tests (jsdom limitation)
- **GlobalLoading**: Only axe tests, no behavior tests

---

## Recommendations (Priority Order)

### P0 -- Must Fix

1. **BulkActionBar keyboard**: Add Escape to dismiss, focus management (trap focus in bar when visible), toolbar arrow-key nav
2. **RichTextEditor toolbar**: Add `role="toolbar"` to toolbar container, add `aria-label` to each toolbar button (not just `title`)
3. **MasterDetail keyboard**: Add roving tabindex to listbox, Enter/Space to activate items

### P1 -- Should Fix

4. **MonthPicker/YearPicker grid keyboard**: Add `role="grid"` and arrow-key navigation matching CalendarGrid
5. **FilePreview volume slider**: Add ArrowUp/Down/Left/Right keyboard support for volume adjustment
6. **FilterBar toolbar keyboard**: Add arrow-key navigation between filter controls
7. **InlineEdit aria-label**: Add `aria-label` prop forwarding to the contentEditable span
8. **Add missing axe tests** to: BulkActionBar, DeadlineIndicator, FilePreview, FormSection, InlineEdit, MarkdownViewer, CalendarGrid
9. **Add missing forwardRef/displayName** to: BulkActionBar, DeadlineIndicator, EmojiPicker, FormSection, InlineEdit, MarkdownViewer

### P2 -- Nice to Have

10. **ScheduleView grid semantics**: Add `role="grid"` to day column layout
11. **TimePicker column navigation**: Consider using listbox pattern instead of individual buttons for long lists
12. **ActivityFeed focus management**: Manage focus after "Show all" / "Load more" clicks
13. **BulkActionBar aria-live**: Add live region for selection count announcements
14. **DateRangePicker/DateTimePicker/TimePicker**: Expand test coverage for interaction paths
15. **ScheduleView reduced motion**: Respect prefers-reduced-motion for current-time pulsing animation
