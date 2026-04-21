import { render, screen } from '@testing-library/react'
import { describe, expect,it } from 'vitest'

import { describeConformance } from '../test-utils/conformance'
import { Text } from './text'

// Sampling a subset of the 20 variants — conformance just verifies they all
// render without error; we don't need to enumerate every typography role.
describeConformance(
  'Text',
  (props) => <Text {...props}>Hello</Text>,
  {
    variants: [
      'heading-2xl', 'heading-lg', 'heading-xs',
      'body-lg', 'body-md', 'body-xs',
      'label-lg', 'label-xs', 'label-plain-md',
      'caption', 'overline', 'code',
    ],
  },
)

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

  it('forwards ref when as is set (non-default element)', () => {
    const ref = { current: null as HTMLElement | null }
    render(<Text as="h1" ref={ref}>Heading ref</Text>)
    expect(ref.current).toBeInstanceOf(HTMLHeadingElement)
  })
})
