import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { axe } from 'vitest-axe'
import userEvent from '@testing-library/user-event'
import { CommandPalette } from '../command-palette'
import type { CommandGroup } from '../command-palette'

const sampleGroups: CommandGroup[] = [
  {
    label: 'Pages',
    items: [
      { id: 'dashboard', label: 'Dashboard', onSelect: () => {} },
      { id: 'projects', label: 'Projects', description: 'View all projects', onSelect: () => {} },
    ],
  },
  {
    label: 'Actions',
    items: [
      { id: 'new-task', label: 'New Task', shortcut: 'Ctrl+N', onSelect: () => {} },
    ],
  },
]

describe('CommandPalette', () => {
  it('should have no accessibility violations when closed (default state)', async () => {
    const { container } = render(<CommandPalette groups={sampleGroups} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no accessibility violations when open', async () => {
    const user = userEvent.setup()
    const { container } = render(<CommandPalette groups={sampleGroups} />)

    // Open via Ctrl+K
    await user.keyboard('{Control>}k{/Control}')

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no accessibility violations with empty groups', async () => {
    const user = userEvent.setup()
    const { container } = render(<CommandPalette groups={[]} />)

    await user.keyboard('{Control>}k{/Control}')

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
