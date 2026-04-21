# DataTableBulkActions

> Internal sub-component of DataTable. Not exported to consumers.

## Usage

This component is used internally by `<DataTable>` and should not be imported directly.
See [DataTable](./data-table.md) for the public API.

## Composability
- **Internal only.** Renders the floating bulk-action bar that appears when rows are selected. Reads selection state + bulkActions config from DataTableContext.
- Customization goes through DataTable's `bulkActions` prop — `{ label, onClick, color?, disabled? }[]`.

## Changes

### v0.32.0
- Extracted from DataTable monolith into focused sub-component.
