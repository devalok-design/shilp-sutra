import { render } from '@testing-library/react'
import { describe, expect,it } from 'vitest'
import { axe } from 'vitest-axe'

import { Badge } from '../badge'

describe('Badge accessibility', () => {
  it('should have no violations with default color', async () => {
    const { container } = render(<Badge>Default</Badge>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with info color', async () => {
    const { container } = render(<Badge color="info">Info</Badge>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with success color', async () => {
    const { container } = render(<Badge color="success">Success</Badge>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with warning color', async () => {
    const { container } = render(<Badge color="warning">Warning</Badge>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with error color', async () => {
    const { container } = render(<Badge color="error">Error</Badge>)
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
