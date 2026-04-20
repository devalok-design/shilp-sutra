import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '../context-menu'

describe('ContextMenu', () => {
  it('renders the trigger content', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>Right click me</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Copy</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    )
    expect(screen.getByText('Right click me')).toBeInTheDocument()
  })

  it('does not show menu content initially', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>Right click me</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Copy</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    )
    expect(screen.queryByText('Copy')).not.toBeInTheDocument()
  })

  it('renders ContextMenuShortcut as a span', () => {
    const { container } = render(<ContextMenuShortcut className="my-shortcut">Ctrl+C</ContextMenuShortcut>)
    const span = container.querySelector('span')
    expect(span).toBeInTheDocument()
    expect(span).toHaveTextContent('Ctrl+C')
    expect(span).toHaveClass('my-shortcut')
  })

  it('ContextMenuShortcut has displayName', () => {
    expect(ContextMenuShortcut.displayName).toBe('ContextMenuShortcut')
  })
})
