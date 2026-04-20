import { render, screen } from '@testing-library/react'
import { describe, expect,it } from 'vitest'
import { axe } from 'vitest-axe'

import { Text } from './text'

describe('Text', () => {
  it('renders with default props (body-md as <p>)', () => {
    render(<Text>Hello world</Text>)
    const el = screen.getByText('Hello world')
    expect(el).toBeInTheDocument()
    expect(el.tagName).toBe('P')
  })

  it('heading-2xl renders as <h1>', () => {
    render(<Text variant="heading-2xl">Title</Text>)
    expect(screen.getByText('Title').tagName).toBe('H1')
  })

  it('heading-xl renders as <h2>', () => {
    render(<Text variant="heading-xl">Subtitle</Text>)
    expect(screen.getByText('Subtitle').tagName).toBe('H2')
  })

  it('heading-lg renders as <h3>', () => {
    render(<Text variant="heading-lg">Section</Text>)
    expect(screen.getByText('Section').tagName).toBe('H3')
  })

  it('body-sm renders as <p>', () => {
    render(<Text variant="body-sm">Small text</Text>)
    expect(screen.getByText('Small text').tagName).toBe('P')
  })

  it('label-md renders as <span>', () => {
    render(<Text variant="label-md">Label</Text>)
    const el = screen.getByText('Label')
    expect(el.tagName).toBe('SPAN')
    expect(el).toHaveClass('uppercase')
  })

  it('caption renders as <span>', () => {
    render(<Text variant="caption">Caption text</Text>)
    expect(screen.getByText('Caption text').tagName).toBe('SPAN')
  })

  it('overline renders as <span> with uppercase', () => {
    render(<Text variant="overline">Overline</Text>)
    const el = screen.getByText('Overline')
    expect(el.tagName).toBe('SPAN')
    expect(el).toHaveClass('uppercase')
  })

  it('as prop overrides the default element', () => {
    render(<Text variant="heading-2xl" as="div">Not an h1</Text>)
    expect(screen.getByText('Not an h1').tagName).toBe('DIV')
  })

  it('as="span" renders inline', () => {
    render(<Text variant="body-md" as="span">Inline</Text>)
    expect(screen.getByText('Inline').tagName).toBe('SPAN')
  })

  it('merges custom className', () => {
    render(<Text className="my-custom">Styled</Text>)
    expect(screen.getByText('Styled')).toHaveClass('my-custom')
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLElement | null }
    render(<Text ref={ref}>Ref test</Text>)
    expect(ref.current).toBeInstanceOf(HTMLParagraphElement)
  })

  it('forwards ref when as is set', () => {
    const ref = { current: null as HTMLElement | null }
    render(<Text as="h1" ref={ref}>Heading ref</Text>)
    expect(ref.current).toBeInstanceOf(HTMLHeadingElement)
  })

  it('passes through HTML attributes', () => {
    render(<Text data-testid="custom" id="text-1">Attrs</Text>)
    const el = screen.getByTestId('custom')
    expect(el).toHaveAttribute('id', 'text-1')
  })

  it('has no a11y violations', async () => {
    const { container } = render(
      <div>
        <Text variant="heading-2xl">Page Title</Text>
        <Text variant="body-md">Some body text.</Text>
      </div>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
