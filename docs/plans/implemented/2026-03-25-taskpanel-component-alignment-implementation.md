# TaskPanel v3 Component Alignment — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enhance 6 core DS components and build 4 karm composed components, then migrate TaskPanel v3 to use them — eliminating all custom toggles, progress bars, collapsible sections, and avatar stacks.

**Architecture:** Phase 1 enhances core primitives (Switch, StatusBadge, AvatarGroup, Progress, ActivityFeed, Accordion) with missing features every major DS ships. Phase 1.5/2 builds karm-domain composed components (TaskSection, PeoplePicker, TaskComposer, TaskTimeline) on top of core. Phase 3 migrates TaskPanel v3 files. Phase 4 adds stories and verifies visually.

**Tech Stack:** React 18, TypeScript 5.7, CVA, Framer Motion, Radix primitives, shilp-sutra tokens.

**Design Doc:** `docs/plans/2026-03-25-taskpanel-component-alignment-design.md`

---

## Conventions

- **Core package:** `packages/core/src/`
- **Karm package:** `packages/karm/src/`
- **Tests:** Co-located (e.g., `switch.test.tsx` next to `switch.tsx`) or in `__tests__/` for a11y
- **Stories:** Co-located (e.g., `switch.stories.tsx`)
- **Typecheck core:** `pnpm --filter @devalok/shilp-sutra typecheck`
- **Typecheck karm:** `pnpm --filter @devalok/shilp-sutra-karm typecheck`
- **Test core:** `pnpm --filter @devalok/shilp-sutra test -- --run`
- **Commit after each task.**

---

## Task Dependency Graph

```
Phase 1 (all parallel, no deps):
  Task 1 (Switch) ──────────────┐
  Task 2 (StatusBadge) ─────────┤
  Task 3 (AvatarGroup) ─────────┤
  Task 4 (Progress) ────────────┤
  Task 5 (ActivityFeed) ────────┤
  Task 6 (Accordion) ───────────┤
                                │
Phase 1.5 (parallel with Phase 1):
  Task 7 (TaskSection) ─────────┤
  Task 8 (PeoplePicker) ────────┤
                                │
Phase 2 (deps noted):           │
  Task 9 (TaskComposer) ←── Task 1 (Switch sm)
  Task 10 (TaskTimeline) ←── Task 5 (ActivityFeed renderItem)
                                │
Phase 3 (deps: all above):      │
  Task 11 (Properties wing migration)
  Task 12 (Files/Subtasks/Dependencies migration)
  Task 13 (Timeline migration)
  Task 14 (Message input migration)
                                │
Phase 4:                        │
  Task 15 (Stories + visual audit)
```

Total: **15 tasks.**

---

## Phase 1: Core DS Enhancements

### Task 1: Switch — sizes + color

**File:** `packages/core/src/ui/switch.tsx`
**Test:** `packages/core/src/ui/switch.test.tsx`

Read the current file. Add `size` and `color` props via CVA or inline maps.

**Size map:**

```typescript
const sizeConfig = {
  sm: { track: 'h-[18px] w-[32px]', thumb: 'h-[14px] w-[14px]', travel: 14 },
  md: { track: 'h-6 w-11', thumb: 'h-ico-md w-ico-md', travel: 20 },
  lg: { track: 'h-7 w-[52px]', thumb: 'h-[22px] w-[22px]', travel: 24 },
} as const
```

**Color map (checked background):**

```typescript
const colorMap = {
  accent: 'data-[state=checked]:bg-accent-9',
  success: 'data-[state=checked]:bg-success-9',
  warning: 'data-[state=checked]:bg-warning-9',
} as const
```

**Props to add:**

```typescript
export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  error?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: 'accent' | 'success' | 'warning'
  thumbIcon?: React.ReactNode
}
```

The `error` prop stays as-is (validation state). `color` controls checked background. `thumbIcon` renders inside the motion thumb span.

Replace the hardcoded `h-6 w-11` and `x: isChecked ? 20 : 0` with lookups from `sizeConfig`. Default `size='md'`, `color='accent'` preserves backward compat.

