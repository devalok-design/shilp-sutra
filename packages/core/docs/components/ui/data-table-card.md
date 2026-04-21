# DataTableCard

> Internal sub-component of DataTable. Not exported to consumers.

## Usage

This component is used internally by `<DataTable>` and should not be imported directly.
See [DataTable](./data-table.md) for the public API.

## Composability
- **Internal only.** Renders the card wrapper around DataTable (border, shadow, rounded corners matching the Card primitive's surface treatment).
- DataTable uses this automatically — no consumer-facing prop toggles it.

## Changes

### v0.32.0
- Extracted from DataTable monolith into focused sub-component.
