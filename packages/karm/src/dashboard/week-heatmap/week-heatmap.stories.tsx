import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { WeekHeatmap } from './week-heatmap'
import type { WeekDay } from './week-heatmap-context'

const meta: Meta = {
  title: 'Karm/Dashboard/WeekHeatmap',
  tags: ['autodocs', 'stable'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '**Package:** `@devalok/shilp-sutra-karm` · **Import:** `import { WeekHeatmap } from "@devalok/shilp-sutra-karm/dashboard"`\n\nA 7-day week strip showing daily task completion progress. Supports both a props shorthand and a composable compound pattern.',
      },
    },
  },
}
export default meta

// ── Mock data ──────────────────────────────────────────────

const TODAY = '2026-03-12' // Thursday

const mixedDays: WeekDay[] = [
  { date: '2026-03-09', completed: 3, total: 3 }, // Mon — all done
  { date: '2026-03-10', completed: 1, total: 3 }, // Tue — partial
  { date: '2026-03-11', completed: 0, total: 2 }, // Wed — nothing done
  { date: '2026-03-12', completed: 2, total: 4 }, // Thu — today
  { date: '2026-03-13', completed: 0, total: 3 }, // Fri — future
  { date: '2026-03-14', completed: 0, total: 0 }, // Sat — empty
  { date: '2026-03-15', completed: 0, total: 0 }, // Sun — empty
]

const allCompleteDays: WeekDay[] = [
  { date: '2026-03-09', completed: 2, total: 2 },
  { date: '2026-03-10', completed: 3, total: 3 },
  { date: '2026-03-11', completed: 1, total: 1 },
  { date: '2026-03-12', completed: 4, total: 4 },
  { date: '2026-03-13', completed: 2, total: 2 },
  { date: '2026-03-14', completed: 1, total: 1 },
  { date: '2026-03-15', completed: 3, total: 3 },
]

const mostlyEmptyDays: WeekDay[] = [
  { date: '2026-03-09', completed: 0, total: 0 },
  { date: '2026-03-10', completed: 2, total: 3 },
  { date: '2026-03-11', completed: 0, total: 0 },
  { date: '2026-03-12', completed: 1, total: 1 },
  { date: '2026-03-13', completed: 0, total: 0 },
  { date: '2026-03-14', completed: 0, total: 0 },
  { date: '2026-03-15', completed: 0, total: 0 },
]

// ── Stories ────────────────────────────────────────────────

type Story = StoryObj

/**
 * Default state with mixed completion — past complete, partial, missed;
 * today in progress; future days waiting; weekend empty.
 */
export const Default: Story = {
  render: () => (
    <div className="max-w-md">
      <WeekHeatmap days={mixedDays} today={TODAY} onDayClick={fn()} overdue={2} />
    </div>
  ),
}

/**
 * All 7 days at 100% completion. Shows the streak indicator.
 */
export const AllComplete: Story = {
  render: () => (
    <div className="max-w-md">
      <WeekHeatmap days={allCompleteDays} today={TODAY} onDayClick={fn()} />
    </div>
  ),
}

/**
 * Only 1-2 days with tasks; the rest are empty (weekends or days off).
 */
export const MostlyEmpty: Story = {
  render: () => (
    <div className="max-w-md">
      <WeekHeatmap days={mostlyEmptyDays} today={TODAY} onDayClick={fn()} />
    </div>
  ),
}

/**
 * Shows the overdue count in the summary.
 */
export const WithOverdue: Story = {
  render: () => (
    <div className="max-w-md">
      <WeekHeatmap days={mixedDays} today={TODAY} onDayClick={fn()} overdue={5} />
    </div>
  ),
}

/**
 * Composable arrangement — pick and choose which sub-components to render.
 */
export const Composable: Story = {
  render: () => (
    <div className="max-w-md space-y-4">
      <WeekHeatmap.Root days={mixedDays} today={TODAY} onDayClick={fn()} overdue={2}>
        <WeekHeatmap.DayStrip />
        <WeekHeatmap.Streak />
        <div className="flex items-center justify-between">
          <WeekHeatmap.Summary />
        </div>
        <WeekHeatmap.ProgressBar />
      </WeekHeatmap.Root>
    </div>
  ),
}
