import type { Meta, StoryObj } from '@storybook/react'
import { Toaster } from './toaster'
import { useToast } from '../hooks/use-toast'
import { ToastAction } from './toast'

const meta: Meta<typeof Toaster> = {
  title: 'UI/Feedback/Toaster',
  component: Toaster,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="min-h-[300px]">
        <Story />
        <Toaster />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof Toaster>

function DefaultToastDemo() {
  const { toast } = useToast()
  return (
    <button
      type="button"
      onClick={() =>
        toast({
          title: 'Changes saved',
          description: 'Your project settings have been updated.',
        })
      }
      className="rounded-ds-md border border-border px-ds-04 py-ds-02 text-[length:var(--font-size-sm)] text-text-primary hover:bg-layer-02 transition-colors"
    >
      Show Toast
    </button>
  )
}

export const Default: Story = {
  render: () => <DefaultToastDemo />,
}

function DestructiveToastDemo() {
  const { toast } = useToast()
  return (
    <button
      type="button"
      onClick={() =>
        toast({
          variant: 'destructive',
          title: 'Deletion failed',
          description: 'Could not delete the resource. Please try again.',
        })
      }
      className="rounded-ds-md border border-border px-ds-04 py-ds-02 text-[length:var(--font-size-sm)] text-text-primary hover:bg-layer-02 transition-colors"
    >
      Show Destructive Toast
    </button>
  )
}

export const Destructive: Story = {
  render: () => <DestructiveToastDemo />,
}

function WithActionDemo() {
  const { toast } = useToast()
  return (
    <button
      type="button"
      onClick={() =>
        toast({
          title: 'File moved to trash',
          description: '"quarterly-report.pdf" has been deleted.',
          action: <ToastAction altText="Undo deletion">Undo</ToastAction>,
        })
      }
      className="rounded-ds-md border border-border px-ds-04 py-ds-02 text-[length:var(--font-size-sm)] text-text-primary hover:bg-layer-02 transition-colors"
    >
      Show Toast with Action
    </button>
  )
}

export const WithAction: Story = {
  render: () => <WithActionDemo />,
}

function MultipleToastsDemo() {
  const { toast } = useToast()
  let count = 0
  return (
    <div className="flex gap-ds-03">
      <button
        type="button"
        onClick={() => {
          count++
          toast({
            title: `Notification ${count}`,
            description: `This is toast message number ${count}.`,
          })
        }}
        className="rounded-ds-md border border-border px-ds-04 py-ds-02 text-[length:var(--font-size-sm)] text-text-primary hover:bg-layer-02 transition-colors"
      >
        Add Toast
      </button>
      <button
        type="button"
        onClick={() =>
          toast({
            variant: 'destructive',
            title: 'Error occurred',
            description: 'An unexpected error happened.',
          })
        }
        className="rounded-ds-md border border-border px-ds-04 py-ds-02 text-[length:var(--font-size-sm)] text-text-primary hover:bg-layer-02 transition-colors"
      >
        Add Error Toast
      </button>
    </div>
  )
}

export const MultipleToasts: Story = {
  render: () => <MultipleToastsDemo />,
}

function AllVariantsDemo() {
  const { toast } = useToast()
  return (
    <div className="flex flex-wrap gap-ds-03">
      <button
        type="button"
        onClick={() =>
          toast({
            title: 'Default toast',
            description: 'A standard notification.',
          })
        }
        className="rounded-ds-md border border-border px-ds-04 py-ds-02 text-[length:var(--font-size-sm)] text-text-primary hover:bg-layer-02 transition-colors"
      >
        Default
      </button>
      <button
        type="button"
        onClick={() =>
          toast({
            variant: 'destructive',
            title: 'Destructive toast',
            description: 'Something went wrong.',
          })
        }
        className="rounded-ds-md border border-border px-ds-04 py-ds-02 text-[length:var(--font-size-sm)] text-text-primary hover:bg-layer-02 transition-colors"
      >
        Destructive
      </button>
      <button
        type="button"
        onClick={() =>
          toast({
            variant: 'karam',
            title: 'Karm toast',
            description: 'Task moved to "Done".',
          })
        }
        className="rounded-ds-md border border-border px-ds-04 py-ds-02 text-[length:var(--font-size-sm)] text-text-primary hover:bg-layer-02 transition-colors"
      >
        Karm
      </button>
      <button
        type="button"
        onClick={() =>
          toast({
            title: 'With action',
            description: 'Item archived.',
            action: <ToastAction altText="Undo archive">Undo</ToastAction>,
          })
        }
        className="rounded-ds-md border border-border px-ds-04 py-ds-02 text-[length:var(--font-size-sm)] text-text-primary hover:bg-layer-02 transition-colors"
      >
        With Action
      </button>
    </div>
  )
}

export const AllVariants: Story = {
  render: () => <AllVariantsDemo />,
}
