# Phase 3: Test Suite Health

Audited 2026-04-06. Sampled 45+ test files across ui/, composed/, shell/, ai/ layers.

---

## False-Pass Patterns

### Vacuous Assertions

Tests that render a component and assert only that *something* exists, without checking anything meaningful about the rendered output.

| File | Line | Pattern | Issue |
|------|------|---------|-------|
| `ui/button.test.tsx` | 14-17 | `it('applies variant classes')` | Renders `variant="solid" color="error"` but only asserts `getByRole('button').toBeInTheDocument()` -- never checks the actual variant classes were applied |
| `shell/top-bar.test.tsx` | 63-72 | `it('renders without crashing')` | Only asserts `container.firstElementChild.toBeInTheDocument()` -- no semantic check |
| `composed/file-preview.test.tsx` | 49-53 | `it('renders with explicit type prop')` | Renders `type="video"` but only asserts `container.firstElementChild.toBeInTheDocument()` -- never verifies a video element or video-specific rendering |
| `composed/rich-text-editor.test.tsx` | 16-19 | `it('renders without crashing')` | `container.firstElementChild.toBeInTheDocument()` only |
| `composed/rich-text-editor.test.tsx` | 69-72 | `RichTextViewer: it('renders without crashing')` | Same pattern |
| `composed/page-skeletons.test.tsx` | 7-10, 36-39, 61-64 | All three skeletons: `it('renders without crashing')` | `container.firstElementChild.toBeInTheDocument()` only -- acceptable for presentational components but still vacuous |
| `composed/loading-skeleton.test.tsx` | 7-10 | `CardSkeleton: it('renders without crashing')` | Same pattern |
| `composed/markdown-viewer.test.tsx` | 52-57 | `it('applies compact spacing via prop')` | Renders with `compact` but only checks `container.firstElementChild.toBeInTheDocument()` -- never verifies compact actually changes spacing |
| `ui/__tests__/sparkline.test.tsx` | 9-12 | `it('renders without crashing')` | `container.firstChild.toBeInTheDocument()` only |

**Severity: LOW-MEDIUM.** Most "renders without crashing" tests are in skeleton/presentational components where they serve as smoke tests. The `button.test.tsx` variant classes test is the most actionable -- it claims to test variant application but doesn't.

### Wrong Queries

No outright wrong-element queries found in the sampled files. The test suite consistently uses correct ARIA roles (`getByRole('button')`, `getByRole('switch')`, `getByRole('combobox')`, `getByRole('tab')`) and accessible names.

### Missing Await on Async Interactions

The codebase uses `fireEvent` (sync) in many places rather than `userEvent` (async). This is not necessarily a bug -- `fireEvent` is synchronous and appropriate for simple events -- but there are cases where it's used for interactions that might benefit from async handling:

| File | Lines | Pattern | Risk |
|------|-------|---------|------|
| `ui/badge.test.tsx` | 54, 62 | `fireEvent.click(btn)` for onDismiss/onClick | LOW -- sync callbacks, assertions are immediate |
| `ui/stat-card.test.tsx` | 92, 99, 106 | `fireEvent.click/keyDown` for onClick | LOW -- sync callback |
| `ui/chat/message-input.test.tsx` | 15-16, 24-25, 38, etc. | `fireEvent.change` + `fireEvent.keyDown` throughout | LOW -- all sync assertions |
| `ui/chat/message.test.tsx` | 159, 181-184, 205-208 | `fireEvent.click` followed by `fireEvent.change` + `fireEvent.keyDown` for inline editing | MEDIUM -- multi-step interactions may miss async state updates |
| `ui/context-menu.test.tsx` | 49+ | `fireEvent.contextMenu` throughout | LOW -- followed by `screen.findByText` (properly awaited) |
| `ai/__tests__/blocks/success.test.tsx` | 49, 110 | `fireEvent.click(undoBtn)` | LOW -- sync assertion |

**Severity: LOW overall.** Most `fireEvent` usage is for truly synchronous interactions. The `chat/message.test.tsx` inline-edit flow (click to edit -> change -> keyDown to save) is the most likely to miss real bugs because it chains multiple sync events for what is likely an async state machine.

### Render-Only Tests (render + axe, zero behavioral assertions)

