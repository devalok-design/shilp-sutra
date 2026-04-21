import { IconHome, IconSettings, IconUser } from '@tabler/icons-react'
import { render, screen } from '@testing-library/react'
import { describe, expect,it } from 'vitest'

import { describeConformance } from '../test-utils/conformance'
import { Icon } from './icon'
import { IconGroup } from './icon-group'

describeConformance(
  'IconGroup',
  (props) => (
    <IconGroup {...props}>
      <Icon icon={IconHome} label="Home" />
    </IconGroup>
  ),
  // IconGroup destructures its props explicitly (no ...rest spread) —
  // arbitrary HTML attrs are not forwarded by design.
  { skip: ['attrs'] },
)

describe('IconGroup', () => {
  it('renders children', () => {
    const { container } = render(
      <IconGroup>
        <Icon icon={IconHome} label="Home" />
        <Icon icon={IconSettings} label="Settings" />
      </IconGroup>,
    )
    // Icon with label renders an accessible SVG
    expect(container.querySelectorAll('svg').length).toBe(2)
  })

  it('applies gap classes', () => {
    const { container } = render(
      <IconGroup gap="loose">
        <Icon icon={IconHome} />
      </IconGroup>,
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('gap-2')
  })

  it('applies tight gap', () => {
    const { container } = render(
      <IconGroup gap="tight">
        <Icon icon={IconHome} />
      </IconGroup>,
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('gap-0.5')
  })

  it('renders with toolbar role', () => {
    render(
      <IconGroup role="toolbar" label="Formatting">
        <Icon icon={IconHome} label="Home" />
      </IconGroup>,
    )
    expect(screen.getByRole('toolbar', { name: 'Formatting' })).toBeInTheDocument()
  })

  it('does not add role by default', () => {
    render(
      <IconGroup>
        <Icon icon={IconHome} />
      </IconGroup>,
    )
    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument()
  })

  it('does not set aria-label without toolbar role', () => {
    const { container } = render(
      <IconGroup label="Ignored label">
        <Icon icon={IconHome} />
      </IconGroup>,
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).not.toHaveAttribute('aria-label')
  })

  it('renders multiple children with default gap', () => {
    const { container } = render(
      <IconGroup>
        <Icon icon={IconHome} />
        <Icon icon={IconSettings} />
        <Icon icon={IconUser} />
      </IconGroup>,
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('gap-1')
    expect(wrapper.children).toHaveLength(3)
  })

})
