import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Toaster, type ToasterProps } from './toaster'
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

function AllPositionsDemo() {
  const positions: ToasterProps['position'][] = [
    'top-left',
    'top-center',
    'top-right',
    'bottom-left',
    'bottom-center',
    'bottom-right',
  ]

  const [position, setPosition] =
    React.useState<ToasterProps['position']>('bottom-right')

  return (
    <>
      <div className="flex flex-wrap gap-ds-03">
        {positions.map((pos) => (
          <Button
            key={pos}
            variant={pos === position ? 'default' : 'outline'}
            onClick={() => {
              setPosition(pos)
              toast.dismiss()
              setTimeout(() => toast.info(`Position: ${pos}`), 100)
            }}
          >
            {pos}
          </Button>
        ))}
      </div>
      <Toaster position={position} />
    </>
  )
}

export const AllPositions: Story = {
  render: () => <AllPositionsDemo />,
}
