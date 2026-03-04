import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { Badge } from '../badge'

describe('Badge accessibility', () => {
  it('should have no violations with neutral variant', async () => {
    const { container } = render(<Badge variant="neutral">Default</Badge>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with info variant', async () => {
    const { container } = render(<Badge variant="info">Info</Badge>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with success variant', async () => {
    const { container } = render(<Badge variant="success">Success</Badge>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with warning variant', async () => {
    const { container } = render(<Badge variant="warning">Warning</Badge>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with error variant', async () => {
    const { container } = render(<Badge variant="error">Error</Badge>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with dot indicator', async () => {
    const { container } = render(<Badge dot>With dot</Badge>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with dismiss button', async () => {
    const { container } = render(<Badge onDismiss={() => {}}>Dismissible</Badge>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
