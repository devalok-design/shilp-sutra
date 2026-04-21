import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { describeConformance } from '../test-utils/conformance'
import { Checkbox } from './checkbox'

describeConformance('Checkbox', (props) => <Checkbox aria-label="Accept terms" {...props} />, {
  sizes: ['sm', 'md', 'lg'],
})

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

  it('renders as checked when checked prop is true', () => {
    render(<Checkbox checked aria-label="Checked box" />)
    expect(screen.getByRole('checkbox', { name: 'Checked box' })).toBeChecked()
  })

  it('sm checkbox can still be checked', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    render(<Checkbox size="sm" aria-label="Small check" onCheckedChange={onCheckedChange} />)
    await user.click(screen.getByRole('checkbox'))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })
})