These files contain ONLY axe checks with no behavioral, state, or interaction assertions. They catch a11y regressions but would not detect functional breakage.

| File | Test count | Notes |
|------|-----------|-------|
| `ui/__tests__/button-a11y.test.tsx` | 8 tests | All render + axe only |
| `ui/__tests__/tabs-a11y.test.tsx` | 1 test | Render + axe only |
| `ui/__tests__/dialog-a11y.test.tsx` | 1 test | Render + axe only |
| `ui/__tests__/sheet-a11y.test.tsx` | 1 test | Render + axe only |
| `ui/__tests__/dropdown-menu-a11y.test.tsx` | 2 tests | Render + axe only (closed + open state) |
| `ui/__tests__/breadcrumb-a11y.test.tsx` | 3 tests | Render + axe only |
| `ui/__tests__/link-a11y.test.tsx` | 4 tests | Render + axe only |
| `ui/__tests__/alert-a11y.test.tsx` | 5 tests | Render + axe only |
| `ui/__tests__/badge-a11y.test.tsx` | 7 tests | Render + axe only |
| `ui/__tests__/select-a11y.test.tsx` | 1 test | Render + axe only |
| `ui/__tests__/separator-a11y.test.tsx` | 2 tests | Render + axe only |
| `ui/__tests__/skeleton-a11y.test.tsx` | (not read, pattern confirmed) | Render + axe only |
| (and ~20 more `*-a11y.test.tsx` files) | ~50 total | All render + axe only |

**Severity: LOW (by design).** These are companion a11y files, not substitutes for behavioral tests. They are correctly structured. However, several components *only* have these a11y files and lack a behavioral test -- see Coverage Gap Matrix below.

---

## Coverage Gap Matrix

### Components with Zero Behavioral Test Files

These components have NO test file (or only an a11y-only test file with zero behavioral assertions):

| Component | Has Tests | Axe | Keyboard | Error States | Interactive States |
|---|---|---|---|---|---|
| **Breadcrumb** | a11y only | YES | NO | NO | NO |
| **Link** | a11y only | YES | NO | NO | NO |
| **IconContext** (`ui/icon-context.tsx`) | NO | NO | N/A | N/A | N/A |
| **ButtonProcessing** (`ui/button-processing.tsx`) | NO (tested via Button) | NO | N/A | N/A | N/A |
| **CommandRegistry** (`shell/command-registry.tsx`) | NO | NO | N/A | N/A | N/A |
| **DevadootIcon** (`ai/devadoot-icon.tsx`) | NO | NO | N/A | N/A | N/A |

**Note on ButtonProcessing:** The processing overlay behavior is tested indirectly through `button.test.tsx` (lines 306-345). However, `ButtonProcessing` as a standalone component has no dedicated test.

### Components with Tests but Missing Axe Coverage

| Component | Has Tests | Axe | Keyboard | Error States | Interactive States |
|---|---|---|---|---|---|
| **Button** (`ui/button.test.tsx`) | YES (29 tests) | NO (separate a11y file exists) | NO | NO | YES (loading, disabled, processing) |
| **Tabs** (`ui/tabs.test.tsx`) | YES (12 tests) | NO (separate a11y file exists) | NO | NO | YES (click to switch) |
| **ButtonGroup** (`ui/button-group.test.tsx`) | YES (6 tests) | NO | NO | NO | NO |
| **VisuallyHidden** (`ui/__tests__/visually-hidden.test.tsx`) | YES (5 tests) | NO | N/A | N/A | N/A |
| **Stepper** (`ui/__tests__/stepper.test.tsx`) | YES (6 tests) | NO | NO | NO | YES (step states) |
| **BulkActionBar** (`composed/bulk-action-bar.test.tsx`) | YES (5 tests) | NO | NO | NO | YES (confirm, clear) |
| **DeadlineIndicator** (`composed/deadline-indicator.test.tsx`) | YES (7 tests) | NO | N/A | NO | NO |
| **FilePreview** (`composed/file-preview.test.tsx`) | YES (5 tests) | NO | NO | NO | NO |
| **FormSection** (`composed/form-section.test.tsx`) | YES (6 tests) | NO | NO | NO | NO |
| **InlineEdit** (`composed/inline-edit.test.tsx`) | YES (7 tests) | NO | NO | NO | NO |
| **MarkdownViewer** (`composed/markdown-viewer.test.tsx`) | YES (9 tests) | NO | N/A | NO | NO |
| **CalendarGrid** (`composed/__tests__/calendar-grid.test.tsx`) | YES (3 tests) | NO | NO | NO | NO |

