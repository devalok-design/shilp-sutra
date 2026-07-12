import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import {
  ResponsiveModal,
  ResponsiveModalBackground,
  ResponsiveModalBody,
  ResponsiveModalClose,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalTrigger,
} from './responsive-modal'

const meta: Meta<typeof ResponsiveModal> = {
  title: 'Patterns/ResponsiveModal',
  component: ResponsiveModal,
  tags: ['autodocs', 'stable'],
  parameters: {
    docs: {
      description: {
        component:
          'Centered Dialog on desktop (md+), partial bottom sheet on mobile (<768px). ' +
          'Resize the preview below 768px to switch modes. On mobile: drag the handle to ' +
          'dismiss, or set `snapPoints` for iOS-style detents.',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof ResponsiveModal>

const fields = (
  <div className="flex flex-col gap-ds-04">
    <div className="flex flex-col gap-ds-02">
      <Label htmlFor="rm-name">Name</Label>
      <Input id="rm-name" defaultValue="Ada Lovelace" />
    </div>
    <div className="flex flex-col gap-ds-02">
      <Label htmlFor="rm-email">Email</Label>
      <Input id="rm-email" type="email" defaultValue="ada@example.com" />
    </div>
  </div>
)

export const Default: Story = {
  render: () => (
    <ResponsiveModal>
      <ResponsiveModalTrigger asChild>
        <Button>Edit profile</Button>
      </ResponsiveModalTrigger>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Edit profile</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Update your details. Changes save when you apply.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>
        <ResponsiveModalBody>{fields}</ResponsiveModalBody>
        <ResponsiveModalFooter>
          <ResponsiveModalClose asChild>
            <Button variant="soft">Cancel</Button>
          </ResponsiveModalClose>
          <Button>Apply</Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  ),
}

/**
 * A long body scrolls inside the panel while the header and footer stay pinned —
 * the height caps at 85dvh (desktop) / 90dvh (mobile).
 */
export const ScrollingBody: Story = {
  render: () => (
    <ResponsiveModal>
      <ResponsiveModalTrigger asChild>
        <Button>Terms</Button>
      </ResponsiveModalTrigger>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Terms of service</ResponsiveModalTitle>
          <ResponsiveModalDescription>Please review before continuing.</ResponsiveModalDescription>
        </ResponsiveModalHeader>
        <ResponsiveModalBody>
          <div className="flex flex-col gap-ds-04 text-ds-md text-surface-fg-muted">
            {Array.from({ length: 20 }, (_, i) => (
              <p key={i}>
                Section {i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            ))}
          </div>
        </ResponsiveModalBody>
        <ResponsiveModalFooter>
          <ResponsiveModalClose asChild>
            <Button variant="soft">Decline</Button>
          </ResponsiveModalClose>
          <Button>Accept</Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  ),
}

/**
 * `snapPoints={[0.4, 0.9]}` makes the mobile sheet rest at 40% or 90% of the
 * viewport; drag between them, or below 40% to dismiss. On desktop the prop is
 * ignored (always a centered Dialog).
 */
export const WithSnapPoints: Story = {
  render: () => (
    <ResponsiveModal>
      <ResponsiveModalTrigger asChild>
        <Button>Open picker</Button>
      </ResponsiveModalTrigger>
      <ResponsiveModalContent snapPoints={[0.4, 0.9]} defaultSnapPoint={0}>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Choose a slot</ResponsiveModalTitle>
        </ResponsiveModalHeader>
        <ResponsiveModalBody>
          <div className="flex flex-col gap-ds-02">
            {Array.from({ length: 12 }, (_, i) => (
              <Button key={i} variant="soft" fullWidth>
                {9 + i}:00
              </Button>
            ))}
          </div>
        </ResponsiveModalBody>
      </ResponsiveModalContent>
    </ResponsiveModal>
  ),
}

/**
 * `dismissable={false}` removes the close button and blocks Escape / outside-click
 * / drag-dismiss — the modal only closes through your own action.
 */
export const NonDismissable: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Start task</Button>
        <ResponsiveModal open={open} onOpenChange={setOpen} dismissable={false}>
          <ResponsiveModalContent>
            <ResponsiveModalHeader>
              <ResponsiveModalTitle>Working…</ResponsiveModalTitle>
              <ResponsiveModalDescription>This cannot be interrupted.</ResponsiveModalDescription>
            </ResponsiveModalHeader>
            <ResponsiveModalBody>Processing your request.</ResponsiveModalBody>
            <ResponsiveModalFooter>
              <Button onClick={() => setOpen(false)}>Force close</Button>
            </ResponsiveModalFooter>
          </ResponsiveModalContent>
        </ResponsiveModal>
      </>
    )
  },
}

/**
 * `ResponsiveModalBackground` paints a full-bleed layer behind the content
 * (`-z-10`, clipped to the panel radius) — a gradient here; render an aurora,
 * image, or canvas in real use. The close button and body still sit above it.
 */
export const WithBackground: Story = {
  render: () => (
    <ResponsiveModal>
      <ResponsiveModalTrigger asChild>
        <Button>Celebrate</Button>
      </ResponsiveModalTrigger>
      <ResponsiveModalContent>
        <ResponsiveModalBackground className="bg-linear-to-br from-accent-3 to-accent-6 opacity-40" />
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>You did it!</ResponsiveModalTitle>
          <ResponsiveModalDescription>All tasks complete for today.</ResponsiveModalDescription>
        </ResponsiveModalHeader>
        <ResponsiveModalBody>Nice work. Take a break.</ResponsiveModalBody>
        <ResponsiveModalFooter>
          <ResponsiveModalClose asChild>
            <Button>Done</Button>
          </ResponsiveModalClose>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  ),
}