**Tests to add:**
- Renders sm size (check track has correct height class)
- Renders lg size
- Renders success color when checked
- Renders thumbIcon inside thumb
- Backward compat: no size/color props = same as before

**Verify:** `pnpm --filter @devalok/shilp-sutra typecheck && pnpm --filter @devalok/shilp-sutra test -- --run -- switch`

**Commit:** `feat(core): Switch — size variants (sm/md/lg) + color (accent/success/warning) + thumbIcon`

---

### Task 2: StatusBadge — in-progress + review + clickable

**File:** `packages/core/src/composed/status-badge.tsx`

Read the current file. Three changes:

**1. Add statuses to the CVA:**

```typescript
// Add to statusBadgeVariants.status:
'in-progress': 'bg-accent-3 text-accent-11',
'review': 'bg-info-3 text-info-11',

// Add to dotColorMap:
'in-progress': 'bg-accent-9',
'review': 'bg-info-9',
```

**2. Add onClick + icon to the interface:**

```typescript
interface StatusBadgeBaseProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children' | 'color'> {
  label?: string
  hideDot?: boolean
  size?: VariantProps<typeof statusBadgeVariants>['size']
  onClick?: () => void
  icon?: React.ReactNode
}
```

**3. Change rendering:** When `onClick` is provided, render as `<motion.button>` instead of `<motion.span>`. Add `cursor-pointer hover:opacity-80` classes. If `onClick` is set and no `icon` is provided, auto-add a `<IconChevronDown>` trailing icon.

**Tests to add:**
- Renders in-progress status with accent colors
- Renders review status with info colors
- Renders as button when onClick provided
- Shows chevron-down icon when clickable and no custom icon
- Shows custom icon when provided
- Backward compat: existing statuses unchanged

**Verify:** `pnpm --filter @devalok/shilp-sutra typecheck`

**Commit:** `feat(core): StatusBadge — in-progress/review statuses + clickable with auto-chevron`

---

### Task 3: AvatarGroup — lead indicator

**File:** `packages/core/src/composed/avatar-group.tsx`

Read the current file. Add `indicator` to `AvatarUser`:

```typescript
export interface AvatarUser {
  name: string
  image?: string | null
  ring?: AvatarRing
  indicator?: 'lead' | 'admin' | React.ReactNode
}
```

In the default render path (when `renderAvatar` is NOT provided), after rendering the Avatar, conditionally render an indicator overlay:

```tsx
{user.indicator && (
  <span className={cn(
    'absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full ring-1 ring-surface-raised',
    user.indicator === 'lead' ? 'bg-warning-9' :
    user.indicator === 'admin' ? 'bg-accent-9' : '',
  )}>
    {typeof user.indicator !== 'string' && user.indicator}
  </span>
)}
```

The avatar container needs `relative` positioning (it likely already has it from the ring styling, verify).

**Tests to add:**
- Lead indicator renders warning-9 dot
- Admin indicator renders accent-9 dot
- Custom ReactNode indicator renders as children
- No indicator when undefined
- renderAvatar path does NOT render indicator (consumer handles it)

**Verify:** `pnpm --filter @devalok/shilp-sutra typecheck`

**Commit:** `feat(core): AvatarGroup — lead/admin indicator dot overlay on avatars`

---

### Task 4: Progress — autoColor

**File:** `packages/core/src/ui/progress.tsx`

Read the current file. Add `autoColor` prop:

```typescript
interface ProgressProps {
  // ...existing...
  autoColor?: boolean
}
```

In the component body, compute the effective color:

```typescript
const effectiveColor = autoColor && value != null
  ? value > 100 ? 'error'
    : value >= 85 ? 'success'
    : value >= 60 ? 'warning'
    : 'default'
  : color
```

Pass `effectiveColor` to `progressIndicatorVariants` instead of `color`.

**Tests to add:**
- autoColor=true, value=50 → default color (accent)
- autoColor=true, value=70 → warning
- autoColor=true, value=90 → success
- autoColor=true, value=105 → error
- autoColor=false (default) → manual color prop used
- autoColor=true, value=undefined → default (indeterminate)

**Verify:** `pnpm --filter @devalok/shilp-sutra typecheck && pnpm --filter @devalok/shilp-sutra test -- --run -- progress`

