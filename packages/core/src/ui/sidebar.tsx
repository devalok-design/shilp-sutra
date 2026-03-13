'use client'

import { Slot } from '@primitives/react-slot'
import { VariantProps, cva } from 'class-variance-authority'
import { IconLayoutSidebarLeftCollapse } from '@tabler/icons-react'
import { motion } from 'framer-motion'

import { useIsMobile } from '../hooks/use-mobile'
import { springs } from './lib/motion'
import { cn } from './lib/utils'
import { Button } from './button'
import { Input } from './input'
import { Separator } from './separator'
import { Sheet, SheetContent } from './sheet'
import { Skeleton } from './skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip'
import {
  ComponentProps,
  forwardRef,
  useMemo,
  useCallback,
  useEffect,
  useContext,
  useState,
  createContext,
  CSSProperties,
  ElementRef,
} from 'react'

const SIDEBAR_COOKIE_NAME = 'sidebar:state'
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = '16rem'
const SIDEBAR_WIDTH_MOBILE = '18rem'
const SIDEBAR_WIDTH_ICON = '3rem'
const SIDEBAR_KEYBOARD_SHORTCUT = 'b'

type SidebarContext = {
  state: 'expanded' | 'collapsed'
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContext | null>(null)

function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.')
  }

  return context
}

const SidebarProvider = forwardRef<
  HTMLDivElement,
  ComponentProps<'div'> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const isMobile = useIsMobile()
    const [openMobile, setOpenMobile] = useState(false)
    const [_open, _setOpen] = useState(defaultOpen)
    const open = openProp ?? _open
    const setOpen = useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === 'function' ? value(open) : value
        if (setOpenProp) {
          setOpenProp(openState)
        } else {
          _setOpen(openState)
        }
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
      },
      [setOpenProp, open],
    )

    const toggleSidebar = useCallback(() => {
      return isMobile
        ? setOpenMobile((open) => !open)
        : setOpen((open) => !open)
    }, [isMobile, setOpen, setOpenMobile])
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
          (event.metaKey || event.ctrlKey)
        ) {
          event.preventDefault()
          toggleSidebar()
        }
      }

      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }, [toggleSidebar])
    const state = open ? 'expanded' : 'collapsed'

    const contextValue = useMemo<SidebarContext>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }),
      [
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      ],
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div
            style={
              {
                '--sidebar-width': SIDEBAR_WIDTH,
                '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
                ...style,
              } as CSSProperties
            }
            className={cn(
              'group/sidebar-wrapper flex min-h-svh has-[[data-variant=inset]]:bg-surface-1',
              className,
            )}
            ref={ref}
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    )
  },
)
SidebarProvider.displayName = 'SidebarProvider'

const Sidebar = forwardRef<
  HTMLDivElement,
  ComponentProps<'div'> & {
    side?: 'left' | 'right'
    variant?: 'sidebar' | 'floating' | 'inset'
    collapsible?: 'offcanvas' | 'icon' | 'none'
  }
>(
  (
    {
      side = 'left',
      variant = 'sidebar',
      collapsible = 'offcanvas',
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

    if (collapsible === 'none') {
      return (
        <div
          className={cn(
            'flex h-full w-[--sidebar-width] flex-col bg-surface-1 text-surface-fg',
            className,
          )}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      )
    }

    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
          <SheetContent
            data-sidebar="sidebar"
            data-mobile="true"
            className="w-[--sidebar-width] bg-surface-1 p-0 text-surface-fg [&>button]:hidden"
            style={
              {
                '--sidebar-width': SIDEBAR_WIDTH_MOBILE,
              } as CSSProperties
            }
            side={side}
          >
            <div className="flex h-full w-full flex-col">{children}</div>
          </SheetContent>
        </Sheet>
      )
    }

    return (
      <div
        ref={ref}
        className="group peer hidden text-surface-fg md:block"
        data-state={state}
        data-collapsible={state === 'collapsed' ? collapsible : ''}
        data-variant={variant}
        data-side={side}
      >
        <div
          className={cn(
            'relative h-svh w-[--sidebar-width] bg-transparent transition-[width] duration-moderate-02 ease-linear',
            'group-data-[collapsible=offcanvas]:w-0',
            'group-data-[side=right]:rotate-180',
            variant === 'floating' || variant === 'inset'
              ? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]'
              : 'group-data-[collapsible=icon]:w-[--sidebar-width-icon]',
          )}
        />
        <div
          className={cn(
            'fixed inset-y-0 z-raised hidden h-svh w-[--sidebar-width] transition-[left,right,width] duration-moderate-02 ease-linear md:flex',
            side === 'left'
              ? 'left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]'
              : 'right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
            variant === 'floating' || variant === 'inset'
              ? 'p-ds-03 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]'
              : 'group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l',
            className,
          )}
          {...props}
        >
          <div
            data-sidebar="sidebar"
            className="flex h-full w-full flex-col bg-surface-1 group-data-[variant=floating]:rounded-ds-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-surface-border group-data-[variant=floating]:shadow"
          >
            {children}
          </div>
        </div>
      </div>
    )
  },
)
Sidebar.displayName = 'Sidebar'

