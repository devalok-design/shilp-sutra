# TaskPanel v3 Detailing Pass — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all visual inconsistencies and redesign the TaskComposer visibility toggle to use the industry-standard tabs+amber pattern.

**Architecture:** TaskComposer gets a full rewrite of its visibility UX (tabs above textarea, amber background for client mode). All other changes are surgical class/padding fixes across 6 files. No new components, no new dependencies.

**Tech Stack:** React, Tailwind, Vitest + RTL (tests)

**Design doc:** `docs/plans/2026-04-04-taskpanel-v3-detailing-design.md`

---

## Task 1: Redesign TaskComposer — tabs + amber background

**Files:**
- Modify: `packages/karm/src/composed/task-composer.tsx`

This is the biggest change. Replace the Switch-inside-input pattern with tab buttons above the textarea, and add amber background when in client mode.

**Step 1: Replace imports**

Remove `Switch` import. Remove `Tooltip`, `TooltipTrigger`, `TooltipContent` imports. Keep `Icon`, `Button`, `cn`, and the icon imports (`IconPaperclip`, `IconSend`, `IconLock`, `IconEye`). Add `IconMoodSmile` can stay if present but isn't used — remove it too.

New imports needed: none (everything used is already imported minus the removed ones).

**Step 2: Add visibility tab bar**

Replace ONLY the `return (...)` JSX block. All handler functions (`handleSend`, `handleKeyDown`, `adjustHeight`, `handleFileChange`) and state declarations stay unchanged. The `handleSend` already calls `setVisibility(defaultVisibility)` on submit — this is preserved.

Here is the complete new `return` statement:

```tsx
return (
  <div
    className={cn(
      'border-t border-surface-border-subtle px-ds-06 py-ds-04',
      className,
    )}
  >
    {/* Visibility tabs — staff on client-visible tasks only */}
    {showVisibility && (
      <div className="mb-ds-02 flex items-center gap-ds-01">
        <button
          type="button"
          onClick={() => setVisibility('INTERNAL')}
          className={cn(
            'inline-flex items-center gap-ds-02 rounded-ds-md px-ds-03 py-ds-01 text-ds-xs font-medium transition-colors',
            !isClient
              ? 'bg-surface-raised-hover text-surface-fg'
              : 'text-surface-fg-subtle hover:text-surface-fg',
          )}
        >
          <Icon icon={IconLock} size="xs" />
          Team
        </button>
        <button
          type="button"
          onClick={() => setVisibility('CLIENT')}
          className={cn(
            'inline-flex items-center gap-ds-02 rounded-ds-md px-ds-03 py-ds-01 text-ds-xs font-medium transition-colors',
            isClient
              ? 'bg-warning-3 text-warning-11'
              : 'text-surface-fg-subtle hover:text-surface-fg',
          )}
        >
          <Icon icon={IconEye} size="xs" />
          Client
        </button>
      </div>
    )}

    <div
      className={cn(
        'flex items-end gap-ds-02 rounded-ds-xl border p-ds-03 transition-colors',
        isClient && showVisibility
          ? 'border-warning-7 bg-warning-2'
          : 'border-surface-border bg-surface-1',
      )}
    >
      {/* Client mode warning inline */}
      {showVisibility && isClient && (
        <div className="mb-px flex shrink-0 items-center">
          <Icon icon={IconEye} size="xs" className="text-warning-11" />
        </div>
      )}

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          adjustHeight()
        }}
        onKeyDown={handleKeyDown}
        placeholder={resolvedPlaceholder}
        aria-label="Message input"
        rows={1}
        className={cn(
          'max-h-[160px] min-h-[24px] flex-1 resize-none bg-transparent text-ds-sm text-surface-fg placeholder:text-surface-fg-subtle focus:outline-none',
          isClient && showVisibility && 'placeholder:text-warning-11/50',
        )}
      />

      {/* Action buttons */}
      <div className="flex shrink-0 items-center gap-ds-01">
        {showAttach && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
              tabIndex={-1}
            />
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Attach file"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              <Icon icon={IconPaperclip} size="sm" />
            </Button>
          </>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
          type="button"
        >
          <Icon icon={IconSend} size="sm" />
        </Button>
      </div>
    </div>
  </div>
)
```

