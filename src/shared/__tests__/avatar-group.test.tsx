import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { axe } from 'vitest-axe'
import { AvatarGroup } from '../avatar-group'

const mockUsers = [
  { name: 'Alice Johnson', image: null },
  { name: 'Bob Smith', image: null },
  { name: 'Charlie Brown', image: null },
  { name: 'Diana Prince', image: null },
  { name: 'Edward Norton', image: null },
]

describe('AvatarGroup', () => {
  it('should have no accessibility violations with multiple users', async () => {
    const { container } = render(
      <AvatarGroup users={mockUsers.slice(0, 3)} />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no accessibility violations with overflow', async () => {
    const { container } = render(
      <AvatarGroup users={mockUsers} max={3} />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no accessibility violations at small size', async () => {
    const { container } = render(
      <AvatarGroup users={mockUsers.slice(0, 2)} size="sm" />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no accessibility violations at large size', async () => {
    const { container } = render(
      <AvatarGroup users={mockUsers.slice(0, 2)} size="lg" />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no accessibility violations with tooltips disabled', async () => {
    const { container } = render(
      <AvatarGroup users={mockUsers.slice(0, 3)} showTooltip={false} />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no accessibility violations with a single user', async () => {
    const { container } = render(
      <AvatarGroup users={[{ name: 'Solo User' }]} />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
