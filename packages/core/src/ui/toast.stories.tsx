import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { toast } from './toast'
import type { UploadFile } from './toast-types'
import { Toaster } from './toaster'
import { Button } from './button'

const meta: Meta = {
  title: 'UI/Feedback/Toast',
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <>
        <Story />
        <Toaster />
      </>
    ),
  ],
}
export default meta
type Story = StoryObj

/* ---------------------------------------------------------------------------
 * Basic types
 * ------------------------------------------------------------------------ */

export const Default: Story = {
  render: () => {
    return (
      <Button onClick={() => toast('Something happened')}>
        Show Default Toast
      </Button>
    )
  },
}

export const Success: Story = {
  render: () => {
    return (
      <Button onClick={() => toast.success('Changes saved successfully')}>
        Show Success Toast
      </Button>
    )
  },
}

export const Error: Story = {
  render: () => {
    return (
      <Button onClick={() => toast.error('Failed to save changes')}>
        Show Error Toast
      </Button>
    )
  },
}

export const Warning: Story = {
  render: () => {
    return (
      <Button onClick={() => toast.warning('Connection unstable')}>
        Show Warning Toast
      </Button>
    )
  },
}

export const Info: Story = {
  render: () => {
    return (
      <Button onClick={() => toast.info('New version available')}>
        Show Info Toast
      </Button>
    )
  },
}

export const Loading: Story = {
  render: () => {
    return (
      <Button onClick={() => toast.loading('Processing...')}>
        Show Loading Toast
      </Button>
    )
  },
}

/* ---------------------------------------------------------------------------
 * Action patterns
 * ------------------------------------------------------------------------ */

export const WithAction: Story = {
  render: () => {
    return (
      <Button
        onClick={() =>
          toast('File deleted', {
            action: { label: 'Undo', onClick: () => toast.success('File restored') },
          })
        }
      >
        Show Toast with Action
      </Button>
    )
  },
}

export const WithActionAndCancel: Story = {
  render: () => {
    return (
      <Button
        onClick={() =>
          toast('Discard unsaved changes?', {
            action: { label: 'Discard', onClick: () => toast.success('Changes discarded') },
            cancel: { label: 'Cancel', onClick: () => toast('Cancelled') },
          })
        }
      >
        Show Toast with Action & Cancel
      </Button>
    )
  },
}

export const UndoPattern: Story = {
  render: () => {
    return (
      <Button
        onClick={() =>
          toast.undo('Break request deleted', {
            onUndo: () => toast.success('Break request restored'),
          })
        }
      >
        Show Undo Toast
      </Button>
    )
  },
}

/* ---------------------------------------------------------------------------
 * Promise
 * ------------------------------------------------------------------------ */

export const PromiseToast: Story = {
  render: () => {
    return (
      <Button
        onClick={() =>
          toast.promise(
            new Promise<void>((resolve) => setTimeout(resolve, 2000)),
            {
              loading: 'Saving...',
              success: 'Saved!',
              error: 'Failed to save',
            },
          )
        }
      >
        Show Promise Toast
      </Button>
    )
  },
}

export const PromiseToastError: Story = {
  render: () => {
    return (
      <Button
        variant="destructive"
        onClick={() =>
          toast.promise(
            new Promise<void>((_resolve, reject) => setTimeout(() => reject(new Error('Network error')), 2000)),
            {
              loading: 'Saving...',
              success: 'Saved!',
              error: 'Failed to save',
            },
          )
        }
      >
        Show Promise Toast (Error)
      </Button>
    )
  },
}

/* ---------------------------------------------------------------------------
 * Upload — single file
 * ------------------------------------------------------------------------ */

function UploadSingleDemo() {
  const [file, setFile] = React.useState<UploadFile>({
    id: '1',
    name: 'quarterly-report.pdf',
    size: 2_400_000,
    status: 'pending',
    progress: 0,
  })
  const toastId = React.useRef<string | undefined>(undefined)
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  const startUpload = () => {
    const initial: UploadFile = {
      id: '1',
      name: 'quarterly-report.pdf',
      size: 2_400_000,
      status: 'uploading',
      progress: 0,
    }
    setFile(initial)
    toastId.current = toast.upload({ id: toastId.current, files: [initial] })

    let progress = 0
    intervalRef.current = setInterval(() => {
      progress += 20
      if (progress >= 100) {
        clearInterval(intervalRef.current)
        const complete: UploadFile = { ...initial, status: 'complete', progress: 100 }
        setFile(complete)
        toast.upload({ id: toastId.current, files: [complete] })
      } else {
        const updated: UploadFile = { ...initial, status: 'uploading', progress }
        setFile(updated)
        toast.upload({ id: toastId.current, files: [updated] })
      }
    }, 500)
  }

  React.useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return (
    <div className="flex items-center gap-ds-03">
      <Button onClick={startUpload}>Upload Single File</Button>
      <span className="text-ds-sm text-surface-fg-muted">
        {file.status === 'pending'
          ? 'Click to start'
          : file.status === 'complete'
            ? 'Done!'
            : `${file.progress ?? 0}%`}
      </span>
    </div>
  )
}

