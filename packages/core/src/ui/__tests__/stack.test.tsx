import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Stack } from '../stack'

describe('Stack', () => {
  it('renders children', () => {
    render(<Stack><div>Child 1</div><div>Child 2</div></Stack>)
    expect(screen.getByText('Child 1')).toBeInTheDocument()
    expect(screen.getByText('Child 2')).toBeInTheDocument()
  })

  it('defaults to vertical (column) direction', () => {
    const { container } = render(<Stack>Content</Stack>)
    expect(container.firstChild).toHaveClass('flex-col')
  })

  it('supports horizontal direction', () => {
    const { container } = render(<Stack direction="horizontal">Content</Stack>)
    expect(container.firstChild).toHaveClass('flex-row')
  })

  it('applies gap spacing', () => {
    const { container } = render(<Stack gap="ds-04">Content</Stack>)
    expect(container.firstChild).toHaveClass('gap-ds-04')
  })

  it('applies custom className', () => {
    const { container } = render(<Stack className="custom">Content</Stack>)
    expect(container.firstChild).toHaveClass('custom')
  })

  it('renders as custom element', () => {
    // @ts-expect-error -- polymorphic `as` narrowing lost through forwardRef
    render(<Stack as="section" data-testid="stack">Content</Stack>)
    expect(screen.getByTestId('stack').tagName).toBe('SECTION')
  })

  it('supports align and justify', () => {
    const { container } = render(
      <Stack align="center" justify="between">Content</Stack>
    )
    expect(container.firstChild).toHaveClass('items-center')
    expect(container.firstChild).toHaveClass('justify-between')
  })

  it('supports wrap', () => {
    const { container } = render(<Stack wrap>Content</Stack>)
    expect(container.firstChild).toHaveClass('flex-wrap')
  })

  it('supports direction="row" as alias for horizontal', () => {
    const { container } = render(<Stack direction="row">Content</Stack>)
    expect(container.firstChild).toHaveClass('flex-row')
  })

  it('supports direction="column" as alias for vertical', () => {
    const { container } = render(<Stack direction="column">Content</Stack>)
    expect(container.firstChild).toHaveClass('flex-col')
  })

  it('accepts numeric gap values', () => {
    const { container } = render(<Stack gap={4}>Content</Stack>)
    expect(container.firstChild).toHaveClass('gap-ds-04')
  })

  it('still applies token string gap', () => {
    const { container } = render(<Stack gap="ds-05">Content</Stack>)
    expect(container.firstChild).toHaveClass('gap-ds-05')
  })
})
