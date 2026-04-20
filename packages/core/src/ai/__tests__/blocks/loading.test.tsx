import { render, screen } from '@testing-library/react'
import { describe, expect,it } from 'vitest'

import { LoadingBlock } from '../../blocks/loading'

describe('LoadingBlock', () => {
  describe('skeleton lines mode', () => {
    it('renders N skeleton bars when data.lines provided', () => {
      const { container } = render(
        <LoadingBlock data={{ lines: 4 }} />,
      )
      // Skeleton bars are aria-hidden divs with shimmer animation
      const skeletons = container.querySelectorAll('[aria-hidden="true"]')
      expect(skeletons.length).toBe(4)
    })

    it('has role="status" and aria-busy="true"', () => {
      render(<LoadingBlock data={{ lines: 3 }} />)
      const status = screen.getByRole('status')
      expect(status).toBeInTheDocument()
      expect(status).toHaveAttribute('aria-busy', 'true')
    })

    it('last skeleton has reduced width', () => {
      const { container } = render(
        <LoadingBlock data={{ lines: 3 }} />,
      )
      const skeletons = container.querySelectorAll('[aria-hidden="true"]')
      const lastSkeleton = skeletons[skeletons.length - 1]
      expect(lastSkeleton.className).toContain('w-3/5')
    })

    it('non-last skeletons have full width', () => {
      const { container } = render(
        <LoadingBlock data={{ lines: 3 }} />,
      )
      const skeletons = container.querySelectorAll('[aria-hidden="true"]')
      expect(skeletons[0].className).toContain('w-full')
      expect(skeletons[1].className).toContain('w-full')
    })
  })

  describe('processing steps mode', () => {
    const steps = [
      { id: '1', label: 'Fetching data', status: 'done' as const },
      { id: '2', label: 'Processing results', status: 'active' as const },
      { id: '3', label: 'Saving output', status: 'pending' as const },
      { id: '4', label: 'Failed step', status: 'error' as const },
    ]

    it('renders step labels when data.steps provided', () => {
      render(<LoadingBlock data={{ steps }} />)
      expect(screen.getByText('Fetching data')).toBeInTheDocument()
      expect(screen.getByText('Processing results')).toBeInTheDocument()
      expect(screen.getByText('Saving output')).toBeInTheDocument()
      expect(screen.getByText('Failed step')).toBeInTheDocument()
    })

    it('has role="status" and aria-busy="true"', () => {
      render(<LoadingBlock data={{ steps }} />)
      const status = screen.getByRole('status')
      expect(status).toBeInTheDocument()
      expect(status).toHaveAttribute('aria-busy', 'true')
    })

    it('done steps show different styling than pending', () => {
      render(<LoadingBlock data={{ steps }} />)
      const doneLabel = screen.getByText('Fetching data')
      const pendingLabel = screen.getByText('Saving output')
      expect(doneLabel.className).toContain('text-surface-fg')
      expect(pendingLabel.className).toContain('text-surface-fg-subtle')
    })

    it('shows spinner indicator for active step', () => {
      render(<LoadingBlock data={{ steps }} />)
      const spinner = screen.getByTestId('step-spinner')
      expect(spinner).toBeInTheDocument()
    })

    it('shows done icon for completed steps', () => {
      render(<LoadingBlock data={{ steps }} />)
      const doneIcon = screen.getByTestId('step-icon-done')
      expect(doneIcon).toBeInTheDocument()
    })

    it('shows error icon for failed steps', () => {
      render(<LoadingBlock data={{ steps }} />)
      const errorIcon = screen.getByTestId('step-icon-error')
      expect(errorIcon).toBeInTheDocument()
    })

    it('shows pending icon for pending steps', () => {
      render(<LoadingBlock data={{ steps }} />)
      const pendingIcon = screen.getByTestId('step-icon-pending')
      expect(pendingIcon).toBeInTheDocument()
    })
  })
})
