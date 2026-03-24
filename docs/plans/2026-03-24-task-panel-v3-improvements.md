# TaskPanel v3 — Improvement Plan

> **Source:** `karm-v2/docs/task-panel-usage-reference.md` — exhaustive usage reference from live codebase.

**Goal:** Close the gap between what the usage reference describes and what TaskPanel v3 currently implements.

---

## Gap Analysis: What the Reference Says vs What v3 Has

### CRITICAL — Must have for v3 to replace v2

| # | Feature | Reference Status | v3 Status | Gap |
|---|---------|-----------------|-----------|-----|
| 1 | **Description field** | "Single biggest functional gap" (§17.3) | Has inline description with edit | Done — v3 already has this |
| 2 | **Review workflow** | "Biggest functional gap" — full backend exists (§8) | Review banner + review wing card | Partial — has approve/request changes buttons but NOT the full deliverable review flow (file versions, review per deliverable) |
| 3 | **humanId display** | `metadata.humanId` e.g. `KRM-847` (§9.3) | Shows `task.taskId` in header | Done — v3 shows this |
| 4 | **Client mode** | Separate permissions for VIEW_ONLY vs COLLABORATOR (§11) | `clientMode` boolean hides internal content | Partial — no COLLABORATOR vs VIEW_ONLY distinction |
| 5 | **Conversation dual-channel** | TEAM_ONLY vs CLIENT_FACING with toggle (§6) | Message input has visibility toggle | Done — v3 has per-message visibility |
| 6 | **File uploads** | Upload with progress, GDrive sync, delete (§7) | No files section in v3 | Missing — files moved to timeline attachments per design but no upload UI |
| 7 | **Activity/audit log** | Lazy-loaded audit timeline (§5) | System events in merged timeline | Done — merged into unified timeline |

### HIGH — Important for parity with production usage

| # | Feature | Reference Status | v3 Status | Gap |
|---|---------|-----------------|-----------|-----|
| 8 | **Overdue indicator** | `dueDate` past + not terminal = overdue (§9.10) | Due date pill shows date but no overdue styling | Missing — needs red color on overdue dates |
| 9 | **Start date** | `task.startDate` field exists (§9.2) | Not in properties | Missing — add to properties wing |
| 10 | **Creator attribution** | `createdByType` LOKWASI/CLIENT/SYSTEM (§9.8) | Not shown | Missing — show "Created by X" with AI/client badge |
| 11 | **Delete task** | API exists, LEAD/COLEAD/ADMIN permission (§9.14) | No delete button | Missing — add to header actions menu |
| 12 | **Move to project** | `moveTaskToProject()` service exists (§9.12) | No UI | Missing — add to header actions menu |
| 13 | **Copy task reference** | Deep link + humanId (§16.5) | No copy button | Missing — add to header actions menu |
| 14 | **Keyboard shortcuts** | E/P/L/A/arrows (§10.1) | Designed but not implemented | Missing — was Task 12 in original plan |
| 15 | **Bandwidth indicator** | HEALTHY/ELEVATED/OVERLOADED on assignees (§16.1) | Not shown | Missing — show colored dot next to assignee names |
| 16 | **Leave indicator** | "On leave" badge on task lead (§16.2) | Not shown | Missing — add badge to lead/assignee in properties |
| 17 | **Phase picker** | `task.phaseId` links to project phases (§16.7) | Not in properties | Missing — add phase row to properties wing |
| 18 | **Task actions menu** | Delete, Move, Promote, Duplicate (§17.9) | No "..." menu | Missing — add dropdown in header |
| 19 | **Relative due dates** | "Due in 3 days", "Overdue by 2 days" (§10.8) | Shows absolute date only | Missing — show relative alongside absolute |
| 20 | **TaskPanelSheet** | All 3 consumers use identical Sheet wrapping (§13, §17.7) | No convenience wrapper | Missing — add wrapper that owns Sheet + loading |

### MEDIUM — Nice to have, can ship after v3 launch

