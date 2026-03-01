import type { Meta, StoryObj } from '@storybook/react'
import { EmptyState } from './empty-state'
import { Button } from './button'

const meta: Meta<typeof EmptyState> = {
  title: 'UI/Data Display/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
  },
}
export default meta
type Story = StoryObj<typeof EmptyState>

export const Default: Story = {
  args: {
    title: 'No projects found',
    description: 'Get started by creating your first project.',
  },
}

export const WithAction: Story = {
  args: {
    title: 'No tasks yet',
    description: 'Create your first task to get started with project management.',
    action: <Button variant="primary">Create Task</Button>,
  },
}

export const WithIllustration: Story = {
  args: {
    title: 'Inbox is empty',
    description: 'You have no unread notifications.',
    illustration: (
      <svg
        className="h-24 w-24 opacity-30"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
    ),
  },
}

export const TitleOnly: Story = {
  args: {
    title: 'Nothing here',
  },
}

export const FullExample: Story = {
  args: {
    title: 'No team members',
    description: 'Your team is empty. Invite colleagues to collaborate on projects.',
    illustration: (
      <svg
        className="h-20 w-20 opacity-30"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
    action: <Button variant="primary">Invite Team Members</Button>,
  },
}

export const SearchNoResults: Story = {
  args: {
    title: 'No results found',
    description: 'Try adjusting your search or filter to find what you are looking for.',
    action: <Button variant="ghost">Clear Filters</Button>,
  },
}
