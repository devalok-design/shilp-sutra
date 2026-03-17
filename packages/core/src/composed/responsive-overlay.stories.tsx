import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ResponsiveOverlay } from './responsive-overlay'
import { Button } from '../ui/button'

const meta: Meta<typeof ResponsiveOverlay> = {
  title: 'Composed/ResponsiveOverlay',
  component: ResponsiveOverlay,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}
export default meta
type Story = StoryObj<typeof ResponsiveOverlay>

function DefaultDemo() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open overlay</Button>
      <ResponsiveOverlay
        open={open}
        onOpenChange={setOpen}
        title="Confirm Changes"
        description="Are you sure you want to save these changes? This action cannot be undone."
      >
        <div className="p-ds-06 space-y-ds-04">
          <p className="text-ds-sm text-surface-fg">
            You have unsaved changes to the project settings. Saving will overwrite the current configuration.
          </p>
          <div className="flex justify-end gap-ds-03">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="solid" onClick={() => setOpen(false)}>Save changes</Button>
          </div>
        </div>
      </ResponsiveOverlay>
    </>
  )
}

export const Default: Story = {
  render: () => <DefaultDemo />,
}
