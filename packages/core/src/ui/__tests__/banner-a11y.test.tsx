import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { Banner } from '../banner'

describe('Banner accessibility', () => {
  it('should have no violations with info variant', async () => {
    const { container } = render(<Banner variant="info">Information banner.</Banner>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with success variant', async () => {
    const { container } = render(<Banner variant="success">Operation succeeded.</Banner>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with warning variant', async () => {
    const { container } = render(<Banner variant="warning">Please review.</Banner>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with error variant', async () => {
    const { container } = render(<Banner variant="error">Something went wrong.</Banner>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations when dismissible', async () => {
    const { container } = render(
      <Banner variant="info" onDismiss={() => {}}>
        Dismissible banner message.
      </Banner>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with action slot', async () => {
    const { container } = render(
      <Banner variant="warning" action={<button type="button">Retry</button>}>
        Connection lost.
      </Banner>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
