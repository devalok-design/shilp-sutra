import { render } from '@testing-library/react'
import { describe, expect,it } from 'vitest'
import { axe } from 'vitest-axe'

import { Avatar, AvatarFallback,AvatarImage } from '../avatar'

describe('Avatar accessibility', () => {
  it('should have no violations with an image', async () => {
    const { container } = render(
      <Avatar>
        <AvatarImage src="https://example.com/avatar.jpg" alt="Jane Doe" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with fallback only', async () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
