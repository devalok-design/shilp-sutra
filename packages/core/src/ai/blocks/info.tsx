'use client'

import * as React from 'react'
import { Alert } from '../../ui/alert'
import type { BlockComponentProps } from '../types'

const InfoBlock = React.memo(function InfoBlock({
  data,
}: BlockComponentProps<{ message: string }>) {
  return (
    <Alert color="info" variant="subtle">
      {data.message}
    </Alert>
  )
})

export { InfoBlock }
