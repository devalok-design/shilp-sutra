import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  AppShell,
  AppShellBar,
  AppShellBody,
  AppShellCanvas,
  AppShellSidebar,
} from './app-shell'

function Shell({
  variant,
  chrome,
}: {
  variant?: 'flat' | 'inset'
  chrome?: 'dim' | 'bright'
}) {
  return (
    <AppShell variant={variant} chrome={chrome} data-testid="root">
      <AppShellBar data-testid="bar">bar</AppShellBar>
      <AppShellBody data-testid="body">
        <AppShellSidebar data-testid="side">side</AppShellSidebar>
        <AppShellCanvas data-testid="canvas">canvas</AppShellCanvas>
      </AppShellBody>
    </AppShell>
  )
}

describe('AppShell', () => {
  it('puts the bar above the body, not inside the content pane', () => {
    render(<Shell />)
    const root = screen.getByTestId('root')
    const bar = screen.getByTestId('bar')
    const body = screen.getByTestId('body')
    // The whole reason this component exists: the bar is a SIBLING of the row,
    // so it spans the sidebar as well. Nesting it inside the canvas is the
    // arrangement we already had.
    expect(bar.parentElement).toBe(root)
    expect(body.parentElement).toBe(root)
    expect(screen.getByTestId('side').parentElement).toBe(body)
  })

  it('renders semantic landmarks', () => {
    render(<Shell />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  describe('surfaces', () => {
    it('flat puts chrome and canvas on the same surface', () => {
      render(<Shell variant="flat" />)
      expect(screen.getByTestId('root').className).toContain('bg-surface-base')
      expect(screen.getByTestId('canvas').className).toContain('bg-surface-base')
    })

    // The two inset arrangements are the SAME pair of tokens, swapped. If these
    // two ever resolve to the same assignment, the distinction has collapsed.
    it('inset/dim recedes the chrome and brightens the canvas', () => {
      render(<Shell variant="inset" chrome="dim" />)
      expect(screen.getByTestId('root').className).toContain('bg-surface-sunken')
      expect(screen.getByTestId('canvas').className).toContain('bg-surface-panel')
    })

    it('inset/bright is the exact reverse', () => {
      render(<Shell variant="inset" chrome="bright" />)
      expect(screen.getByTestId('root').className).toContain('bg-surface-panel')
      expect(screen.getByTestId('canvas').className).toContain('bg-surface-sunken')
    })
  })

  describe('the bar', () => {
    it('uses a MINIMUM height, never a fixed one', () => {
      // A fixed height clips a two-line workspace switcher. This is the bug the
      // Figma prototype hit before the height became a minimum.
      render(<Shell variant="flat" />)
      const cls = screen.getByTestId('bar').className
      expect(cls).toContain('min-h-ds-xl')
      // NB: /\bh-ds-/ would match INSIDE `min-h-ds-xl` — \b sits at the hyphen.
      expect(cls).not.toMatch(/(^|\s)h-ds-/)
    })

    it('is shorter when inset, because it is part of a continuous plane', () => {
      render(<Shell variant="inset" />)
      expect(screen.getByTestId('bar').className).toContain('min-h-ds-lg')
    })

    it('draws an edge when flat and none when inset', () => {
      const { unmount } = render(<Shell variant="flat" />)
      expect(screen.getByTestId('bar').className).toContain('border-b')
      unmount()
      render(<Shell variant="inset" />)
      expect(screen.getByTestId('bar').className).not.toContain('border-b')
    })

    it('lets the caller override the edge either way', () => {
      render(
        <AppShell variant="inset">
          <AppShellBar bordered data-testid="bar">
            bar
          </AppShellBar>
        </AppShell>,
      )
      expect(screen.getByTestId('bar').className).toContain('border-b')
    })
  })

  describe('the sidebar', () => {
    it('matches the widths Sidebar itself uses', () => {
      const { unmount } = render(<Shell />)
      expect(screen.getByTestId('side')).toHaveStyle({ width: '16rem' })
      unmount()
      render(
        <AppShell>
          <AppShellBody>
            <AppShellSidebar collapsed data-testid="side" />
          </AppShellBody>
        </AppShell>,
      )
      expect(screen.getByTestId('side')).toHaveStyle({ width: '3rem' })
    })

    it('carries its own edge only when flat', () => {
      const { unmount } = render(<Shell variant="flat" />)
      expect(screen.getByTestId('side').className).toContain('border-r')
      unmount()
      render(<Shell variant="inset" />)
      expect(screen.getByTestId('side').className).not.toContain('border-r')
    })
  })

  describe('the inset canvas', () => {
    it('floats off the bottom-right only, flush to the bar and sidebar', () => {
      render(<Shell variant="inset" />)
      const gap = screen.getByTestId('canvas').parentElement
      expect(gap?.className).toContain('pb-ds-03')
      expect(gap?.className).toContain('pr-ds-03')
      expect(gap?.className).not.toContain('pt-')
      expect(gap?.className).not.toContain('pl-')
    })

    it('carries no shadow — it is a frame, not a floating thing', () => {
      render(<Shell variant="inset" />)
      const canvas = screen.getByTestId('canvas')
      expect(canvas.className).not.toMatch(/shadow-(raised|floating|overlay)/)
      expect(canvas.parentElement?.className).not.toMatch(/shadow-/)
    })

    it('has no wrapper or radius when flat', () => {
      render(<Shell variant="flat" />)
      const canvas = screen.getByTestId('canvas')
      expect(canvas.className).not.toContain('rounded-')
      expect(canvas.parentElement).toBe(screen.getByTestId('body'))
    })
  })

  it('defaults to flat', () => {
    render(<Shell />)
    expect(screen.getByTestId('root').className).toContain('bg-surface-base')
  })

  it('forwards className without dropping its own classes', () => {
    render(
      <AppShell className="custom-x" data-testid="root">
        <AppShellBody />
      </AppShell>,
    )
    const cls = screen.getByTestId('root').className
    expect(cls).toContain('custom-x')
    expect(cls).toContain('flex')
  })
})
