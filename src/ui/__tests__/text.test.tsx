import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Text } from '../text'

describe('Text', () => {
  it('renders heading-2xl as h1 by default', () => {
    render(<Text variant="heading-2xl">Hello</Text>)
    const el = screen.getByText('Hello')
    expect(el.tagName).toBe('H1')
  })

  it('renders body-md as p by default', () => {
    render(<Text variant="body-md">Body text</Text>)
    const el = screen.getByText('Body text')
    expect(el.tagName).toBe('P')
  })

  it('renders label-sm as span by default', () => {
    render(<Text variant="label-sm">Label</Text>)
    const el = screen.getByText('Label')
    expect(el.tagName).toBe('SPAN')
  })

  it('allows overriding the element with as prop', () => {
    // @ts-expect-error -- polymorphic `as` narrowing lost through forwardRef
    render(<Text variant="heading-2xl" as="span">Override</Text>)
    const el = screen.getByText('Override')
    expect(el.tagName).toBe('SPAN')
  })

  it('applies custom className', () => {
    render(<Text variant="body-md" className="custom">Styled</Text>)
    const el = screen.getByText('Styled')
    expect(el).toHaveClass('custom')
  })

  it('renders children correctly', () => {
    render(<Text variant="body-md">Content here</Text>)
    expect(screen.getByText('Content here')).toBeInTheDocument()
  })

  it('forwards ref', () => {
    const ref = { current: null } as React.RefObject<HTMLParagraphElement>
    render(<Text variant="body-md" ref={ref}>Ref test</Text>)
    expect(ref.current).toBeInstanceOf(HTMLElement)
  })

  it('applies label uppercase transform', () => {
    render(<Text variant="label-md">Label Text</Text>)
    const el = screen.getByText('Label Text')
    expect(el.className).toContain('uppercase')
  })

  it('applies overline uppercase transform', () => {
    render(<Text variant="overline">Overline Text</Text>)
    const el = screen.getByText('Overline Text')
    expect(el.className).toContain('uppercase')
  })
})
