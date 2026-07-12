---
"@devalok/shilp-sutra": minor
---

Three consumer-reported fixes (all filed via the MCP `report_issue` tool).

**Added — `ResponsiveModal` (composed).** One overlay that is a centered Dialog on desktop (md+) and a partial, content-height bottom sheet on mobile (<768px), built on the same accessible dialog primitive as `Dialog`/`Sheet`. Compound API: `ResponsiveModal` / `Trigger` / `Content` / `Background` / `Header` / `Title` / `Description` / `Body` / `Footer` / `Close`. Owns the parts consumers kept hand-rolling: a pinned header/footer, an internal scroll body (capped 85dvh desktop / 90dvh mobile), an optional full-bleed background slot painted at `-z-10` (with the close button correctly stacked above it), drag-to-dismiss on mobile, and optional iOS-style `snapPoints`. Prefer it over `DialogContent responsive`, whose mobile form is a full-screen takeover that leaves dead space under short content (#115).

**Fixed — `PageHeader` action overflow on mobile.** The `actions` slot was `shrink-0` inside a non-wrapping row, so a header with 2+ buttons overflowed a phone viewport and forced the page to pan sideways. The header row now wraps and the actions cluster drops onto its own line on narrow screens (pure CSS, still server-safe). Desktop layout is unchanged (#133).

**Fixed — mcp-manifest mis-attributed compound subcomponent props to the root.** The manifest emitter flattened the whole `## Props` section onto the root component, ignoring `### Subpart` headings — so a `numeric` prop belonging to `TableCell`/`TableHead`, an `href` belonging to `TableRowLink`, etc. all read as props of `<Table>`. An agent trusting the manifest wrote `<Table numeric>` / `<TableRow href>` and hit TS2322. Props under a `### Subpart` heading are now emitted under `subComponents[Name].props`, keyed by the owning subcomponent, across all 27 multi-part component docs. Manifest format bumped to 1.2.0 (additive); the hosted docs MCP `get_component` surfaces the new `subComponents` block (#132).
