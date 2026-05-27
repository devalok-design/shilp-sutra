// @server-safe
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

// Polymorphic component type — preserves T across the call site so element-
// specific props (e.g. `<Container as="main">` accepting <main> props)
// typecheck. Standard polymorphic-component pattern; see text.tsx + stack.tsx.
type ContainerComponent = (<T extends React.ElementType = 'div'>(
  props: ContainerProps<T> & { ref?: React.ComponentPropsWithRef<T>['ref'] },
) => React.ReactElement | null) & { displayName?: string }

const ContainerImpl = React.forwardRef<HTMLElement, ContainerProps>(
  ({ as, maxWidth = 'default', className, children, ...props }, ref) => {
    const Component = as || 'div'
    return React.createElement(
      Component,
      {
        ref,
        className: cn('mx-auto w-full px-page-x', maxWidthMap[maxWidth], className),
        ...props,
      },
      children,
    )
  },
)
ContainerImpl.displayName = 'Container'

const Container = ContainerImpl as unknown as ContainerComponent

export { Container, type ContainerProps }