**Commit:** `feat(core): Progress — autoColor shifts accent→warning→success→error by value`

---

### Task 5: ActivityFeed — renderItem prop

**File:** `packages/core/src/composed/activity-feed.tsx`

Read the current file. Add `renderItem` to the props:

```typescript
export interface ActivityFeedProps extends React.HTMLAttributes<HTMLDivElement> {
  // ...existing...
  renderItem?: (item: ActivityItem, index: number) => React.ReactNode | undefined
}
```

In the rendering loop where `ActivityEntry` is used, wrap with the renderItem check:

```tsx
{items.map((item, index) => {
  const customRender = renderItem?.(item, index)
  if (customRender !== undefined) {
    return (
      <div key={item.id} className="relative pl-8">
        {/* Timeline dot + line still rendered by ActivityFeed */}
        <span className={cn('absolute left-0 top-2 h-2 w-2 rounded-full', dotColorMap[item.color ?? 'default'])} />
        {customRender}
      </div>
    )
  }
  // Default: existing ActivityEntry rendering
  return <ActivityEntry key={item.id} item={item} compact={compact} />
})}
```

The timeline line and dot are ALWAYS rendered by ActivityFeed. Only the content area is replaced by `renderItem`. Returning `undefined` falls back to the default `ActivityEntry`.

**Tests to add:**
- renderItem returns JSX → custom content rendered, dot still visible
- renderItem returns undefined → default ActivityEntry used
- renderItem not provided → all items use default rendering
- Timeline line renders regardless of renderItem

**Verify:** `pnpm --filter @devalok/shilp-sutra typecheck`

**Commit:** `feat(core): ActivityFeed — renderItem prop for custom per-item rendering`

---

### Task 6: Accordion — chevronPosition

**File:** `packages/core/src/ui/accordion.tsx`

Read the current file. The `AccordionTrigger` currently renders children then chevron icon in a `justify-between` flex row. Add a `chevronPosition` prop:

```typescript
interface AccordionTriggerProps extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {
  chevronPosition?: 'left' | 'right'
}
```

When `chevronPosition='left'`, render the chevron before children (flip the order). Adjust padding accordingly.

```tsx
const chevron = (
  <Icon icon={IconChevronDown}
    className="shrink-0 text-surface-fg-subtle transition-transform group-data-[state=open]:rotate-180"
    size="sm"
  />
)

return (
  <AccordionPrimitive.Trigger className={...}>
    {chevronPosition === 'left' && chevron}
    <span className="flex-1">{children}</span>
    {chevronPosition !== 'left' && chevron}
  </AccordionPrimitive.Trigger>
)
```

Default: `'right'` (backward compat).

**Tests to add:**
- Default: chevron on right (backward compat)
- chevronPosition='left': chevron renders before children
- Chevron rotates on open in both positions

**Verify:** `pnpm --filter @devalok/shilp-sutra typecheck`

**Commit:** `feat(core): Accordion — chevronPosition prop (left/right)`

---

## Phase 1.5: Karm Composed Components (no Phase 1 deps)

### Task 7: TaskSection — collapsible section with header

**File:** Create `packages/karm/src/composed/task-section.tsx`

**Built on:** Core `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent`, `Badge`, `Icon`, `motion`

```tsx
export interface TaskSectionProps {
  title: string
  count?: number
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  chevronPosition?: 'left' | 'right'
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
}
```

**Implementation:**
- Uses `Collapsible` with `open`/`defaultOpen`/`onOpenChange` passthrough
- Header row: `CollapsibleTrigger` with flex layout
  - Title: `text-[11px] text-surface-fg-subtle/50 uppercase tracking-wider`
  - Count: `<Badge size="xs" variant="outline">{count}</Badge>` (when count is defined)
  - Actions: rendered in the header row (passed through)
  - Chevron: `motion.span` with `animate={{ rotate: open ? 90 : 0 }}` using `IconChevronRight`
- Content: `CollapsibleContent` wrapping `motion.div` with `height: auto` animation
- Track open state internally for the chevron animation (or use a controlled pattern)

**Verify:** `pnpm --filter @devalok/shilp-sutra-karm typecheck`

