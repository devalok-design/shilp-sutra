import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { Text } from '../text'

describe('Text accessibility', () => {
  it('should have no violations with heading-xl variant', async () => {
    const { container } = render(
      <Text variant="heading-xl">Page Title</Text>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with body-md variant', async () => {
    const { container } = render(
      <Text variant="body-md">
        This is a paragraph of body text with regular sizing.
      </Text>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with label-md variant', async () => {
    const { container } = render(
      <Text variant="label-md">Field Label</Text>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with caption variant', async () => {
    const { container } = render(
      <Text variant="caption">Small caption text</Text>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with overline variant', async () => {
    const { container } = render(
      <Text variant="overline">Section Overline</Text>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with custom element via as prop', async () => {
    const { container } = render(
      <Text variant="heading-md" as={'h1' as never}>
        Custom heading element
      </Text>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with heading hierarchy', async () => {
    const { container } = render(
      <div>
        <Text variant="heading-2xl">Main Title</Text>
        <Text variant="heading-xl">Subtitle</Text>
        <Text variant="body-md">Paragraph content goes here.</Text>
      </div>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
