# TaskPanel v3 — Full Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Close every gap between the karm-v2 usage reference and the TaskPanel v3 DS components, bringing it to feature parity with industry leaders (Linear, Asana, Notion, ClickUp) and production-readiness.

**Architecture:** Extend the existing compound component system (`TaskPanel.Header`, `.Timeline`, `.Wings`, etc.) with new subcomponents. Extend `TaskPanelTask` type and `TaskPanelContextValue` for new data and callbacks. No structural rewrites — additive changes only.

**Tech Stack:** React 18, TypeScript 5.7, Framer Motion, shilp-sutra core (Button v2, Icon system, DevalokGrain), existing karm pickers.

**Design References:**
- `karm-v2/docs/task-panel-usage-reference.md` — exhaustive production usage spec
- Industry research: Linear (keyboard shortcuts, actions menu), Asana (master-detail, prev/next nav), ClickUp (breadcrumbs, overdue treatment), Notion (inline comments)

---

## Conventions

**Files:** `packages/karm/src/tasks/v3/`
**Tests:** `packages/karm/src/tasks/v3/__tests__/`
**Stories:** `packages/karm/src/tasks/v3/task-panel.stories.tsx`
**Commit after each task.** Conventional commits: `feat(karm):`, `fix(karm):`.

---

## Phase 1: Data Model + Context Extensions

### Task 1: Extend TaskPanelTask type and context

**Files:**
- Modify: `packages/karm/src/tasks/v3/task-panel-types.ts`
- Modify: `packages/karm/src/tasks/v3/task-panel-context.tsx`

**Type additions to TaskPanelTask:**
```typescript
// Add to TaskPanelTask interface:
startDate: string | null
phase?: { id: string; name: string } | null
phaseOptions?: { id: string; name: string }[]
createdByType?: 'LOKWASI' | 'CLIENT' | 'SYSTEM'
createdByName?: string
humanId?: string  // e.g. "AVN-WEB-001" — metadata.humanId
projectName?: string  // for breadcrumb context
parentTaskId?: string | null
files?: TaskFile[]  // files attached to the task
```

**New TaskFile type:**
```typescript
export interface TaskFile {
  id: string
  name: string
  fileUrl: string
  downloadUrl: string
  fileType: string
  size: number  // bytes
  uploadedBy: { id: string; name: string; image?: string | null }
  createdAt: string
  gDriveUrl?: string  // Google Drive sync link
  isClientVisible?: boolean
}
```

**Client permission type (extends clientMode boolean):**
```typescript
// Change clientMode from boolean to union in TaskPanelContextValue:
clientMode: false | 'VIEW_ONLY' | 'COLLABORATOR'
// false = staff, 'VIEW_ONLY' = client read-only, 'COLLABORATOR' = client with edit
```

**Callback additions to TaskPanelContextValue:**
```typescript
// Add to context:
onUpdateStartDate: (date: Date | null) => void
onUpdatePhase: (phaseId: string | null) => void
onDeleteTask: () => void
onMoveToProject: (projectId: string) => void
onDuplicateTask: () => void
onCopyLink: () => void
onNavigatePrev?: () => void  // prev/next task navigation
onNavigateNext?: () => void
onUploadFile: (file: File) => void
onDeleteFile: (fileId: string) => void
```

Update `TaskPanelProvider` to include new callbacks with `noop` defaults.

**Verify:** `pnpm --filter @devalok/shilp-sutra-karm typecheck`

**Commit:** `feat(karm): extend TaskPanel types — start date, phase, creator, actions`

---

## Phase 2: Quick Wins (Visual Polish)

### Task 2: Overdue date styling + relative dates

**Files:**
- Modify: `packages/karm/src/tasks/v3/task-panel-wing-properties.tsx`
- Modify: `packages/karm/src/tasks/v3/task-panel-quick-props.tsx`

