---
"@devalok/shilp-sutra": minor
---

Auto-discover the docs MCP on install.

On install the package now writes a project-scoped `.mcp.json` declaring the hosted docs MCP (`https://shilp-sutra.devalok.in/mcp`), so an AI coding agent (Claude Code / Cursor / Codex) discovers it right after `install` and the client prompts to approve it — no manual wiring. The write runs even on piped / non-TTY installs (exactly when an agent runs the install), unlike the human-facing welcome banner.

Safety: additive merge (never clobbers other servers or an existing `shilp-sutra` entry), skips CI and dev installs, write-once via sentinel (a user who deletes `.mcp.json` is not re-nagged), never throws, and opt-out via `SHILP_SUTRA_NO_MCP=1` (or the existing `SHILP_SUTRA_NO_WELCOME=1`).

`AGENTS.md` also now gives the one-line manual wire — `claude mcp add --transport http shilp-sutra https://shilp-sutra.devalok.in/mcp` — for agents that read the docs instead.
