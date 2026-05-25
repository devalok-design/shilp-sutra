# shilp-sutra — Devalok Design System

> Agent Skill for `@devalok/shilp-sutra` — Devalok Design & Strategy Studios' React design system. Tailwind 4, React 19, CVA, OKLCH tokens, framer-motion, 110+ accessible components.

Use this skill when working in a React project that depends on `@devalok/shilp-sutra` (or when adding the package to one). It teaches the agent the correct setup, the per-framework playbook, the component API, the brand-token override pattern, and the Server Component import rules — all from the same files the design system ships in its npm tarball, so the skill never drifts from the live package.

## When the agent should activate this skill

- The user mentions `shilp-sutra`, `@devalok`, or Devalok's design system.
- The project's `package.json` lists `@devalok/shilp-sutra` or `@devalok/shilp-sutra-brand`.
- The user asks to install Tailwind, add UI components, theme an app, or migrate from shadcn/MUI/Chakra in a project that already has the package.

## What's inside

```
shilp-sutra/
├── SKILL.md                              # Entry — load this first
├── README.md                             # This file (marketplace listing)
├── LICENSE                               # MIT
└── references/
    ├── components.md                     # Concise component cheatsheet (~660 lines)
    ├── components-full.md                # Exhaustive per-component reference (~6900 lines)
    ├── setup-next-app-router.md          # Next.js (App Router) install playbook
    ├── setup-next-pages.md               # Next.js (Pages Router) install playbook
    ├── setup-vite.md                     # Vite + React install playbook
    ├── setup-astro.md                    # Astro install playbook
    ├── setup-remix.md                    # Remix install playbook
    ├── setup-tanstack-start.md           # TanStack Start install playbook
    ├── customize-brand.md                # Token override cookbook
    ├── server-components.md              # RSC-safety matrix and import patterns
    └── troubleshoot.md                   # Decision tree for the 8 most common breakages
```

## Install

### Claude Code (personal)

```bash
# Option A — clone the repo (sparse) and copy the skill
git clone --depth=1 --filter=blob:none --sparse https://github.com/devalok-design/shilp-sutra
cd shilp-sutra
git sparse-checkout set skills/shilp-sutra
cp -r skills/shilp-sutra ~/.claude/skills/shilp-sutra

# Option B — if @devalok/shilp-sutra is already a dependency in your project
cp -r node_modules/@devalok/shilp-sutra/skill ~/.claude/skills/shilp-sutra

# Option C — direct curl (latest from main)
curl -fsSL https://raw.githubusercontent.com/devalok-design/shilp-sutra/main/skills/shilp-sutra/install.sh | bash
```

Restart Claude Code or open a new session. Verify with `What skills are available?` — `shilp-sutra` should appear.

### Project-scoped (commit to repo)

```bash
mkdir -p .claude/skills
curl -fsSL https://raw.githubusercontent.com/devalok-design/shilp-sutra/main/skills/shilp-sutra/install.sh | INSTALL_DIR=.claude/skills bash
git add .claude/skills/shilp-sutra
git commit -m "chore: add shilp-sutra agent skill"
```

Every contributor (and their agent) on the project gets the skill automatically.

### Cursor, Codex, Aider, and other tools

The skill follows the [Agent Skills open standard](https://agentskills.io/specification) — any compatible agent loads it from the same directory. See your tool's docs for the install path.

## What it teaches the agent

- **Setup playbook** for Next.js (App + Pages), Vite, Astro, Remix, TanStack Start. Each recipe is concrete, copy-pasteable, and has been validated against real consumer projects.
- **Hard constraints** — the eight ways to break Tailwind 4 + framer-motion setup that look unrelated to the design system but aren't.
- **Component API** — every component, every variant, every example. Two layers: a cheatsheet for fast scans and a full reference for prop tables.
- **RSC import patterns** — which components are server-safe, which need `"use client"`, and why per-component imports matter for Next.js.
- **Theming** — how to override OKLCH ramps, radius, fonts, and the spacing scale without forking the package.
- **Troubleshoot tree** — the eight most common breakages with the symptom, root cause, and exact fix for each.

## Source of truth

This skill is **built from** the package's own documentation (`packages/core/llms.txt`, `packages/core/llms-full.txt`, `packages/core/docs/recipes/`) by `scripts/build-skill.mjs`. The pre-publish audit fails if the bundled references drift from source, so the skill stays in sync with every release.

## Versioning

The skill version tracks the package version. Both are at the top of `SKILL.md` (frontmatter `metadata.version`) and in `package.json`. If you've installed the skill but upgraded the package, regenerate the skill or pull the latest from the repo.

## Feedback

If a recipe is wrong, a constraint is outdated, or a component behavior contradicts the docs, file an issue at <https://github.com/devalok-design/shilp-sutra/issues> with the label `ai-agent-feedback`. Include the package version, the file/recipe path, the command or error, and what you expected.

## License

MIT © Devalok Design & Strategy Studios. See `LICENSE`.

## Links

- npm: <https://www.npmjs.com/package/@devalok/shilp-sutra>
- Storybook: <https://devalok-design.github.io/shilp-sutra/>
- Repo: <https://github.com/devalok-design/shilp-sutra>
- Agent Skills spec: <https://agentskills.io/specification>
