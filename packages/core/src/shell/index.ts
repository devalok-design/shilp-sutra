// Layout components -- application shell
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
  default as NotificationPreferences,
  type NotificationPreference,
  type NotificationProject,
  type NotificationPreferencesProps,
} from './notification-preferences'

export {
  default as AppCommandPalette,
  type SearchResult,
  type AppCommandPaletteUser,
  type AppCommandPaletteProps,
} from './app-command-palette'
