import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { MasterDetail } from './master-detail'

describe('MasterDetail', () => {
  it('renders list children', () => {
    render(
      <MasterDetail>
        <MasterDetail.List>
          <MasterDetail.ListItem>Item 1</MasterDetail.ListItem>
          <MasterDetail.ListItem>Item 2</MasterDetail.ListItem>
        </MasterDetail.List>
        <MasterDetail.Detail>
          <p>Detail content</p>
        </MasterDetail.Detail>
      </MasterDetail>,
    )
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
  })

  it('renders detail children', () => {
    render(
      <MasterDetail>
        <MasterDetail.List>
          <MasterDetail.ListItem>Item A</MasterDetail.ListItem>
        </MasterDetail.List>
        <MasterDetail.Detail>
          <p>Detail pane content</p>
        </MasterDetail.Detail>
      </MasterDetail>,
    )
    expect(screen.getByText('Detail pane content')).toBeInTheDocument()
  })

  it('renders ListItem with option role', () => {
    render(
      <MasterDetail>
        <MasterDetail.List>
          <MasterDetail.ListItem>Clickable</MasterDetail.ListItem>
        </MasterDetail.List>
        <MasterDetail.Detail>Detail</MasterDetail.Detail>
      </MasterDetail>,
    )
    expect(screen.getByRole('option', { name: 'Clickable' })).toBeInTheDocument()
  })

  it('marks active ListItem with data-active and aria-selected', () => {
    render(
      <MasterDetail selected="1">
        <MasterDetail.List>
          <MasterDetail.ListItem active>Active item</MasterDetail.ListItem>
        </MasterDetail.List>
        <MasterDetail.Detail>Detail</MasterDetail.Detail>
      </MasterDetail>,
    )
    const item = screen.getByRole('option', { name: 'Active item' })
    expect(item).toHaveAttribute('data-active')
    expect(item).toHaveAttribute('aria-selected', 'true')
  })

  // An ungated `hover:bg-surface-panel-hover` is (0,2,0) and a plain
  // `bg-accent-4` is (0,1,0), so hover WON and pointing at the selected row
  // turned it grey. TreeItem and TableRow already guard against this; this was
  // the third instance of the same fault.
  //
  // Asserted on the class list rather than by simulating hover, because jsdom
  // does not apply :hover — a behavioural test here would pass while the bug
  // was live, which is how it survived a review in the first place.
  it('an active item keeps its tint under hover', () => {
    render(
      <MasterDetail selected="1">
        <MasterDetail.List>
          <MasterDetail.ListItem active>Active item</MasterDetail.ListItem>
          <MasterDetail.ListItem>Idle item</MasterDetail.ListItem>
        </MasterDetail.List>
        <MasterDetail.Detail>Detail</MasterDetail.Detail>
      </MasterDetail>,
    )
    const active = screen.getByRole('option', { name: 'Active item' })
    const idle = screen.getByRole('option', { name: 'Idle item' })

    // The grey hover must not be on the active row at all…
    expect(active.className).not.toContain('hover:bg-surface-panel-hover')
    // …and the active row still needs a hover state of its own, or it looks
    // dead to the pointer.
    expect(active.className).toContain('hover:bg-accent-5')
    expect(active.className).toContain('bg-accent-4')

    // The idle row is unaffected.
    expect(idle.className).toContain('hover:bg-surface-panel-hover')
  })

  it('renders both list and detail in desktop mode (matchMedia returns false)', () => {
    // matchMedia is mocked to return matches:false (desktop) in test-setup
    render(
      <MasterDetail>
        <MasterDetail.List data-testid="list-pane">
          <MasterDetail.ListItem>Nav</MasterDetail.ListItem>
        </MasterDetail.List>
        <MasterDetail.Detail data-testid="detail-pane">
          <p>Content</p>
        </MasterDetail.Detail>
      </MasterDetail>,
    )
    expect(screen.getByTestId('list-pane')).toBeInTheDocument()
    expect(screen.getByTestId('detail-pane')).toBeInTheDocument()
  })

  it('listbox has an accessible name + detail is a polite live region (a11y)', () => {
    render(
      <MasterDetail label="Projects">
        <MasterDetail.List>
          <MasterDetail.ListItem value="a">A</MasterDetail.ListItem>
        </MasterDetail.List>
        <MasterDetail.Detail>Detail</MasterDetail.Detail>
      </MasterDetail>,
    )
    expect(screen.getByRole('listbox', { name: 'Projects' })).toBeInTheDocument()
    const region = screen.getByRole('region', { name: 'Detail' })
    expect(region).toHaveAttribute('aria-live', 'polite')
  })

  it('owns selection via value/onSelect (uncontrolled) — derives active from context', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    const onSelect = vi.fn()
    render(
      <MasterDetail defaultSelected="a" onSelect={onSelect}>
        <MasterDetail.List>
          <MasterDetail.ListItem value="a">Alpha</MasterDetail.ListItem>
          <MasterDetail.ListItem value="b">Bravo</MasterDetail.ListItem>
        </MasterDetail.List>
        <MasterDetail.Detail>d</MasterDetail.Detail>
      </MasterDetail>,
    )
    // Active derived from value === selected — no hand-wired `active` prop.
    expect(screen.getByRole('option', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('option', { name: 'Bravo' })).toHaveAttribute('aria-selected', 'false')
    await userEvent.click(screen.getByRole('option', { name: 'Bravo' }))
    expect(onSelect).toHaveBeenCalledWith('b')
    // Uncontrolled → the component moved selection itself.
    expect(screen.getByRole('option', { name: 'Bravo' })).toHaveAttribute('aria-selected', 'true')
  })
})
