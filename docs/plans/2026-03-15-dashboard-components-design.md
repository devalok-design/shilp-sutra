# Dashboard Components & Scratchpad Composable Refactor — Design

**Date:** 2026-03-15
**Requested by:** Karm team
**Context:** Redesigning the Lokwasi (staff) dashboard from passive info view to action-first launchpad. Components are generic enough for reuse across Devalok apps.

---

## Scope

6 pieces of work across 2 packages:

| # | Component | Package | Type |
|---|-----------|---------|------|
| 1 | Scratchpad composable refactor | karm | Major refactor + new features |
| 2 | ActivityFeed time grouping | core | Enhancement |
| 3 | Banner multi-action wrapping | core | Enhancement |
| 4 | WeekHeatmap | karm | New component |
| 5 | TaskActionRow | karm | New component |
| 6 | ProjectHealthCard | karm | New component |

### Industry References

| Pattern | Source | Applied To |
|---------|--------|------------|
| Strategic minimalism — every element earns its place | Linear | TaskActionRow |
| Composition over configuration — TaskRow split via injector pattern | Asana | TaskActionRow, Scratchpad |
| Multi-access actions — click, keyboard, context menu | Linear | TaskActionRow |
| Roving tabindex — arrow keys within, Tab escapes | WAI-ARIA, UXPin | TaskActionRow list, WeekHeatmap days |
| Hover + focus-visible parity | WCAG 2026 | All hover-reveal actions |
| Dashboard ≤ 5-6 cards initial view | Notion | ProjectHealthCard sizing |
| Sprint health = progress + blockers + velocity | Jira | ProjectHealthCard |
| Color-intensity heatmap + tooltip detail-on-demand | GitHub contributions | WeekHeatmap |
| Smooth sparkline with gradient fill | Linear, Stripe | ProjectHealthCard trend |
| Gamification streaks | Duolingo | WeekHeatmap streak indicator |

---

## 1. Scratchpad Composable Refactor

### Architecture

Refactor `ScratchpadWidget` and `SidebarScratchpad` into a single composable system sharing primitives via React context. Existing components become backward-compatible prebuilt arrangements.

### Composable Parts

```
Scratchpad.Root            — Context provider (items, callbacks, filter state, drag state)
Scratchpad.Header          — Title + children slot for actions
Scratchpad.List            — Animated item list (MotionStagger + dnd-kit SortableContext)
Scratchpad.Item            — Checkbox + inline-editable text + hover actions
Scratchpad.AddInput        — Inline input with Enter/Escape, rapid-entry mode
Scratchpad.EmptyState      — Icon + message (auto-shows when items empty)
Scratchpad.ProgressRing    — Circular SVG progress (extracted)
Scratchpad.FilterToggle    — Eye icon toggle to show/hide completed
Scratchpad.Collapse        — Collapsible wrapper with chevron
```

### Types

```typescript
interface ScratchpadItem {
  id: string
  text: string
  done: boolean
}

interface ScratchpadRootProps {
  items: ScratchpadItem[]
  maxItems?: number                                    // default: Infinity
  onToggle: (id: string, done: boolean) => void
  onAdd?: (text: string) => void                       // hides AddInput when absent
  onDelete?: (id: string) => void                      // hides delete action when absent
  onEdit?: (id: string, text: string) => void          // hides inline edit when absent
  onReorder?: (items: ScratchpadItem[]) => void        // enables drag handles when present
  onPromote?: (id: string) => void                     // shows promote action when present
  children: React.ReactNode
}
```

Callbacks drive feature visibility: no `onAdd` = no AddInput. No `onPromote` = no promote button.

### Scratchpad.Item — Core Row

```
┌─[≡]─[☐]─[ Task text (editable on dblclick) ]──[↑ promote]──[× delete]─┐
  drag  chk        flex-1, inline edit              hover actions
```

