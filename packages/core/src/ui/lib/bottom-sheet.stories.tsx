import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'
import { BottomSheet } from './bottom-sheet'
import { Button } from '../button'

const meta: Meta<typeof BottomSheet> = {
  title: 'Internal/BottomSheet',
  component: BottomSheet,
  tags: ['autodocs'],
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
}
export default meta
type Story = StoryObj<typeof BottomSheet>

export const Default: Story = {
  render: function Render() {
    const [open, setOpen] = React.useState(false)
    return (
      <>
        <Button variant="outline" onClick={() => setOpen(true)}>Open BottomSheet</Button>
        <BottomSheet open={open} onOpenChange={setOpen} title="Example Sheet">
          <h3 className="text-ds-lg font-semibold mb-ds-03">Bottom Sheet</h3>
          <p className="text-surface-fg-muted">Swipe down to dismiss, or tap the backdrop.</p>
        </BottomSheet>
      </>
    )
  },
}

export const NoDragHandle: Story = {
  render: function Render() {
    const [open, setOpen] = React.useState(false)
    return (
      <>
        <Button variant="outline" onClick={() => setOpen(true)}>Open</Button>
        <BottomSheet open={open} onOpenChange={setOpen} title="No Handle" dragHandle={false}>
          <p>No drag handle on this sheet.</p>
        </BottomSheet>
      </>
    )
  },
}
