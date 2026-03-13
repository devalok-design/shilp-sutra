import type { Meta, StoryObj } from '@storybook/react'
import { Toaster } from './toaster'
import { toast } from './toast'
import { Button } from './button'

const meta: Meta<typeof Toaster> = {
  title: 'UI/Feedback/Toaster',
  component: Toaster,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Toaster>

export const BottomRight: Story = {
  render: () => (
    <>
      <Button onClick={() => toast.success('Bottom-right (default)')}>
        Show Toast
      </Button>
      <Toaster position="bottom-right" />
    </>
  ),
}

export const TopCenter: Story = {
  render: () => (
    <>
      <Button onClick={() => toast.info('Top-center toast')}>
        Show Toast
      </Button>
      <Toaster position="top-center" />
    </>
  ),
}

export const WithCloseButton: Story = {
  render: () => (
    <>
      <Button onClick={() => toast.success('Has a close button')}>
        Show Toast
      </Button>
      <Toaster closeButton />
    </>
  ),
}

export const AllPositions: Story = {
  render: () => {
    const positions = [
      'top-left',
      'top-center',
      'top-right',
      'bottom-left',
      'bottom-center',
      'bottom-right',
    ] as const

    return (
      <>
        <div className="flex flex-wrap gap-ds-03">
          {positions.map((pos) => (
            <Button
              key={pos}
              variant="outline"
              onClick={() => toast.info(`Position: ${pos}`)}
            >
              {pos}
            </Button>
          ))}
        </div>
        <Toaster position="bottom-right" />
      </>
    )
  },
}
