import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'
import { within, userEvent, expect, waitFor } from 'storybook/test'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from './dialog'
import { Button } from './button'
import { Input } from './input'
import { Label } from './label'

const meta: Meta<typeof Dialog> = {
  title: 'Components/Overlays/Dialog',
  component: Dialog,
  tags: ['autodocs', 'stable'],
}
export default meta
type Story = StoryObj<typeof Dialog>

export const Default: Story = {
  parameters: { chromatic: { delay: 500 } },
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="solid">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you are done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-ds-04 py-ds-04">
          <div className="flex flex-col gap-ds-02">
            <Label htmlFor="name">Name</Label>
            <Input id="name" defaultValue="Pedro Duarte" />
          </div>
          <div className="flex flex-col gap-ds-02">
            <Label htmlFor="username">Username</Label>
            <Input id="username" defaultValue="@peduarte" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button variant="solid">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: /open dialog/i })
    await userEvent.click(trigger)
    const body = within(document.body)
    await waitFor(() => {
      const dialog = body.getByRole('dialog')
      expect(dialog).toBeVisible()
      expect(within(dialog).getByText('Edit Profile')).toBeVisible()
    })
  },
}

export const Confirmation: Story = {
  parameters: { chromatic: { delay: 500 } },
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="solid" color="error">Delete Account</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button variant="solid" color="error">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Open the confirmation dialog
    await userEvent.click(canvas.getByRole('button', { name: /delete account/i }))
    const body = within(document.body)
    await waitFor(() => {
      const dialog = body.getByRole('dialog')
      expect(dialog).toBeVisible()
      expect(within(dialog).getByText('Are you sure?')).toBeVisible()
    })

    // Close the dialog via the Cancel button
    const dialog = body.getByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: /cancel/i }))

    // Wait for exit animation to complete and dialog to be removed from DOM
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull())
  },
}

export const SimpleMessage: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Show Info</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Information</DialogTitle>
          <DialogDescription>
            Your changes have been saved successfully. You can continue working on your project.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="solid">Got it</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const MobileFullScreen: Story = {
  globals: { viewport: 'mobile' },
  render: function Render() {
    const [open, setOpen] = React.useState(false)
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="solid">Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mobile Full Screen</DialogTitle>
            <DialogDescription>
              On mobile viewports, this dialog fills the entire screen with a slide-up animation.
            </DialogDescription>
          </DialogHeader>
          <div className="py-ds-05">
            <p className="text-surface-fg-muted">Content area expands to fill the viewport.</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  },
}
