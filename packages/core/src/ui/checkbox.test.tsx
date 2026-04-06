import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Checkbox } from './checkbox'

describe('Checkbox', () => {
  it('renders unchecked by default', () => {
    render(<Checkbox aria-label="Accept terms" />)
    expect(screen.getByRole('checkbox', { name: 'Accept terms' })).not.toBeChecked()
  })

  it('can be checked via click', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    render(<Checkbox aria-label="Accept terms" onCheckedChange={onCheckedChange} />)
    await user.click(screen.getByRole('checkbox'))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLButtonElement | null }
    render(<Checkbox ref={ref as React.Ref<HTMLButtonElement>} aria-label="Ref test" />)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('renders as checked when checked prop is true', () => {
    render(<Checkbox checked aria-label="Checked box" />)
    expect(screen.getByRole('checkbox', { name: 'Checked box' })).toBeChecked()
  })

  describe('size prop', () => {
    it('defaults to md (h-6 w-6)', () => {
      render(<Checkbox aria-label="Size test" />)
      const el = screen.getByRole('checkbox')
      expect(el.className).toContain('h-6')
      expect(el.className).toContain('w-6')
    })

    it('renders sm size (h-5 w-5)', () => {
      render(<Checkbox size="sm" aria-label="Small checkbox" />)
      const el = screen.getByRole('checkbox')
      expect(el.className).toContain('h-5')
      expect(el.className).toContain('w-5')
    })

    it('renders lg size (h-7 w-7)', () => {
      render(<Checkbox size="lg" aria-label="Large checkbox" />)
      const el = screen.getByRole('checkbox')
      expect(el.className).toContain('h-7')
      expect(el.className).toContain('w-7')
    })

    it('sm checkbox can still be checked', async () => {
      const user = userEvent.setup()
      const onCheckedChange = vi.fn()
      render(<Checkbox size="sm" aria-label="Small check" onCheckedChange={onCheckedChange} />)
      await user.click(screen.getByRole('checkbox'))
      expect(onCheckedChange).toHaveBeenCalledWith(true)
    })
  })
})