**Note:** Button and Tabs have *separate* a11y test files (`button-a11y.test.tsx`, `tabs-a11y.test.tsx`), so axe coverage exists but is decoupled from the behavioral test.

### Components with Tests but Missing Keyboard Interaction Coverage

| Component | Open/Close via keyboard | Arrow navigation | Escape to dismiss | Tab/Focus trapping |
|---|---|---|---|---|
| **Dialog** (`ui/dialog.test.tsx`) | NO | N/A | NO | NO |
| **Sheet** (a11y only) | NO | N/A | NO | NO |
| **DropdownMenu** (a11y only) | NO | NO | NO | NO |
| **Tabs** (`ui/tabs.test.tsx`) | NO (click only) | NO (arrow key nav) | N/A | N/A |
| **NavigationMenu** (`ui/navigation-menu.test.tsx`) | NO (click only) | NO | NO | N/A |
| **Select** (`ui/select.test.tsx`) | NO (forced open) | NO | NO | N/A |
| **ContextMenu** (`ui/context-menu.test.tsx`) | YES (contextmenu event) | NO | NO | N/A |
| **CommandPalette** (`composed/command-palette.test.tsx`) | YES (Ctrl+K) | NO | NO | N/A |
| **Collapsible** (`ui/collapsible.test.tsx`) | NO (click only) | N/A | N/A | N/A |

**High-priority gaps:** Dialog, Sheet, and DropdownMenu have NO behavioral tests beyond their a11y-only files. For Radix-based components, keyboard interaction is handled by the primitive layer, but there are no tests verifying that the primitives are wired correctly.

---

## Test Isolation

### Global Setup (`test-setup.ts`)

The global setup file provides:
1. **`vitest-axe` matchers** -- extended via `expect.extend(axeMatchers)`
2. **`ResizeObserver` mock** -- empty no-op implementation (observe/unobserve/disconnect do nothing)
3. **`window.matchMedia` mock** -- always returns `matches: false`, no-op listeners
4. **`Element.prototype.hasPointerCapture`** -- returns `false`
5. **`Element.prototype.releasePointerCapture`** -- no-op
6. **`Element.prototype.setPointerCapture`** -- no-op
7. **`Element.prototype.scrollIntoView`** -- no-op

All mocks use `if (typeof X === 'undefined')` guards, so they only install when jsdom doesn't provide the API. This is well-structured and won't clobber real implementations.

### Potential Leaks

#### IntersectionObserver -- duplicated and never cleaned up

| File | Scope | Cleanup |
|------|-------|---------|
| `ai/__tests__/ai-components.test.tsx` (line 9-21) | Module-level `if` guard | NO cleanup -- persists for entire test run |
| `ai/__tests__/conversation.test.tsx` (line 25-37) | `beforeAll` | NO cleanup -- persists for entire test run |

Both files install `globalThis.IntersectionObserver` without an `afterAll` to restore the original. Since the global test-setup.ts does NOT mock IntersectionObserver, these two files are adding it independently. If either file runs before tests that DON'T want IntersectionObserver mocked, the mock leaks.

**Risk: LOW** in practice because Vitest isolates test files by default (`isolate: true`). But if isolation is ever disabled for performance, this becomes a real problem.

#### window.matchMedia -- re-defined per-test without restore

| File | Scope | Cleanup |
|------|-------|---------|
| `shell/sidebar.test.tsx` (line 11-20) | `beforeEach` | NO `afterEach` restore |
| `shell/top-bar.test.tsx` (line 51-60) | `beforeEach` | NO `afterEach` restore |

Both use `Object.defineProperty(window, 'matchMedia', { writable: true, configurable: true, value: ... })` in `beforeEach` but never restore the original. Since `test-setup.ts` already provides a global matchMedia mock, these per-file overrides are redundant AND they shadow the global mock. If a test later checks `window.matchMedia` behavior, it would get the test-file-specific mock rather than the global one.

