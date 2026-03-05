import * as React from 'react'
import { cn } from './lib/utils'

export interface VisuallyHiddenProps
  extends React.HTMLAttributes<HTMLSpanElement> {}

const VisuallyHidden = React.forwardRef<HTMLSpanElement, VisuallyHiddenProps>(
  ({ className, ...props }, ref) => {
    return <span ref={ref} className={cn('sr-only', className)} {...props} />
  },
)
VisuallyHidden.displayName = 'VisuallyHidden'

export { VisuallyHidden }