const SidebarTrigger = forwardRef<
  ElementRef<typeof Button>,
  ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      variant="ghost"
      size="icon-md"
      className={cn('h-ds-xs-plus w-ds-xs-plus', className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <IconLayoutSidebarLeftCollapse />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
})
SidebarTrigger.displayName = 'SidebarTrigger'

const SidebarRail = forwardRef<HTMLButtonElement, ComponentProps<'button'>>(
  ({ className, ...props }, ref) => {
    const { toggleSidebar } = useSidebar()

    return (
      <button
        ref={ref}
        data-sidebar="rail"
        aria-label="Toggle Sidebar"
        tabIndex={-1}
        onClick={toggleSidebar}
        title="Toggle Sidebar"
        className={cn(
          'hover:after:bg-surface-border-strong absolute inset-y-0 z-raised hidden w-4 -translate-x-1/2 transition-colors ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex',
          '[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize',
          '[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize',
          'group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-surface-2',
          '[[data-side=left][data-collapsible=offcanvas]_&]:-right-2',
          '[[data-side=right][data-collapsible=offcanvas]_&]:-left-2',
          className,
        )}
        {...props}
      />
    )
  },
)
SidebarRail.displayName = 'SidebarRail'

const SidebarInset = forwardRef<HTMLDivElement, ComponentProps<'main'>>(
  ({ className, ...props }, ref) => {
    return (
      <main
        ref={ref}
        className={cn(
          'relative flex min-h-svh flex-1 flex-col bg-surface-1',
          'peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-ds-03 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-ds-03 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-ds-xl md:peer-data-[variant=inset]:shadow',
          className,
        )}
        {...props}
      />
    )
  },
)
SidebarInset.displayName = 'SidebarInset'

const SidebarInput = forwardRef<
  ElementRef<typeof Input>,
  ComponentProps<typeof Input>
>(({ className, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      data-sidebar="input"
      className={cn(
        'h-ds-sm w-full bg-surface-1 shadow-none focus-visible:ring-2 focus-visible:ring-accent-9',
        className,
      )}
      {...props}
    />
  )
})
SidebarInput.displayName = 'SidebarInput'

const SidebarHeader = forwardRef<HTMLDivElement, ComponentProps<'div'>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-sidebar="header"
        className={cn('flex flex-col gap-ds-03 p-ds-03', className)}
        {...props}
      />
    )
  },
)
SidebarHeader.displayName = 'SidebarHeader'

const SidebarFooter = forwardRef<HTMLDivElement, ComponentProps<'div'>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-sidebar="footer"
        className={cn('flex flex-col gap-ds-03 p-ds-03', className)}
        {...props}
      />
    )
  },
)
SidebarFooter.displayName = 'SidebarFooter'

const SidebarSeparator = forwardRef<
  ElementRef<typeof Separator>,
  ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => {
  return (
    <Separator
      ref={ref}
      data-sidebar="separator"
      className={cn(
        'bg-surface-border mx-ds-03 w-auto',
        className,
      )}
      {...props}
    />
  )
})
SidebarSeparator.displayName = 'SidebarSeparator'

const SidebarContent = forwardRef<HTMLDivElement, ComponentProps<'div'>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-sidebar="content"
        className={cn(
          'flex min-h-0 flex-1 flex-col gap-ds-03 overflow-auto group-data-[collapsible=icon]:overflow-hidden',
          className,
        )}
        {...props}
      />
    )
  },
)
SidebarContent.displayName = 'SidebarContent'

const SidebarGroup = forwardRef<HTMLDivElement, ComponentProps<'div'>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-sidebar="group"
        className={cn('relative flex w-full min-w-0 flex-col p-ds-03', className)}
        {...props}
      />
    )
  },
)
SidebarGroup.displayName = 'SidebarGroup'

const SidebarGroupLabel = forwardRef<
  HTMLDivElement,
  ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'

  return (
    <Comp
      ref={ref}
      data-sidebar="group-label"
      className={cn(
        'flex h-ds-sm shrink-0 items-center rounded-ds-md px-ds-03 text-ds-sm font-medium text-surface-fg-muted outline-none ring-accent-9 transition-[margin,opa] duration-moderate-02 ease-linear focus-visible:ring-2 [&>svg]:h-ico-sm [&>svg]:w-ico-sm [&>svg]:shrink-0',
        'group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0',
        className,
      )}
      {...props}
    />
  )
})
SidebarGroupLabel.displayName = 'SidebarGroupLabel'

