import type { Meta, StoryObj } from '@storybook/react-vite'
import { within, userEvent, expect, waitFor } from 'storybook/test'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'

const meta: Meta<typeof Tabs> = {
  title: 'UI/Navigation/Tabs',
  component: Tabs,
  tags: ['autodocs', 'stable'],
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
        <p className="text-ds-sm text-surface-fg-muted">
          Project overview and summary information.
        </p>
      </TabsContent>
      <TabsContent value="tasks">
        <p className="text-ds-sm text-surface-fg-muted">
          Task list and kanban board view.
        </p>
      </TabsContent>
      <TabsContent value="settings">
        <p className="text-ds-sm text-surface-fg-muted">
          Project configuration and permissions.
        </p>
      </TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Wait for initial tab content animation
    await waitFor(() => expect(canvas.getByText('Project overview and summary information.')).toBeVisible())
    // Click the "Tasks" tab
    const tasksTab = canvas.getByRole('tab', { name: /tasks/i })
    await userEvent.click(tasksTab)
    // Wait for new tab content animation
    await waitFor(() => expect(canvas.getByText('Task list and kanban board view.')).toBeVisible())
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
        <p className="text-ds-sm text-surface-fg-muted">
          Showing all items.
        </p>
      </TabsContent>
      <TabsContent value="active">
        <p className="text-ds-sm text-surface-fg-muted">
          Showing active items only.
        </p>
      </TabsContent>
      <TabsContent value="archived">
        <p className="text-ds-sm text-surface-fg-muted">
          Showing archived items only.
        </p>
      </TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Wait for initial tab content animation
    await waitFor(() => expect(canvas.getByText('Showing all items.')).toBeVisible())

    // Click the "Archived" tab
    await userEvent.click(canvas.getByRole('tab', { name: /archived/i }))
    await waitFor(() => expect(canvas.getByText('Showing archived items only.')).toBeVisible())

    // Click the "Active" tab
    await userEvent.click(canvas.getByRole('tab', { name: /active/i }))
    await waitFor(() => expect(canvas.getByText('Showing active items only.')).toBeVisible())
  },
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
        <p className="text-ds-sm text-surface-fg-muted">First tab content.</p>
      </TabsContent>
      <TabsContent value="tab3">
        <p className="text-ds-sm text-surface-fg-muted">Third tab content.</p>
      </TabsContent>
    </Tabs>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-08 w-full max-w-lg">
      <div>
        <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">Small</p>
        <Tabs defaultValue="overview">
          <TabsList variant="line" size="sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <p className="text-ds-sm text-surface-fg-muted">Small line tabs.</p>
          </TabsContent>
        </Tabs>
      </div>
      <div>
        <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">Medium (default)</p>
        <Tabs defaultValue="overview">
          <TabsList variant="line" size="md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <p className="text-ds-sm text-surface-fg-muted">Medium line tabs.</p>
          </TabsContent>
        </Tabs>
      </div>
      <div>
        <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">Large</p>
        <Tabs defaultValue="overview">
          <TabsList variant="line" size="lg">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <p className="text-ds-sm text-surface-fg-muted">Large line tabs.</p>
          </TabsContent>
        </Tabs>
      </div>
      <div>
        <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">Contained — Small / Medium / Large</p>
        <div className="flex flex-col gap-ds-05">
          <Tabs defaultValue="all">
            <TabsList variant="contained" size="sm">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
          </Tabs>
          <Tabs defaultValue="all">
            <TabsList variant="contained" size="md">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
          </Tabs>
          <Tabs defaultValue="all">
            <TabsList variant="contained" size="lg">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </div>
  ),
}

export const Colors: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-08 w-full max-w-lg">
      <div>
        <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">Accent (default)</p>
        <Tabs defaultValue="overview">
          <TabsList variant="line" color="accent">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <p className="text-ds-sm text-surface-fg-muted">Accent color — active tab uses accent tokens.</p>
          </TabsContent>
        </Tabs>
      </div>
      <div>
        <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">Neutral</p>
        <Tabs defaultValue="overview">
          <TabsList variant="line" color="neutral">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <p className="text-ds-sm text-surface-fg-muted">Neutral color — active tab uses surface-fg tokens.</p>
          </TabsContent>
        </Tabs>
      </div>
      <div>
        <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">Contained — Accent vs Neutral</p>
        <div className="flex flex-col gap-ds-05">
          <Tabs defaultValue="all">
            <TabsList variant="contained" color="accent">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
            </TabsList>
          </Tabs>
          <Tabs defaultValue="all">
            <TabsList variant="contained" color="neutral">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </div>
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
        <p className="text-ds-sm text-surface-fg-muted">Kanban board view.</p>
      </TabsContent>
      <TabsContent value="list">
        <p className="text-ds-sm text-surface-fg-muted">List view.</p>
      </TabsContent>
      <TabsContent value="timeline">
        <p className="text-ds-sm text-surface-fg-muted">Timeline/Gantt view.</p>
      </TabsContent>
      <TabsContent value="calendar">
        <p className="text-ds-sm text-surface-fg-muted">Calendar view.</p>
      </TabsContent>
      <TabsContent value="files">
        <p className="text-ds-sm text-surface-fg-muted">Project files.</p>
      </TabsContent>
    </Tabs>
  ),
}
