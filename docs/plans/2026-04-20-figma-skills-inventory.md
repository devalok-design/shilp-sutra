# Specialized Skills & Agents Inventory — Figma Port

**Purpose**: Catalog which Claude Code skills and agent types to invoke for each phase of the Figma library rebuild.

## Skills with direct Figma DS relevance

### Core rebuild tools (invoke per-component)

| Skill | What it does | When to invoke |
|---|---|---|
| `design-systems:create-component` | Scaffolds a full component specification from a name/description | Before building each Figma component — generates the spec we hand to `use_figma` |
| `design-systems:component-spec` | Detailed spec: props, states, variants, a11y, usage guidelines | For complex components (Dialog, Select, DataTable) where the CVA doesn't capture everything |
| `design-systems:tokenize` | Extract and organize tokens from an existing design/stylesheet | Validate: feed our `semantic.css` in, check what it extracts |
| `design-systems:design-token` | Define/organize tokens with naming conventions | Reference for the DTCG-emit work |
| `design-systems:theming-system` | Theming architecture supporting brand variants, dark, hc | **Directly relevant** — use to validate our modes architecture |
| `design-systems:audit-system` | Comprehensive audit of an existing DS | Run after Figma rebuild is complete, before Publish |
| `design-systems:accessibility-audit` | WCAG audit with severity + remediation | Per-component QA before publish |
| `design-systems:icon-system` | Icon system spec (grid, sizing, naming) | Already have partial; skill can formalize |
| `design-systems:pattern-library` | Pattern entry with problem + solution + examples | For composed components (Form, DataTable) |
| `design-systems:naming-convention` | Naming rules for elements, components, tokens | Retrofit our current Figma names against best practice |

### UI design tools (per-component fidelity)

| Skill | Use |
|---|---|
| `ui-design:color-system` | Validate our 15-scale × 12-step palette against accessibility + harmony rules |
| `ui-design:dark-mode-design` | Sanity-check our dark mode values before Figma push |
| `ui-design:typography-scale` | Validate our type scale (we have one; this audits it) |
| `ui-design:spacing-system` | Validate our `--spacing-ds-*` namespace |
| `ui-design:layout-grid` | For future Grid/Container components |
| `ui-design:data-visualization` | For Chart component Figma port |
| `ui-design:responsive-design` | Guide for sizing/responsive variant decisions |
| `ui-design:visual-hierarchy` | QA on composed components |

### Strategy / QA

| Skill | Use |
|---|---|
| `frontend-design:frontend-design` | Creative polish on screens using the library |
| `ui-ux-refinement-guide` | Review generated interfaces — the "does it feel right" pass |
| `ux-strategy:design-principles` | If we need to codify DS principles beyond CLAUDE.md |

### Process skills

| Skill | Use |
|---|---|
| `superpowers:brainstorming` | When user asks for a new component — explore requirements first |
| `superpowers:writing-plans` | After brainstorming — produce the implementation plan |
| `superpowers:subagent-driven-development` | Execute the rebuild sequence with checkpoints |
| `superpowers:verification-before-completion` | Before saying "done" on any component |
| `superpowers:requesting-code-review` | Before publishing |
| `superpowers:test-driven-development` | If we end up writing sync scripts with tests |

## Agent types worth using

### For parallel research (already used today)
- `general-purpose` — broad web research, WebFetch access. Proven useful for the 4 streams above.

### For focused deep-dives
- `Explore` (subagent type) — "fast agent specialized for exploring codebases" — useful to locate every CVA component in `packages/core/src/ui/*` and extract their variant surfaces in one sweep.
- `feature-dev:code-explorer` — deep analysis of existing features. For when we port complex components (Dialog, Combobox) and need to understand their compound-component structure before building Figma equivalents.

### For architecture decisions
- `feature-dev:code-architect` — design blueprints. Use when the Figma rebuild hits a fork (e.g., "should compact-* sizes be a separate Button component or variant axis?").
- `superpowers:agent-council` — spawns multiple AI perspectives; use for contentious decisions where we want a devil's-advocate pass.

### For verification
- `feature-dev:code-reviewer` — reviews for bugs, adherence. Use on new sync scripts.
- `coderabbit:code-review` — specialized code review. Before merging the Figma sync scripts to main.
- `superpowers:code-reviewer` — major-step code review. After completing a milestone.

## Figma-specific MCP capabilities (not skills, but distinct tools)

Already documented in earlier session notes:
- `use_figma` — write ops via Plugin API JS execution
- `get_design_context` — read component + code reference
- `get_screenshot` — visual verification
- `get_variable_defs` — inspect live variable state
- `search_design_system` — find components/variables/styles by name
- `get_context_for_code_connect` — structured component metadata (still useful on Pro for generating descriptions)
- `create_design_system_rules` — generates DS rules prompt

**Blocked on Pro plan**: `add_code_connect_map`, `send_code_connect_mappings`, `get_code_connect_suggestions`, `get_code_connect_map`. These require Enterprise.

## Recommended invocation pattern

**Per-component rebuild workflow (the "one component at a time" loop):**

```
1. superpowers:brainstorming
   → understand requirements (only for components where CVA isn't self-explanatory)

2. design-systems:create-component OR design-systems:component-spec
   → generate the spec as a structured object

3. Execute via use_figma
   → build the component set, variables, properties per the spec

4. ui-design:* skills (color-system, typography-scale, etc.)
   → validate specific facets

5. design-systems:accessibility-audit
   → WCAG check before marking complete

6. superpowers:verification-before-completion
   → final check that all checklist items from CLAUDE.md are met

7. feature-dev:code-reviewer (if we touched code)
   → review any repo-side changes (sync scripts, CLAUDE.md additions)
```

**Before publishing the library** (run once, not per-component):

```
1. design-systems:audit-system (full DS audit)
2. design-systems:accessibility-audit (batch run)
3. superpowers:requesting-code-review (pre-publish gate)
4. ui-ux-refinement-guide (polish pass on reference frames)
```

## What NOT to use

- `statusline-setup` — unrelated
- `claude-code-guide` — for Claude Code tooling questions, not our content
- `design-research:*` skills — those are for user research (interviews, diary studies, card sorts). We're not doing that; we're building a DS. Skip unless we decide to user-test the Figma library itself later.

## Decision

**Primary rebuild driver**: `design-systems:create-component` (per component) → `use_figma` MCP (execute) → `design-systems:accessibility-audit` (verify).

**Do NOT** try to use every skill. Most are for specific questions — invoke them only when the question arises.
