# TaskPanel v3 — Component Alignment Design

**Date:** 2026-03-25
**Scope:** Enhance core DS components + build karm-domain composed components + migrate TaskPanel v3 to use them.
**Packages:** `@devalok/shilp-sutra` (core), `@devalok/shilp-sutra-karm` (karm)

---

## Problem

TaskPanel v3 hand-builds patterns that either already exist in core (Switch, AvatarGroup, Badge, StatusBadge, ActivityFeed, MemberPicker) or should be karm-domain composed components. This creates:
- Inconsistent behavior (custom toggle vs core Switch)
- Missed animations (core components have Framer Motion, custom ones don't)
- Wasted effort (rebuilding what exists)
- Drift from the token system

## Research Basis

Audited against: Radix/shadcn, Mantine v7, Chakra UI, Ant Design. Cross-referenced with Linear, Asana, Notion, Height.app, Frame.io, Filestage for PM-domain patterns.

**Key finding:** Core DS components should be generic primitives. PM-domain patterns (deadline display, priority indicators, people pickers with roles, message composers, collapsible task sections) belong in the karm package as composed components built on core primitives.

---

## Part 1: Core DS Enhancements

These are genuine gaps where every major DS ships something we don't.

### 1.1 Switch — add size variants + color

**Current:** Single size (24×44), accent-only. Has `error` prop for error state styling.
**Every other DS:** Mantine ships 5 sizes, Chakra ships 3. We ship 1.

**Add:**
- `size: 'sm' | 'md' | 'lg'` (sm=18×32, md=24×44 current, lg=28×52)
- `color: 'accent' | 'success' | 'warning'` — checked state background color (replaces accent-9)
- Keep existing `error` prop for form validation error state (red border). `color` controls the *checked* color; `error` controls the *validation* state. No conflict.
- `thumbIcon?: ReactNode` — optional icon inside the thumb (Mantine pattern)

**Implementation note:** Thumb travel distance is hardcoded to `x: 20` for the current 24×44 track. Each size needs its own travel value: sm=12, md=20, lg=24. Use a size-to-travel map.

**API after:**
```tsx
<Switch size="sm" color="success" checked={visible} onCheckedChange={toggle} />
```

### 1.2 StatusBadge — add in-progress + review + clickable

**Current:** Two modes via discriminated union — `status` (8 predefined: active, pending, approved, rejected, completed, blocked, cancelled, draft) OR `color` (5: success, warning, error, info, neutral). Has `size: 'sm' | 'md'`, `hideDot`, `label`. Display-only — no `onClick`.

**Add to `status` branch:**
- `'in-progress'` → `bg-accent-3 text-accent-11`, dot `bg-accent-9`
- `'review'` → `bg-info-3 text-info-11`, dot `bg-info-9`

**Add to both branches:**
- `onClick?: () => void` — renders as `<button>` with hover state + cursor-pointer
- `icon?: ReactNode` — optional trailing icon (auto chevron-down when clickable and no icon provided)

**NOT adding `customColor`** — the existing `color` branch already handles arbitrary semantic colors. PM tools with custom workflow colors should use the `color` branch with `label` override: `<StatusBadge color="success" label="Design" />`.

**API after:**
```tsx
<StatusBadge status="in-progress" label="In Progress" onClick={openPicker} />
<StatusBadge color="info" label="Design" onClick={openPicker} />
```

### 1.3 AvatarGroup — add lead indicator

**Current:** Overflow, hover expansion, role rings, tooltip. No per-user metadata beyond `ring`.

**Add:**
- `AvatarUser.indicator?: 'lead' | 'admin' | ReactNode` — small dot/icon overlay on avatar
- Indicator renders as a 8px circle at top-right of avatar (warning-9 for lead, accent-9 for admin)
- **Note:** Indicator only works in the default render path. When `renderAvatar` is provided, the consumer is responsible for their own indicator rendering.

**API after:**
```tsx
<AvatarGroup
  users={people.map(p => ({
    ...p,
    indicator: leads.has(p.id) ? 'lead' : undefined,
  }))}
  max={4}
  size="sm"
/>
```

### 1.4 Progress — add color auto-detection from value

**Current:** Manual `color` prop. No automatic urgency.

**Add:**
- `autoColor?: boolean` — when true, color shifts based on value: 0-60 = default (accent-9), 60-85 = warning, 85-100 = success. Overdue (value > 100) = error. Uses existing `color` variant names internally.
- This is opt-in. Default behavior unchanged.

### 1.5 Badge (NOT Chip — Chip is deprecated)

**Current:** Badge has 4 variants × 16 colors, `onClick`, `onDismiss`, `startIcon`/`endIcon`, `selected` toggle, `dot`, `maxWidth` truncation, animated dismiss/select. Chip is a deprecated thin wrapper around Badge.

**Action:** No API changes needed. Badge is already the most feature-complete of any DS surveyed. The work is migration — replacing hand-built label pills with `<Badge variant="outline" size="sm" onDismiss={...}>`. All migration references should use Badge, not Chip.

### 1.6 ActivityFeed — add `renderItem` prop

**Current:** ActivityFeed renders items via internal `ActivityEntry` layout (dot + actor avatar + action text + timestamp + expandable detail). No way for consumers to customize per-item rendering. The `detail` prop is expandable content, not a full custom renderer.

**Problem:** TaskTimeline needs to render comments as rich cards (with reactions, reply, edit, delete) and system events as compressed lines. The current fixed layout can't do both.

**Add:**
- `renderItem?: (item: ActivityItem, index: number) => ReactNode` — full custom rendering per item. When provided, replaces the built-in `ActivityEntry` for that item. The timeline line and dot are still rendered by ActivityFeed; only the content area is customized.

**API after:**
```tsx
<ActivityFeed
  items={items}
  renderItem={(item) =>
    item.id.startsWith('comment-')
      ? <CommentCard {...item} />       // rich card with reactions
      : undefined                        // undefined = use default ActivityEntry
  }
/>
```

Returning `undefined` from `renderItem` falls back to the built-in rendering. This keeps system events using the default compressed layout while letting comments use custom rich cards.

### 1.7 Accordion — add `chevronPosition` prop

**Current:** Our `AccordionTrigger` explicitly renders `<Icon icon={IconChevronDown}>` on the right. This is DS code, not Radix default — Radix doesn't render chevrons.

**Add:**
- `chevronPosition?: 'left' | 'right'` on AccordionTrigger (Mantine ships this)
- This makes it easier to build the "Details >" collapsible pattern

---

## Part 2: Karm-Domain Composed Components

These patterns are PM-specific. No design system ships them as primitives. They belong in `packages/karm/src/composed/` built on core primitives.

### 2.1 TaskSection — collapsible section with header

**Why:** Built 5+ times in TaskPanel (files, subtasks, details, dependencies).

**Built on:** Core `Collapsible` + `Badge` + `Icon` + motion

**API:**
```tsx
<TaskSection
  title="Files"
  count={3}                      // optional badge
  defaultOpen={false}
  chevronPosition="right"
  actions={<Button size="icon-xs"><Icon icon={IconPlus} /></Button>}
  onOpenChange={(open) => {}}
>
  {children}
</TaskSection>
```

**Internals:** Uses `Collapsible` + `CollapsibleTrigger` + `CollapsibleContent`. Adds: title text styling (11px uppercase tracking), animated chevron rotation via `motion.span`, optional count `Badge`, optional action slot. Content animates with `height: auto` transition.

### 2.2 TaskComposer — message input with visibility + attachments

**Why:** The message input pattern (textarea + send + visibility toggle + file attach) is task-specific.

**Built on:** Core `Textarea` + `Button` + `Switch` + `Tooltip` + `Icon`

**API:**
```tsx
<TaskComposer
  onSubmit={(text, visibility) => {}}
  placeholder="Write a message..."
  showVisibility={task.visibility === 'EVERYONE' && !clientMode}
  defaultVisibility="INTERNAL"
  showAttach={!clientMode}
  onAttach={(file) => {}}
  disabled={!canPost}
/>
```

**Internals:** Auto-resizing textarea, Enter to send / Shift+Enter for newline, visibility toggle using core `Switch` (sm, success color), paperclip button for file attach, send button. Warning banner when visibility is CLIENT.

### 2.3 PeoplePicker — unified assignee + lead picker

**Why:** The unified people picker with star-to-mark-lead is task-specific.

**Built on:** Core `MemberPicker` + `Tooltip` + `Icon`

**API:**
```tsx
<PeoplePicker
  members={task.members}
  assignees={task.assignees}
  leads={task.leads}
  onAssign={(id) => {}}
  onUnassign={(id) => {}}
  onToggleLead={(id) => {}}
  trigger={<button>...</button>}
/>
```

**Internals:** Wraps `MemberPicker` (which wraps `MultiSelectPopover`). Adds star toggle per assigned member for lead status. Header hint: "Click to assign · ★ = lead".

### 2.4 TaskTimeline — activity feed with comment/event rendering

**Why:** Task-specific rendering of comments, system events, agent responses, review events.

**Built on:** Core `ActivityFeed` + `Avatar` + `Badge` + `ContentCard`

**API:**
```tsx
<TaskTimeline
  entries={task.timeline}
  filter={filter}                    // 'all' | 'comments' | 'reviews'
  onFilterChange={setFilter}
  clientMode={clientMode}
  onReact={(entryId, emoji) => {}}
  onReply={(entryId) => {}}
  onEdit={(entryId) => {}}
  onDelete={(entryId) => {}}
/>
```

**Internals:** Maps `TimelineEntry[]` to `ActivityItem[]` for the core `ActivityFeed`. Comments render as rich cards (avatar + author + timestamp + body + reactions). System events render as compressed single-line items. Agent responses render with AI avatar + subtle tint. Review events render with status badges.

---

## Part 3: Migration Map

After enhancements + new composed components, migrate these files:

| File | What to migrate | Core component used |
|------|----------------|-------------------|
| `task-panel-wing-properties.tsx` | Status chip → `StatusBadge` (clickable) | StatusBadge |
| | Priority chip → `PriorityIndicator` (existing, with onClick wrapper) | PriorityIndicator |
| | Visibility toggle → `Switch` (sm, success) | Switch |
| | AvatarStack → `AvatarGroup` (with lead indicator) | AvatarGroup |
| | People picker → `PeoplePicker` (karm composed) | MemberPicker via PeoplePicker |
| | Details section → `TaskSection` (karm composed) | Collapsible via TaskSection |
| | Label pills → `Badge` (Chip is deprecated) | Badge |
| `task-panel-files.tsx` | Collapsible section → `TaskSection` | Collapsible via TaskSection |
| `task-panel-subtasks.tsx` | Collapsible section → `TaskSection` | Collapsible via TaskSection |
| | Progress bar → `Progress` (with autoColor) or `ProgressRing` | Progress/ProgressRing |
| `task-panel-dependencies.tsx` | Collapsible section → `TaskSection` | Collapsible via TaskSection |
| `task-panel-timeline.tsx` | Custom timeline → `TaskTimeline` (karm composed) | ActivityFeed via TaskTimeline |
| `task-panel-message-input.tsx` | Custom input → `TaskComposer` (karm composed) | Textarea+Switch via TaskComposer |
| `task-panel-description.tsx` | Keep as-is (TipTap integration is separate effort) | — |

---

## Part 4: What We Don't Build

| Proposed | Decision | Reason |
|----------|----------|--------|
| FileCard (core) | Skip | File gallery layout is task-specific. Core has FilePreview for the viewer. A card wrapper is just a div. |
| CommentCard (core) | Skip | Use ActivityFeed's new `renderItem` prop (added in 1.6) for custom comment rendering within the timeline. For standalone use, compose with ContentCard + custom children. |
| AnnotationLayer (core) | Phase 3 | Frame.io-level pin comments is a full feature. Punt to review workflow phase. |
| PropertyRow (core) | Skip | Properties wing layout is unique to TaskPanel. |
| DeadlineIndicator enhancement | Skip core changes | Already works. Use as-is in migration. |
| PriorityIndicator enhancement | Skip core changes | Already works. Wrap with onClick in karm. |
| MemberPicker role toggle | Skip core changes | Build role toggle in karm's PeoplePicker wrapper. |
| ComposerInput (core) | Skip | No DS ships this. Build as karm's TaskComposer. |
| CollapsibleSection (core) | Skip | No DS ships header+count+collapse. Build as karm's TaskSection. |

---

## Build Order

```
Phase 1 — Core enhancements (all independent, can parallel):
  1a. Switch sizes + color
  1b. StatusBadge in-progress + review + clickable
  1c. AvatarGroup lead indicator
  1d. Progress autoColor
  1e. ActivityFeed renderItem prop
  1f. Accordion chevronPosition

Phase 1.5 — Karm composed components with NO Phase 1 deps (can parallel with Phase 1):
  1.5a. TaskSection (uses existing Collapsible — no Phase 1 dep)
  1.5b. PeoplePicker (uses existing MemberPicker — no Phase 1 dep)

Phase 2 — Karm composed components WITH Phase 1 deps:
  2a. TaskComposer (needs 1a: Switch sm size)
  2b. TaskTimeline (needs 1e: ActivityFeed renderItem)

Phase 3 — Migration (depends on Phase 2):
  3a. Properties wing migration
  3b. Files/Subtasks/Dependencies migration (TaskSection)
  3c. Timeline migration (TaskTimeline)
  3d. Message input migration (TaskComposer)

Phase 4 — Stories + visual verification for all enhanced/new components
```

---

## Success Criteria

- Zero custom toggles, progress bars, collapsible patterns, or avatar stacks in TaskPanel
- Every interactive element uses a core or karm-composed component
- All animations use motion tokens (springs.snappy, tweens.fade, etc.)
- All colors use semantic tokens (no hardcoded oklch/hex)
- Typecheck passes across both packages
- Stories updated for all enhanced/new components
- Visual verification in Storybook before committing
