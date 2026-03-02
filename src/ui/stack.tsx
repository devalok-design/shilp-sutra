import * as React from 'react'
import { cn } from './lib/utils'

type StackProps<T extends React.ElementType = 'div'> = {
  as?: T
  direction?: 'vertical' | 'horizontal'
  gap?: string
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  wrap?: boolean
  className?: string
  children?: React.ReactNode
} & Omit<React.ComponentPropsWithRef<T>, 'as' | 'className' | 'children'>

const alignMap = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
} as const

const justifyMap = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
} as const

const Stack = React.forwardRef<HTMLElement, StackProps>(
  ({ as, direction = 'vertical', gap, align, justify, wrap, className, children, ...props }, ref) => {
    const Component = as || 'div'
    return React.createElement(
      Component,
      {
        ref,
        className: cn(
          'flex',
          direction === 'vertical' ? 'flex-col' : 'flex-row',
          gap && `gap-${gap}`,
          align && alignMap[align],
          justify && justifyMap[justify],
          wrap && 'flex-wrap',
          className,
        ),
        ...props,
      },
      children,
    )
  },
)
Stack.displayName = 'Stack'

export { Stack, type StackProps }