- **Drag handle** (≡): Only when `onReorder` in context. Uses `useSortable` from @dnd-kit.
- **Checkbox**: `onToggle(id, !done)`. Done items get `line-through text-surface-fg-subtle`.
- **Text**: Double-click enters edit mode (inline Input, Enter/Escape). `onEdit(id, newText)`.
- **Promote** (IconArrowUp): Only when `onPromote` in context. Hover-reveal.
- **Delete** (IconX): Only when `onDelete` in context. Hover-reveal.
- Hover actions: `opacity-0 group-hover:opacity-100 group-focus-within:opacity-100`.
- `compact` prop: `py-0.5 text-ds-sm gap-ds-02` for sidebar.

### Scratchpad.FilterToggle

- IconEye/IconEyeOff icon button in header.
- Toggles `showCompleted` in context (default: true).
- Completed items hidden from list but counted in ProgressRing.

### Scratchpad.ProgressRing

- `size="sm" | "md"` — md (20px) for card, sm (16px) for sidebar.
- Reads items/maxItems from context.
- Pulse animation on all-done.

### Scratchpad.Collapse

- CSS grid transition (`grid-rows-[1fr]` → `grid-rows-[0fr]`).
- `defaultOpen` prop. Chevron rotation.

### Drag-to-Reorder

- `Scratchpad.List` wraps in `DndContext` + `SortableContext` when `onReorder` exists.
- `Scratchpad.Item` uses `useSortable` for drag handle + transform.
- Drag overlay: same item styling + `shadow-02` elevation.
- Follows @dnd-kit patterns from board-column.tsx / task-card.tsx.

### Prebuilt Arrangements (Backward-Compatible)

```tsx
// ScratchpadWidget — full dashboard card
<ScratchpadWidget
  items={items} maxItems={5}
  onToggle={...} onAdd={...} onDelete={...}
  onEdit={handleEdit} onReorder={handleReorder} onPromote={handlePromote}
  title="My Scratchpad" loading={false}
/>

// SidebarScratchpad — compact, now feature-rich
<SidebarScratchpad
  items={items}
  onToggle={...} onAdd={handleAdd} onDelete={handleDelete}
  onEdit={handleEdit} onReorder={handleReorder} onPromote={handlePromote}
  defaultOpen maxItems={5}
/>
```

### Token Usage

```
Card shell (widget):      Card variant="outline", bg-surface-1, border-surface-border-strong, shadow-01
Sidebar wrapper:          no card — bg inherited from sidebar
Item row:                 hover:bg-surface-2, rounded-ds-md, gap-ds-03
Item row (compact):       hover:bg-surface-2, rounded-ds-sm, gap-ds-02, py-0.5
Item text (widget):       text-ds-md
Item text (sidebar):      text-ds-sm (bumped from text-xs for readability)
Header text (sidebar):    text-ds-sm (bumped from text-ds-xs)
Drag overlay:             bg-surface-1, shadow-02, rounded-ds-md, ring-1 ring-accent-7
Drag handle:              text-surface-fg-subtle, cursor-grab, active:cursor-grabbing
Edit input:               inline Input size="sm" with accent ring
Promote icon:             text-accent-11, hover:text-accent-12
Filter toggle:            IconButton variant="ghost" size="xs", text-surface-fg-subtle
Empty state:              text-surface-fg-subtle, py-ds-06, centered
Progress ring:            accent-9 (in progress), success-9 (all done)
```

### File Structure

```
packages/karm/src/dashboard/
  scratchpad/
    scratchpad-context.tsx
    scratchpad-root.tsx
    scratchpad-header.tsx
    scratchpad-list.tsx
    scratchpad-item.tsx
    scratchpad-add-input.tsx
    scratchpad-empty-state.tsx
    scratchpad-progress-ring.tsx
    scratchpad-filter-toggle.tsx
    scratchpad-collapse.tsx
    scratchpad.tsx               ← barrel: Scratchpad.Root, .Header, etc.
    index.ts
  scratchpad-widget.tsx          ← prebuilt full card
  sidebar-scratchpad.tsx         ← prebuilt compact
```

---

