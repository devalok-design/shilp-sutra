---
"@devalok/shilp-sutra": minor
---

AI docs overhaul: hosted MCP live, mcp-manifest.json ships, llms-full.txt/llms-quick.txt removed (BREAKING for doc-path consumers)

- **NEW hosted MCP at `https://shilp-sutra.devalok.in/mcp`** — six read-only tools (`find_component`, `get_component`, `get_tokens`, `get_setup`, `upgrade`, `search_docs`). Every tool takes a `version` param; pass your installed version for version-exact props/tokens/migration answers. Connect: `claude mcp add --transport http shilp-sutra https://shilp-sutra.devalok.in/mcp`. Docs are served from published npm tarballs, so this release (0.45.0) is the coverage floor; `upgrade(from, to)` accepts older `from` versions as the migration path in.
- **NEW `mcp-manifest.json`** at the package root — machine-readable component/token reference (122 components, 709 props, 281 tokens; react-docgen prop shape; schema in `mcp-manifest.schema.json`). The MCP's data source and the preferred structured read for agents without it.
- **`llms.txt` is now a ~2.5K-token router** (llmstxt.org format): what exists + where to get detail. Prop tables and examples no longer live in it.
- **REMOVED `llms-full.txt` and `llms-quick.txt`.** Fallback chain for MCP-less agents: `llms.txt` router → `docs/components/<tier>/<name>.md` (~3K tokens per component) → `mcp-manifest.json`. Tooling reading the removed paths must switch. See MIGRATION.md.
- AGENTS.md, the bundled Agent Skill, and recipes updated to the MCP-first priority order. Composition data (compound parts, composes-with relations, contexts, anti-patterns) now parses from doc Composability sections into the manifest (grammar: `docs/specs/mcp-manifest-standard.md`).
