import { render, screen } from '@testing-library/react'
import { describe, expect,it } from 'vitest'

import { describeConformance } from '../test-utils/conformance'
import { Stack } from './stack'

describeConformance(
  'Stack',
  (props) => <Stack {...props}><span>A</span></Stack>,
)

describe('Stack', () => {
  it('renders children in a div by default', () => {
    render(<Stack data-testid="stack"><span>A</span><span>B</span></Stack>)
    const el = screen.getByTestId('stack')
    expect(el.tagName).toBe('DIV')
    expect(el.children).toHaveLength(2)
  })

  it('defaults to vertical (flex-col)', () => {
    render(<Stack data-testid="stack">Content</Stack>)
    expect(screen.getByTestId('stack')).toHaveClass('flex', 'flex-col')
  })

  it('direction="horizontal" applies flex-row', () => {
    render(<Stack data-testid="stack" direction="horizontal">Content</Stack>)
    const el = screen.getByTestId('stack')
    expect(el).toHaveClass('flex-row')
    expect(el).not.toHaveClass('flex-col')
  })

  it('direction="row" applies flex-row', () => {
    render(<Stack data-testid="stack" direction="row">Content</Stack>)
    expect(screen.getByTestId('stack')).toHaveClass('flex-row')
  })

  it('direction="column" applies flex-col', () => {
    render(<Stack data-testid="stack" direction="column">Content</Stack>)
    expect(screen.getByTestId('stack')).toHaveClass('flex-col')
  })

  it('gap with token string applies correct class', () => {
    render(<Stack data-testid="stack" gap="ds-04">Content</Stack>)
    expect(screen.getByTestId('stack')).toHaveClass('gap-ds-04')
  })

  it('gap with number applies correct class', () => {
    render(<Stack data-testid="stack" gap={3}>Content</Stack>)
    expect(screen.getByTestId('stack')).toHaveClass('gap-ds-03')
  })

  it('align="center" applies items-center', () => {
    render(<Stack data-testid="stack" align="center">Content</Stack>)
    expect(screen.getByTestId('stack')).toHaveClass('items-center')
  })

  it('align="baseline" applies items-baseline', () => {
    render(<Stack data-testid="stack" align="baseline">Content</Stack>)
    expect(screen.getByTestId('stack')).toHaveClass('items-baseline')
  })

  it('justify="between" applies justify-between', () => {
    render(<Stack data-testid="stack" justify="between">Content</Stack>)
    expect(screen.getByTestId('stack')).toHaveClass('justify-between')
  })

  it('justify="evenly" applies justify-evenly', () => {
    render(<Stack data-testid="stack" justify="evenly">Content</Stack>)
    expect(screen.getByTestId('stack')).toHaveClass('justify-evenly')
  })

  it('wrap adds flex-wrap', () => {
    render(<Stack data-testid="stack" wrap>Content</Stack>)
    expect(screen.getByTestId('stack')).toHaveClass('flex-wrap')
  })

  it('as prop changes rendered element', () => {
    render(<Stack as="section" data-testid="stack">Content</Stack>)
    expect(screen.getByTestId('stack').tagName).toBe('SECTION')
  })

  it('as="ul" renders a list', () => {
    render(<Stack as="ul" data-testid="stack"><li>Item</li></Stack>)
    expect(screen.getByTestId('stack').tagName).toBe('UL')
  })

})
