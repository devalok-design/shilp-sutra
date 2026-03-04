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
})