## 2. ActivityFeed — Time Grouping Enhancement

**Package:** `@devalok/shilp-sutra` (composed/activity-feed)
**Type:** Additive enhancement, no breaking changes

### API Addition

```tsx
<ActivityFeed
  items={items}
  compact
  groupBy="time"              // "time" | "none" (default: "none")
  groupLabels={{              // optional label overrides
    today: "Today",
    yesterday: "Yesterday",
    thisWeek: "Earlier this week",
    older: "Older"
  }}
/>
```

### Grouping Logic

- Pure function `groupItemsByTime(items, labels)` → `{ label: string, items: ActivityItem[] }[]`
- Buckets: today, yesterday, earlier this week (since Monday), older
- Empty groups skipped
- `maxInitialItems` + `onLoadMore` apply to flat list BEFORE grouping

### Group Header Rendering

```
uppercase tracking-ds-wide text-ds-xs text-surface-fg-subtle
border-b border-surface-border
mt-ds-04 (except first group) mb-ds-02 pb-ds-02
```

---

## 3. Banner — Multi-Action Mobile Wrapping

**Package:** `@devalok/shilp-sutra` (ui/banner)
**Type:** Additive enhancement, no breaking changes

### Changes

1. Rename `action` → `actions` with backward-compat alias (both work, `actions` takes precedence)
2. Add `flex-wrap` to root layout for mobile responsiveness
3. Add `min-w-0` on children div to enable wrapping
4. Actions container: `flex items-center gap-ds-02 shrink-0`

### Layout

```
Desktop: [icon] [children (text)] ──────── [actions] [dismiss]
Mobile:  [icon] [children (text)] [dismiss]
         [actions — full width wrap]
```

No compound `Banner.Actions` sub-component — `actions` prop accepting ReactNode is sufficient.

---

## 4. WeekHeatmap — New Composed Component

**Package:** `@devalok/shilp-sutra-karm` (dashboard/week-heatmap)

### Composable API

```tsx
// Props-driven shorthand
<WeekHeatmap days={days} onDayClick={handleClick} overdue={2} />

// Composable
<WeekHeatmap.Root days={days} onDayClick={handleDayClick}>
  <WeekHeatmap.DayStrip />
  <WeekHeatmap.Streak />
  <WeekHeatmap.Summary />
  <WeekHeatmap.ProgressBar />
</WeekHeatmap.Root>
```

### Types

```typescript
interface WeekDay {
  date: string           // ISO date
  completed: number
  total: number
}

interface WeekHeatmapProps {
  days: WeekDay[]        // Exactly 7 (Mon-Sun)
  onDayClick?: (date: string) => void
  overdue?: number
  className?: string
}
```

### Day Column States

| State | Background | Ring | Text |
|-------|-----------|------|------|
| Past, all complete | bg-success-9 | — | text-success-11 |
| Past, partial | bg-warning-9 | — | text-warning-11 |
| Past, nothing done | bg-error-9 | — | text-error-11 |
| Today | bg-info-9 | ring-1 ring-info-7 | text-info-11 font-medium |
| Future | bg-surface-3 | — | text-surface-fg-muted |
| Weekend/empty | bg-surface-2 | border-dashed border-surface-border | text-surface-fg-subtle |

### Improvements Over Request

1. **Tooltip on hover** — Full date + "3 of 4 completed" breakdown (detail-on-demand, GitHub pattern)
2. **Keyboard grid navigation** — Arrow Left/Right, Enter/Space, Home/End (WAI-ARIA grid pattern)
3. **Streak indicator** — "3-day streak" when consecutive days at 100% (Duolingo gamification)
4. **Responsive** — < 360px: days stack vertically as compact rows

### Accessibility

- `role="grid"` on DayStrip, `role="gridcell"` on each day
- Roving tabindex with arrow keys
- Non-clickable future days: `aria-disabled` but focusable

### Animation

- MotionStagger on columns (left→right, 50ms)
- Each column: MotionSlide direction="up" with springs.smooth
- Today: MotionPop on mount
- Click: `whileTap={{ scale: 0.95 }}`