Add a `formatRelativeDate` helper:
```typescript
function formatRelativeDate(iso: string): { text: string; isOverdue: boolean } {
  const now = new Date()
  const due = new Date(iso)
  const diffMs = due.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / 86_400_000)

  if (diffDays < 0) return { text: `${Math.abs(diffDays)}d overdue`, isOverdue: true }
  if (diffDays === 0) return { text: 'Due today', isOverdue: false }
  if (diffDays === 1) return { text: 'Due tomorrow', isOverdue: false }
  if (diffDays <= 7) return { text: `Due in ${diffDays}d`, isOverdue: false }
  return { text: formatDate(iso), isOverdue: false }
}
```

In **wing-properties**: Due date cell shows relative text + red `text-error-11` when overdue.

In **quick-props**: DueDatePill shows relative text. When overdue, pill uses `color="error"` variant on the soft pill.

**Commit:** `feat(karm): overdue date styling + relative dates in properties and quick props`

---

### Task 3: Creator attribution

**Files:**
- Modify: `packages/karm/src/tasks/v3/task-panel-wing-properties.tsx`

Add a creator line in the meta section (bottom of properties card), between the separator and Updated/Created row:

```tsx
{/* Creator attribution */}
{task.createdByName && (
  <div className="flex items-center gap-ds-02 mb-ds-03">
    <span className="text-ds-xs text-surface-fg-subtle">
      Created by
    </span>
    <span className="text-ds-xs text-surface-fg-muted font-medium">
      {task.createdByName}
    </span>
    {task.createdByType === 'SYSTEM' && (
      <Badge variant="subtle" color="accent" size="xs">AI</Badge>
    )}
    {task.createdByType === 'CLIENT' && (
      <Badge variant="subtle" color="success" size="xs">Client</Badge>
    )}
  </div>
)}
```

**Commit:** `feat(karm): creator attribution with AI/Client badge in properties`

---

### Task 4: Task actions menu (header dropdown)

**Files:**
- Modify: `packages/karm/src/tasks/v3/task-panel-header.tsx`

Add a DropdownMenu triggered by the existing "..." button (or add one if missing). Menu items:

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon-sm" aria-label="Task actions">
      <Icon icon={IconDots} />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onClick={onCopyLink}>
      <Icon icon={IconLink} size="sm" />
      Copy link
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => {
      navigator.clipboard.writeText(`${task.taskId}: ${task.title}`)
    }}>
      <Icon icon={IconCopy} size="sm" />
      Copy reference
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={onDuplicateTask}>
      <Icon icon={IconCopy} size="sm" />
      Duplicate
    </DropdownMenuItem>
    {!clientMode && (
      <>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDeleteTask} className="text-error-11">
          <Icon icon={IconTrash} size="sm" />
          Delete task
        </DropdownMenuItem>
      </>
    )}
  </DropdownMenuContent>
</DropdownMenu>
```

Import `DropdownMenu` from `@/ui/dropdown-menu`.

**Commit:** `feat(karm): task actions menu — copy link, copy ref, duplicate, delete`

---

### Task 5: Project breadcrumb in header

**Files:**
- Modify: `packages/karm/src/tasks/v3/task-panel-header.tsx`

Add a breadcrumb line above the task ID:
```tsx
{/* Breadcrumb: project name > task ID */}
<div className="flex items-center gap-ds-02 text-ds-xs text-surface-fg-subtle">
  {task.projectName && (
    <>
      <span>{task.projectName}</span>
      <Icon icon={IconChevronRight} size="xs" />
    </>
  )}
  <span className="font-mono">{task.taskId}</span>
