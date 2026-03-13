import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect, vi } from 'vitest'

vi.mock('../../composed/command-palette', () => ({
  CommandPalette: ({ children, ...props }: { children?: React.ReactNode } & Record<string, unknown>) => (
    <div data-testid="command-palette" {...props}>{children}</div>
  ),
}))

import { AppCommandPalette } from '../app-command-palette'

describe('AppCommandPalette', () => {
  it('renders without crashing', () => {
    const { container } = render(<AppCommandPalette />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<AppCommandPalette />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('merges className', () => {
    const { container } = render(<AppCommandPalette className="custom" />)
    expect(container.firstChild).toHaveClass('custom')
  })

  it('spreads props', () => {
    const { container } = render(<AppCommandPalette data-testid="acp" />)
    expect(container.firstChild).toHaveAttribute('data-testid', 'acp')
  })
})
