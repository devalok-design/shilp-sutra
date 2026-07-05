# @devalok/shilp-sutra-mcp-server

Hosted read-only MCP server serving shilp-sutra docs to AI agents. Private — never published to npm; deployed to Railway (Phase 3).

- **Plan**: `docs/plans/2026-07-05-hosted-docs-mcp-plan.md`
- **Standard** (tool conventions, response envelope, manifest schema): `docs/specs/mcp-manifest-standard.md`

## How it works

Docs are extracted from **published npm tarballs** (`registry.npmjs.org`) and cached per version — the server is a pure read-through cache with zero release-time coupling. From 0.46.0 the tarball ships `mcp-manifest.json` (structured props/tokens/composition), which backs the manifest tools. Versions below the 0.46 floor get a redirect to `upgrade(from, to)` — the only tool that accepts pre-floor versions.

## Tools

`find_component` · `get_component(name, sections?)` · `get_tokens(category?)` · `get_setup(framework?)` · `upgrade(from, to?)` · `search_docs(query)` — every tool takes optional `version`; agents are instructed to pass the consumer's installed version.

## Run

```sh
# local mode — serve the working-tree packages/core (pre-0.46 development)
LOCAL_CORE_DIR=../core node src/index.mjs

# registry mode — serve published versions
node src/index.mjs

# smoke test (spawns a local-mode server if none running)
node scripts/smoke.mjs
```

`POST /mcp` (streamable HTTP, stateless) · `GET /health`. Connect from Claude Code:

```sh
claude mcp add --transport http shilp-sutra http://localhost:3111/mcp
```
