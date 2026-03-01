import type { Meta, StoryObj } from '@storybook/react'
import { within, userEvent, expect } from '@storybook/test'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'

const meta: Meta<typeof Tabs> = {
  title: 'UI/Navigation/Tabs',
  component: Tabs,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Tabs>

export const Line: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-full max-w-lg">
      <TabsList variant="line">
        <TabsTrigger value="overview" variant="line">Overview</TabsTrigger>
        <TabsTrigger value="tasks" variant="line">Tasks</TabsTrigger>
        <TabsTrigger value="settings" variant="line">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Project overview and summary information.
        </p>
      </TabsContent>
      <TabsContent value="tasks">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Task list and kanban board view.
        </p>
      </TabsContent>
      <TabsContent value="settings">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Project configuration and permissions.
        </p>
      </TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Verify initial tab content is visible
    await expect(canvas.getByText('Project overview and summary information.')).toBeVisible()
    // Click the "Tasks" tab
    const tasksTab = canvas.getByRole('tab', { name: /tasks/i })
    await userEvent.click(tasksTab)
    // Verify the tasks content is now visible
    await expect(canvas.getByText('Task list and kanban board view.')).toBeVisible()
  },
}

export const Contained: Story = {
  render: () => (
    <Tabs defaultValue="all" className="w-full max-w-lg">
      <TabsList variant="contained">
        <TabsTrigger value="all" variant="contained">All</TabsTrigger>
        <TabsTrigger value="active" variant="contained">Active</TabsTrigger>
        <TabsTrigger value="archived" variant="contained">Archived</TabsTrigger>
      </TabsList>
      <TabsContent value="all">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Showing all items.
        </p>
      </TabsContent>
      <TabsContent value="active">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Showing active items only.
        </p>
      </TabsContent>
      <TabsContent value="archived">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Showing archived items only.
        </p>
      </TabsContent>
    </Tabs>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-full max-w-lg">
      <TabsList variant="line">
        <TabsTrigger value="tab1" variant="line">Enabled</TabsTrigger>
        <TabsTrigger value="tab2" variant="line" disabled>Disabled</TabsTrigger>
        <TabsTrigger value="tab3" variant="line">Also Enabled</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p className="text-sm text-[var(--color-text-secondary)]">First tab content.</p>
      </TabsContent>
      <TabsContent value="tab3">
        <p className="text-sm text-[var(--color-text-secondary)]">Third tab content.</p>
      </TabsContent>
    </Tabs>
  ),
}

export const ManyTabs: Story = {
  render: () => (
    <Tabs defaultValue="board" className="w-full max-w-2xl">
      <TabsList variant="line">
        <TabsTrigger value="board" variant="line">Board</TabsTrigger>
        <TabsTrigger value="list" variant="line">List</TabsTrigger>
        <TabsTrigger value="timeline" variant="line">Timeline</TabsTrigger>
        <TabsTrigger value="calendar" variant="line">Calendar</TabsTrigger>
        <TabsTrigger value="files" variant="line">Files</TabsTrigger>
      </TabsList>
      <TabsContent value="board">
        <p className="text-sm text-[var(--color-text-secondary)]">Kanban board view.</p>
      </TabsContent>
      <TabsContent value="list">
        <p className="text-sm text-[var(--color-text-secondary)]">List view.</p>
      </TabsContent>
      <TabsContent value="timeline">
        <p className="text-sm text-[var(--color-text-secondary)]">Timeline/Gantt view.</p>
      </TabsContent>
      <TabsContent value="calendar">
        <p className="text-sm text-[var(--color-text-secondary)]">Calendar view.</p>
      </TabsContent>
      <TabsContent value="files">
        <p className="text-sm text-[var(--color-text-secondary)]">Project files.</p>
      </TabsContent>
    </Tabs>
  ),
}
