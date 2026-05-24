---
"@devalok/shilp-sutra": minor
---

feat(skill): ship as an [Agent Skill](https://agentskills.io)

Adds a bundled Anthropic Agent Skill at `skills/shilp-sutra/` (and inside the npm tarball at `node_modules/@devalok/shilp-sutra/skill/`) so AI coding agents — Claude Code, Cursor, Codex, Aider, and anything else that speaks the Agent Skills open standard — can load shilp-sutra's setup playbooks, component API, theming cookbook, RSC import patterns, and troubleshoot tree on demand.

**Why:** Consumers reported that the design system was hard to onboard onto — you had to drill into each Storybook section to discover what was available, and there was no single drop-in for AI agents. The skill is one install away from full coverage:

```bash
curl -fsSL https://raw.githubusercontent.com/devalok-design/shilp-sutra/main/skills/shilp-sutra/install.sh | bash
```

**Layout:**

- `skills/shilp-sutra/SKILL.md` — entry, navigation, hard constraints (~135 lines)
- `skills/shilp-sutra/references/` — bundled cheatsheet (`components.md`), full reference (`components-full.md`), six setup playbooks, brand customization, RSC matrix, troubleshoot tree
- `skills/shilp-sutra/install.sh` — one-liner installer (sparse fetch from GitHub)
- `skills/shilp-sutra/README.md` — marketplace listing for skills.sh-style directories
- `skills/shilp-sutra/LICENSE` — MIT

**Single source of truth:** `scripts/build-skill.mjs` regenerates `skills/shilp-sutra/references/` from `packages/core/llms.txt`, `packages/core/llms-full.txt`, and `packages/core/docs/recipes/*.md`. The pre-publish audit gates on drift (`build-skill.mjs --check`) and on spec compliance (name format, description ≤1024 chars, body ≤500 lines per [agentskills.io](https://agentskills.io/specification)), so the skill cannot ship out of sync.

**npm tarball:** `packages/core/scripts/copy-skill.mjs` runs in the post-build pipeline and copies the skill tree into `packages/core/skill/`. Declared in `files[]`, so `cp -r node_modules/@devalok/shilp-sutra/skill ~/.claude/skills/shilp-sutra` works after any `pnpm add @devalok/shilp-sutra`.

**No runtime changes.** Package exports, peer deps, and CSS/component APIs are unchanged.
