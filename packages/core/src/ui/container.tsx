import * as React from 'react'
import { cn } from './lib/utils'

type ContainerProps<T extends React.ElementType = 'div'> = {
  as?: T
  maxWidth?: 'default' | 'body' | 'full'
  className?: string
  children?: React.ReactNode
} & Omit<React.ComponentPropsWithRef<T>, 'as' | 'className' | 'children'>

const maxWidthMap = {
  default: 'max-w-layout',
  body: 'max-w-layout-body',
  full: 'max-w-full',
} as const

const Container = React.forwardRef<HTMLElement, ContainerProps>(
  ({ as, maxWidth = 'default', className, children, ...props }, ref) => {
    const Component = as || 'div'
    return React.createElement(
      Component,
      {
        ref,
        className: cn('mx-auto w-full px-ds-05', maxWidthMap[maxWidth], className),
        ...props,
      },
      children,
    )
  },
)
Container.displayName = 'Container'

export { Container, type ContainerProps }
