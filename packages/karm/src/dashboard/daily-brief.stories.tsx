import type { Meta, StoryObj } from '@storybook/react'
import DailyBrief, { type BriefData } from './daily-brief'

const meta: Meta<typeof DailyBrief> = {
  title: 'Karm/Dashboard/DailyBrief',
  component: DailyBrief,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 640 }}>
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof DailyBrief>

// ── Mock data ──────────────────────────────────────────────

const TYPICAL_BRIEF: BriefData = {
  brief: [
    '**14 of 16** team members have marked attendance. Priya and Rahul are still pending.',
    '**Sprint 12** is on track — 8 of 22 tasks completed, 6 in progress. The `client-portal-redesign` epic has 3 tasks due this week.',
    'Amit Kumar has a **pending break request** (sick leave, 2 days). Needs approval before end of day.',
    'Sprint review meeting at **3:00 PM** today. All task owners should prepare a 2-minute status update.',
  ],
  generatedAt: new Date().toISOString(),
}

const SHORT_BRIEF: BriefData = {
  brief: [
    'All team members have marked attendance today.',
    'No pending break requests or approvals needed.',
  ],
  generatedAt: new Date().toISOString(),
}

const DETAILED_BRIEF: BriefData = {
  brief: [
    '**12 of 18** lokwasi have marked attendance. Reminders sent to: Priya Sharma, Rahul Verma, Anika Patel, Sneha Joshi, Dev Arora, Kavya Nair.',
    'Sprint 14 progress: **15 of 30 tasks** completed (50%). The team velocity is slightly below the 3-sprint average of 28 tasks.',
    '**3 tasks are stalled** for more than 48 hours: *Fix payment gateway timeout*, *Redesign onboarding flow*, *Update deployment scripts*. Consider checking in with the assignees.',
    '**2 break requests** pending: Amit Kumar (sick leave, Mar 3-4) and Sneha Joshi (personal, Mar 5). Both need approval.',
    'The `karm-v2` deployment to production is scheduled for **5:00 PM** today. Ensure all PRs are merged and staging tests pass before 3:00 PM.',
  ],
  generatedAt: new Date().toISOString(),
}

const BRIEF_WITH_MARKDOWN: BriefData = {
  brief: [
    'Check the [sprint board](/projects/proj-1/board) — there are **5 tasks** in the *Review* column that need attention.',
    'The `api.breaks.tsx` endpoint returned `501` errors yesterday. The fix in `attendance.service.ts` should be deployed today.',
    'New **Devsabha** standup notes are available. Key highlights: migration to Next.js discussed, timeline set for Q3.',
  ],
  generatedAt: new Date().toISOString(),
}

// ── Stories ─────────────────────────────────────────────────

export const Default: Story = {
  args: {
    data: TYPICAL_BRIEF,
  },
}

export const Loading: Story = {
  args: {
    data: null,
    loading: true,
  },
}

export const ShortBrief: Story = {
  name: 'Short Brief (2 Items)',
  args: {
    data: SHORT_BRIEF,
  },
}

export const DetailedBrief: Story = {
  name: 'Detailed Brief (5 Items)',
  args: {
    data: DETAILED_BRIEF,
  },
}

export const WithMarkdownLinks: Story = {
  name: 'With Markdown and Links',
  args: {
    data: BRIEF_WITH_MARKDOWN,
  },
}

export const NoData: Story = {
  name: 'No Data (Hidden)',
  args: {
    data: null,
    loading: false,
  },
}

export const EmptyBrief: Story = {
  name: 'Empty Brief Array (Hidden)',
  args: {
    data: { brief: [], generatedAt: new Date().toISOString() },
    loading: false,
  },
}

export const WithCustomClassName: Story = {
  name: 'With Custom className',
  args: {
    data: TYPICAL_BRIEF,
    className: 'border-2 border-border-interactive',
  },
}
