import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { axe } from 'vitest-axe'
import { IconPlus } from '@tabler/icons-react'
import { IconProvider } from '../icon-context'
import { Icon } from '../icon'

describe('IconContext', () => {
  it('provides default size to child Icons', () => {
    render(
      <IconProvider size="lg">
        <Icon icon={IconPlus} label="Add" />
      </IconProvider>,
    )
    // lg = 20px
    const svg = screen.getByRole('img', { name: 'Add' })
    expect(svg).toHaveAttribute('width', '20')
    expect(svg).toHaveAttribute('height', '20')
  })

  it('child Icon explicit size overrides context', () => {
    render(
      <IconProvider size="lg">
        <Icon icon={IconPlus} size="xs" label="Add" />
      </IconProvider>,
    )
    // xs = 14px
    const svg = screen.getByRole('img', { name: 'Add' })
    expect(svg).toHaveAttribute('width', '14')
  })

  it('provides stroke to child Icons', () => {
    const { container } = render(
      <IconProvider stroke="bold">
        <Icon icon={IconPlus} />
      </IconProvider>,
    )
    // bold + md (default) = strokeWidth 2.5
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('stroke-width', '2.5')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <IconProvider size="md">
        <Icon icon={IconPlus} label="Add item" />
      </IconProvider>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