**Commit:** `feat(karm): TaskSection — reusable collapsible section with header, count, actions`

---

### Task 8: PeoplePicker — unified assignee + lead picker

**File:** Create `packages/karm/src/composed/people-picker.tsx`

**Built on:** Core `Popover`, `PopoverTrigger`, `PopoverContent`, `Button`, `Avatar`, `Icon`, `Tooltip`

```tsx
export interface PeoplePickerProps {
  members: { id: string; name: string; image?: string | null }[]
  assignees: { id: string; name: string; image?: string | null }[]
  leads: { id: string; name: string; image?: string | null }[]
  onAssign: (memberId: string) => void
  onUnassign: (memberId: string) => void
  onToggleLead: (memberId: string) => void
  /** Position of the helper hint text. @default 'top' */
  hintPosition?: 'top' | 'bottom'
  /** Custom hint text. @default "Click to assign · ★ = lead" */
  hint?: React.ReactNode
  children: React.ReactNode  // trigger element
}
```

**Implementation:**
- Wraps `Popover` with a `PopoverContent` containing the member list
- Helper hint: `"Click to assign · ★ = lead"` in `text-[10px] uppercase tracking-wider`
- `hintPosition` controls whether hint renders above or below the member list (default: top)
- `hint` allows custom hint text or `null` to hide entirely
- Each member row:
  - `Button variant="ghost"` with avatar + name + check icon (if assigned)
  - Star toggle button (only visible when assigned): `IconStarFilled` (warning-9) when lead, `IconStar` (muted) when not
  - Click member = toggle assign/unassign
  - Click star = toggle lead
- Uses `children` as `PopoverTrigger` (asChild pattern)

**Verify:** `pnpm --filter @devalok/shilp-sutra-karm typecheck`

**Commit:** `feat(karm): PeoplePicker — unified assignee/lead picker with star toggle`

---

## Phase 2: Karm Composed Components (with Phase 1 deps)

### Task 9: TaskComposer — message input

**File:** Create `packages/karm/src/composed/task-composer.tsx`
**Depends on:** Task 1 (Switch sm size)

**Built on:** Core `Button`, `Switch`, `Icon`, `Tooltip`

```tsx
export interface TaskComposerProps {
  onSubmit: (text: string, visibility: 'INTERNAL' | 'CLIENT') => void
  placeholder?: string
  showVisibility?: boolean
  defaultVisibility?: 'INTERNAL' | 'CLIENT'
  showAttach?: boolean
  onAttach?: (file: File) => void
  disabled?: boolean
  className?: string
}
```

**Implementation:**
- Auto-resizing textarea (ref + scrollHeight adjustment)
- Enter to send, Shift+Enter for newline
- Visibility toggle: `<Switch size="sm" color="success">` — success when CLIENT, accent when INTERNAL
- Warning banner when visibility is CLIENT: "This message will be visible to clients"
- Paperclip button for file attach (hidden file input)
- Send button (IconSend), disabled when empty
- Layout: border rounded-ds-xl, textarea + action buttons row

Port logic from current `task-panel-message-input.tsx` but use core Switch instead of custom visibility toggle.

**Verify:** `pnpm --filter @devalok/shilp-sutra-karm typecheck`

**Commit:** `feat(karm): TaskComposer — message input with visibility toggle + file attach`

---

### Task 10: TaskTimeline — activity feed wrapper

**File:** Create `packages/karm/src/composed/task-timeline.tsx`
**Depends on:** Task 5 (ActivityFeed renderItem)

**Built on:** Core `ActivityFeed`, `Avatar`, `Badge`, `StatusBadge`

```tsx
export interface TaskTimelineProps {
  entries: TimelineEntry[]
  filter?: 'all' | 'comments' | 'reviews'
  onFilterChange?: (filter: 'all' | 'comments' | 'reviews') => void
  clientMode: ClientMode
  onReact?: (entryId: string, emoji: string) => void
  onReply?: (entryId: string) => void
  onEdit?: (entryId: string) => void
  onDelete?: (entryId: string) => void
  className?: string
}
```