const SidebarGroupAction = forwardRef<
  HTMLButtonElement,
  ComponentProps<'button'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      ref={ref}
      data-sidebar="group-action"
      className={cn(
        'hover:bg-surface-2 absolute right-ds-04 top-ds-04 flex aspect-square w-5 items-center justify-center rounded-ds-md p-0 text-surface-fg outline-none ring-accent-9 transition-transform hover:text-surface-fg focus-visible:ring-2 [&>svg]:h-ico-sm [&>svg]:w-ico-sm [&>svg]:shrink-0',
        'after:absolute after:-inset-2 after:md:hidden',
        'group-data-[collapsible=icon]:hidden',
        className,
      )}
      {...props}
    />
  )
})
SidebarGroupAction.displayName = 'SidebarGroupAction'

const SidebarGroupContent = forwardRef<HTMLDivElement, ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-sidebar="group-content"
      className={cn('w-full text-ds-md', className)}
      {...props}
    />
  ),
)
SidebarGroupContent.displayName = 'SidebarGroupContent'

const SidebarMenu = forwardRef<HTMLUListElement, ComponentProps<'ul'>>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      data-sidebar="menu"
      className={cn('flex w-full min-w-0 flex-col gap-ds-02', className)}
      {...props}
    />
  ),
)
SidebarMenu.displayName = 'SidebarMenu'

const SidebarMenuItem = forwardRef<HTMLLIElement, ComponentProps<'li'>>(
  ({ className, ...props }, ref) => (
    <li
      ref={ref}
      data-sidebar="menu-item"
      className={cn('group/menu-item relative', className)}
      {...props}
    />
  ),
)
SidebarMenuItem.displayName = 'SidebarMenuItem'

const sidebarMenuButtonVariants = cva(
  'peer/menu-button hover:bg-surface-2 active:bg-accent-2 data-[active=true]:bg-accent-2 data-[state=open]:hover:bg-surface-2 flex w-full items-center gap-ds-03 overflow-hidden rounded-ds-md p-ds-03 text-left outline-none ring-accent-9 transition-[width,height,padding] hover:text-surface-fg focus-visible:ring-2 active:text-surface-fg disabled:pointer-events-none disabled:opacity-action-disabled group-has-[[data-sidebar=menu-action]]/menu-item:pr-ds-07 aria-disabled:pointer-events-none aria-disabled:opacity-action-disabled data-[active=true]:font-medium data-[active=true]:text-surface-fg data-[state=open]:hover:text-surface-fg group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-ds-03 [&>span:last-child]:truncate [&>svg]:h-ico-sm [&>svg]:w-ico-sm [&>svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'hover:bg-surface-2 hover:text-surface-fg',
        outline:
          'hover:bg-surface-2 bg-surface-1 shadow-[0_0_0_1px_var(--color-surface-border)] hover:text-surface-fg hover:shadow-[0_0_0_1px_var(--color-surface-border-strong)]',
      },
      size: {
        md: 'h-ds-sm text-ds-md',
        sm: 'h-ds-xs-plus text-ds-sm',
        lg: 'h-ds-lg text-ds-md group-data-[collapsible=icon]:!p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
)

const SidebarMenuButton = forwardRef<
  HTMLButtonElement,
  ComponentProps<'button'> & {
    asChild?: boolean
    isActive?: boolean
    tooltip?: string | ComponentProps<typeof TooltipContent>
  } & VariantProps<typeof sidebarMenuButtonVariants>
>(
  (
    {
      asChild = false,
      isActive = false,
      variant = 'default',
      size = 'md',
      tooltip,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button'
    const { isMobile, state } = useSidebar()

    const button = (
      <Comp
        ref={ref}
        data-sidebar="menu-button"
        data-size={size}
        data-active={isActive}
        className={cn(sidebarMenuButtonVariants({ variant, size }), !asChild && 'relative', className)}
        {...props}
      >
        {asChild ? children : (
          <>
            {isActive && (
              <motion.span
                layoutId="sidebar-active-indicator"
                className="absolute inset-0 rounded-ds-md bg-accent-2"
                transition={springs.smooth}
              />
            )}
            <span className="relative z-[1] flex w-full items-center gap-[inherit]">{children}</span>
          </>
        )}
      </Comp>
    )

    if (!tooltip) {
      return button
    }

    if (typeof tooltip === 'string') {
      tooltip = {
        children: tooltip,
      }
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent
          side="right"
          align="center"
          hidden={state !== 'collapsed' || isMobile}
          {...tooltip}
        />
      </Tooltip>
    )
  },
)
SidebarMenuButton.displayName = 'SidebarMenuButton'

const SidebarMenuAction = forwardRef<
  HTMLButtonElement,
  ComponentProps<'button'> & {
    asChild?: boolean
    showOnHover?: boolean
  }
>(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-action"
      className={cn(
        'hover:bg-surface-2 absolute right-ds-02 top-ds-02b flex aspect-square w-5 items-center justify-center rounded-ds-md p-0 text-surface-fg outline-none ring-accent-9 transition-transform hover:text-surface-fg focus-visible:ring-2 peer-hover/menu-button:text-surface-fg [&>svg]:h-ico-sm [&>svg]:w-ico-sm [&>svg]:shrink-0',
        'after:absolute after:-inset-2 after:md:hidden',
        'peer-data-[size=sm]/menu-button:top-1',
        'peer-data-[size=md]/menu-button:top-ds-02b',
        'peer-data-[size=lg]/menu-button:top-ds-03',
        'group-data-[collapsible=icon]:hidden',
        showOnHover &&
          'group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-surface-fg md:opacity-0',
        className,
      )}
      {...props}
    />
  )
})
SidebarMenuAction.displayName = 'SidebarMenuAction'

