<!--
Thanks for the PR. Fill the checklist below; reviewers will use it to triage.
For larger context, see CONTRIBUTING.md.
-->

## Summary

<!-- 1–3 sentences: what changed and why. Skip the play-by-play; the diff has that. -->

## Linked issues

<!-- Use "Closes #N" / "Fixes #N" for auto-close. List multiple if applicable. -->

Closes #

## Checklist

### Always

- [ ] `pnpm typecheck && pnpm lint && pnpm test` clean locally
- [ ] Changeset added (`pnpm changeset`) at the right bump level — see [Versioning](../blob/main/CONTRIBUTING.md#versioning--breaking-changes)
- [ ] Storybook stories updated if visuals changed
- [ ] `pre-publish-audit.mjs` clean (CI runs it on `main`; run locally for risky changes)

### If this PR fixes agent-filed feedback (`ai-agent-feedback` label)

- [ ] `llms.txt` updated where the agent's expectation no longer matches reality
- [ ] `llms-full.txt` updated if per-component prop/variant details changed
- [ ] `docs/recipes/` updated if the install/setup path changed
- [ ] `AGENTS.md` updated if a hard constraint or auth-tier order changed
- [ ] The original agent-filed issue is closed by this PR (`Closes #N`)

### If this PR introduces a breaking change

- [ ] Changeset body leads with `**BREAKING:**` + before/after snippet
- [ ] `MIGRATION.md` section added with consumer-side migration steps
- [ ] **If the break touches more than two components**: migration autofix added to the [`@devalok/eslint-plugin-shilp-sutra`](../blob/main/packages/eslint-plugin) `migration` preset per [Codemod policy](../blob/main/CONTRIBUTING.md#codemod-policy). Name the rule:
- [ ] Deprecation cycle observed (≥1 minor as `@deprecated` before removal), OR explicit justification for skipping below

### If this PR adds a new component

- [ ] `React.forwardRef` + `displayName`
- [ ] `className` merged via `cn()` + remaining props spread
- [ ] CVA used if `variant`/`size`/`color` props exist
- [ ] Exported prop types interface
- [ ] Unit test with at least one `vitest-axe` assertion
- [ ] Storybook story with `tags: ['autodocs']`
- [ ] Entry added to `llms.txt` Quick Reference + `llms-full.txt` per-component block

## Notes for the reviewer

<!-- Anything non-obvious about the approach, alternatives considered, or follow-ups intentionally deferred. -->
