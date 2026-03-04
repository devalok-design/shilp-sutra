import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { Code } from '../code'

describe('Code accessibility', () => {
  it('should have no violations with inline code', async () => {
    const { container } = render(<Code>const x = 42</Code>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with block code', async () => {
    const { container } = render(
      <Code variant="block">
        {'function hello() {\n  return "world"\n}'}
      </Code>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with inline code inside a paragraph', async () => {
    const { container } = render(
      <p>
        Use <Code>npm install</Code> to install dependencies.
      </p>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