const SidebarMenuBadge = forwardRef<HTMLDivElement, ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-sidebar="menu-badge"
      className={cn(
        'pointer-events-none absolute right-ds-02 flex h-5 min-w-5 select-none items-center justify-center rounded-ds-md px-ds-02 text-ds-sm font-medium tabular-nums text-surface-fg',
        'peer-hover/menu-button:text-surface-fg peer-data-[active=true]/menu-button:text-surface-fg',
        'peer-data-[size=sm]/menu-button:top-1',
        'peer-data-[size=md]/menu-button:top-ds-02b',
        'peer-data-[size=lg]/menu-button:top-ds-03',
        'group-data-[collapsible=icon]:hidden',
        className,
      )}
      {...props}
    />
  ),
)
SidebarMenuBadge.displayName = 'SidebarMenuBadge'

const SidebarMenuSkeleton = forwardRef<
  HTMLDivElement,
  ComponentProps<'div'> & {
    showIcon?: boolean
  }
>(({ className, showIcon = false, ...props }, ref) => {
  const width = useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`
  }, [])

  return (
    <div
      ref={ref}
      data-sidebar="menu-skeleton"
      className={cn('flex h-ds-sm items-center gap-ds-03 rounded-ds-md px-ds-03', className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="h-ico-sm w-ico-sm rounded-ds-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 max-w-[--skeleton-width] flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            '--skeleton-width': width,
          } as CSSProperties
        }
      />
    </div>
  )
})
SidebarMenuSkeleton.displayName = 'SidebarMenuSkeleton'

const SidebarMenuSub = forwardRef<HTMLUListElement, ComponentProps<'ul'>>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      data-sidebar="menu-sub"
      className={cn(
        'mx-ds-04 flex min-w-0 translate-x-px flex-col gap-ds-02 border-l border-surface-border px-ds-03 py-ds-01',
        'group-data-[collapsible=icon]:hidden',
        className,
      )}
      {...props}
    />
  ),
)
SidebarMenuSub.displayName = 'SidebarMenuSub'

const SidebarMenuSubItem = forwardRef<HTMLLIElement, ComponentProps<'li'>>(
  ({ ...props }, ref) => <li ref={ref} {...props} />,
)
SidebarMenuSubItem.displayName = 'SidebarMenuSubItem'

const SidebarMenuSubButton = forwardRef<
  HTMLAnchorElement,
  ComponentProps<'a'> & {
    asChild?: boolean
    size?: 'sm' | 'md'
    isActive?: boolean
  }
>(({ asChild = false, size = 'md', isActive, className, ...props }, ref) => {
  const Comp = asChild ? Slot : 'a'

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        'hover:bg-surface-2 active:bg-accent-2 flex h-ds-xs-plus min-w-0 -translate-x-px items-center gap-ds-03 overflow-hidden rounded-ds-md px-ds-03 text-surface-fg outline-none ring-accent-9 hover:text-surface-fg focus-visible:ring-2 active:text-surface-fg disabled:pointer-events-none disabled:opacity-action-disabled aria-disabled:pointer-events-none aria-disabled:opacity-action-disabled [&>span:last-child]:truncate [&>svg]:h-ico-sm [&>svg]:w-ico-sm [&>svg]:shrink-0 [&>svg]:text-surface-fg',
        'data-[active=true]:bg-accent-2 data-[active=true]:text-surface-fg',
        size === 'sm' && 'text-ds-sm',
        size === 'md' && 'text-ds-md',
        'group-data-[collapsible=icon]:hidden',
        className,
      )}
      {...props}
    />
  )
})
SidebarMenuSubButton.displayName = 'SidebarMenuSubButton'

export type SidebarProps = React.ComponentPropsWithoutRef<'div'> & { side?: 'left' | 'right'; variant?: 'sidebar' | 'floating' | 'inset'; collapsible?: 'offcanvas' | 'icon' | 'none' }

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}