**Risk: LOW** because the mocks are functionally identical to the global one.

#### window.getComputedStyle -- mutated without cleanup

| File | Scope | Cleanup |
|------|-------|---------|
| `composed/rich-text-editor.test.tsx` (line 8-12) | Module level | NO cleanup |

Overrides `window.getComputedStyle` with a minimal stub. If any subsequent test in the same thread depends on `getComputedStyle` returning real computed styles, it would fail silently.

**Risk: LOW** (Vitest file isolation protects against this).

#### localStorage.clear() -- proper cleanup

`shell/top-bar.test.tsx` properly calls `localStorage.clear()` in `beforeEach` and removes `.dark` class. This is correctly done.

#### vi.useFakeTimers -- properly cleaned

`composed/activity-feed.test.tsx`, `composed/deadline-indicator.test.tsx`, `ui/spinner.test.tsx`, and `ai/__tests__/blocks/success.test.tsx` all use `vi.useFakeTimers()` / `vi.useRealTimers()` with proper `beforeEach`/`afterEach` pairs.

#### Toast dismiss -- properly cleaned

`ui/toast.test.tsx` uses `afterEach(() => { act(() => { toast.dismiss() }) })` to clear toasts between tests.

---

## Recommendations

### Critical (fix before next release)

1. **Add keyboard tests for Dialog, Sheet, and DropdownMenu.** These are core overlay components. At minimum test: Escape closes, Tab traps focus within open overlay, and initial focus lands on the correct element.

2. **Fix the vacuous Button variant test** (`button.test.tsx:14-17`). It claims to test variant classes but asserts nothing about them. Either check `toHaveClass('bg-error-9')` or remove the test (it's a false positive giving false confidence).

### High Priority

3. **Add behavioral tests for Breadcrumb and Link.** Both only have a11y files. At minimum: renders correct `<nav>` landmark, links have correct `href`, separator renders between items (Breadcrumb); renders as `<a>`, handles `target="_blank"`, handles `onClick` (Link).

4. **Add keyboard navigation tests for Tabs.** Arrow keys should move between tabs -- this is Radix behavior but needs verification that the DS wiring preserves it.

5. **Add axe assertions to ButtonGroup, Stepper, VisuallyHidden, BulkActionBar, DeadlineIndicator, FilePreview, FormSection, InlineEdit, MarkdownViewer, and CalendarGrid.** These have behavioral tests but no a11y assertions.

6. **Add test files for IconContext, CommandRegistry, and DevadootIcon.** These are completely untested.

### Medium Priority

7. **Migrate `fireEvent` to `userEvent` in chat/message.test.tsx.** The multi-step inline edit flow (click -> change -> keyDown) is risky with sync events. `userEvent` would better simulate real interactions.

8. **Centralize IntersectionObserver mock** in `test-setup.ts` alongside the existing ResizeObserver mock. Remove the duplicated mocks from `ai/__tests__/ai-components.test.tsx` and `ai/__tests__/conversation.test.tsx`.

9. **Remove redundant matchMedia overrides** from `shell/sidebar.test.tsx` and `shell/top-bar.test.tsx` -- the global mock in `test-setup.ts` already handles this.

### Low Priority

10. **"Renders without crashing" tests** in skeleton/presentational components are acceptable as smoke tests but should not be counted as real test coverage. Consider adding `/* smoke */` comments to distinguish them from behavioral tests.

11. **FilePreview `type="video"` test** is effectively vacuous -- it should verify a `<video>` element is rendered or at minimum check for a video-specific class/attribute.

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Test files sampled | 45+ |
| Vacuous assertion instances | 9 |
| Pure render+axe files (by design) | ~25 |
| Components with zero test files | 4 (IconContext, ButtonProcessing, CommandRegistry, DevadootIcon) |
| Components with a11y-only tests | 2 (Breadcrumb, Link) |
| Components missing axe coverage | 12 |
| Components missing keyboard tests | 9 overlay/navigation components |
| Global mock leak risks | 3 (all LOW risk due to Vitest isolation) |
| fireEvent usage (vs userEvent) | ~55 call sites across all test files |
