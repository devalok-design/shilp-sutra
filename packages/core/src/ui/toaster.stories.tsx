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
      <div className="relative min-h-[350px]">
        <Story />
        <Toaster />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof Toaster>

const triggerClass =
  'rounded-ds-md border border-border bg-layer-01 px-ds-04 py-ds-02 text-ds-sm text-text-primary transition-colors hover:bg-layer-02 active:bg-layer-03'

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
      className={triggerClass}
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
          color: 'error',
          title: 'Deletion failed',
          description: 'Could not delete the resource. Please try again.',
        })
      }
      className={triggerClass}
    >
      Show Error Toast
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
      className={triggerClass}
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
        className={triggerClass}
      >
        Add Toast
      </button>
      <button
        type="button"
        onClick={() =>
          toast({
            color: 'error',
            title: 'Error occurred',
            description: 'An unexpected error happened.',
          })
        }
        className={triggerClass}
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
        className={triggerClass}
      >
        Default
      </button>
      <button
        type="button"
        onClick={() =>
          toast({
            color: 'success',
            title: 'Task complete',
            description: 'Task moved to "Done".',
          })
        }
        className={triggerClass}
      >
        Success
      </button>
      <button
        type="button"
        onClick={() =>
          toast({
            color: 'warning',
            title: 'Warning toast',
            description: 'Please review before proceeding.',
          })
        }
        className={triggerClass}
      >
        Warning
      </button>
      <button
        type="button"
        onClick={() =>
          toast({
            color: 'error',
            title: 'Error toast',
            description: 'Something went wrong.',
          })
        }
        className={triggerClass}
      >
        Error
      </button>
      <button
        type="button"
        onClick={() =>
          toast({
            color: 'info',
            title: 'Info toast',
            description: 'A new update is available.',
          })
        }
        className={triggerClass}
      >
        Info
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
        className={triggerClass}
      >
        With Action
      </button>
    </div>
  )
}

export const AllVariants: Story = {
  render: () => <AllVariantsDemo />,
}
