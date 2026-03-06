import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { Banner } from '../banner'

describe('Banner accessibility', () => {
  it('should have no violations with info color', async () => {
    const { container } = render(<Banner color="info">Information banner.</Banner>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with success color', async () => {
    const { container } = render(<Banner color="success">Operation succeeded.</Banner>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with warning color', async () => {
    const { container } = render(<Banner color="warning">Please review.</Banner>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with error color', async () => {
    const { container } = render(<Banner color="error">Something went wrong.</Banner>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations when dismissible', async () => {
    const { container } = render(
      <Banner color="info" onDismiss={() => {}}>
        Dismissible banner message.
      </Banner>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with action slot', async () => {
    const { container } = render(
      <Banner color="warning" action={<button type="button">Retry</button>}>
        Connection lost.
      </Banner>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
