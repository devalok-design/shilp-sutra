/**
 * Function-based categories for the component library (as opposed to
 * `Layer` in component-registry.ts, which reflects internal folder
 * structure — ui/composed/shell — not what a component is *for*).
 *
 * Used by /components' CategorySidebar so a designer can browse by
 * "Buttons", "Forms", "Feedback", etc., the way most component-library
 * docs sites (MUI, etc.) organize their nav.
 */

export type FunctionCategoryKey =
  | 'actions'
  | 'forms'
  | 'feedback'
  | 'data-display'
  | 'navigation'
  | 'overlays'
  | 'layout'
  | 'other'

export const FUNCTION_CATEGORIES: { key: FunctionCategoryKey; label: string }[] = [
  { key: 'actions', label: 'Buttons & Actions' },
  { key: 'forms', label: 'Forms & Inputs' },
  { key: 'feedback', label: 'Feedback & Alerts' },
  { key: 'data-display', label: 'Data Display' },
  { key: 'navigation', label: 'Navigation' },
  { key: 'overlays', label: 'Overlays' },
  { key: 'layout', label: 'Layout & Utilities' },
  { key: 'other', label: 'Other' },
]

/** slug -> function category. Any slug not listed here falls back to 'other'. */
const SLUG_CATEGORY: Record<string, FunctionCategoryKey> = {
  // Buttons & Actions
  'button': 'actions',
  'button-group': 'actions',
  'button-processing': 'actions',
  'icon-button': 'actions',
  'oauth-button': 'actions',
  'split-button': 'actions',
  'toggle': 'actions',
  'toggle-group': 'actions',
  'link': 'actions',
  'table-row-link': 'actions',

  // Forms & Inputs
  'form': 'forms',
  'form-section': 'forms',
  'input': 'forms',
  'textarea': 'forms',
  'number-input': 'forms',
  'search-input': 'forms',
  'color-input': 'forms',
  'input-otp': 'forms',
  'select': 'forms',
  'combobox': 'forms',
  'autocomplete': 'forms',
  'checkbox': 'forms',
  'radio': 'forms',
  'switch': 'forms',
  'slider': 'forms',
  'segmented-control': 'forms',
  'date-picker': 'forms',
  'emoji-picker': 'forms',
  'label': 'forms',
  'file-upload': 'forms',
  'rich-text-editor': 'forms',
  'rich-chat-input': 'forms',
  'multi-select-popover': 'forms',
  'member-picker': 'forms',

  // Feedback & Alerts
  'alert': 'feedback',
  'alert-dialog': 'feedback',
  'toast': 'feedback',
  'toaster': 'feedback',
  'banner': 'feedback',
  'badge': 'feedback',
  'badge-group': 'feedback',
  'badge-indicator': 'feedback',
  'chip': 'feedback',
  'status-badge': 'feedback',
  'priority-indicator': 'feedback',
  'deadline-indicator': 'feedback',
  'progress': 'feedback',
  'progress-ring': 'feedback',
  'spinner': 'feedback',
  'skeleton': 'feedback',
  'loading-skeleton': 'feedback',
  'page-skeletons': 'feedback',
  'global-loading': 'feedback',
  'empty-state': 'feedback',
  'error-boundary': 'feedback',
  'confirm-dialog': 'feedback',

  // Data Display
  'table': 'data-display',
  'data-table': 'data-display',
  'data-table-body': 'data-display',
  'data-table-header': 'data-display',
  'data-table-toolbar': 'data-display',
  'data-table-pagination': 'data-display',
  'data-table-bulk-actions': 'data-display',
  'data-table-card': 'data-display',
  'data-table-context': 'data-display',
  'card': 'data-display',
  'content-card': 'data-display',
  'stat-card': 'data-display',
  'stat-flash': 'data-display',
  'charts': 'data-display',
  'avatar': 'data-display',
  'avatar-group': 'data-display',
  'code': 'data-display',
  'markdown-viewer': 'data-display',
  'truncated-text': 'data-display',
  'text': 'data-display',
  'dot': 'data-display',
  'color-swatch': 'data-display',
  'tree-view': 'data-display',
  'activity-feed': 'data-display',
  'file-preview': 'data-display',
  'chat': 'data-display',

  // Navigation
  'tabs': 'navigation',
  'breadcrumb': 'navigation',
  'pagination': 'navigation',
  'menubar': 'navigation',
  'navigation-menu': 'navigation',
  'command-palette': 'navigation',
  'app-command-palette': 'navigation',
  'command-registry': 'navigation',
  'sidebar': 'navigation',
  'bottom-navbar': 'navigation',
  'top-bar': 'navigation',
  'link-context': 'navigation',
  'master-detail': 'navigation',
  'schedule-view': 'navigation',

  // Overlays
  'dialog': 'overlays',
  'sheet': 'overlays',
  'popover': 'overlays',
  'dropdown-menu': 'overlays',
  'hover-card': 'overlays',
  'simple-tooltip': 'overlays',
  'tooltip': 'overlays',
  'context-menu': 'overlays',
  'responsive-modal': 'overlays',
  'notification-center': 'overlays',
  'notification-preferences': 'overlays',

  // Layout & Utilities
  'container': 'layout',
  'stack': 'layout',
  'surface': 'layout',
  'separator': 'layout',
  'aspect-ratio': 'layout',
  'collapsible': 'layout',
  'accordion': 'layout',
  'page-header': 'layout',
  'filter-bar': 'layout',
  'bulk-action-bar': 'layout',
  'devalok-grain': 'layout',
  'icon': 'layout',
  'icon-context': 'layout',
  'icon-group': 'layout',
  'visually-hidden': 'layout',
  'inline-edit': 'layout',
  'stepper': 'layout',
}

export function categoryForSlug(slug: string): FunctionCategoryKey {
  return SLUG_CATEGORY[slug] ?? 'other'
}