**Implementation:**
1. Filter entries based on `filter` prop and `clientMode` (hide internal comments from clients)
2. Map `TimelineEntry[]` → `ActivityItem[]`:
   - Comments → `{ action: <CommentBody>, actor, timestamp, color: 'default', detail: reactions }`
   - System events → `{ action: description text, actor, timestamp, color based on type }`
   - Agent responses → `{ action: <AgentBody>, icon: robot, color: 'info' }`
   - Review events → `{ action: <ReviewBody with StatusBadge>, color based on action }`
3. Use `ActivityFeed` with `renderItem` for comments (rich cards) and `undefined` for system events (use default compressed layout)
4. Filter toggle tabs at top: "All" / "Comments" / "Reviews"
5. Group by time: `groupBy="time"`

**Verify:** `pnpm --filter @devalok/shilp-sutra-karm typecheck`

**Commit:** `feat(karm): TaskTimeline — maps task entries to ActivityFeed with filters + custom comment cards`

---

## Phase 3: Migration

### Task 11: Properties wing migration

**File:** `packages/karm/src/tasks/v3/task-panel-wing-properties.tsx`

Migrate these patterns to core/karm components:

1. **Status chip** → `<StatusBadge status="in-progress" label={statusName} onClick={...} size="sm" />`
   - Remove: custom status dot + text + chevron button
   - Remove: `getStatusDotColor`, `getStatusTextColor` helpers (StatusBadge handles it)

2. **Priority chip** → `<PriorityIndicator priority={task.priority} display="full" />` wrapped in a clickable button
   - Remove: `PRIORITY_CONFIG`, hand-built priority chip

3. **Visibility toggle** → `<Switch size="sm" color="success" checked={task.visibility === 'EVERYONE'} onCheckedChange={...} />`
   - Remove: hand-built toggle with sliding circle spans

4. **Avatar stack** → `<AvatarGroup users={allPeople.map(p => ({ ...p, indicator: leads.has(p.id) ? 'lead' : undefined }))} max={4} size="xs" />`
   - Remove: custom `AvatarStack` component, `EmptyPeopleSlot`

5. **People picker** → `<PeoplePicker members={...} assignees={...} leads={...} onAssign={...} onUnassign={...} onToggleLead={...}>`
   - Remove: `UnifiedPeoplePickerContent`

6. **Details section** → `<TaskSection title="Details" chevronPosition="right" defaultOpen={false}>`
   - Remove: custom `detailsExpanded` state, manual chevron animation

7. **Labels** → Already using `Badge` (keep as-is)

**Verify:** `pnpm --filter @devalok/shilp-sutra-karm typecheck`

**Commit:** `refactor(karm): properties wing — migrate to StatusBadge, Switch, AvatarGroup, PeoplePicker, TaskSection`

---

### Task 12: Files + Subtasks + Dependencies migration

**Files:**
- `packages/karm/src/tasks/v3/task-panel-files.tsx`
- `packages/karm/src/tasks/v3/task-panel-subtasks.tsx`
- `packages/karm/src/tasks/v3/task-panel-dependencies.tsx`

All three have the same pattern: hand-built collapsible section with chevron + badge count.

Replace each with `<TaskSection>`:

```tsx
// Files — before:
<Button variant="ghost" onClick={() => setExpanded(!expanded)}>
  <Icon icon={IconChevronDown} className={expanded && 'rotate-180'} />
  Files
  <Badge>{files.length}</Badge>
</Button>
<MotionCollapse show={expanded}>...</MotionCollapse>

// Files — after:
<TaskSection title="Files" count={files.length} defaultOpen={false}>
  ...file list content...
</TaskSection>
```

For subtasks, also replace the custom progress bar with `<Progress autoColor value={progressPct} size="sm" />` or `<ProgressRing value={completedCount} max={totalCount} size="sm" showValue />`.

**Verify:** `pnpm --filter @devalok/shilp-sutra-karm typecheck`

**Commit:** `refactor(karm): files/subtasks/dependencies — migrate to TaskSection + Progress`

---

### Task 13: Timeline migration

**File:** `packages/karm/src/tasks/v3/task-panel-timeline.tsx`

Replace the custom timeline rendering with `<TaskTimeline>`:

