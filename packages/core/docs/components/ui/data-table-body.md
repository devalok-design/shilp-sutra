# DataTableBody

> Internal sub-component of DataTable. Not exported to consumers.

## Usage

This component is used internally by `<DataTable>` and should not be imported directly.
See [DataTable](./data-table.md) for the public API.

## Composability
- **Internal only.** Renders the tbody + rows for DataTable. Consumes DataTableContext for row data, selection state, expandable state, loading skeletons.
- Customization routes through DataTable props: `renderExpanded`, `onRowClick`, `getRowId`, `loading`, `emptyState`.

## Changes

### v0.32.0
- Extracted from DataTable monolith into focused sub-component.
