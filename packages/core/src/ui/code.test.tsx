import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { axe } from 'vitest-axe'
import { Code } from './code'

describe('Code', () => {
  it('renders inline <code> by default', () => {
    render(<Code>console.log</Code>)
    const el = screen.getByText('console.log')
    expect(el.tagName).toBe('CODE')
  })

  it('inline variant has monospace font class', () => {
    render(<Code>snippet</Code>)
    expect(screen.getByText('snippet')).toHaveClass('font-mono')
  })

  it('block variant renders <pre> wrapping <code>', () => {
    render(<Code variant="block">const x = 1</Code>)
    const pre = screen.getByText('const x = 1').closest('pre')
    expect(pre).toBeInTheDocument()
    expect(pre!.tagName).toBe('PRE')
    // The text is inside a <code> within the <pre>
    const code = pre!.querySelector('code')
    expect(code).toBeInTheDocument()
    expect(code).toHaveTextContent('const x = 1')
  })

  it('block variant has overflow-x-auto for scrolling', () => {
    render(<Code variant="block" data-testid="block-code">long line</Code>)
    const pre = screen.getByTestId('block-code')
    expect(pre).toHaveClass('overflow-x-auto')
  })

  it('block variant has monospace font class', () => {
    render(<Code variant="block" data-testid="block-code">code</Code>)
    expect(screen.getByTestId('block-code')).toHaveClass('font-mono')
  })

  it('merges custom className on inline variant', () => {
    render(<Code className="my-code">inline</Code>)
    const el = screen.getByText('inline')
    expect(el).toHaveClass('my-code')
    expect(el).toHaveClass('font-mono')
  })

  it('merges custom className on block variant', () => {
    render(<Code variant="block" className="my-block" data-testid="block">block</Code>)
    const el = screen.getByTestId('block')
    expect(el).toHaveClass('my-block')
    expect(el).toHaveClass('font-mono')
  })

  it('forwards ref on inline variant', () => {
    const ref = { current: null as HTMLElement | null }
    render(<Code ref={ref}>ref test</Code>)
    expect(ref.current).toBeInstanceOf(HTMLElement)
    expect(ref.current!.tagName).toBe('CODE')
  })

  it('forwards ref on block variant', () => {
    const ref = { current: null as HTMLPreElement | null }
    render(<Code variant="block" ref={ref as React.Ref<HTMLPreElement>}>ref test</Code>)
    expect(ref.current).toBeInstanceOf(HTMLPreElement)
  })

  it('passes through HTML attributes', () => {
    render(<Code data-testid="custom" id="code-1">attrs</Code>)
    const el = screen.getByTestId('custom')
    expect(el).toHaveAttribute('id', 'code-1')
  })

  it('has no a11y violations (inline)', async () => {
    const { container } = render(
      <p>Use the <Code>onClick</Code> prop to handle clicks.</p>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has no a11y violations (block)', async () => {
    const { container } = render(
      <Code variant="block">{`const x = 1\nconst y = 2`}</Code>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
