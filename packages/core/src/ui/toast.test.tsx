import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { axe } from 'vitest-axe'
import { act } from 'react'
import { Toaster } from './toaster'
import {
  toast,
  ToastContent,
  UploadToastContent,
  UploadFileRow,
  TimerBar,
  formatFileSize,
} from './toast'
import type { UploadFile } from './toast-types'

/* ---------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------ */

function TestWrapper({ children }: { children?: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  )
}

afterEach(() => {
  // Dismiss all toasts between tests so they don't leak
  act(() => {
    toast.dismiss()
  })
})

/* ---------------------------------------------------------------------------
 * Rendering tests
 * ------------------------------------------------------------------------ */

describe('Toast — rendering', () => {
  it('renders a success toast with title', async () => {
    render(<TestWrapper />)
    act(() => {
      toast.success('Saved!')
    })
    await waitFor(() => {
      expect(screen.getByText('Saved!')).toBeVisible()
    })
  })

  it('renders an error toast with accent bar and icon', async () => {
    render(<TestWrapper />)
    act(() => {
      toast.error('Failed to save')
    })
    await waitFor(() => {
      expect(screen.getByText('Failed to save')).toBeVisible()
    })
    // Error toast should have role="status" and accent bar
    const status = screen.getAllByRole('status').find((el) =>
      el.textContent?.includes('Failed to save'),
    )
    expect(status).toBeDefined()
    // Accent bar is the first child div with bg-error-border
    const accentBar = status!.querySelector('.bg-error-border')
    expect(accentBar).toBeInTheDocument()
  })

  it('renders a warning toast', async () => {
    render(<TestWrapper />)
    act(() => {
      toast.warning('Disk space low')
    })
    await waitFor(() => {
      expect(screen.getByText('Disk space low')).toBeVisible()
    })
  })

  it('renders an info toast', async () => {
    render(<TestWrapper />)
    act(() => {
      toast.info('New version available')
    })
    await waitFor(() => {
      expect(screen.getByText('New version available')).toBeVisible()
    })
  })

  it('renders a plain message toast (no icon, no accent bar)', async () => {
    render(<TestWrapper />)
    act(() => {
      toast('Something happened')
    })
    await waitFor(() => {
      expect(screen.getByText('Something happened')).toBeVisible()
    })
    const status = screen.getAllByRole('status').find((el) =>
      el.textContent?.includes('Something happened'),
    )
    expect(status).toBeDefined()
    // Message type has no accent bar (accentClass is empty string)
    const accentBar = status!.querySelector(
      '.bg-success-border, .bg-error-border, .bg-warning-border, .bg-info-border, .bg-interactive',
    )
    expect(accentBar).toBeNull()
  })

  it('renders a loading toast with spinner', async () => {
    render(<TestWrapper />)
    act(() => {
      toast.loading('Saving...')
    })
    await waitFor(() => {
      expect(screen.getByText('Saving...')).toBeVisible()
    })
    // Loading icon should have animate-spin class
    const status = screen.getAllByRole('status').find((el) =>
      el.textContent?.includes('Saving...'),
    )
    expect(status).toBeDefined()
    const spinner = status!.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('renders toast with title and description', async () => {
    render(<TestWrapper />)
    act(() => {
      toast.success('File uploaded', { description: '3 files processed' })
    })
    await waitFor(() => {
      expect(screen.getByText('File uploaded')).toBeVisible()
      expect(screen.getByText('3 files processed')).toBeVisible()
    })
  })
})

/* ---------------------------------------------------------------------------
 * Accessibility tests
 * ------------------------------------------------------------------------ */

describe('Toast — accessibility', () => {
  it('toast has role="status" and aria-live="polite"', async () => {
    render(<TestWrapper />)
    act(() => {
      toast.success('A11y test')
    })
    await waitFor(() => {
      expect(screen.getByText('A11y test')).toBeVisible()
    })
    const status = screen.getAllByRole('status').find((el) =>
      el.textContent?.includes('A11y test'),
    )
    expect(status).toBeDefined()
    expect(status).toHaveAttribute('aria-live', 'polite')
  })

  it('no a11y violations for success toast', async () => {
    const { container } = render(
      <ToastContent type="success" title="Success toast" />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('no a11y violations for error toast', async () => {
    const { container } = render(
      <ToastContent type="error" title="Error toast" />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})

/* ---------------------------------------------------------------------------
 * Action button tests
 * ------------------------------------------------------------------------ */

describe('Toast — action buttons', () => {
  it('renders action button and fires onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <ToastContent
        type="success"
        title="Item deleted"
        action={{ label: 'Undo', onClick }}
      />,
    )
    const actionButton = screen.getByRole('button', { name: 'Undo' })
    expect(actionButton).toBeVisible()
    await user.click(actionButton)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('renders cancel button', () => {
    const onCancel = vi.fn()
    render(
      <ToastContent
        type="info"
        title="Confirm action"
        cancel={{ label: 'Dismiss', onClick: onCancel }}
      />,
    )
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeVisible()
  })

  it('renders both action and cancel buttons', () => {
    render(
      <ToastContent
        type="info"
        title="Changes detected"
        action={{ label: 'Save', onClick: vi.fn() }}
        cancel={{ label: 'Discard', onClick: vi.fn() }}
      />,
    )
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Discard' })).toBeVisible()
  })
})

/* ---------------------------------------------------------------------------
 * Upload toast tests
 * ------------------------------------------------------------------------ */

const baseFiles: UploadFile[] = [
  { id: '1', name: 'document.pdf', size: 1024 * 500, status: 'pending' },
  { id: '2', name: 'photo.jpg', size: 1024 * 1024 * 2, status: 'uploading', progress: 45 },
  { id: '3', name: 'report.xlsx', size: 1024 * 300, status: 'complete' },
  { id: '4', name: 'data.csv', size: 1024 * 100, status: 'error', error: 'Too large' },
]

describe('Toast — upload toast', () => {
  it('renders upload toast with file list', () => {
    render(
      <UploadToastContent files={baseFiles} />,
    )
    expect(screen.getByText('document.pdf')).toBeVisible()
    expect(screen.getByText('photo.jpg')).toBeVisible()
    expect(screen.getByText('report.xlsx')).toBeVisible()
    expect(screen.getByText('data.csv')).toBeVisible()
  })

  it('shows progress for uploading files', () => {
    const uploadingFiles: UploadFile[] = [
      { id: '1', name: 'file.txt', size: 1000, status: 'uploading', progress: 60 },
    ]
    render(<UploadToastContent files={uploadingFiles} />)
    expect(screen.getByText('60%')).toBeVisible()
  })

  it('shows complete status for finished files', () => {
    const completeFiles: UploadFile[] = [
      { id: '1', name: 'done.txt', size: 1000, status: 'complete' },
    ]
    render(<UploadToastContent files={completeFiles} />)
    expect(screen.getByText('Done')).toBeVisible()
    // Header should say "1 file uploaded"
    expect(screen.getByText('1 file uploaded')).toBeVisible()
  })

  it('shows error status with retry button', () => {
    const errorFiles: UploadFile[] = [
      { id: '1', name: 'broken.txt', size: 1000, status: 'error', error: 'Too large' },
    ]
    const onRetry = vi.fn()
    render(<UploadToastContent files={errorFiles} onRetry={onRetry} />)
    expect(screen.getByText('Too large')).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'Retry broken.txt' }),
    ).toBeVisible()
  })

  it('calls onRetry callback when retry clicked', async () => {
    const user = userEvent.setup()
    const errorFiles: UploadFile[] = [
      { id: 'f1', name: 'broken.txt', size: 1000, status: 'error', error: 'Timeout' },
    ]
    const onRetry = vi.fn()
    render(<UploadToastContent files={errorFiles} onRetry={onRetry} />)
    await user.click(screen.getByRole('button', { name: 'Retry broken.txt' }))
    expect(onRetry).toHaveBeenCalledOnce()
    expect(onRetry).toHaveBeenCalledWith('f1')
  })

  it('shows header with mixed complete and error counts', () => {
    const mixedFiles: UploadFile[] = [
      { id: '1', name: 'a.txt', size: 100, status: 'complete' },
      { id: '2', name: 'b.txt', size: 100, status: 'complete' },
      { id: '3', name: 'c.txt', size: 100, status: 'error', error: 'Fail' },
    ]
    render(<UploadToastContent files={mixedFiles} />)
    expect(screen.getByText('2 of 3 uploaded')).toBeVisible()
  })

  it('shows uploading header when files are in progress', () => {
    const inProgressFiles: UploadFile[] = [
      { id: '1', name: 'a.txt', size: 100, status: 'uploading', progress: 50 },
      { id: '2', name: 'b.txt', size: 100, status: 'pending' },
    ]
    render(<UploadToastContent files={inProgressFiles} />)
    expect(screen.getByText('Uploading 2 files')).toBeVisible()
    expect(screen.getByText('0 of 2 complete')).toBeVisible()
  })

  it('renders upload toast with aria-label', () => {
    render(<UploadToastContent files={baseFiles} />)
    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-label', 'File uploads')
  })
})

/* ---------------------------------------------------------------------------
 * UploadFileRow tests
 * ------------------------------------------------------------------------ */

describe('UploadFileRow', () => {
  it('shows cancel button for non-terminal files', () => {
    const onRemove = vi.fn()
    render(
      <UploadFileRow
        file={{ id: '1', name: 'test.txt', size: 100, status: 'uploading', progress: 10 }}
        onRemove={onRemove}
      />,
    )
    expect(
      screen.getByRole('button', { name: 'Cancel test.txt' }),
    ).toBeVisible()
  })

  it('does not show cancel button for complete files', () => {
    const onRemove = vi.fn()
    render(
      <UploadFileRow
        file={{ id: '1', name: 'test.txt', size: 100, status: 'complete' }}
        onRemove={onRemove}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Cancel test.txt' })).toBeNull()
  })

  it('shows file size for pending files', () => {
    render(
      <UploadFileRow
        file={{ id: '1', name: 'test.txt', size: 2048, status: 'pending' }}
      />,
    )
    expect(screen.getByText('2.0 KB')).toBeVisible()
  })

  it('shows "Failed" for error without message', () => {
    render(
      <UploadFileRow
        file={{ id: '1', name: 'test.txt', size: 100, status: 'error' }}
      />,
    )
    expect(screen.getByText('Failed')).toBeVisible()
  })
})

/* ---------------------------------------------------------------------------
 * Timer bar tests
 * ------------------------------------------------------------------------ */

describe('Toast — timer bar', () => {
  it('timer bar is present on standard toasts', () => {
    const { container } = render(
      <ToastContent type="success" title="Done" duration={5000} />,
    )
    const timerBar = container.querySelector('.motion-safe\\:animate-timer-bar')
    expect(timerBar).toBeInTheDocument()
  })

  it('timer bar is NOT present on loading toasts', () => {
    const { container } = render(
      <ToastContent type="loading" title="Loading..." />,
    )
    const timerBar = container.querySelector('.motion-safe\\:animate-timer-bar')
    expect(timerBar).toBeNull()
  })

  it('timer bar respects custom duration', () => {
    const { container } = render(
      <TimerBar duration={3000} type="info" paused={false} />,
    )
    const bar = container.querySelector('.motion-safe\\:animate-timer-bar')
    expect(bar).toBeInTheDocument()
    expect(bar).toHaveStyle({ animationDuration: '3000ms' })
  })

  it('timer bar pauses on hover state', () => {
    const { container } = render(
      <TimerBar duration={5000} type="success" paused={true} />,
    )
    const bar = container.querySelector('.motion-safe\\:animate-timer-bar')
    expect(bar).toHaveStyle({ animationPlayState: 'paused' })
  })
})

/* ---------------------------------------------------------------------------
 * formatFileSize tests
 * ------------------------------------------------------------------------ */

describe('formatFileSize', () => {
  it('formats bytes', () => {
    expect(formatFileSize(500)).toBe('500 B')
  })

  it('formats kilobytes', () => {
    expect(formatFileSize(1536)).toBe('1.5 KB')
  })

  it('formats megabytes', () => {
    expect(formatFileSize(1024 * 1024 * 2.5)).toBe('2.5 MB')
  })

  it('formats gigabytes', () => {
    expect(formatFileSize(1024 * 1024 * 1024 * 1.25)).toBe('1.25 GB')
  })

  it('handles zero', () => {
    expect(formatFileSize(0)).toBe('0 B')
  })

  it('handles negative', () => {
    expect(formatFileSize(-100)).toBe('0 B')
  })

  it('handles NaN', () => {
    expect(formatFileSize(NaN)).toBe('0 B')
  })
})

/* ---------------------------------------------------------------------------
 * Toast dismiss tests
 * ------------------------------------------------------------------------ */

describe('Toast — dismiss', () => {
  it('toast.dismiss does not throw', () => {
    // Sonner dismiss relies on CSS animations that don't run in jsdom,
    // so we verify the API doesn't throw rather than testing DOM removal.
    expect(() => toast.dismiss()).not.toThrow()
    expect(() => toast.dismiss('nonexistent')).not.toThrow()
  })
})

/* ---------------------------------------------------------------------------
 * Toast.undo tests
 * ------------------------------------------------------------------------ */

describe('Toast — undo', () => {
  it('renders undo toast with action button', async () => {
    const onUndo = vi.fn()
    render(<TestWrapper />)
    act(() => {
      toast.undo('Item deleted', { onUndo })
    })
    await waitFor(() => {
      expect(screen.getByText('Item deleted')).toBeVisible()
      expect(screen.getByRole('button', { name: 'Undo' })).toBeVisible()
    })
  })
})