### File Structure

```
packages/karm/src/dashboard/
  week-heatmap/
    week-heatmap-context.tsx
    week-heatmap-root.tsx
    week-heatmap-day-strip.tsx
    week-heatmap-day.tsx
    week-heatmap-summary.tsx
    week-heatmap-progress-bar.tsx
    week-heatmap-streak.tsx
    week-heatmap.tsx
    index.ts
```

---

## 5. TaskActionRow — New Composed Component

**Package:** `@devalok/shilp-sutra-karm` (tasks/task-action-row)

### Composable API

```tsx
// Full composition (dashboard)
<TaskActionRow.Root task={task} onClick={() => openPanel(task.id)}>
  <TaskActionRow.Checkbox onComplete={handleComplete} />
  <TaskActionRow.Priority />
  <TaskActionRow.Title truncate />
  <TaskActionRow.Labels max={2} />
  <TaskActionRow.ProjectBadge onClick={...} />
  <TaskActionRow.DueDate />
  <TaskActionRow.Navigate href={...} />
</TaskActionRow.Root>

// Props shorthand
<TaskActionRow
  task={task} onComplete={handleComplete} onClick={() => openPanel(task.id)}
  showCheckbox showPriority showLabels showProject showDueDate showNavigate truncateTitle
/>
```

### Types

```typescript
interface TaskActionRowTask {
  id: string
  title: string
  priority: Priority               // LOW | MEDIUM | HIGH | URGENT
  dueDate?: string | null
  projectName?: string
  projectId?: string
  stage?: string
  isOverdue?: boolean
  labels?: string[]
}

interface TaskActionRowRootProps {
  task: TaskActionRowTask
  onClick?: () => void
  onContextMenu?: (e: React.MouseEvent) => void
  showSeparator?: boolean          // default true
  className?: string
  children: React.ReactNode
}

interface TaskActionRowCheckboxProps {
  onComplete: (taskId: string) => void | Promise<void>
}
```

### Layout

```
┌─[☐]─[●]─[ Task title... ]──[labels]──[ Project X ]──[ Mar 18 ]──[→]─┐
  chk  pri    flex-1 truncate    chips      Badge        color-coded   nav
```

### Improvements Over Request

1. **Keyboard list navigation** — Roving tabindex, Arrow Up/Down between rows (Linear pattern)
2. **Focus-within action reveal** — `group-focus-within:opacity-100` alongside hover (WCAG)
3. **Optimistic completion** — Check → MotionPop → MotionCollapse (600ms). Promise reject reverts.
4. **Context menu** — `onContextMenu` fires on right-click + Shift+F10
5. **Labels sub-component** — `task.labels` as `Badge size="xs" variant="subtle"`, `max` prop truncates
6. **Separator control** — `showSeparator` prop for clean list termination

### Token Usage

```
Row:                transparent, hover:bg-surface-3, active:bg-surface-4
Row border:         border-b border-surface-border (when showSeparator)
Checkbox:           standard DS Checkbox
Priority:           PriorityIndicator display="compact"
Title:              text-surface-fg text-ds-md font-medium, truncate
Project badge:      Badge variant="subtle" color="default" size="xs"
Due date:           text-ds-sm; overdue: text-error-11; today: text-warning-11; future: text-surface-fg-muted
Navigate:           IconButton size="sm" variant="ghost"
Hover actions:      opacity-0 group-hover:opacity-100 group-focus-within:opacity-100
```

### Accessibility

- Row: `role="button"` + tabIndex={0} + Enter/Space
- In list: parent manages roving tabindex, arrow keys
- Checkbox: independent tab stop
- Navigate: `aria-label="Open task in project board"`
- Context menu: right-click + Shift+F10

### File Structure

