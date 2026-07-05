---
"@devalok/shilp-sutra": minor
---

AI docs overhaul: MCP manifest ships, llms-full.txt/llms-quick.txt removed (BREAKING for doc-path consumers)

- **NEW `mcp-manifest.json`** at the package root — the machine-readable component/token reference (122 components, 709 props, 281 tokens; react-docgen prop shape; schema in `mcp-manifest.schema.json`). This is the data source for the upcoming hosted shilp-sutra MCP server and the preferred structured read for agents without it.
- **`llms.txt` is now a ~2.5K-token router** (llmstxt.org format): what exists + where to get detail. Prop tables and examples no longer live in it — fetch per component.
- **REMOVED `llms-full.txt` and `llms-quick.txt`.** Fallback chain for agents: `llms.txt` router → `docs/components/<tier>/<name>.md` (single component, ~3K tokens) → `mcp-manifest.json` for structured data. Any tooling reading the removed paths must switch.
- AGENTS.md, the bundled Agent Skill, and recipes updated to the new MCP-first priority order.
- Composition data (compound parts, composes-with, contained-by, anti-patterns) now parses from doc Composability sections into the manifest; tagged-bullet grammar defined in `docs/specs/mcp-manifest-standard.md`.
