import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import type { CommandGroup } from '../command-palette'
import { CommandPalette } from '../command-palette'

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

  // -- P1 #4: Controlled open state --

  it('supports controlled open state', () => {
    const onOpenChange = vi.fn()
    render(
      <CommandPalette groups={sampleGroups} open={true} onOpenChange={onOpenChange} />,
    )
    // Dialog should be open
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('supports defaultOpen for uncontrolled usage', () => {
    render(<CommandPalette groups={sampleGroups} defaultOpen={true} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('calls onOpenChange when opening/closing', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<CommandPalette groups={sampleGroups} onOpenChange={onOpenChange} />)

    // Open via Ctrl+K
    await user.keyboard('{Control>}k{/Control}')
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  // -- P1 #6: Keyboard shortcut customization --

  it('supports custom keybinding', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <CommandPalette groups={sampleGroups} keybinding="ctrl+p" onOpenChange={onOpenChange} />,
    )

    // Default Ctrl+K should not open
    await user.keyboard('{Control>}k{/Control}')
    expect(onOpenChange).not.toHaveBeenCalled()

    // Custom Ctrl+P should open
    await user.keyboard('{Control>}p{/Control}')
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('disables keybinding when false', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <CommandPalette groups={sampleGroups} keybinding={false} onOpenChange={onOpenChange} />,
    )

    await user.keyboard('{Control>}k{/Control}')
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('supports multiple keybindings', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <CommandPalette
        groups={sampleGroups}
        keybinding={['mod+k', 'ctrl+p']}
        onOpenChange={onOpenChange}
      />,
    )

    await user.keyboard('{Control>}p{/Control}')
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  // -- P0 #3: ReactNode labels --

  it('renders ReactNode labels', async () => {
    const groups: CommandGroup[] = [
      {
        label: 'Test',
        items: [
          {
            id: 'rich',
            label: <span data-testid="rich-label">Rich <strong>Label</strong></span>,
            filterValue: 'Rich Label',
            onSelect: () => {},
          },
        ],
      },
    ]
    render(<CommandPalette groups={groups} defaultOpen={true} />)
    expect(screen.getByTestId('rich-label')).toBeInTheDocument()
  })

  it('uses filterValue for search when label is ReactNode', async () => {
    const user = userEvent.setup()
    const groups: CommandGroup[] = [
      {
        label: 'Test',
        items: [
          {
            id: 'rich',
            label: <span>Rich Label</span>,
            filterValue: 'findme',
            onSelect: () => {},
          },
          {
            id: 'plain',
            label: 'Plain Item',
            onSelect: () => {},
          },
        ],
      },
    ]
    render(<CommandPalette groups={groups} defaultOpen={true} />)

    const dialog = screen.getByRole('dialog')
    const input = within(dialog).getByRole('combobox')
    await user.type(input, 'findme')

    // Rich item should match, plain should not
    expect(within(dialog).getByText('Rich Label')).toBeInTheDocument()
    expect(within(dialog).queryByText('Plain Item')).not.toBeInTheDocument()
  })

  it('renders renderLabel with query', async () => {
    const user = userEvent.setup()
    const renderLabel = vi.fn((query: string) => (
      <span data-testid="render-label">query={query}</span>
    ))
    const groups: CommandGroup[] = [
      {
        label: 'Test',
        items: [
          {
            id: 'custom',
            label: 'Custom Item',
            renderLabel,
            onSelect: () => {},
          },
        ],
      },
    ]
    render(<CommandPalette groups={groups} defaultOpen={true} />)

    const dialog = screen.getByRole('dialog')
    const input = within(dialog).getByRole('combobox')
    await user.type(input, 'cus')

    expect(renderLabel).toHaveBeenCalledWith('cus')
    expect(screen.getByTestId('render-label')).toBeInTheDocument()
  })

  // -- P2 #9: Custom empty state --

  it('renders custom emptyState ReactNode', () => {
    render(
      <CommandPalette
        groups={[]}
        defaultOpen={true}
        emptyState={<div data-testid="custom-empty">Try searching for something</div>}
      />,
    )
    expect(screen.getByTestId('custom-empty')).toBeInTheDocument()
  })

  // -- P2 #8: Configurable max-height --

  it('applies custom maxHeight', () => {
    render(<CommandPalette groups={sampleGroups} defaultOpen={true} maxHeight="500px" />)
    const dialog = screen.getByRole('dialog')
    const listbox = within(dialog).getByRole('listbox')
    expect(listbox.style.maxHeight).toBe('500px')
  })

  it('applies numeric maxHeight as pixels', () => {
    render(<CommandPalette groups={sampleGroups} defaultOpen={true} maxHeight={400} />)
    const dialog = screen.getByRole('dialog')
    const listbox = within(dialog).getByRole('listbox')
    expect(listbox.style.maxHeight).toBe('400px')
  })

  // -- P2 #11: Custom footer hints --

  it('renders custom footer hints', () => {
    render(
      <CommandPalette
        groups={sampleGroups}
        defaultOpen={true}
        footerHints={[{ keys: 'Tab', label: 'Filter' }]}
      />,
    )
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText('Filter')).toBeInTheDocument()
    expect(within(dialog).getByText('Tab')).toBeInTheDocument()
  })

  it('hides footer when footerHints is false', () => {
    render(
      <CommandPalette groups={sampleGroups} defaultOpen={true} footerHints={false} />,
    )
    const dialog = screen.getByRole('dialog')
    // Default hints should not be present
    expect(within(dialog).queryByText('Navigate')).not.toBeInTheDocument()
    expect(within(dialog).queryByText('Select')).not.toBeInTheDocument()
    expect(within(dialog).queryByText('Close')).not.toBeInTheDocument()
  })

  // -- P1 #7: Shortcut display --

  it('renders shortcut keys as individual keycaps', () => {
    const groups: CommandGroup[] = [
      {
        label: 'Nav',
        items: [
          { id: 'go', label: 'Go Home', shortcut: 'G H', onSelect: () => {} },
        ],
      },
    ]
    render(<CommandPalette groups={groups} defaultOpen={true} />)
    const dialog = screen.getByRole('dialog')
    const kbds = within(dialog).getAllByText(/^[GH]$/)
    expect(kbds.length).toBe(2)
  })
})
