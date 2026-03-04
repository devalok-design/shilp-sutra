import type { Meta, StoryObj } from '@storybook/react'
import AttendanceCTA from './attendance-cta'

const meta: Meta<typeof AttendanceCTA> = {
  title: 'Karm/Dashboard/AttendanceCTA',
  component: AttendanceCTA,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 720 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    onMarkAttendance: { action: 'markAttendance' },
  },
}
export default meta
type Story = StoryObj<typeof AttendanceCTA>

// ── Stories ─────────────────────────────────────────────────

export const Unmarked: Story = {
  name: 'Unmarked (Can Mark)',
  args: {
    userName: 'Mudit Sharma',
    attendance: null,
    canMarkAttendance: true,
  },
}

export const Submitting: Story = {
  name: 'Submitting (Marking in Progress)',
  args: {
    userName: 'Mudit Sharma',
    attendance: null,
    canMarkAttendance: true,
    isSubmitting: true,
  },
}

export const Marked: Story = {
  name: 'Marked Present',
  args: {
    userName: 'Priya Kapoor',
    attendance: {
      attendance: {
        id: 'att-001',
        status: 'PRESENT',
        timeIn: '2026-03-01T09:15:00+05:30',
        timeOut: null,
      },
      breakReason: null,
    },
    canMarkAttendance: false,
    formatTime: () => '09:15 am',
  },
}

export const MarkedEarlyMorning: Story = {
  name: 'Marked Present (Early Morning)',
  args: {
    userName: 'Rahul Verma',
    attendance: {
      attendance: {
        id: 'att-002',
        status: 'PRESENT',
        timeIn: '2026-03-01T07:30:00+05:30',
        timeOut: null,
      },
      breakReason: null,
    },
    canMarkAttendance: false,
    formatTime: () => '07:30 am',
  },
}

export const OnBreak: Story = {
  name: 'On Break',
  args: {
    userName: 'Anika Patel',
    attendance: {
      attendance: {
        id: 'att-003',
        status: 'BREAK',
        timeIn: '2026-03-01T09:00:00+05:30',
        timeOut: null,
      },
      breakReason: 'Lunch break',
    },
    canMarkAttendance: false,
  },
}

export const OnBreakNoReason: Story = {
  name: 'On Break (No Reason)',
  args: {
    userName: 'Sneha Joshi',
    attendance: {
      attendance: {
        id: 'att-004',
        status: 'BREAK',
        timeIn: '2026-03-01T09:00:00+05:30',
        timeOut: null,
      },
      breakReason: null,
    },
    canMarkAttendance: false,
  },
}

export const WindowClosed: Story = {
  name: 'Attendance Window Closed',
  args: {
    userName: 'Amit Kumar',
    attendance: null,
    canMarkAttendance: false,
  },
}

export const ShortFirstName: Story = {
  name: 'Short First Name',
  args: {
    userName: 'Dev',
    attendance: null,
    canMarkAttendance: true,
  },
}
