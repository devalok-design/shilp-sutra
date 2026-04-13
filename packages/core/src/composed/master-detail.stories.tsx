import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { MasterDetail } from './master-detail'

const meta: Meta<typeof MasterDetail> = {
  title: 'Patterns/MasterDetail',
  component: MasterDetail,
  tags: ['autodocs', 'stable'],
}
export default meta
type Story = StoryObj<typeof MasterDetail>

const users = [
  { id: '1', name: 'Aanya Patel', role: 'Frontend Engineer', email: 'aanya@example.com', joined: 'Jan 2024' },
  { id: '2', name: 'Rohan Sharma', role: 'Backend Engineer', email: 'rohan@example.com', joined: 'Mar 2024' },
  { id: '3', name: 'Priya Mehta', role: 'UX Designer', email: 'priya@example.com', joined: 'Feb 2024' },
  { id: '4', name: 'Vikram Singh', role: 'DevOps Lead', email: 'vikram@example.com', joined: 'Nov 2023' },
  { id: '5', name: 'Diya Gupta', role: 'Product Manager', email: 'diya@example.com', joined: 'Jun 2024' },
]

function DefaultDemo() {
  const [selected, setSelected] = useState<string | null>('1')
  const selectedUser = users.find((u) => u.id === selected)

  return (
    <MasterDetail
      selected={selected}
      onBack={() => setSelected(null)}
      className="h-[400px] border border-surface-border rounded-ds-lg overflow-hidden"
    >
      <MasterDetail.List>
        {users.map((user) => (
          <MasterDetail.ListItem
            key={user.id}
            active={user.id === selected}
            onClick={() => setSelected(user.id)}
          >
            <div className="flex flex-col">
              <span className="font-semibold">{user.name}</span>
              <span className="text-ds-xs text-surface-fg-muted">{user.role}</span>
            </div>
          </MasterDetail.ListItem>
        ))}
      </MasterDetail.List>
      <MasterDetail.Detail>
        {selectedUser ? (
          <div className="p-ds-06 space-y-ds-04">
            <h2 className="text-ds-lg font-semibold text-surface-fg">{selectedUser.name}</h2>
            <div className="space-y-ds-02 text-ds-sm">
              <div><span className="text-surface-fg-muted">Role:</span> {selectedUser.role}</div>
              <div><span className="text-surface-fg-muted">Email:</span> {selectedUser.email}</div>
              <div><span className="text-surface-fg-muted">Joined:</span> {selectedUser.joined}</div>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-surface-fg-muted text-ds-sm">
            Select a user to view details
          </div>
        )}
      </MasterDetail.Detail>
    </MasterDetail>
  )
}

export const Default: Story = {
  render: () => <DefaultDemo />,
}

function NoSelectionDemo() {
  const [selected, setSelected] = useState<string | null>(null)
  const selectedUser = users.find((u) => u.id === selected)

  return (
    <MasterDetail
      selected={selected}
      onBack={() => setSelected(null)}
      className="h-[400px] border border-surface-border rounded-ds-lg overflow-hidden"
    >
      <MasterDetail.List>
        {users.map((user) => (
          <MasterDetail.ListItem
            key={user.id}
            active={user.id === selected}
            onClick={() => setSelected(user.id)}
          >
            <div className="flex flex-col">
              <span className="font-semibold">{user.name}</span>
              <span className="text-ds-xs text-surface-fg-muted">{user.role}</span>
            </div>
          </MasterDetail.ListItem>
        ))}
      </MasterDetail.List>
      <MasterDetail.Detail>
        {selectedUser ? (
          <div className="p-ds-06 space-y-ds-04">
            <h2 className="text-ds-lg font-semibold text-surface-fg">{selectedUser.name}</h2>
            <div className="space-y-ds-02 text-ds-sm">
              <div><span className="text-surface-fg-muted">Role:</span> {selectedUser.role}</div>
              <div><span className="text-surface-fg-muted">Email:</span> {selectedUser.email}</div>
              <div><span className="text-surface-fg-muted">Joined:</span> {selectedUser.joined}</div>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-surface-fg-muted text-ds-sm">
            Select a user to view details
          </div>
        )}
      </MasterDetail.Detail>
    </MasterDetail>
  )
}

export const NoSelection: Story = {
  render: () => <NoSelectionDemo />,
}
