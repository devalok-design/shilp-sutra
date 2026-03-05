import * as React from 'react'
import { cn } from './lib/utils'

type SpacingToken =
  | 'ds-01'
  | 'ds-02'
  | 'ds-02b'
  | 'ds-03'
  | 'ds-04'
  | 'ds-05'
  | 'ds-05b'
  | 'ds-06'
  | 'ds-07'
  | 'ds-08'
  | 'ds-09'
  | 'ds-10'
  | 'ds-11'
  | 'ds-12'
  | 'ds-13'

type StackProps<T extends React.ElementType = 'div'> = {
  as?: T
  direction?: 'vertical' | 'horizontal' | 'row' | 'column'
  gap?: SpacingToken | number
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

const gapMap: Record<string, string> = {
  '0': 'gap-0',
  '1': 'gap-ds-01',
  '2': 'gap-ds-02',
  '3': 'gap-ds-03',
  '4': 'gap-ds-04',
  '5': 'gap-ds-05',
  '6': 'gap-ds-06',
  '7': 'gap-ds-07',
  '8': 'gap-ds-08',
  'ds-01': 'gap-ds-01',
  'ds-02': 'gap-ds-02',
  'ds-02b': 'gap-ds-02b',
  'ds-03': 'gap-ds-03',
  'ds-04': 'gap-ds-04',
  'ds-05': 'gap-ds-05',
  'ds-05b': 'gap-ds-05b',
  'ds-06': 'gap-ds-06',
  'ds-07': 'gap-ds-07',
  'ds-08': 'gap-ds-08',
  'ds-09': 'gap-ds-09',
  'ds-10': 'gap-ds-10',
  'ds-11': 'gap-ds-11',
  'ds-12': 'gap-ds-12',
  'ds-13': 'gap-ds-13',
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
          (direction === 'vertical' || direction === 'column') ? 'flex-col' : 'flex-row',
          gap != null && gapMap[String(gap)],
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

export { Stack, type SpacingToken, type StackProps }
