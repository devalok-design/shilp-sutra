# @devalok/shilp-sutra-karm

Domain-specific UI components for project management applications -- kanban boards, task panels, AI chat, attendance dashboards, client portals, and admin tools.

[![npm](https://img.shields.io/npm/v/@devalok/shilp-sutra-karm)](https://www.npmjs.com/package/@devalok/shilp-sutra-karm)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

## When to use Karm vs Core

| Need | Package |
|------|---------|
| Generic UI primitives (Button, Dialog, Table, Badge, etc.) | `@devalok/shilp-sutra` (core) |
| Project management features (boards, tasks, chat, admin) | `@devalok/shilp-sutra-karm` |

Karm builds on top of core. It provides opinionated, domain-specific components that combine multiple core primitives into ready-to-use features for project management and team collaboration apps.

## Install

```bash
pnpm add @devalok/shilp-sutra-karm @devalok/shilp-sutra
```

## Peer Dependencies

| Package | Version | Required |
|---------|---------|----------|
| `@devalok/shilp-sutra` | `>=0.1.0` | Yes |
| `react` | `^18 \|\| ^19` | Yes |
| `react-dom` | `^18 \|\| ^19` | Yes |

## Usage

All Karm components are **client-only** (`"use client"` directives included).

```tsx
import { KanbanBoard } from '@devalok/shilp-sutra-karm/board'
import { TaskDetailPanel } from '@devalok/shilp-sutra-karm/tasks'
import { ChatPanel } from '@devalok/shilp-sutra-karm/chat'
import { AttendanceCTA, DailyBrief } from '@devalok/shilp-sutra-karm/dashboard'
import { ClientPortalHeader, ProjectCard } from '@devalok/shilp-sutra-karm/client'
import { AdminDashboard, BreakAdmin } from '@devalok/shilp-sutra-karm/admin'
```

## Component Inventory

### Board (`@devalok/shilp-sutra-karm/board`)

Drag-and-drop kanban board with sortable columns and task cards.

| Component | Description |
|-----------|-------------|
| `KanbanBoard` | Full kanban board with columns, drag-and-drop, and task management |
| `BoardColumn` | Single sortable column with task list and add-task action |
| `TaskCard` | Draggable task card with priority, labels, assignees, and due date |

### Tasks (`@devalok/shilp-sutra-karm/tasks`)

Task detail panel with tabbed content (conversation, files, subtasks, reviews, activity).

| Component | Description |
|-----------|-------------|
| `TaskDetailPanel` | Sheet-based task detail view with all tabs |
| `TaskProperties` | Editable task metadata (status, priority, assignees, dates) |
| `ConversationTab` | Threaded comments on a task |
| `FilesTab` | File attachments with upload and delete |
| `SubtasksTab` | Nested subtask list with create and status toggle |
| `ReviewTab` | Review request and approval workflow |
| `ActivityTab` | Audit log of task changes |

### Chat (`@devalok/shilp-sutra-karm/chat`)

AI-powered chat panel with streaming support and conversation history.

| Component | Description |
|-----------|-------------|
| `ChatPanel` | Full chat interface with conversation list and message area |
| `ChatInput` | Message input with agent selector and submit |
| `MessageList` | Scrollable message thread with markdown rendering |
| `ConversationList` | Sidebar list of past conversations |
| `StreamingText` | Animated streaming text display for AI responses |

### Dashboard (`@devalok/shilp-sutra-karm/dashboard`)

Employee-facing attendance and daily brief widgets.

| Component | Description |
|-----------|-------------|
| `AttendanceCTA` | Attendance marking card with status display |
| `DailyBrief` | Daily summary card with tasks, meetings, and announcements |

### Client (`@devalok/shilp-sutra-karm/client`)

Client portal components with brand accent theming.

| Component | Description |
|-----------|-------------|
| `ClientPortalHeader` | Portal header with org branding and user menu |
| `ProjectCard` | Project summary card for client-facing views |
| `AccentProvider` | CSS custom property provider for client brand colors |

### Admin (`@devalok/shilp-sutra-karm/admin`)

Admin dashboard, break/leave management, attendance tracking, and adjustments.

| Component | Description |
|-----------|-------------|
| `AdminDashboard` | Compound admin view with attendance overview, calendar, and associate detail |
| `BreakAdmin` | Compound break management panel (header, balance, breaks list, requests) |
| `BreakAdminHeader` | Filter bar for break admin |
| `BreakBalance` | Break balance summary table with edit |
| `Breaks` | Break list with edit and delete actions |
| `EditBreak` | Break edit dialog |
| `DeleteBreak` | Break delete confirmation dialog |
| `EditBreakBalance` | Balance adjustment dialog |
| `LeaveRequest` | Individual leave request card with approve/reject |
| `LeaveRequests` | Pending leave requests list |
| `AttendanceOverview` | Team attendance summary cards |
| `AssociateDetail` | Individual associate detail with attendance, tasks, and breaks |
| `DashboardHeader` | Admin dashboard header with date and user selector |
| `Calendar` | Monthly attendance calendar with day status |
| `CorrectionList` | Attendance correction requests list |
| `RenderDate` | Date display utility component |
| `ApprovedAdjustments` | Approved break adjustment history table |
| `BreakAdminSkeleton` | Loading skeleton for BreakAdmin |
| `DashboardSkeleton` | Loading skeleton for AdminDashboard |
| `renderAdjustmentType` | Utility to render adjustment type labels |

## Sub-path Exports

| Import path | Contents |
|-------------|----------|
| `@devalok/shilp-sutra-karm` | All domain components (barrel) |
| `@devalok/shilp-sutra-karm/board` | Kanban board with drag-and-drop |
| `@devalok/shilp-sutra-karm/tasks` | Task detail panel, properties, tabs |
| `@devalok/shilp-sutra-karm/chat` | AI chat panel, message list, streaming |
| `@devalok/shilp-sutra-karm/dashboard` | Attendance CTA, daily brief |
| `@devalok/shilp-sutra-karm/client` | Client portal (accent provider, header, project card) |
| `@devalok/shilp-sutra-karm/admin` | Admin dashboard, break management, adjustments |

## Tailwind Content

Add Karm's dist to your Tailwind content array:

```ts
// tailwind.config.ts
content: [
  // ...your app files
  './node_modules/@devalok/shilp-sutra-karm/dist/**/*.js',
],
```

## License

MIT -- Copyright 2026 Devalok Design & Strategy Studios
