import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { Alert } from '../alert'

describe('Alert accessibility', () => {
  it('should have no violations with info variant', async () => {
    const { container } = render(
      <Alert variant="info" title="Information">
        This is an informational message.
      </Alert>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with error variant', async () => {
    const { container } = render(
      <Alert variant="error" title="Error">
        Something went wrong.
      </Alert>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with success variant', async () => {
    const { container } = render(
      <Alert variant="success" title="Success">
        Operation completed successfully.
      </Alert>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with warning variant', async () => {
    const { container } = render(
      <Alert variant="warning" title="Warning">
        Please review before continuing.
      </Alert>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with button', async () => {
    const { container } = render(
      <Alert variant="info" onDismiss={() => {}}>
        Dismissible alert message.
      </Alert>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
