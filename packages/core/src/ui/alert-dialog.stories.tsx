import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { within, userEvent, expect, waitFor } from 'storybook/test'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog'
import { Button } from './button'

const meta: Meta<typeof AlertDialog> = {
  title: 'UI/Feedback/AlertDialog',
  component: AlertDialog,
  tags: ['autodocs', 'stable'],
}
export default meta
type Story = StoryObj<typeof AlertDialog>

export const Default: Story = {
  parameters: { chromatic: { delay: 500 } },
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="solid">Open Alert Dialog</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: /open alert dialog/i })
    await userEvent.click(trigger)
    const body = within(document.body)
    await waitFor(() => {
      const dialog = body.getByRole('alertdialog')
      expect(dialog).toBeVisible()
      expect(within(dialog).getByText('Are you absolutely sure?')).toBeVisible()
    })
  },
}

export const MobileResponsive: Story = {
  globals: { viewport: 'mobile' },
  render: function Render() {
    const [open, setOpen] = React.useState(false)
    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="solid">Open Alert</Button>
        </AlertDialogTrigger>
        <AlertDialogContent responsive>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm action</AlertDialogTitle>
            <AlertDialogDescription>
              On mobile viewports, this alert dialog slides up from the bottom and fills the screen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  },
}

export const Destructive: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="solid" color="error">Delete Item</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this item?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the selected item. This action cannot be
            reversed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction className="bg-error-9 text-accent-fg hover:bg-error-9">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
}
