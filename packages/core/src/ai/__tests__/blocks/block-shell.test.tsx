import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'

import { BlockShell } from '../../blocks/block-shell'

describe('BlockShell', () => {
  describe('confidence levels', () => {
    it('low: sets data-confidence="low" and applies the warning treatment', () => {
      const { container } = render(
        <BlockShell confidence="low">low content</BlockShell>,
      )
      const root = container.firstChild as HTMLElement
      expect(root).toHaveAttribute('data-confidence', 'low')
      expect(root.className).toContain('bg-warning-2')
      expect(root.className).toContain('relative')
      expect(root.className).toContain('rounded-surface')
      expect(root.className).toContain('pt-ds-07')
    })

    it('medium: sets data-confidence="medium" and does NOT apply the warning treatment', () => {
      const { container } = render(
        <BlockShell confidence="medium">medium content</BlockShell>,
      )
      const root = container.firstChild as HTMLElement
      expect(root).toHaveAttribute('data-confidence', 'medium')
      expect(root.className).not.toContain('bg-warning-2')
    })

    it('high: sets data-confidence="high" and does NOT apply the warning treatment', () => {
      const { container } = render(
        <BlockShell confidence="high">high content</BlockShell>,
      )
      const root = container.firstChild as HTMLElement
      expect(root).toHaveAttribute('data-confidence', 'high')
      expect(root.className).not.toContain('bg-warning-2')
    })

    it('omitted confidence: renders without a data-confidence attribute and without the warning treatment', () => {
      const { container } = render(<BlockShell>no confidence</BlockShell>)
      const root = container.firstChild as HTMLElement
      // React drops an attribute entirely when its value is undefined.
      expect(root.hasAttribute('data-confidence')).toBe(false)
      expect(root.className).not.toContain('bg-warning-2')
    })
  })

  describe('warning classes / low-confidence chip', () => {
    it('renders the "Low confidence" chip when confidence="low"', () => {
      render(<BlockShell confidence="low">content</BlockShell>)
      expect(screen.getByText('Low confidence')).toBeInTheDocument()
    })

    it.each(['medium', 'high', undefined] as const)(
      'does not render the "Low confidence" chip when confidence=%s',
      (confidence) => {
        render(<BlockShell confidence={confidence}>content</BlockShell>)
        expect(screen.queryByText('Low confidence')).not.toBeInTheDocument()
      },
    )
  })

  describe('independence between instances', () => {
    it('two siblings with different confidence levels render independently', () => {
      render(
        <>
          <BlockShell confidence="low" className="instance-a">
            Instance A
          </BlockShell>
          <BlockShell confidence="high" className="instance-b">
            Instance B
          </BlockShell>
        </>,
      )

      const instanceA = screen.getByText('Instance A').closest('.instance-a')
      const instanceB = screen.getByText('Instance B').closest('.instance-b')

      expect(instanceA).toHaveAttribute('data-confidence', 'low')
      expect(instanceB).toHaveAttribute('data-confidence', 'high')

      // Only the low-confidence instance carries the warning wash.
      expect(instanceA?.className).toContain('bg-warning-2')
      expect(instanceB?.className).not.toContain('bg-warning-2')

      // Only the low-confidence instance shows the chip, and there is exactly one.
      expect(screen.getAllByText('Low confidence')).toHaveLength(1)
      expect(instanceA).toContainElement(screen.getByText('Low confidence'))
    })

    it('re-rendering one instance does not affect an unrelated sibling instance', () => {
      const { rerender } = render(
        <>
          <BlockShell confidence="low" className="instance-a">
            Instance A
          </BlockShell>
          <BlockShell confidence="low" className="instance-b">
            Instance B
          </BlockShell>
        </>,
      )

      expect(screen.getAllByText('Low confidence')).toHaveLength(2)

      rerender(
        <>
          <BlockShell confidence="high" className="instance-a">
            Instance A
          </BlockShell>
          <BlockShell confidence="low" className="instance-b">
            Instance B
          </BlockShell>
        </>,
      )

      // Instance A dropped its warning treatment; instance B, untouched by the
      // prop change, must still carry its own independently.
      const instanceA = screen.getByText('Instance A').closest('.instance-a')
      const instanceB = screen.getByText('Instance B').closest('.instance-b')
      expect(instanceA).toHaveAttribute('data-confidence', 'high')
      expect(instanceA?.className).not.toContain('bg-warning-2')
      expect(instanceB).toHaveAttribute('data-confidence', 'low')
      expect(instanceB?.className).toContain('bg-warning-2')
      expect(screen.getAllByText('Low confidence')).toHaveLength(1)
    })
  })

  describe('smoke', () => {
    it('renders its children', () => {
      render(
        <BlockShell>
          <p>child content</p>
        </BlockShell>,
      )
      expect(screen.getByText('child content')).toBeInTheDocument()
    })

    it('merges a custom className onto the root element', () => {
      const { container } = render(
        <BlockShell className="custom-class">content</BlockShell>,
      )
      const root = container.firstChild as HTMLElement
      expect(root.className).toContain('custom-class')
    })

    it('merges a custom className alongside the low-confidence warning classes', () => {
      const { container } = render(
        <BlockShell confidence="low" className="custom-class">
          content
        </BlockShell>,
      )
      const root = container.firstChild as HTMLElement
      expect(root.className).toContain('custom-class')
      expect(root.className).toContain('bg-warning-2')
    })
  })

  describe('accessibility', () => {
    it('has no axe violations for a low-confidence block', async () => {
      const { container } = render(
        <BlockShell confidence="low">
          <p>Some AI-generated content that may be unreliable.</p>
        </BlockShell>,
      )
      expect(await axe(container)).toHaveNoViolations()
    })

    it('has no axe violations for a high-confidence block', async () => {
      const { container } = render(
        <BlockShell confidence="high">
          <p>Some AI-generated content.</p>
        </BlockShell>,
      )
      expect(await axe(container)).toHaveNoViolations()
    })
  })
})
