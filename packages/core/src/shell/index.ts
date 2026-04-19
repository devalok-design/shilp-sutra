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
export {
  AppCommandPalette,
  type AppCommandPaletteProps,
  type AppCommandPaletteUser,
  type SearchResult,
  type SearchResultGroup,
} from './app-command-palette'
export {
  BottomNavbar,
  type BottomNavbarProps,
  type BottomNavbarUser,
  type BottomNavItem,
} from './bottom-navbar'
export {
  type CommandPageItem,
  type CommandRegistry,
  CommandRegistryProvider,
  type CommandRegistryProviderProps,
  useCommandRegistry,
} from './command-registry'
export { LinkProvider, type LinkProviderProps,useLink } from './link-context'
export {
  type Notification,
  NotificationCenter,
  type NotificationCenterProps,
} from './notification-center'
export {
  type NotificationPreference,
  NotificationPreferences,
  type NotificationPreferencesProps,
  type NotificationProject,
} from './notification-preferences'
export {
  AppSidebar,
  type AppSidebarProps,
  type NavGroup,
  type NavItem,
  type SidebarUser,
} from './sidebar'
export {
  TopBar,
  type TopBarProps,
  type TopBarUser,
  type UserMenuItem,
} from './top-bar'
