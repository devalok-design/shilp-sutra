import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { BulkActionBar } from './bulk-action-bar'
import { IconArchive, IconCopy, IconTag, IconTrash } from '@tabler/icons-react'

const meta: Meta<typeof BulkActionBar> = {
  title: 'Composed/BulkActionBar',
  component: BulkActionBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
}
export default meta
type Story = StoryObj<typeof BulkActionBar>

function DefaultDemo() {
  const [show, setShow] = useState(true)
  return (
    <div className="h-[300px] flex items-center justify-center">
      <button
        className="text-ds-sm text-accent-11 underline"
        onClick={() => setShow(!show)}
      >
        {show ? 'Hide bar' : 'Show bar'}
      </button>
      <BulkActionBar
        show={show}
        count={5}
        onClearSelection={() => setShow(false)}
        actions={[
          { label: 'Archive', icon: IconArchive, onClick: () => {} },
          { label: 'Duplicate', icon: IconCopy, onClick: () => {} },
          { label: 'Add label', icon: IconTag, onClick: () => {} },
        ]}
      />
    </div>
  )
}

export const Default: Story = {
  render: () => <DefaultDemo />,
}

function WithErrorActionDemo() {
  const [show, setShow] = useState(true)
  return (
    <div className="h-[300px] flex items-center justify-center">
      <button
        className="text-ds-sm text-accent-11 underline"
        onClick={() => setShow(!show)}
      >
        {show ? 'Hide bar' : 'Show bar'}
      </button>
      <BulkActionBar
        show={show}
        count={3}
        onClearSelection={() => setShow(false)}
        actions={[
          { label: 'Archive', icon: IconArchive, onClick: () => {} },
          { label: 'Duplicate', icon: IconCopy, onClick: () => {} },
          { label: 'Delete', icon: IconTrash, onClick: () => {}, color: 'error' },
        ]}
      />
    </div>
  )
}

export const WithErrorAction: Story = {
  render: () => <WithErrorActionDemo />,
}
