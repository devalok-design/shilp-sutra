---
"@devalok/shilp-sutra": minor
---

feat: public-launch release — Agent Skill + marketing site

**Agent Skill (`@devalok/shilp-sutra`):** a fully bundled [Agent Skills](https://agentskills.io)-compatible skill ships in the npm tarball at `node_modules/@devalok/shilp-sutra/skill/` and in the repo at `skills/shilp-sutra/`. AI coding agents — Claude Code, Cursor, Codex, Aider, and any other tool that speaks the open standard — can install once and load setup playbooks, component APIs, theming patterns, and troubleshooting on demand:

```bash
# Personal install
curl -fsSL https://raw.githubusercontent.com/devalok-design/shilp-sutra/main/skills/shilp-sutra/install.sh | bash

# Or, after installing the package:
cp -r node_modules/@devalok/shilp-sutra/skill ~/.claude/skills/shilp-sutra
```

The skill is **built from** the package's own documentation (`llms.txt`, `llms-full.txt`, `docs/recipes/`) by `scripts/build-skill.mjs`. Pre-publish audit gates on drift (`build-skill.mjs --check`) and on spec compliance (name format, description ≤1024 chars, body ≤500 lines per [agentskills.io](https://agentskills.io/specification)), so the skill cannot ship out of sync.

**Marketing + docs site (shilp-sutra.devalok.in):** a Next.js 15 + Tailwind 4 site eats its own dog food — built entirely from shilp-sutra components. Hosted on Railway. Includes:

- Landing page with framework-aware install snippets and the Agent Skill one-liner front-and-centre
- `/components` — browseable index of all 119 components, parsed from `docs/components/*.md`, grouped by layer (UI primitives / composed / shell), with search and filter
- `/docs/[slug]` — rendered recipes from `packages/core/docs/recipes/` (single source of truth — site reads the same files that ship in the tarball)
- Dark mode, OKLCH brand tokens, framer-motion animations
- Storybook stays at `devalok-design.github.io/shilp-sutra` for now; will move to a subpath in v2

**No runtime changes to the package.** Component APIs, peer deps, and CSS unchanged. This release is additive: skill bundle + new docs surface.

**Site repo layout:**

```
apps/site/                  # Next 15 marketing/docs site (deploys to Railway)
skills/shilp-sutra/         # Anthropic-format Agent Skill (ships in npm tarball as skill/)
scripts/build-skill.mjs     # regenerates skill/references/ from source
packages/core/scripts/copy-skill.mjs  # copies skill into packages/core/skill/ at build
railway.toml                # Docker build config for the site service
```
