import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
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
})
