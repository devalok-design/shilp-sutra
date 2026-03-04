import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { CorrectionList, type AttendanceCorrection } from './correction-list'
import type { AdminUser } from '../types'

// ============================================================
// Mock Data
// ============================================================

const mockUsers: AdminUser[] = [
  {
    id: 'u1',
    name: 'Arjun Mehta',
    firstName: 'Arjun',
    lastName: 'Mehta',
    email: 'arjun@example.com',
    designation: 'Senior Developer',
    image: null,
    role: 'Associate',
    isActive: true,
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'u2',
    name: 'Priya Sharma',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya@example.com',
    designation: 'Designer',
    image: null,
    role: 'Associate',
    isActive: true,
    createdAt: '2024-02-01T00:00:00Z',
  },
  {
    id: 'u3',
    name: 'Kavita Reddy',
    firstName: 'Kavita',
    lastName: 'Reddy',
    email: 'kavita@example.com',
    designation: 'Product Manager',
    image: null,
    role: 'Associate',
    isActive: true,
    createdAt: '2024-03-10T00:00:00Z',
  },
]

const mockCorrections: AttendanceCorrection[] = [
  {
    id: 'corr-1',
    date: '2026-03-01',
    reason: 'Forgot to clock in — was in office from 9 AM',
    requestedDate: '2026-03-02',
    correctionStatus: 'PENDING',
    user: mockUsers[0],
  },
  {
    id: 'corr-2',
    date: '2026-02-28',
    reason: 'System error during clock-out',
    requestedDate: '2026-03-01',
    correctionStatus: 'PENDING',
    user: mockUsers[1],
  },
  {
    id: 'corr-3',
    date: '2026-02-27',
    reason: 'Worked remotely but forgot to mark attendance',
    requestedDate: '2026-02-28',
    correctionStatus: 'PENDING',
    user: mockUsers[2],
  },
]

const mockUserImages: Record<string, string> = {
  u1: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun',
  u2: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
  u3: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kavita',
}

// ============================================================
// Meta
// ============================================================

const meta = {
  title: 'Karm/Admin/Dashboard/CorrectionList',
  component: CorrectionList,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="w-[720px] rounded-lg border border-border bg-layer-01">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CorrectionList>

export default meta
type Story = StoryObj<typeof meta>

// ============================================================
// Stories
// ============================================================

/** Multiple pending corrections from different users */
export const Default: Story = {
  args: {
    corrections: mockCorrections,
    currentUserId: 'admin-1',
    userImages: mockUserImages,
    assetsBaseUrl: '',
    activeTimeFrame: 'weekly',
    onApproveCorrection: fn(),
    onRejectCorrection: fn(),
  },
}

/** Single correction request */
export const SingleCorrection: Story = {
  args: {
    corrections: [mockCorrections[0]],
    currentUserId: 'admin-1',
    userImages: mockUserImages,
    assetsBaseUrl: '',
    activeTimeFrame: 'weekly',
    onApproveCorrection: fn(),
    onRejectCorrection: fn(),
  },
}

/** Current user's own correction — approve/reject buttons are disabled */
export const OwnCorrection: Story = {
  args: {
    corrections: mockCorrections,
    currentUserId: 'u1',
    userImages: mockUserImages,
    assetsBaseUrl: '',
    activeTimeFrame: 'weekly',
    onApproveCorrection: fn(),
    onRejectCorrection: fn(),
  },
}

/** Empty state when no corrections are pending */
export const Empty: Story = {
  args: {
    corrections: [],
    currentUserId: 'admin-1',
    userImages: {},
    assetsBaseUrl: '',
    activeTimeFrame: 'weekly',
  },
}