</div>
```

**Commit:** `feat(karm): project breadcrumb in task panel header`

---

### Task 2b: Client permission handling (COLLABORATOR vs VIEW_ONLY)

**Files:**
- Modify: `packages/karm/src/tasks/v3/task-panel-context.tsx` — change `clientMode: boolean` to `clientMode: false | 'VIEW_ONLY' | 'COLLABORATOR'`
- Modify: `packages/karm/src/tasks/v3/task-panel-description.tsx`
- Modify: `packages/karm/src/tasks/v3/task-panel-message-input.tsx`
- Modify: `packages/karm/src/tasks/v3/task-panel-quick-props.tsx`
- Modify: `packages/karm/src/tasks/v3/task-panel-subtasks.tsx`

**Logic change:** Replace all `clientMode` boolean checks with:
- `clientMode === false` → staff (full edit access)
- `clientMode === 'VIEW_ONLY'` → read-only everything (current client behavior)
- `clientMode === 'COLLABORATOR'` → can edit OWN task properties (title, description, due date, priority), can post CLIENT_FACING messages, can approve/reject deliverables

Helper:
```typescript
const isStaff = clientMode === false
const isClient = clientMode !== false
const canEdit = isStaff || clientMode === 'COLLABORATOR'
const canEditProperties = isStaff  // only staff can change status, assignees, labels, visibility
const canEditOwnContent = isStaff || clientMode === 'COLLABORATOR'  // title, desc, due, priority
```

Each component checks the appropriate permission level instead of just `!clientMode`.

**Commit:** `feat(karm): client COLLABORATOR vs VIEW_ONLY permission handling`

---

### Task 5b: Files section in timeline / dedicated area

**Files:**
- Create: `packages/karm/src/tasks/v3/task-panel-files.tsx`
- Modify: `packages/karm/src/tasks/v3/task-panel.tsx` — add to compound export
- Modify: `packages/karm/src/tasks/v3/task-panel.stories.tsx` — add mock files

The files section sits between subtasks and timeline (collapsible, like subtasks):

```tsx
export function TaskPanelFiles() {
  const { task, clientMode, onUploadFile, onDeleteFile } = useTaskPanel()
  const files = task.files ?? []

  // Collapsible section with file count badge
  // Each file row: icon (by type) + name + size + uploader + date + actions
  // Staff: upload button (drag-and-drop zone) + delete per file
  // Client VIEW_ONLY: read-only list with download links
  // Client COLLABORATOR: read-only list with download links (no upload per §11)

  // GDrive indicator: small external link icon if gDriveUrl exists
}
```

File row pattern:
```tsx
<div className="flex items-center gap-ds-03 rounded-ds-md px-ds-03 py-ds-02 hover:bg-surface-raised-hover">
  <Icon icon={getFileIcon(file.name)} size="sm" className="text-surface-fg-subtle shrink-0" />
  <div className="min-w-0 flex-1">
    <a href={file.downloadUrl} className="text-ds-sm text-surface-fg truncate block hover:text-accent-11">
      {file.name}
    </a>
    <span className="text-ds-xs text-surface-fg-subtle">
      {formatFileSize(file.size)} · {file.uploadedBy.name}
    </span>
  </div>
  {file.gDriveUrl && (
    <a href={file.gDriveUrl} target="_blank" rel="noopener" aria-label="Open in Google Drive">
      <Icon icon={IconExternalLink} size="xs" className="text-surface-fg-subtle" />
    </a>
  )}
  {!isClient && (
    <Button variant="ghost" size="icon-xs" onClick={() => onDeleteFile(file.id)} aria-label="Delete file">
      <Icon icon={IconTrash} />
    </Button>
  )}
