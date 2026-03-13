import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ConfirmDialog } from './confirm-dialog'
import { Button } from '../ui/button'

const meta: Meta<typeof ConfirmDialog> = {
  title: 'Composed/ConfirmDialog',
  component: ConfirmDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '**Package:** `@devalok/shilp-sutra` · A pre-built confirmation dialog with title, description, and confirm/cancel buttons.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof ConfirmDialog>

function ConfirmDialogDemo({ color = 'default' }: { color?: 'default' | 'error' }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        {color === 'error' ? 'Delete item' : 'Confirm action'}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={color === 'error' ? 'Delete this item?' : 'Confirm action'}
        description={
          color === 'error'
            ? 'This action cannot be undone. The item will be permanently deleted.'
            : 'Are you sure you want to proceed with this action?'
        }
        color={color}
        confirmText={color === 'error' ? 'Delete' : 'Confirm'}
        onConfirm={() => setOpen(false)}
      />
    </>
  )
}

export const Default: Story = {
  render: () => <ConfirmDialogDemo />,
}

export const Destructive: Story = {
  render: () => <ConfirmDialogDemo color="error" />,
}
