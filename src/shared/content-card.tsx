import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../ui/lib/utils'

const contentCardVariants = cva(
  'rounded-ds-lg transition-[color,background-color,border-color,box-shadow] duration-moderate',
  {
    variants: {
      variant: {
        default:
          'border border-border bg-layer-01 shadow-01 hover:shadow-02',
        outline:
          'border border-[var(--border-secondary)] bg-transparent hover:border-[var(--border-tertiary)]',
        ghost:
          'border border-transparent bg-transparent hover:bg-layer-02',
      },
      padding: {
        default: 'p-ds-05b',
        compact: 'p-ds-04',
        spacious: 'p-ds-06',
        none: 'p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'default',
    },
  },
)

const getPadding = (padding: string | null | undefined) => {
  switch (padding) {
    case 'compact': return 'px-ds-04 py-2.5'
    case 'spacious': return 'px-ds-06 py-ds-05'
    default: return 'px-ds-05b py-3.5'
  }
}

const getContentPadding = (padding: string | null | undefined) => {
  switch (padding) {
    case 'compact': return 'p-ds-04'
    case 'spacious': return 'p-ds-06'
    default: return 'p-ds-05b'
  }
}

interface ContentCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof contentCardVariants> {
  header?: React.ReactNode
  headerTitle?: string
  headerActions?: React.ReactNode
  footer?: React.ReactNode
}

const ContentCard = React.forwardRef<HTMLDivElement, ContentCardProps>(
  (
    {
      variant,
      padding,
      header,
      headerTitle,
      headerActions,
      footer,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const hasHeader = header || headerTitle || headerActions

    return (
      <div
        ref={ref}
        className={cn(
          contentCardVariants({ variant, padding: hasHeader || footer ? 'none' : padding }),
          className,
        )}
        {...props}
      >
        {hasHeader && (
          <div
            className={cn(
              'flex items-center justify-between border-b border-border',
              getPadding(padding),
            )}
          >
            {header ?? (
              <>
                {headerTitle && (
                  <h3 className="text-ds-base semibold text-text-primary">
                    {headerTitle}
                  </h3>
                )}
                {headerActions && (
                  <div className="flex items-center gap-ds-03">{headerActions}</div>
                )}
              </>
            )}
          </div>
        )}

        <div
          className={cn(
            (hasHeader || footer) && getContentPadding(padding),
          )}
        >
          {children}
        </div>

        {footer && (
          <div
            className={cn(
              'border-t border-border',
              getPadding(padding),
            )}
          >
            {footer}
          </div>
        )}
      </div>
    )
  },
)
ContentCard.displayName = 'ContentCard'

export { ContentCard, contentCardVariants }
export type { ContentCardProps }
