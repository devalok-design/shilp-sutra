import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { Link } from '../link'

describe('Link accessibility', () => {
  it('should have no violations with href', async () => {
    const { container } = render(<Link href="https://example.com">Example</Link>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations as inline link', async () => {
    const { container } = render(
      <p>
        Visit <Link href="https://example.com" inline>our website</Link> for details.
      </p>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations as block link', async () => {
    const { container } = render(
      <Link href="https://example.com" inline={false}>
        Block-level link
      </Link>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with external link attributes', async () => {
    const { container } = render(
      <Link href="https://example.com" target="_blank" rel="noopener noreferrer">
        External link
      </Link>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
