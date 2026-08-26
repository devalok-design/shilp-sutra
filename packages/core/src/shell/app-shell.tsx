'use client'

import type { ComponentProps } from 'react'
import { createContext, forwardRef, useContext } from 'react'

import { cn } from '../ui/lib/utils'

/**
 * AppShell — the frame that lets a bar span above BOTH the sidebar and the
 * content.
 *
 * This is the one shape the library could not express. `SidebarProvider`
 * renders a single flex row, so a bar can only live *inside* the content pane —
 * which is why every shadcn example puts its `<header>` inside `SidebarInset`.
 * Carbon can do it because its `Header` is a sibling above `SideNav`; this is
 * that arrangement.
 *
 * Compose it with the components you already have:
 *
 * ```tsx
 * <AppShell variant="inset" chrome="dim">
 *   <AppShellBar><TopBar … /></AppShellBar>
 *   <AppShellBody>
 *     <AppShellSidebar><Sidebar … /></AppShellSidebar>
 *     <AppShellCanvas>{children}</AppShellCanvas>
 *   </AppShellBody>
 * </AppShell>
 * ```
 *
 * ## The two inset arrangements
 *
 * `chrome` decides which plane the frame takes and which the work takes. It is
 * not a lightness switch — the two planes swap roles, and which one is lighter
 * flips between themes:
 *
 * | | light chrome | light canvas | dark chrome | dark canvas |
 * |---|---|---|---|---|
 * | `dim`    | `#eeeeee` | `#ffffff` | `#0a0a0a` | `#171717` |
 * | `bright` | `#ffffff` | `#eeeeee` | `#171717` | `#0a0a0a` |
 *
 * Both come from the same two tokens — `surface-sunken` and `surface-panel` —
 * swapped. No third tier, and no per-theme special case.
 *
 * With `dim` the brand tint lands on the frame and the work area stays neutral.
 * With `bright` it is the reverse. That choice matters more than the lightness:
 * it decides whether your brand colour surrounds the work or sits underneath it.
 *
 * See docs/plans/2026-08-26-surface-model-rebuild.md.
 */

type Variant = 'flat' | 'inset'
type Chrome = 'dim' | 'bright'

interface ShellContext {
  variant: Variant
  chrome: Chrome
}

const AppShellContext = createContext<ShellContext>({ variant: 'flat', chrome: 'dim' })

function useAppShell(part: string): ShellContext {
  const ctx = useContext(AppShellContext)
  if (!ctx) throw new Error(`${part} must be rendered inside <AppShell>.`)
  return ctx
}

export interface AppShellProps extends ComponentProps<'div'> {
  /**
   * `flat` — chrome and content share one surface; a hairline on the sidebar
   * does the separating. `inset` — the content sits in a rounded panel inside
   * the chrome. @default 'flat'
   */
  variant?: Variant
  /**
   * Which plane the chrome takes when `variant="inset"`. Ignored when flat.
   * @default 'dim'
   */
  chrome?: Chrome
}

const AppShell = forwardRef<HTMLDivElement, AppShellProps>(
  ({ variant = 'flat', chrome = 'dim', className, children, ...props }, ref) => (
    <AppShellContext.Provider value={{ variant, chrome }}>
      <div
        ref={ref}
        className={cn(
          'flex min-h-svh flex-col',
          variant === 'flat' && 'bg-surface-base',
          // the two inset arrangements are the same pair of tokens, swapped
          variant === 'inset' && chrome === 'dim' && 'bg-surface-sunken',
          variant === 'inset' && chrome === 'bright' && 'bg-surface-panel',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </AppShellContext.Provider>
  ),
)
AppShell.displayName = 'AppShell'

export interface AppShellBarProps extends ComponentProps<'header'> {
  /**
   * Draw a hairline under the bar. Defaults to `true` when flat (the bar is its
   * own region and needs the edge) and `false` when inset (the bar is part of a
   * continuous chrome plane, and a border would cut it in half).
   */
  bordered?: boolean
}

/**
 * The full-width bar. Sits above the sidebar and the canvas, which is the whole
 * point of this component.
 *
 * Height is a MINIMUM, not a fixed value — `TopBar` sizes to its content, and a
 * two-line workspace switcher legitimately needs more room than a one-line one.
 * Fixing it would clip.
 */
const AppShellBar = forwardRef<HTMLElement, AppShellBarProps>(
  ({ bordered, className, ...props }, ref) => {
    const { variant } = useAppShell('AppShellBar')
    const showBorder = bordered ?? variant === 'flat'
    return (
      <header
        ref={ref}
        className={cn(
          'flex w-full shrink-0 items-center',
          variant === 'flat' ? 'min-h-ds-xl' : 'min-h-ds-lg',
          showBorder && 'border-b border-surface-border',
          className,
        )}
        {...props}
      />
    )
  },
)
AppShellBar.displayName = 'AppShellBar'

/** The row beneath the bar: sidebar alongside canvas. */
const AppShellBody = forwardRef<HTMLDivElement, ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    // min-h-0 so a scrolling canvas does not stretch the row past the viewport
    <div ref={ref} className={cn('flex min-h-0 flex-1', className)} {...props} />
  ),
)
AppShellBody.displayName = 'AppShellBody'

export interface AppShellSidebarProps extends ComponentProps<'div'> {
  /** Render at the collapsed icon width instead of the full width. */
  collapsed?: boolean
}

/**
 * Fixed-width slot for the sidebar. Widths come from the same constants
 * `Sidebar` uses (16rem expanded, 3rem collapsed), so the two agree whether or
 * not you compose them together.
 */
const AppShellSidebar = forwardRef<HTMLDivElement, AppShellSidebarProps>(
  ({ collapsed = false, className, style, ...props }, ref) => {
    const { variant } = useAppShell('AppShellSidebar')
    return (
      <div
        ref={ref}
        data-collapsed={collapsed || undefined}
        style={{ width: collapsed ? '3rem' : '16rem', ...style }}
        className={cn(
          'flex shrink-0 flex-col',
          // flat has no chrome plane of its own, so the edge does the work
          variant === 'flat' && 'border-r border-surface-border',
          className,
        )}
        {...props}
      />
    )
  },
)
AppShellSidebar.displayName = 'AppShellSidebar'

/**
 * The content pane.
 *
 * When inset, the panel is flush to the bar and the sidebar and floats only off
 * the bottom-right. It reads as the frame opening up rather than as a card
 * dropped into the middle — a symmetric gap fights that.
 *
 * No shadow. The inset canvas is a frame, not a floating thing; shadows are
 * reserved for what genuinely floats.
 */
const AppShellCanvas = forwardRef<HTMLDivElement, ComponentProps<'main'>>(
  ({ className, children, ...props }, ref) => {
    const { variant, chrome } = useAppShell('AppShellCanvas')

    if (variant === 'flat') {
      return (
        <main
          ref={ref}
          className={cn('flex min-w-0 flex-1 flex-col bg-surface-base', className)}
          {...props}
        >
          {children}
        </main>
      )
    }

    return (
      <div className="flex min-w-0 flex-1 pb-ds-03 pr-ds-03">
        <main
          ref={ref}
          className={cn(
            'flex min-w-0 flex-1 flex-col overflow-hidden rounded-overlay-lg',
            chrome === 'dim' ? 'bg-surface-panel' : 'bg-surface-sunken',
            className,
          )}
          {...props}
        >
          {children}
        </main>
      </div>
    )
  },
)
AppShellCanvas.displayName = 'AppShellCanvas'

export { AppShell, AppShellBar, AppShellBody, AppShellCanvas, AppShellSidebar }
