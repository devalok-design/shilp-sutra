/**
 * Re-export. The implementation moved to `ui/bulk-action-bar` so that
 * `DataTable` can use it — `ui/` is forbidden from importing `composed/`
 * (see the module-boundary rules in eslint.config.js), and DataTable lives in
 * `ui/`. Rather than keep two bulk bars, the shared one moved down a layer.
 *
 * This file exists so `@devalok/shilp-sutra/composed/bulk-action-bar` keeps
 * resolving. It is the documented path and consumers import it; moving the
 * file should not move the import.
 */
export {
  BulkActionBar,
  type BulkActionBarAction,
  type BulkActionBarProps,
  type BulkActionsPlacement,
} from '../ui/bulk-action-bar'
