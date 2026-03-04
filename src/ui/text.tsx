import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './lib/utils'

const textVariants = cva('font-sans', {
  variants: {
    variant: {
      'heading-2xl': 'text-[length:var(--typo-heading-2xl-size)] font-[number:var(--typo-heading-2xl-weight)] leading-[var(--typo-heading-2xl-leading)] tracking-[var(--typo-heading-2xl-tracking)]',
      'heading-xl':  'text-[length:var(--typo-heading-xl-size)] font-[number:var(--typo-heading-xl-weight)] leading-[var(--typo-heading-xl-leading)] tracking-[var(--typo-heading-xl-tracking)]',
      'heading-lg':  'text-[length:var(--typo-heading-lg-size)] font-[number:var(--typo-heading-lg-weight)] leading-[var(--typo-heading-lg-leading)] tracking-[var(--typo-heading-lg-tracking)]',
      'heading-md':  'text-[length:var(--typo-heading-md-size)] font-[number:var(--typo-heading-md-weight)] leading-[var(--typo-heading-md-leading)] tracking-[var(--typo-heading-md-tracking)]',
      'heading-sm':  'text-[length:var(--typo-heading-sm-size)] font-[number:var(--typo-heading-sm-weight)] leading-[var(--typo-heading-sm-leading)] tracking-[var(--typo-heading-sm-tracking)]',
      'heading-xs':  'text-[length:var(--typo-heading-xs-size)] font-[number:var(--typo-heading-xs-weight)] leading-[var(--typo-heading-xs-leading)] tracking-[var(--typo-heading-xs-tracking)]',
      'body-lg':     'text-[length:var(--typo-body-lg-size)] font-[number:var(--typo-body-lg-weight)] leading-[var(--typo-body-lg-leading)] tracking-[var(--typo-body-lg-tracking)]',
      'body-md':     'text-[length:var(--typo-body-md-size)] font-[number:var(--typo-body-md-weight)] leading-[var(--typo-body-md-leading)] tracking-[var(--typo-body-md-tracking)]',
      'body-sm':     'text-[length:var(--typo-body-sm-size)] font-[number:var(--typo-body-sm-weight)] leading-[var(--typo-body-sm-leading)] tracking-[var(--typo-body-sm-tracking)]',
      'body-xs':     'text-[length:var(--typo-body-xs-size)] font-[number:var(--typo-body-xs-weight)] leading-[var(--typo-body-xs-leading)] tracking-[var(--typo-body-xs-tracking)]',
      'label-lg':    'text-[length:var(--typo-label-lg-size)] font-[number:var(--typo-label-lg-weight)] leading-[var(--typo-label-lg-leading)] tracking-[var(--typo-label-lg-tracking)] uppercase',
      'label-md':    'text-[length:var(--typo-label-md-size)] font-[number:var(--typo-label-md-weight)] leading-[var(--typo-label-md-leading)] tracking-[var(--typo-label-md-tracking)] uppercase',
      'label-sm':    'text-[length:var(--typo-label-sm-size)] font-[number:var(--typo-label-sm-weight)] leading-[var(--typo-label-sm-leading)] tracking-[var(--typo-label-sm-tracking)] uppercase',
      'label-xs':    'text-[length:var(--typo-label-xs-size)] font-[number:var(--typo-label-xs-weight)] leading-[var(--typo-label-xs-leading)] tracking-[var(--typo-label-xs-tracking)] uppercase',
      caption:       'text-[length:var(--typo-caption-size)] font-[number:var(--typo-caption-weight)] leading-[var(--typo-caption-leading)] tracking-[var(--typo-caption-tracking)]',
      overline:      'text-[length:var(--typo-overline-size)] font-[number:var(--typo-overline-weight)] leading-[var(--typo-overline-leading)] tracking-[var(--typo-overline-tracking)] uppercase',
    },
  },
  defaultVariants: {
    variant: 'body-md',
  },
})

type TextVariant = NonNullable<VariantProps<typeof textVariants>['variant']>

const defaultElementMap: Record<TextVariant, keyof React.JSX.IntrinsicElements> = {
  'heading-2xl': 'h1',
  'heading-xl':  'h2',
  'heading-lg':  'h3',
  'heading-md':  'h4',
  'heading-sm':  'h5',
  'heading-xs':  'h6',
  'body-lg':     'p',
  'body-md':     'p',
  'body-sm':     'p',
  'body-xs':     'p',
  'label-lg':    'span',
  'label-md':    'span',
  'label-sm':    'span',
  'label-xs':    'span',
  caption:       'span',
  overline:      'span',
}

/**
 * Props for Text — a polymorphic typography component covering the full type scale:
 * headings, body, labels, captions, and overlines — with automatic semantic HTML element selection.
 *
 * **Variants (grouped):**
 * - Headings: `heading-2xl` → `h1`, `heading-xl` → `h2`, `heading-lg` → `h3`, etc.
 * - Body: `body-lg` | `body-md` (default) | `body-sm` | `body-xs` → `<p>`
 * - Labels: `label-lg` | `label-md` | `label-sm` | `label-xs` → `<span>` (uppercase)
 * - Misc: `caption` | `overline` → `<span>` (overline is uppercase)
 *
 * **`as` prop:** Override the rendered element. E.g. `<Text variant="heading-lg" as="div">` renders
 * `<div class="text-heading-lg ...">` — useful when you need heading styles on a non-heading element.
 *
 * @example
 * // Page heading:
 * <Text variant="heading-2xl">Welcome to Shilp Sutra</Text>
 *
 * @example
 * // Section label (uppercase, small):
 * <Text variant="label-sm" className="text-text-secondary">Recent activity</Text>
 *
 * @example
 * // Body copy with custom element (renders as <span> for inline use):
 * <Text variant="body-sm" as="span" className="text-text-secondary">
 *   Last updated 3 hours ago
 * </Text>
 *
 * @example
 * // Caption under an image or figure:
 * <Text variant="caption" className="text-text-tertiary">Figure 1: System architecture</Text>
 * // These are just a few ways — feel free to combine props creatively!
 */
type TextProps<T extends React.ElementType = 'p'> = {
  variant?: TextVariant
  as?: T
  className?: string
  children?: React.ReactNode
} & Omit<React.ComponentPropsWithRef<T>, 'as' | 'variant' | 'className' | 'children'>

const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ variant = 'body-md', as, className, children, ...props }, ref) => {
    const Component = as || defaultElementMap[variant] || 'p'
    return React.createElement(
      Component,
      { ref, className: cn(textVariants({ variant }), className), ...props },
      children,
    )
  },
)
Text.displayName = 'Text'

export { Text, textVariants, type TextProps, type TextVariant }
