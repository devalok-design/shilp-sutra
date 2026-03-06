# @devalok/shilp-sutra-karm

Domain components for project management -- board, tasks, chat, dashboard, client portal, and admin.

[![npm](https://img.shields.io/npm/v/@devalok/shilp-sutra-karm)](https://www.npmjs.com/package/@devalok/shilp-sutra-karm)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

## Install

```bash
pnpm add @devalok/shilp-sutra-karm @devalok/shilp-sutra
```

**Note:** `@devalok/shilp-sutra >=0.3.0` is a required peer dependency.

## Peer Dependencies

| Package | Version | Required |
|---------|---------|----------|
| `@devalok/shilp-sutra` | `>=0.3.0` | Yes |
| `react` | `^18 \|\| ^19` | Yes |
| `react-dom` | `^18 \|\| ^19` | Yes |

## Usage

All Karm components are **client-only** (`"use client"` directives included).

```tsx
import { KanbanBoard } from '@devalok/shilp-sutra-karm/board'
import { TaskDetailPanel } from '@devalok/shilp-sutra-karm/tasks'
import { ChatPanel } from '@devalok/shilp-sutra-karm/chat'
import { AttendanceCTA, DailyBrief } from '@devalok/shilp-sutra-karm/dashboard'
import { ClientHeader, ProjectCard } from '@devalok/shilp-sutra-karm/client'
import { AdminDashboard, BreakAdmin } from '@devalok/shilp-sutra-karm/admin'
```

## Sub-path Exports

| Import path | Contents |
|-------------|----------|
| `@devalok/shilp-sutra-karm` | All domain components |
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