| # | Feature | Reference Status | v3 Status | Gap |
|---|---------|-----------------|-----------|-----|
| 21 | Deliverable versions | `DeliverableVersion` model (§9.5) | Not shown | Deferred |
| 22 | Embed URLs | Figma/Loom/Docs embeds (§9.18) | Not rendered | Deferred |
| 23 | Dependencies | `TaskDependency` model (§9.6) | No UI | Deferred |
| 24 | Threaded messages | `parentMessageId` (§9.16) | Flat list | Deferred |
| 25 | Message attachments | `attachments` JSON (§9.17) | Not rendered | Deferred |
| 26 | Inline file preview | Images/PDFs/embeds (§10.10) | Not implemented | Deferred |
| 27 | Promote subtask | `promoteSubtask()` (§9.13) | No UI | Deferred |
| 28 | Client task badges | "Client Request" label (§16.6) | Not shown | Deferred |
| 29 | GDrive sync status | Per-file sync indicator (§16.8) | Not shown | Deferred |
| 30 | Optimistic mutations | Every change does full re-fetch (§17.10) | Same | Deferred |

---

## Priority 1 — Quick Wins (can implement now, minimal complexity)

### 1.1 Overdue date styling
Add red color to due date when overdue. The `isOverdue()` helper already exists in wing-properties.

### 1.2 Relative due dates
Show "Due in 3 days" or "Overdue by 2 days" alongside the absolute date in the properties wing and quick props pills.

### 1.3 Creator attribution
Add a line in the meta section: "Created by [name] · [AI/Client/Staff badge]"

### 1.4 Task actions menu (header "..." dropdown)
Add a DropdownMenu to the header with:
- Copy link
- Copy task reference (e.g., "KRM-847: Fix auth token refresh")
- Delete task (with ConfirmDialog)
- Move to project (deferred — just the menu slot)

### 1.5 Overdue visual in quick props
Due date pill should turn red/error when overdue.

---

## Priority 2 — Important Features (moderate complexity)

### 2.1 Keyboard shortcuts
Implement the `useTaskPanelKeyboard` hook (was Task 12 in original plan):
- `S` → focus status picker
- `A` → focus assignee picker
- `P` → focus priority picker
- `D` → focus due date picker
- `E` → toggle description edit
- `C` → focus message input
- `Escape` → close panel / exit edit mode

### 2.2 TaskPanelSheet convenience wrapper
```tsx
<TaskPanelSheet
  open={panel.open}
  onOpenChange={panel.onOpenChange}
  loading={panel.loading}
  task={panel.taskDetail}
  mode="staff"  // or "client"
  {...callbacks}
>
  {/* Consumer just provides Wings + any custom sections */}
</TaskPanelSheet>
```

### 2.3 Bandwidth indicator on assignees
Show a colored dot (green/yellow/red) next to each assignee name in the properties wing. Requires `bandwidth` data in the task context.

### 2.4 Leave indicator
Show "On leave" badge next to lead/assignee names when they're on approved break.

### 2.5 Phase picker
Add a Phase property row to the properties wing with a popover picker.

### 2.6 Start date
Add a Start Date property to the 2-column grid in the properties wing (alongside Due Date).

---

## Priority 3 — Full Review Workflow (high complexity, critical for clients)

### 3.1 Deliverable review integration
Connect the existing `ReviewCard`, `ReviewResponseForm`, `ReviewRequestButton` components from the shilp-sutra-karm library to the panel. This requires:
- Adding `deliverables` to the task context
- "Request Review" button in the review wing
- Client view: approve/reject form per deliverable
- Staff view: review status per deliverable
- File version history

This is the single largest missing feature and warrants its own implementation plan.

---

## Recommended Implementation Order

**Sprint 1 (quick wins — 1 session):**
1.1 → 1.2 → 1.3 → 1.4 → 1.5

**Sprint 2 (important features — 1-2 sessions):**
2.1 → 2.2 → 2.3 → 2.6

**Sprint 3 (review workflow — dedicated session):**
3.1 (needs its own design + plan)

**Deferred (post-launch):**
Items 21-30 from the medium priority list
