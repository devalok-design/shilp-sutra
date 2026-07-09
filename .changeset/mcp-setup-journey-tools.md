---
"@devalok/shilp-sutra": minor
---

Add machine-readable optional-peer data and route AI agents through the MCP setup journey.

- **`peers` field in `mcp-manifest.json`** — each component that imports an optional peer dependency (data-table, charts, date-picker, rich-text-editor, input-otp, file-preview, markdown-viewer) now carries a structured `peers: [...]` array, mirroring the recipe optional-peer table. Previously this lived only as prose in `gotchas`. The manifest emitter cross-checks the map against the gotchas so it can't silently drift, and the schema documents the field.
- **AGENTS.md** — new "Setting up in a new project" section that routes agents through `detect_framework → get_setup → preflight → validate_snippet → verify_setup`, plus the hosted MCP URL so agents connect the live docs server instead of reading the frozen `node_modules` copy.
- **Postinstall banner** — points at the live MCP (`https://shilp-sutra.devalok.in/mcp`) as the primary AI-agent assist; component count made evergreen.

The hosted MCP server gains four setup-journey tools (`preflight`, `validate_snippet`, `detect_framework`, `verify_setup`) that read this data — they close the peer-dep cliff, silent TW4 dead-class, wrong-recipe, and mis-wired-config traps that break agent-driven installs. No consumer API change; the manifest addition is additive.
