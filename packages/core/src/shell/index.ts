/**
 * @module @devalok/shilp-sutra/shell
 *
 * Application shell components: top bar, bottom nav, notifications, and command palette.
 * All shell components require client-side React ("use client").
 *
 * For sidebars, compose the `Sidebar` primitives from `@devalok/shilp-sutra/ui/sidebar`,
 * or start from a ready-made preset (e.g. `sidebar-app`) at
 * https://shilp-sutra.devalok.in/presets.
 *
 * @example
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
export {
  AppShell,
  AppShellBar,
  type AppShellBarProps,
  AppShellBody,
  AppShellCanvas,
  type AppShellProps,
  AppShellSidebar,
  type AppShellSidebarProps,
} from './app-shell'
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
  TopBar,
  type TopBarProps,
  type TopBarUser,
  type UserMenuItem,
} from './top-bar'