```tsx
// Before: hand-built timeline with tabs + custom entry rendering
// After:
<TaskTimeline
  entries={task.timeline}
  filter={filter}
  onFilterChange={setFilter}
  clientMode={clientMode}
  onReact={onReact}
  onReply={onReply}
  onEdit={onEditComment}
  onDelete={onDeleteComment}
/>
```

Remove: custom filter state management (TaskTimeline handles it), custom entry components, custom "new" counter logic (move to TaskTimeline if needed).

**Verify:** `pnpm --filter @devalok/shilp-sutra-karm typecheck`

**Commit:** `refactor(karm): timeline — migrate to TaskTimeline composed component`

---

### Task 14: Message input migration

**File:** `packages/karm/src/tasks/v3/task-panel-message-input.tsx`

Replace the custom message input with `<TaskComposer>`:

```tsx
// Before: hand-built textarea + visibility toggle + file attach
// After:
<TaskComposer
  onSubmit={onPostComment}
  showVisibility={!clientMode && task.visibility === 'EVERYONE'}
  defaultVisibility="INTERNAL"
  showAttach={!clientMode}
  onAttach={onUploadFile}
  disabled={!canPost}
  placeholder={clientMode ? 'Post a comment...' : 'Write a message...'}
/>
```

Remove: custom auto-resize logic, custom visibility toggle, custom handleSend/handleKeyDown (all moved to TaskComposer).

**Verify:** `pnpm --filter @devalok/shilp-sutra-karm typecheck`

**Commit:** `refactor(karm): message input — migrate to TaskComposer composed component`

---

## Phase 4: Stories + Visual Verification

### Task 15: Stories + audit

**Files:**
- Update: `packages/core/src/ui/switch.stories.tsx` — add Size Variants, Color Variants, With ThumbIcon stories
- Update: `packages/core/src/composed/status-badge.stories.tsx` — add InProgress, Review, Clickable stories
- Update: `packages/core/src/composed/avatar-group.stories.tsx` — add WithLeadIndicator story
- Update: `packages/core/src/ui/progress.stories.tsx` — add AutoColor story
- Update: `packages/core/src/composed/activity-feed.stories.tsx` — add CustomRenderItem story
- Update: `packages/core/src/ui/accordion.stories.tsx` — add ChevronLeft story
- Create: `packages/karm/src/composed/task-section.stories.tsx`
- Create: `packages/karm/src/composed/people-picker.stories.tsx`
- Create: `packages/karm/src/composed/task-composer.stories.tsx`
- Create: `packages/karm/src/composed/task-timeline.stories.tsx`

After all stories are written:

1. Run typecheck: `pnpm typecheck`
2. Run tests: `pnpm test`
3. Run lint: `pnpm lint`
4. Boot Storybook and visually verify each enhanced/new component
5. Verify TaskPanel story still renders correctly after all migrations

**Commit:** `feat: stories for all enhanced core + new karm composed components`

---

## Summary

| Task | Phase | What | Package | Files |
|------|-------|------|---------|-------|
| 1 | 1 | Switch sizes + color | core | switch.tsx |
| 2 | 1 | StatusBadge in-progress + clickable | core | status-badge.tsx |
| 3 | 1 | AvatarGroup lead indicator | core | avatar-group.tsx |
| 4 | 1 | Progress autoColor | core | progress.tsx |
| 5 | 1 | ActivityFeed renderItem | core | activity-feed.tsx |
| 6 | 1 | Accordion chevronPosition | core | accordion.tsx |
| 7 | 1.5 | TaskSection | karm | composed/task-section.tsx |
| 8 | 1.5 | PeoplePicker | karm | composed/people-picker.tsx |
| 9 | 2 | TaskComposer | karm | composed/task-composer.tsx |
| 10 | 2 | TaskTimeline | karm | composed/task-timeline.tsx |
| 11 | 3 | Properties wing migration | karm | task-panel-wing-properties.tsx |
| 12 | 3 | Files/Subtasks/Deps migration | karm | 3 files |
| 13 | 3 | Timeline migration | karm | task-panel-timeline.tsx |
| 14 | 3 | Message input migration | karm | task-panel-message-input.tsx |
| 15 | 4 | Stories + visual audit | both | 10+ story files |
