# Re: shilp-sutra-feedback.md — Response from design system team

Hi team, thanks for the detailed feedback doc. We've triaged all 14 items and shipped fixes for the real issues. Here's the breakdown:

## Fixed (shipping in next release)

| # | Issue | Fix |
|---|-------|-----|
| **1** | `getInitials` not exported (P0) | Now exported from `@devalok/shilp-sutra/composed`. Your `karm/tasks` imports will resolve correctly. |
| **3** | Button no `"default"` / `"destructive"` | Added as variant aliases. `variant="default"` → solid, `variant="destructive"` → solid+error. |
| **4** | Badge no `"secondary"` / `"destructive"` | Added as variant aliases. `variant="secondary"` → subtle, `variant="destructive"` → solid+error. |
| **7** | StatCard `label` vs `title` | `title` now accepted as alias for `label`. Either prop works. |
| **8** | Button `size="icon"` missing | Added as alias for `size="icon-md"`. |
| **9** | PriorityIndicator uppercase-only | Now accepts both `"HIGH"` and `"high"` (and all other priorities). |

## Already resolved in v0.6.0 (no action needed)

These items appear to be based on an earlier build. The current v0.6.0 already handles them:

| # | Issue | Current state |
|---|-------|---------------|
| **2** | StatusBadge status enum too narrow | Already has a `color` prop (success/warning/error/info/neutral) alongside `status` — use `<StatusBadge color="success" label="Present" />` for custom statuses. |
| **5** | CalendarGrid is only a date picker | Already has an `events` prop accepting `CalendarEvent[]` with `{ date, color?, label? }`. |
| **6** | Alert uses `color` not `variant` | Already uses the two-axis system: `variant` (subtle/filled/outline) + `color` (info/success/warning/error/neutral). |
| **10** | Tooltip requires 4 nested components | `SimpleTooltip` already exists: `import { SimpleTooltip } from '@devalok/shilp-sutra/composed/simple-tooltip'` — wraps the common case. |
| **11** | NavItem icon expects ComponentType | Already typed as `React.ReactNode` — pass `<IconDashboard />` directly. |
| **12** | PageHeader title required with breadcrumbs | `title` is already optional (`title?: string`). |
| **13** | No event calendar | `ScheduleView` is available from `@devalok/shilp-sutra/composed/schedule-view`, and `CalendarGrid` supports `events`. |

## Tracked for future (P3)

| # | Issue | Status |
|---|-------|--------|
| **14** | No data table with sorting/filtering | On the roadmap. For now, use the base `Table` components with your own sorting logic. |

Let us know if you hit any other issues after updating!
