# shilp-sutra chat skill

A small pointer that teaches AI chat assistants what `@devalok/shilp-sutra` is and
routes them to the MCP server for the real, version-exact component docs. Use it on chat
surfaces that have no native Agent Skills support. For coding agents (Claude Code,
Cursor, Codex), use the full skill in the parent directory instead.

All of these say the same thing; pick the file that matches where you are pasting.

| Surface | File | How to load it |
| --- | --- | --- |
| claude.ai / Claude Desktop | `SKILL.md` | Add as a skill, or connect the MCP directly: `claude mcp add --transport http shilp-sutra https://shilp-sutra.devalok.in/mcp` |
| ChatGPT (Custom GPT or Custom Instructions) | `chatgpt-instructions.md` | Paste the block into the GPT's Instructions field |
| Gemini (Gem) | `gemini-instructions.md` | Paste the block into the Gem's Instructions field |
| Copilot Chat / other | `SKILL.md` | Paste the body into the system or context prompt |

The heavy lifting lives in the MCP server at https://shilp-sutra.devalok.in/mcp. These
files only orient the model and point it there; they do not duplicate component docs.
