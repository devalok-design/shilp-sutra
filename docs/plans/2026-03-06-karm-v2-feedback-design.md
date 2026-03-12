# Design: Shilp Sutra v0.6.0 — Karm V2 Feedback Response

**Date:** 2026-03-06
**Source:** `karm-v2/docs/shilp-sutra-feedback.md` (12 issues across 38 pages built with `@devalok/shilp-sutra@0.5.0`)
**Target:** v0.6.0 release

---

## Investigation Findings

Before designing fixes, we investigated two items that turned out to be discoverability problems, not missing features:

- **KanbanBoard (#11):** Exists and is properly exported from `@devalok/shilp-sutra-karm@0.4.0` via `./board`. The Karm V2 team looked for it in the core package because Storybook shows both packages without clear separation.
- **DataTable (#12):** Exists in core with sorting, filtering, pagination, and virtualization. Removed from the barrel export in v0.5.0 (barrel isolation for Next.js). Available via `@devalok/shilp-sutra/ui/data-table` but this isn't documented anywhere.

---

## Scope

### A. API Fixes (5 items)

#### 1. StatusBadge — Add `color` prop

**Problem:** The `status` enum only accepts 8 values. Domain statuses like PRESENT, IN_PROGRESS, ON_HOLD don't map cleanly.

**Solution:** Add an optional `color` prop (`"success" | "warning" | "error" | "info" | "neutral"`) that overrides the color derived from `status`. When `color` is provided, `status` becomes optional.

```tsx
// Existing — unchanged
<StatusBadge status="active" />

// New — custom label + explicit color
<StatusBadge color="success" label="Present" />
<StatusBadge color="warning" label="On Hold" />
<StatusBadge color="info" label="In Review" />
```

**Implementation:** Add a `color` prop to the CVA definition. When `color` is set, use its color mapping. When `status` is set (no `color`), use the existing status-to-color mapping. At least one of `status` or `color` must be provided.

#### 2. CalendarGrid — Add `events` prop

**Problem:** The name suggests an event calendar but it only supports date selection. No way to render event indicators on dates.

**Solution:** Keep the name. Add an `events` prop for rendering dot indicators on dates. Tooltip on hover shows event label.

```tsx
type CalendarEvent = {
  date: Date
  color?: string    // CSS color or token, defaults to primary
  label?: string    // shown in tooltip on hover
}

<CalendarGrid
  events={[
    { date: new Date('2026-03-10'), color: 'var(--color-error)', label: '3 tasks due' },
    { date: new Date('2026-03-12'), label: 'Sprint review' },
  ]}
  onSelect={setDate}
/>
```

**Rendering:** Small dots below the date number. Multiple events = multiple dots (max 3 visible, "+N" in tooltip). Uses SimpleTooltip internally for hover labels.

#### 3. Alert — Add `variant` axis

**Problem:** Alert uses only `color`, unlike Button/Badge which use `variant` + `color`. Consumers reach for `variant="destructive"` and fail silently.

**Solution:** Add a `variant` prop (`"subtle" | "filled" | "outline"`). Current behavior becomes `variant="subtle"` (default). No breaking change.

| Variant | Background | Border | Text |
|---------|-----------|--------|------|
| `subtle` (default) | Light tinted | None | Colored (current behavior) |
| `filled` | Solid color | None | White/contrast |
| `outline` | Transparent | Colored border | Colored text |

```tsx
<Alert color="error" variant="filled">Critical failure</Alert>
<Alert color="warning" variant="outline">Check your input</Alert>
<Alert color="info">Informational note</Alert>  {/* subtle, unchanged */}
```

#### 4. PageHeader — Optional `title`

**Problem:** `title` is required even when breadcrumbs already contain it, causing duplication.

**Solution:** Make `title` optional. When omitted and `breadcrumbs` are provided, auto-derive from the last breadcrumb's `label`. If neither is provided, TypeScript error.

```tsx
// Before (redundant)
<PageHeader title="Dashboard" breadcrumbs={[{ label: "Home", href: "/" }, { label: "Dashboard" }]} />

// After (auto-derived)
<PageHeader breadcrumbs={[{ label: "Home", href: "/" }, { label: "Dashboard" }]} />
```

**Type:** Use a discriminated union or conditional type so at least one of `title` or `breadcrumbs` is required.

#### 5. Icon prop standardization — `ReactNode` everywhere

**Problem:** Shell components (Sidebar, BottomNavbar) expect `icon: ComponentType`, while EmptyState expects `icon: ReactNode`. AIs consistently write the wrong pattern.

**Solution:** Standardize all icon props on `ReactNode`. Shell components enforce sizing via CSS on the wrapper:

```tsx
// Wrapper in sidebar
<span className="[&>svg]:h-5 [&>svg]:w-5">{item.icon}</span>
```

**Breaking change.** Affects:
- `Sidebar` / `NavItem` — `icon` prop
- `BottomNavbar` — `icon` prop
- `AppCommandPalette` — `icon` in command items
- `CommandPalette` — `icon` in items
- `NotificationPreferences` — internal only, not breaking

Migration:
```tsx
// Before
{ title: 'Dashboard', icon: IconLayoutDashboard }

// After
{ title: 'Dashboard', icon: <IconLayoutDashboard /> }
```

---

### B. New Components (2 items)

#### 6. SimpleTooltip — Composed convenience wrapper

**Problem:** Tooltip requires 4 nested Radix components for a simple tooltip.

**Solution:** New composed component that wraps the common case.

```tsx
interface SimpleTooltipProps {
  content: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  delayDuration?: number
  children: React.ReactNode
}

<SimpleTooltip content="Edit this item">
  <Button variant="ghost" size="icon"><IconEdit /></Button>
</SimpleTooltip>
```

**Implementation:** Wraps `TooltipProvider` + `Tooltip` + `TooltipTrigger asChild` + `TooltipContent`. Exported from `composed/index` and per-component at `./composed/simple-tooltip`.

#### 7. ScheduleView — Week/day timeline component

**Problem:** No way to render events on a calendar timeline. Karm V2 fell back to grouped-by-date list views.

**Solution:** New composed component for day and week timeline views.

```tsx
interface ScheduleEvent {
  id: string
  title: string
  start: Date
  end: Date
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'
}

interface ScheduleViewProps {
  view: 'day' | 'week'
  date: Date                        // current day or week start
  events: ScheduleEvent[]
  onEventClick?: (event: ScheduleEvent) => void
  onSlotClick?: (start: Date, end: Date) => void
  startHour?: number                // default 8
  endHour?: number                  // default 18
  slotDuration?: number             // minutes, default 30
}

<ScheduleView
  view="week"
  date={new Date()}
  events={events}
  onEventClick={(e) => openDetail(e.id)}
  onSlotClick={(start, end) => createEvent(start, end)}
/>
```

**Rendering:**
- Time column on left (hours)
- Day columns (1 for day view, 7 for week view)
- Events as absolutely positioned colored blocks
- Current time indicator line
- Click empty slot to trigger `onSlotClick`
- No drag-to-reschedule (keeps complexity manageable)

**Location:** `composed/schedule-view.tsx`, exported from `composed/index` and `./composed/schedule-view`.

---

### C. Documentation (5 items)

#### 8. Storybook package labels

Add a visible indicator in each Storybook story's docs page showing which npm package the component belongs to and its import path.

**Implementation:** Custom Storybook decorator or docs page component that reads a `package` parameter from story meta:
```tsx
const meta: Meta<typeof KanbanBoard> = {
  title: 'Karm/Board/KanbanBoard',
  parameters: {
    package: '@devalok/shilp-sutra-karm',
    importPath: "import { KanbanBoard } from '@devalok/shilp-sutra-karm/board'",
  },
}
```

#### 9. Import path guide

New Storybook docs page: "Import Guide" listing every component with:
- Package name
- Barrel import (if available)
- Per-component import path
- Whether it requires "use client"

Highlight barrel-isolated components (DataTable, Charts, DataTableToolbar) with their specific import paths.

#### 10. shadcn migration mapping

New Storybook docs page: "Coming from shadcn/ui?" with a mapping table:

| shadcn/ui | shilp-sutra | Notes |
|-----------|-------------|-------|
| `variant="destructive"` | `variant="solid" color="error"` | Two-axis system |
| `variant="default"` | `variant="solid"` | |
| `variant="secondary"` | `variant="subtle"` | |
| `variant="outline"` | `variant="outline"` | Same |
| `variant="ghost"` | `variant="ghost"` | Same |
| `<Badge variant="destructive">` | `<Badge variant="solid" color="error">` | |
| `<Badge variant="secondary">` | `<Badge variant="subtle">` | |

#### 11. v0.5.0 migration guide

Add to CHANGELOG.md and a standalone migration doc:
- EmptyState `icon` prop changed from `ComponentType` to `ReactNode`
- DataTable, Charts, DataTableToolbar removed from barrel — per-component imports required
- Exact import paths for each

#### 12. Karm package README

Update `packages/karm/README.md` with:
- What the package is (domain components for project management apps)
- When to use it vs core
- Component inventory with import paths
- Peer dependency requirements

---

## Breaking Changes (v0.6.0)

1. **Icon prop migration** — Shell components change from `ComponentType` to `ReactNode`
2. **Alert** — Not breaking (new `variant` prop defaults to `"subtle"`, matching current behavior)
3. **PageHeader** — Not breaking (`title` becomes optional, existing usage still works)
4. **StatusBadge** — Not breaking (new `color` prop is additive)

Only #1 is a true breaking change. Document in migration guide.

---

## Out of Scope

- Variant aliases for Button/Badge (decision: docs-only, keeps API canonical for AI consistency)
- Drag-to-reschedule in ScheduleView (future enhancement)
- WebP conversion of brand assets (separate effort)
