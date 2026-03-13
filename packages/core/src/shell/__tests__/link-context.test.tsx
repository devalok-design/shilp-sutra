import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { LinkProvider, useLink } from '../link-context'

function TestConsumer() {
  const Link = useLink()
  return <Link href="/test">Test link</Link>
}

describe('LinkProvider', () => {
  it('provides default anchor link', () => {
    render(
      <LinkProvider component={React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }>(
        (props, ref) => <a ref={ref} {...props} />
      )}>
        <TestConsumer />
      </LinkProvider>,
    )
    expect(screen.getByText('Test link')).toBeInTheDocument()
    expect(screen.getByText('Test link').closest('a')).toHaveAttribute('href', '/test')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <LinkProvider component={React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }>(
        (props, ref) => <a ref={ref} {...props} />
      )}>
        <TestConsumer />
      </LinkProvider>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('useLink', () => {
  it('returns default anchor when no provider is present', () => {
    render(<TestConsumer />)
    expect(screen.getByText('Test link')).toBeInTheDocument()
  })
})
