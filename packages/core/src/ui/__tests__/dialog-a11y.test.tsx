import { render } from '@testing-library/react'
import { describe, expect,it } from 'vitest'
import { axe } from 'vitest-axe'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '../dialog'

describe('Dialog accessibility', () => {
  it('should have no violations in open state with title and description', async () => {
    const { container } = render(
      <Dialog open>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Confirm Action</DialogTitle>
          <DialogDescription>
            Are you sure you want to proceed with this action?
          </DialogDescription>
        </DialogContent>
      </Dialog>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
