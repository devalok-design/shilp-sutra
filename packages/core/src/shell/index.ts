/**
 * @module @devalok/shilp-sutra/shell
 *
 * Application shell components: sidebar, top bar, bottom nav, notifications, and command palette.
 * All shell components require client-side React ("use client").
 *
 * @example
 * import { AppSidebar } from '@devalok/shilp-sutra/shell/sidebar'
 * import { TopBar } from '@devalok/shilp-sutra/shell/top-bar'
 */

// Layout components -- application shell
export { LinkProvider, useLink } from './link-context'

export {
  AppSidebar,
  type NavItem,
  type NavGroup,
  type SidebarUser,
  type AppSidebarProps,
} from './sidebar'

export {
  TopBar,
  type TopBarUser,
  type UserMenuItem,
  type TopBarProps,
} from './top-bar'

export {
  BottomNavbar,
  type BottomNavItem,
  type BottomNavbarUser,
  type BottomNavbarProps,
} from './bottom-navbar'

export {
  NotificationCenter,
  type Notification,
  type NotificationCenterProps,
} from './notification-center'

export {
  NotificationPreferences,
  type NotificationPreference,
  type NotificationProject,
  type NotificationPreferencesProps,
} from './notification-preferences'

export {
  AppCommandPalette,
  type SearchResult,
  type AppCommandPaletteUser,
  type AppCommandPaletteProps,
} from './app-command-palette'
