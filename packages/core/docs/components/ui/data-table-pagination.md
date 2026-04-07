# $(echo $f | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g')

> Internal sub-component of DataTable. Not exported to consumers.

## Usage

This component is used internally by `<DataTable>` and should not be imported directly.
See [DataTable](./data-table.md) for the public API.

## Changes

### v0.32.0
- Extracted from DataTable monolith into focused sub-component.
