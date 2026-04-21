# DataTableContext

> Internal sub-component of DataTable. Not exported to consumers.

## Usage

This component is used internally by `<DataTable>` and should not be imported directly.
See [DataTable](./data-table.md) for the public API.

## Composability
- **Internal React context** — binds DataTable's sub-components (header, body, pagination, toolbar, bulk-actions) to shared state: TanStack table instance, density, selection, loading.
- Consumer code never reads this context — all interaction goes through DataTable's props.

## Changes

### v0.32.0
- Extracted from DataTable monolith into focused sub-component.
