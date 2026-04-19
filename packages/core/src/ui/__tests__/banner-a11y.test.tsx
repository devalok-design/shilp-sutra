import { render, screen } from '@testing-library/react'
import { describe, expect,it } from 'vitest'
import { axe } from 'vitest-axe'

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

  it('should render with actions prop (plural) and have no violations', async () => {
    const { container } = render(
      <Banner
        color="info"
        actions={
          <>
            <button type="button">Learn more</button>
            <button type="button">Dismiss</button>
          </>
        }
      >
        Multiple actions banner.
      </Banner>,
    )
    expect(screen.getByText('Learn more')).toBeInTheDocument()
    expect(screen.getByText('Dismiss')).toBeInTheDocument()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should prefer actions over action when both provided', () => {
    render(
      <Banner
        color="info"
        action={<button type="button">Old action</button>}
        actions={<button type="button">New action</button>}
      >
        Conflict test.
      </Banner>,
    )
    expect(screen.getByText('New action')).toBeInTheDocument()
    expect(screen.queryByText('Old action')).not.toBeInTheDocument()
  })
})