</div>
```

Upload area (staff only):
```tsx
{!isClient && (
  <div
    className="mt-ds-02 rounded-ds-lg border border-dashed border-surface-border p-ds-04 text-center text-ds-xs text-surface-fg-subtle hover:border-accent-7 hover:text-accent-11 cursor-pointer transition-colors"
    onClick={() => fileInputRef.current?.click()}
    onDragOver={handleDragOver}
    onDrop={handleDrop}
  >
    <Icon icon={IconUpload} size="sm" className="mx-auto mb-ds-01" />
    Drop files or click to upload
    <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} multiple />
  </div>
)}
```

**Commit:** `feat(karm): TaskPanel files section — upload, download, GDrive, delete`

---

## Phase 3: Properties Wing Expansion

### Task 6: Start date + phase picker

**Files:**
- Modify: `packages/karm/src/tasks/v3/task-panel-wing-properties.tsx`

**Start date:** Add a second date cell in the grid (making it a 2x2 grid: Status/Due top row, Start/Phase bottom row — or keep Status/Due as-is and add Start Date as a row below).

Better approach: expand the 2-col grid to 4 cells:
```
Status    | Due
Start     | Phase
```

Start date gets the same popover pattern as due date (shortcuts + custom date picker). Phase gets a simple popover with the list of `task.phaseOptions`.

**Commit:** `feat(karm): start date + phase picker in properties wing`

---

### Task 7: Bandwidth + leave indicators on assignees

**Files:**
- Modify: `packages/karm/src/tasks/v3/task-panel-types.ts` — add `bandwidth?: 'HEALTHY' | 'ELEVATED' | 'OVERLOADED'` and `isOnLeave?: boolean` to the member type
- Modify: `packages/karm/src/tasks/v3/task-panel-wing-properties.tsx` — show colored dot + leave badge

In the PeopleValue helper, next to each avatar:
```tsx
{person.bandwidth === 'OVERLOADED' && (
  <span className="h-2 w-2 rounded-full bg-error-9" title="Overloaded" />
)}
{person.bandwidth === 'ELEVATED' && (
  <span className="h-2 w-2 rounded-full bg-warning-9" title="Elevated workload" />
)}
{person.isOnLeave && (
  <Badge variant="subtle" size="xs" color="warning">On leave</Badge>
)}
```

**Commit:** `feat(karm): bandwidth + leave indicators on assignees/leads`

---

## Phase 4: Keyboard Shortcuts

### Task 8: useTaskPanelKeyboard hook

**Files:**
- Create: `packages/karm/src/tasks/v3/use-task-panel-keyboard.ts`
- Modify: `packages/karm/src/tasks/v3/task-panel-root.tsx` — wire hook

Implement the `useTaskPanelKeyboard` hook:

```typescript
export function useTaskPanelKeyboard(panelRef: React.RefObject<HTMLElement>) {
  const { clientMode, onClose } = useTaskPanel()

  useEffect(() => {
    if (clientMode) return // no shortcuts in client mode

    const handler = (e: KeyboardEvent) => {
      // Skip when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return

      switch (e.key) {
        case 'Escape': onClose(); break
        case 's': /* dispatch custom event to focus status picker */ break
        case 'a': /* dispatch custom event to focus assignee picker */ break
        case 'p': /* dispatch custom event to focus priority picker */ break
        case 'd': /* dispatch custom event to focus due date picker */ break
        case 'e': /* dispatch custom event to toggle description edit */ break
        case 'c': /* dispatch custom event to focus message input */ break
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [clientMode, onClose])
}
```

Use `CustomEvent` dispatched on the panel element, which individual pickers listen for. This avoids coupling the hook to every picker's ref.

**Commit:** `feat(karm): keyboard shortcuts — S/A/P/D/E/C/Escape`

---

### Task 9: Prev/Next task navigation

**Files:**
- Modify: `packages/karm/src/tasks/v3/task-panel-header.tsx`
- Modify: `packages/karm/src/tasks/v3/use-task-panel-keyboard.ts`

Add prev/next buttons to the header (between breadcrumb and close button):
```tsx
{onNavigatePrev && (
  <Button variant="ghost" size="icon-xs" onClick={onNavigatePrev} aria-label="Previous task">
    <Icon icon={IconChevronUp} />
  </Button>
)}
{onNavigateNext && (
  <Button variant="ghost" size="icon-xs" onClick={onNavigateNext} aria-label="Next task">
    <Icon icon={IconChevronDown} />
  </Button>
)}
```

Add `J`/`K` keyboard shortcuts for prev/next.

**Commit:** `feat(karm): prev/next task navigation — buttons + J/K shortcuts`

---

## Phase 5: TaskPanelSheet Convenience Wrapper

### Task 10: TaskPanelSheet component

**Files:**
- Create: `packages/karm/src/tasks/v3/task-panel-sheet-wrapper.tsx`

This is the convenience wrapper that all three karm-v2 consumers use identically:

```tsx
export function TaskPanelSheet({
  open,
  onOpenChange,
  loading,
  children,
  ...panelProps
}: TaskPanelSheetProps) {
  return (
    <Sheet modal={false} open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-hidden p-0 sm:max-w-none sm:w-[480px] border-l border-surface-border-strong bg-surface-overlay"
      >
        <VisuallyHidden><SheetTitle>Task Details</SheetTitle></VisuallyHidden>
        {loading ? (
          <TaskPanel.Loading />
        ) : (
          <TaskPanel {...panelProps}>
            {children}
          </TaskPanel>
        )}
      </SheetContent>
    </Sheet>
  )
}
```

Export from barrel.

**Commit:** `feat(karm): TaskPanelSheet convenience wrapper — owns Sheet + loading`

---

## Phase 6: Stories + Integration Tests

### Task 11: Update stories with all new features

**Files:**
- Modify: `packages/karm/src/tasks/v3/task-panel.stories.tsx`

Update mock data to include new fields:
- `startDate`, `phase`, `phaseOptions`
- `createdByType`, `createdByName`
- `projectName`
- Bandwidth/leave data on members

Add new stories:
- **OverdueTask** — task with due date in the past
- **WithKeyboardShortcuts** — instructions to test S/A/P/D/E/C
- **ClientCollaborator** — client mode with edit capability
- **CrossProject** — shows project breadcrumb
- **AICreatedTask** — shows AI creator badge

Update existing callbacks to be interactive (useState) for:
- `onUpdateStartDate`, `onUpdatePhase`
- `onNavigatePrev`, `onNavigateNext`

**Commit:** `feat(karm): TaskPanel stories — overdue, keyboard, client collaborator, AI creator`

---

### Task 12: Integration tests

**Files:**
- Create: `packages/karm/src/tasks/v3/__tests__/task-panel-integration.test.tsx`

Test cases:
- Full panel renders with all subcomponents
- Quick props show correct values
- Properties wing shows all properties
- Overdue date shows red styling
- Actions menu opens and shows items
- Client mode hides internal content
- Breadcrumb shows project name
- Creator attribution shows correct badge

**Commit:** `test(karm): TaskPanel v3 integration tests`

---

## Phase 7: Migration + Export

### Task 13: Make v3 the default TaskPanel export

**Files:**
- Modify: `packages/karm/src/tasks/index.ts` — re-export v3 TaskPanel as default
- Keep: v2 files intact for now

```typescript
// v3 is now the default
export { TaskPanel } from './v3'
export type { TaskPanelTask, TaskPanelMode, TimelineEntry } from './v3'
export { TaskPanelSheet } from './v3'
```

**Commit:** `feat(karm)!: TaskPanel v3 as default export`

---

### Task 14: Docs

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `packages/karm/llms.txt` (if exists)

CHANGELOG entries for all new features.

**Commit:** `docs(karm): CHANGELOG — TaskPanel v3 full feature set`

---

## Task Dependency Graph

```
Task 1 (types + context) → Tasks 2, 2b, 3, 4, 5, 5b, 6, 7 (can parallelize)
Task 2b (client permissions) → all rendering tasks need this
Tasks 2-7 → Task 8 (keyboard shortcuts)
Task 8 → Task 9 (prev/next)
Task 1 → Task 10 (TaskPanelSheet)
Tasks 2-10 → Task 11 (stories)
Task 11 → Task 12 (integration tests)
Task 12 → Task 13 (migration)
Task 13 → Task 14 (docs)
```

**Total: 16 tasks across 7 phases.**

Task 2b should run early (after Task 1) since it changes the `clientMode` type that all components use.
Tasks 2-7 and 5b can parallelize after Tasks 1 and 2b.

## Explicit Decisions

**Move to project:** The actions menu has the menu item and wires `onMoveToProject`. The project picker UI is consumer-owned — the consumer provides the project list and handles the selection. This is intentional because the project list comes from the consumer's data context, not from the DS component.

**Review workflow:** The full deliverable review flow (per-deliverable approval, version history, review request with client selection) is NOT in this plan. It requires its own design session. The existing review banner + review wing card cover the "task is in review" state. The full flow is post-launch.
