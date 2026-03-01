import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription } from './toast'

function renderToast(props: { variant?: 'default' | 'destructive' | 'karam' } = {}) {
  return render(
    <ToastProvider>
      <Toast open {...props}>
        <ToastTitle>Toast Title</ToastTitle>
        <ToastDescription>Toast Description</ToastDescription>
      </Toast>
      <ToastViewport />
    </ToastProvider>,
  )
}

describe('Toast', () => {
  it('renders with role status and aria-live polite', () => {
    renderToast()
    const toasts = screen.getAllByRole('status')
    const toastEl = toasts.find((el) => el.getAttribute('aria-live') === 'polite')
    expect(toastEl).toBeDefined()
    expect(toastEl).toHaveAttribute('aria-live', 'polite')
  })

  it('renders title and description', () => {
    renderToast()
    expect(screen.getByText('Toast Title')).toBeInTheDocument()
    expect(screen.getByText('Toast Description')).toBeInTheDocument()
  })

  it('accepts variant prop without error', () => {
    renderToast({ variant: 'destructive' })
    expect(screen.getByText('Toast Title')).toBeInTheDocument()
  })
})