```
packages/karm/src/tasks/
  task-action-row/
    task-action-row-context.tsx
    task-action-row-root.tsx
    task-action-row-checkbox.tsx
    task-action-row-priority.tsx
    task-action-row-title.tsx
    task-action-row-labels.tsx
    task-action-row-project-badge.tsx
    task-action-row-due-date.tsx
    task-action-row-status-badge.tsx
    task-action-row-navigate.tsx
    task-action-row.tsx
    index.ts
```

---

## 6. ProjectHealthCard — Props-Driven

**Package:** `@devalok/shilp-sutra-karm` (dashboard/project-health-card)

### API

```tsx
<ProjectHealthCard
  project={{
    id: "proj-1",
    name: "Project X",
    completed: 18, total: 24,
    overdue: 3, urgent: 2,
    contextLine: "Sprint ends Mar 19",
    trend: [0.6, 0.7, 0.65, 0.75, 0.8, 0.85, 0.75],
  }}
  onClick={() => navigate(`/projects/proj-1/board`)}
  loading={false}
/>
```

### Types

```typescript
interface ProjectHealthData {
  id: string
  name: string
  completed: number
  total: number
  overdue?: number
  urgent?: number
  contextLine?: string
  trend?: number[]          // 7 values (0-1) for sparkline
}

interface ProjectHealthCardProps {
  project: ProjectHealthData
  onClick?: () => void
  loading?: boolean
  className?: string
}
```

### Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Project X                                     [2 urgent]   │
│  ████████████░░░░  18/24 tasks  ╱‾╲╱‾╲●        (sparkline)  │
│  Sprint ends Mar 19 · 3 overdue                             │
└─────────────────────────────────────────────────────────────┘
```

### Sparkline Design

The sparkline is a polished micro-visualization, not a crude line:

- **Smooth curves**: SVG `<path>` with monotone cubic interpolation (catmull-rom spline). Smooth, natural curves that never overshoot data points.
- **Area gradient fill**: Below the curve, a `<path>` filled with linear gradient from `{color}-4` (15% opacity) at top to transparent at bottom. Gives visual weight and a "chart" feel.
- **End dot**: Small filled circle (r=2) on the last data point in `{color}-9`. Anchors the eye to "where we are now."
- **Line treatment**: `stroke-width: 1.5`, `stroke-linecap: round`, `stroke-linejoin: round`. Stroke color: `{color}-9` (success/warning/error based on trend).
- **Proportions**: 48×20px viewbox with 2px padding. Y-axis normalized to data range (not forced 0-1) so small variations are visible. Minimum visual range enforced for near-flat data.
- **Trend color**: success-9 if trending up (last 3 avg > first 3 avg), warning-9 if flat (±5%), error-9 if trending down.

### Improvements Over Request

1. **Micro-sparkline trend** — 7-point SVG with smooth curves + gradient fill (Jira/Stripe pattern)
2. **Loading skeleton** — Shimmer matching card layout
3. **Click ripple** — `whileTap={{ scale: 0.98 }}` + bg-surface-3 flash

### Token Usage

```
Card:               Card variant="outline" interactive, bg-surface-1, hover:bg-surface-2
Project name:       text-surface-fg, heading-sm
Status badge:       urgent>0: Badge solid error; overdue>0: Badge subtle warning; else: Badge subtle success
Progress:           Progress size="sm", color by %: >75% success, 25-75% warning, <25% error
Count:              text-surface-fg-muted text-ds-sm
Context:            text-surface-fg-subtle text-ds-xs
Overdue in context: text-error-11
```

### File Structure

```
packages/karm/src/dashboard/
  project-health-card.tsx
  project-health-card.stories.tsx
  __tests__/project-health-card.test.tsx
```

---

## Priority Order

1. **Scratchpad composable refactor** — Foundation work, biggest scope
2. **TaskActionRow** — Highest dashboard impact, blocks my-tasks work
3. **ActivityFeed time grouping** — Small enhancement, high reuse
4. **Banner actions** — Small enhancement, needed for attention banner
5. **WeekHeatmap** — Medium effort, dashboard-specific
6. **ProjectHealthCard** — Smallest scope, quick build
