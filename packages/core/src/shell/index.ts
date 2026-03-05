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
