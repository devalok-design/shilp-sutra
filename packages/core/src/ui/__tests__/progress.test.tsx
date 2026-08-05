import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { Progress } from '../progress'

/**
 * The missing-accessible-name warning is latched at module scope so a bar that
 * re-renders on every value tick logs once instead of once per frame. That makes
 * the latch global across a test file, so any case asserting the warn FIRES has
 * to start from a fresh module registry — hence `vi.resetModules()` plus a
 * dynamic import rather than the top-level `Progress` binding.
 */
async function freshProgress() {
  vi.resetModules()
  return (await import('../progress')).Progress
}

describe('Progress', () => {
  it('renders a progressbar with the value', () => {
    render(<Progress value={72} aria-label="Upload" />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toBeInTheDocument()
    expect(bar).toHaveAttribute('aria-valuenow', '72')
  })

  it('has no axe violations when labelled', async () => {
    const { container } = render(<Progress value={72} label="Storage used" />)
    expect(await axe(container)).toHaveNoViolations()
  })

  describe('accessible name', () => {
    let warn: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    })

    afterEach(() => {
      warn.mockRestore()
    })

    it('wires aria-labelledby from `label`', () => {
      render(<Progress value={40} label="Storage used" />)
      // Accessible name comes from the visible label, so the bar is findable by it.
      expect(screen.getByRole('progressbar', { name: 'Storage used' })).toBeInTheDocument()
      expect(warn).not.toHaveBeenCalled()
    })

    it('honours an explicit aria-label', () => {
      render(<Progress value={40} aria-label="Upload progress" />)
      expect(screen.getByRole('progressbar', { name: 'Upload progress' })).toBeInTheDocument()
      expect(warn).not.toHaveBeenCalled()
    })

    it('honours an explicit aria-labelledby', () => {
      render(
        <>
          <span id="ext-label">External label</span>
          <Progress value={40} aria-labelledby="ext-label" />
        </>,
      )
      expect(screen.getByRole('progressbar', { name: 'External label' })).toBeInTheDocument()
      expect(warn).not.toHaveBeenCalled()
    })

    it('warns in DEV when there is no accessible name at all', async () => {
      const Fresh = await freshProgress()
      render(<Fresh value={72} />)

      expect(screen.getByRole('progressbar')).not.toHaveAccessibleName()
      expect(warn).toHaveBeenCalledTimes(1)
      expect(warn.mock.calls[0][0]).toContain('[shilp-sutra] <Progress> has no accessible name')
      // The message must name both escape hatches, or it isn't actionable.
      expect(warn.mock.calls[0][0]).toContain('label')
      expect(warn.mock.calls[0][0]).toContain('aria-label')
    })

    it('warns only once however many unlabelled bars render', async () => {
      const Fresh = await freshProgress()
      const { rerender } = render(<Fresh value={10} />)
      rerender(<Fresh value={20} />)
      rerender(<Fresh value={30} />)
      render(
        <>
          <Fresh value={40} />
          <Fresh value={50} />
        </>,
      )
      expect(warn).toHaveBeenCalledTimes(1)
    })

    it('does not warn when a value-less (indeterminate) bar is labelled', async () => {
      const Fresh = await freshProgress()
      render(<Fresh label="Loading" />)
      expect(warn).not.toHaveBeenCalled()
    })
  })
})