export const UploadSingle: Story = {
  render: () => <UploadSingleDemo />,
}

/* ---------------------------------------------------------------------------
 * Upload — multiple files
 * ------------------------------------------------------------------------ */

function UploadMultipleDemo() {
  const initialFiles: UploadFile[] = [
    { id: '1', name: 'design-mockup.png', size: 3_200_000, status: 'pending', progress: 0 },
    { id: '2', name: 'meeting-notes.docx', size: 450_000, status: 'pending', progress: 0 },
    { id: '3', name: 'budget.xlsx', size: 1_100_000, status: 'pending', progress: 0 },
  ]

  const [files, setFiles] = React.useState<UploadFile[]>(initialFiles)
  const toastId = React.useRef<string | undefined>(undefined)
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  const startUpload = () => {
    const starting = initialFiles.map((f) => ({ ...f, status: 'uploading' as const, progress: 0 }))
    setFiles(starting)
    toastId.current = toast.upload({ id: toastId.current, files: starting })

    let tick = 0
    intervalRef.current = setInterval(() => {
      tick++
      setFiles((prev) => {
        const next = prev.map((f, i) => {
          if (f.status === 'complete' || f.status === 'error') return f
          const newProgress = Math.min(100, (f.progress ?? 0) + (20 + i * 10))
          // File 3 fails at ~60%
          if (i === 2 && tick >= 3) {
            return { ...f, status: 'error' as const, progress: 60, error: 'Network error' }
          }
          if (newProgress >= 100) {
            return { ...f, status: 'complete' as const, progress: 100 }
          }
          return { ...f, status: 'uploading' as const, progress: newProgress }
        })
        toast.upload({
          id: toastId.current,
          files: next,
          onRetry: (fileId) => toast.info(`Retrying ${fileId}`),
        })
        if (next.every((f) => f.status === 'complete' || f.status === 'error')) {
          clearInterval(intervalRef.current)
        }
        return next
      })
    }, 600)
  }

  React.useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return (
    <div className="flex items-center gap-ds-03">
      <Button onClick={startUpload}>Upload Multiple Files</Button>
      <span className="text-ds-sm text-surface-fg-muted">
        {files.filter((f) => f.status === 'complete').length}/{files.length} complete
      </span>
    </div>
  )
}

export const UploadMultiple: Story = {
  render: () => <UploadMultipleDemo />,
}

/* ---------------------------------------------------------------------------
 * Custom JSX
 * ------------------------------------------------------------------------ */

export const CustomJSX: Story = {
  render: () => {
    return (
      <Button
        onClick={() =>
          toast.custom((id) => (
            <div className="flex items-center gap-ds-03 rounded-ds-md border border-surface-border-strong bg-surface-1 p-ds-04 shadow-02">
              <span className="text-ds-md text-surface-fg">
                Custom content (id: {String(id)})
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.dismiss(id)}
              >
                Close
              </Button>
            </div>
          ))
        }
      >
        Show Custom Toast
      </Button>
    )
  },
}

/* ---------------------------------------------------------------------------
 * Gallery & stress tests
 * ------------------------------------------------------------------------ */

export const AllTypes: Story = {
  render: () => {
    const types = [
      { label: 'Default', fn: () => toast('Default message') },
      { label: 'Success', fn: () => toast.success('Success message') },
      { label: 'Error', fn: () => toast.error('Error message') },
      { label: 'Warning', fn: () => toast.warning('Warning message') },
      { label: 'Info', fn: () => toast.info('Info message') },
      { label: 'Loading', fn: () => toast.loading('Loading message') },
    ]
    return (
      <div className="flex flex-wrap gap-ds-03">
        {types.map(({ label, fn }) => (
          <Button key={label} variant="outline" onClick={fn}>
            {label}
          </Button>
        ))}
      </div>
    )
  },
}

export const Stacking: Story = {
  render: () => {
    return (
      <Button
        onClick={() => {
          toast('Toast 1')
          toast.success('Toast 2')
          toast.error('Toast 3')
          toast.warning('Toast 4')
          toast.info('Toast 5')
        }}
      >
        Fire 5 Toasts
      </Button>
    )
  },
}
