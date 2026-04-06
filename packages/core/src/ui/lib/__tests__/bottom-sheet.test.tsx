import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { BottomSheet } from '../bottom-sheet'

describe('BottomSheet', () => {
  it('renders when open', () => {
    render(
      <BottomSheet open onOpenChange={() => {}} title="Test">
        Content
      </BottomSheet>,
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(
      <BottomSheet open={false} onOpenChange={() => {}} title="Test">
        Content
      </BottomSheet>,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows drag handle by default', () => {
    render(
      <BottomSheet open onOpenChange={() => {}} title="Test">
        Content
      </BottomSheet>,
    )
    // Drag handle is a small bar (h-1 w-8) rendered inside the portaled dialog
    const handle = document.body.querySelector('.h-1.w-8')
    expect(handle).toBeInTheDocument()
  })

  it('hides drag handle when dragHandle={false}', () => {
    render(
      <BottomSheet open onOpenChange={() => {}} title="Test" dragHandle={false}>
        Content
      </BottomSheet>,
    )
    const handle = document.body.querySelector('.h-1.w-8')
    expect(handle).not.toBeInTheDocument()
  })

  it('has accessible dialog role with aria-label', () => {
    render(
      <BottomSheet open onOpenChange={() => {}} title="Test sheet">
        Content
      </BottomSheet>,
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-label', 'Test sheet')
  })

  // Note: Swipe-to-dismiss via framer-motion drag is not testable in jsdom

  it('has no accessibility violations', async () => {
    const { container } = render(
      <BottomSheet open onOpenChange={() => {}} title="Test">
        Content
      </BottomSheet>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