Key changes from current code:
- Removed: `Switch`, `Tooltip/TooltipTrigger/TooltipContent` wrapper, the client-visibility warning banner above
- Added: Tab buttons above the input
- Changed: Input container background from `bg-surface-base` → `bg-surface-1` (default) or `bg-warning-2` (client mode)
- Changed: Border from `border-surface-border` → `border-warning-7` in client mode
- Added: Small eye icon inside input when in client mode (subtle inline reminder)
- Added: Amber-tinted placeholder text in client mode

**Step 3: Clean up unused imports**

Remove these imports (all are now unused):
- `Switch` from `'@/ui/switch'` (entire import line)
- `Tooltip`, `TooltipTrigger`, `TooltipContent` from `'@/ui/tooltip'` (entire import line)
- `IconMoodSmile` from the `@tabler/icons-react` import (it's imported but never used)

**Step 4: Verify typecheck**

```bash
pnpm typecheck
```

**Step 5: Commit**

```
refactor(karm): redesign TaskComposer — tabs + amber background for client visibility
```

---

## Task 2: Normalize QuickProps pill heights

**Files:**
- Modify: `packages/karm/src/tasks/v3/task-panel-quick-props.tsx`

**Step 1: Find and replace all status dots**

There are 3 occurrences of `h-2 w-2 shrink-0 rounded-full bg-accent-9` in this file (lines ~96, ~152, ~446). Change all three to `h-2.5 w-2.5 shrink-0 rounded-full bg-accent-9`.

**Step 2: Fix QuickProps container padding**

Change `px-ds-05 pt-ds-03 pb-ds-02` (line ~609) to `px-ds-06 pt-ds-03 pb-ds-02`. This aligns the pills horizontally with the header above which uses `px-ds-06`.

**Step 3: Verify visually**

Check Storybook — the status pill should now be the same height as the priority and assignee pills.

**Step 4: Commit**

```
fix(karm): normalize QuickProps pill heights and horizontal padding
```

---

## Task 3: Fix FileRow height consistency + remove inline Figma embed

**Files:**
- Modify: `packages/karm/src/tasks/v3/task-panel-files.tsx`

**Step 1: Normalize thumbnail and icon sizes**

In the `FileRow` component, change the image thumbnail container from `size-12` to `size-10`:

```tsx
// Before:
<div className="size-12 shrink-0 overflow-hidden rounded-ds-md bg-surface-raised">

// After:
<div className="size-10 shrink-0 overflow-hidden rounded-ds-md bg-surface-raised">
```

Change the non-image icon from a bare `Icon` to a container-wrapped icon:

```tsx
// Before:
<Icon
  icon={FileIcon}
  size="sm"
  className="shrink-0 text-surface-fg-subtle"
/>

// After:
<div className="flex size-10 shrink-0 items-center justify-center rounded-ds-md bg-surface-raised">
  <Icon icon={FileIcon} size="sm" className="text-surface-fg-subtle" />
</div>
```

**Step 2: Remove inline Figma embed**

Delete the entire Figma embed block from `FileRow` (the `{file.source === 'figma' && file.embedUrl && ( ... )}` JSX block, approximately lines 224-236). Figma files will still preview in the `FilePreview` dialog when clicked.

**Step 3: Fix UploadingFileRow padding**

Change `py-ds-02` to `py-ds-03` in the `UploadingFileRow` wrapper div:

```tsx
// Before:
<div className="flex items-center gap-ds-03 rounded-ds-md px-ds-03 py-ds-02">

// After:
<div className="flex items-center gap-ds-03 rounded-ds-md px-ds-03 py-ds-03">
```

**Step 4: Fix first category top margin**

The category divs are NOT first children of their parent container — they're preceded by the action bar, link input, validation errors, and upload rows. CSS `:first-child` won't work. Instead, pre-filter the categories and use array index:

Replace the `renderFileList` function's categorized branch. Current code:

```tsx
return CATEGORY_ORDER.map((cat) => {
  const catFiles = grouped.get(cat)
  if (!catFiles || catFiles.length === 0) return null
  return (
    <div key={cat}>
      <span className="block text-[11px] font-semibold text-surface-fg-subtle/60 uppercase tracking-wider mt-ds-03 mb-ds-01 px-ds-03">
        {CATEGORY_LABELS[cat]}
      </span>
      {catFiles.map((file) => renderFileRow(file))}
    </div>
  )
})
```

New code — filter first, then map with index:

```tsx
const visibleCategories = CATEGORY_ORDER.filter(
  (cat) => (grouped.get(cat)?.length ?? 0) > 0,
)
return visibleCategories.map((cat, i) => {
  const catFiles = grouped.get(cat)!
  return (
    <div key={cat}>
      <span className={cn(
        'block text-[11px] font-semibold text-surface-fg-subtle/60 uppercase tracking-wider mb-ds-01 px-ds-03',
        i > 0 && 'mt-ds-03',
      )}>
        {CATEGORY_LABELS[cat]}
      </span>
      {catFiles.map((file) => renderFileRow(file))}
    </div>
  )
})
```

This needs `cn` imported — it's already imported at the top of the file.

**Step 5: Remove redundant "+ Upload files" dashed button**

Delete the entire block that renders the dashed upload button at the bottom of the files section:

```tsx
// DELETE this block (approximately lines 667-675):
{canUpload && files.length > 0 && (
  <button
    type="button"
    className="mt-ds-02 rounded-ds-lg border border-dashed border-surface-border px-ds-04 py-ds-03 text-center text-ds-xs text-surface-fg-subtle transition-colors hover:border-accent-7 hover:text-accent-11"
    onClick={() => fileInputRef.current?.click()}
  >
    + Upload files
  </button>
)}
```

The Upload + Attach link buttons at the top of the section are sufficient.

**Step 6: Run typecheck**

```bash
pnpm typecheck
```

**Step 7: Commit**

```
fix(karm): normalize file row heights, remove Figma embed and redundant upload button
```

---

## Task 4: Fix Dependencies indent + Subtask add-link alignment

**Files:**
- Modify: `packages/karm/src/tasks/v3/task-panel-dependencies.tsx`
- Modify: `packages/karm/src/tasks/v3/task-panel-subtasks.tsx`

**Step 1: Fix Dependencies indent**

Remove `pl-ds-05` from both dependency group wrappers. The rows already have `px-ds-03` which matches the subtask indent.

```tsx
// Before (2 occurrences):
<div className="flex flex-col gap-ds-01 pl-ds-05">

// After:
<div className="flex flex-col gap-ds-01">
```

**Step 2: Fix "+ Add subtask" link alignment**

In `task-panel-subtasks.tsx`, add `px-ds-03` to the add subtask button so it aligns with the subtask row content:

```tsx
// Before:
<button
  type="button"
  className="mt-ds-02 text-ds-sm text-accent-11 hover:text-accent-12 transition-colors"
  onClick={() => setIsAdding(true)}
>
  + Add subtask
</button>

// After:
<button
  type="button"
  className="mt-ds-02 px-ds-03 text-ds-sm text-accent-11 hover:text-accent-12 transition-colors"
  onClick={() => setIsAdding(true)}
>
  + Add subtask
</button>
```

**Step 3: Commit**

```
fix(karm): align dependencies indent and subtask add-link with row content
```

---

## Task 5: Fix Timeline filter bar alignment

**Files:**
- Modify: `packages/karm/src/tasks/v3/task-panel-timeline.tsx`

**Step 1: Change filter bar padding**

In the `FilterBar` component:

```tsx
// Before:
<div className="px-ds-02 pb-ds-02">

// After:
<div className="px-ds-04 pb-ds-02">
```

This aligns the filter pills with the message content below.

**Step 2: Commit**

```
fix(karm): align timeline filter bar padding with message content
```

---

## Task 6: Update tests for TaskComposer redesign + update story

**Files:**
- Create: `packages/karm/src/composed/__tests__/task-composer.test.tsx` (directory doesn't exist — will be created)
- Modify: `packages/karm/src/composed/task-composer.stories.tsx` (update description to reflect tab pattern)

TaskComposer currently has no tests. Add tests for the new tab behavior. Only the `return` JSX was replaced — all handler functions (`handleSend`, `handleKeyDown`, `adjustHeight`, `handleFileChange`) are unchanged.

**Step 1: Write tests**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { TaskComposer } from '../task-composer'

describe('TaskComposer', () => {
  const onSubmit = vi.fn()

  afterEach(() => { vi.clearAllMocks() })

  it('renders textarea with placeholder', () => {
    render(<TaskComposer onSubmit={onSubmit} placeholder="Write a message..." />)
    expect(screen.getByPlaceholderText('Write a message...')).toBeInTheDocument()
  })

  it('does not show visibility tabs when showVisibility is false', () => {
    render(<TaskComposer onSubmit={onSubmit} />)
    expect(screen.queryByText('Team')).not.toBeInTheDocument()
    expect(screen.queryByText('Client')).not.toBeInTheDocument()
  })

  it('shows visibility tabs when showVisibility is true', () => {
    render(<TaskComposer onSubmit={onSubmit} showVisibility />)
    expect(screen.getByText('Team')).toBeInTheDocument()
    expect(screen.getByText('Client')).toBeInTheDocument()
  })

  it('defaults to INTERNAL visibility', () => {
    render(<TaskComposer onSubmit={onSubmit} showVisibility />)
    // Team tab should be active (has bg-surface-raised-hover)
    const teamTab = screen.getByText('Team').closest('button')!
    expect(teamTab.className).toContain('bg-surface-raised-hover')
  })

  it('switches to client mode on Client tab click', async () => {
    const user = userEvent.setup()
    render(<TaskComposer onSubmit={onSubmit} showVisibility />)
    await user.click(screen.getByText('Client'))
    // Client tab should now be active (has bg-warning-3)
    const clientTab = screen.getByText('Client').closest('button')!
    expect(clientTab.className).toContain('bg-warning-3')
  })

  it('submits with correct visibility', async () => {
    const user = userEvent.setup()
    render(<TaskComposer onSubmit={onSubmit} showVisibility />)
    const textarea = screen.getByLabelText('Message input')
    await user.type(textarea, 'Hello')
    await user.click(screen.getByLabelText('Send message'))
    expect(onSubmit).toHaveBeenCalledWith('Hello', 'INTERNAL')
  })

  it('submits with CLIENT visibility after tab switch', async () => {
    const user = userEvent.setup()
    render(<TaskComposer onSubmit={onSubmit} showVisibility />)
    await user.click(screen.getByText('Client'))
    const textarea = screen.getByLabelText('Message input')
    await user.type(textarea, 'Hello client')
    await user.click(screen.getByLabelText('Send message'))
    expect(onSubmit).toHaveBeenCalledWith('Hello client', 'CLIENT')
  })

  it('submits on Enter key', async () => {
    const user = userEvent.setup()
    render(<TaskComposer onSubmit={onSubmit} />)
    const textarea = screen.getByLabelText('Message input')
    await user.type(textarea, 'Hello{Enter}')
    expect(onSubmit).toHaveBeenCalledWith('Hello', 'INTERNAL')
  })

  it('does not submit on Shift+Enter', async () => {
    const user = userEvent.setup()
    render(<TaskComposer onSubmit={onSubmit} />)
    const textarea = screen.getByLabelText('Message input')
    await user.type(textarea, 'Hello{Shift>}{Enter}{/Shift}')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('resets visibility to default after submit', async () => {
    const user = userEvent.setup()
    render(<TaskComposer onSubmit={onSubmit} showVisibility />)
    await user.click(screen.getByText('Client'))
    const textarea = screen.getByLabelText('Message input')
    await user.type(textarea, 'Hello{Enter}')
    // After submit, should reset to INTERNAL — verify via next submit
    await user.type(screen.getByLabelText('Message input'), 'Second{Enter}')
    expect(onSubmit).toHaveBeenLastCalledWith('Second', 'INTERNAL')
    // Also verify Team tab is visually active
    const teamTab = screen.getByText('Team').closest('button')!
    expect(teamTab.className).toContain('bg-surface-raised-hover')
  })

  it('shows attach button when showAttach is true', () => {
    render(<TaskComposer onSubmit={onSubmit} showAttach />)
    expect(screen.getByLabelText('Attach file')).toBeInTheDocument()
  })

  it('hides attach button when showAttach is false', () => {
    render(<TaskComposer onSubmit={onSubmit} />)
    expect(screen.queryByLabelText('Attach file')).not.toBeInTheDocument()
  })

  it('disables send when text is empty', () => {
    render(<TaskComposer onSubmit={onSubmit} />)
    expect(screen.getByLabelText('Send message')).toBeDisabled()
  })
})
```

**Step 2: Run tests**

```bash
cd packages/karm && pnpm test -- --run src/composed/__tests__/task-composer.test.tsx
```

**Step 3: Update TaskComposer story description**

In `packages/karm/src/composed/task-composer.stories.tsx`, update the meta description (if it references "toggle" or "Switch") to reflect the new tab pattern. The `WithVisibility` story will automatically render the new tabs — no JSX changes needed.

**Step 4: Commit**

```
test(karm): add TaskComposer tests for visibility tabs and submit behavior
```

---

## Task 7: Update existing file tests for FileRow changes

**Files:**
- Modify: `packages/karm/src/tasks/v3/__tests__/task-panel-files.test.tsx`

**Step 1: Update tests affected by FileRow changes**

The icon container change (bare `Icon` → wrapped in a `div`) may affect any test that queries for the icon directly. Check the test file and update selectors if needed. The thumbnail size change (`size-12` → `size-10`) shouldn't affect functional tests.

There is no test for the Figma inline embed, so no removal needed there.

Update the stale comment around line 139 that says "There are two buttons matching /upload/i — the action-bar 'Upload' and the bottom '+ Upload files' drop target" — the `+ Upload files` button was removed in Task 3, so this comment should be removed or updated to reflect only the action-bar button remains.

**Step 2: Run all v3 tests**

```bash
cd packages/karm && pnpm test -- --run src/tasks/v3/
```

Fix any failures.

**Step 3: Commit**

```
test(karm): update file section tests for icon container and embed removal
```

---

## Task 8: Full verification pass

**Step 1: Typecheck**

```bash
pnpm typecheck
```

**Step 2: Lint**

```bash
pnpm lint
```

**Step 3: Run all karm tests**

```bash
cd packages/karm && pnpm test -- --run
```

**Step 4: Build**

```bash
pnpm build
```

**Step 5: Commit any fixes**

**Step 6: Visual verify in Storybook**

Open the following stories and verify the changes:
- `Karm/Tasks/TaskPanel v3 > SidePanelStaff` — check tab visibility toggle, amber background
- `Karm/Tasks/TaskPanel v3 > FileGallery` — check consistent row heights, no Figma embed
- `Karm/Tasks/TaskPanel v3 > FileUploadProgress` — check upload row padding matches
- `Karm/Tasks/TaskPanel v3 > SidePanelNoReview` — check pill heights, filter alignment

---

## Dependency Graph

```
Task 1 (TaskComposer redesign) ──→ Task 6 (TaskComposer tests)
Task 2 (pill heights) ────────────────────────────────────→ Task 8 (verification)
Task 3 (file rows + embed + upload) ──→ Task 7 (file tests) → Task 8
Task 4 (deps indent + subtask align) ────────────────────→ Task 8
Task 5 (filter bar align) ───────────────────────────────→ Task 8
```

**Parallelizable:** Tasks 1, 2, 3, 4, 5 have no dependencies on each other and can run in parallel.
Tasks 6 and 7 depend on Tasks 1 and 3 respectively.
Task 8 depends on all prior tasks.
