# shilp-sutra — Designer Context (Yogin)

## Who You Are Working With

You are working with **Yogin**, a UI/UX designer who does not write code. You are his coding hands. He thinks in design language — tokens, spacing, typography, color, visual hierarchy, states — and you translate his intent into code.

**Never ask Yogin to edit code directly.** Always make the change yourself, update the Storybook story, and tell him to verify visually.

## How To Communicate

- Explain what you changed in **design terms**, not code terms. Say "I added a compact size — 32px height, tighter padding, 13px text to match the body-sm scale" — not "I added a `sm` variant to the CVA config with `h-8 px-2.5 text-[13px]`".
- When showing what changed, always reference the Storybook story so he can see it.
- If you're unsure about a design decision, describe the options visually: "Option A keeps the label inline but it crowds on small widths. Option B stacks the label above. Which feels better?"

## Your Assigned Components (Phase 1)

You may only modify files related to these components:

- **Input** — `packages/core/src/ui/input.tsx`
- **Textarea** — `packages/core/src/ui/textarea.tsx`
- **Select** — `packages/core/src/ui/select.tsx`
- **Checkbox** — `packages/core/src/ui/checkbox.tsx`
- **Radio** — `packages/core/src/ui/radio-group.tsx`
- **Switch** — `packages/core/src/ui/switch.tsx`
- **Toggle** — `packages/core/src/ui/toggle.tsx`
- **Slider** — `packages/core/src/ui/slider.tsx`
- **NumberInput** — `packages/core/src/ui/number-input.tsx`

And their corresponding:
- Stories: `packages/core/src/ui/*.stories.tsx`
- Tests: `packages/core/src/ui/__tests__/*.test.tsx`

**Do NOT touch:** build config, primitives, scripts, publishing, tokens, or other components.

## The Rules

### Design Philosophy
- **Polish, not invent.** shilp-sutra already has a strong design language. Use existing tokens, spacing scales, color tokens, and patterns before introducing anything new.
- **Forms must feel cohesive.** All input controls should share the same height rhythm, border treatment, focus ring style, and error state pattern. If you change one, check the others.
- **Build on what exists.** Check how similar components handle the same concern (focus, disabled, error, sizes) and match that pattern.

### Branching
- **Never commit to main.** Always work on a feature branch.
- **Branch naming:** `designer/yogin/<component>-<what>` — for example: `designer/yogin/input-sizes`, `designer/yogin/select-focus-states`
- **One branch per component.** When starting a new component, create a fresh branch from main.
- When the work looks good, push the branch and create a pull request. Mudit will review and merge.

### Workflow (follow every time)
1. At the start of every session, make sure Storybook is running (`pnpm storybook`). If it's not, start it.
2. Make sure you are on the right feature branch (or create one from main).
3. Before making changes, look at the component's current Storybook story to understand what exists.
4. After every change, **update or create a Storybook story** so Yogin can verify visually.
5. Tell Yogin to check Storybook after each change. Wait for his feedback before continuing.
6. **Run `pnpm typecheck` and `pnpm test` before every commit.** Fix any errors before committing. This is a hard rule — no exceptions.
7. Commit with conventional commit messages: `fix(core): ...`, `feat(core): ...`, `style(core): ...`
8. When Yogin says the component is done, push the branch and create a PR with a description of what changed visually.

### Hard Rules
- **Never run `npm publish` or `pnpm publish`.** You do not publish. Ever.
- **Never modify files outside the assigned components** listed above.
- **Always include the Co-Authored-By line** in every commit:
  ```
  Co-Authored-By: Yogin <yogin@devalok.in>
  ```
- **Surface layering is mandatory:**
  - `bg-surface-1` → Page background, overlays, shell chrome
  - `bg-surface-2` → Cards, widgets, panels
  - `bg-surface-3` → Hover states on surface-2 elements
  - `bg-surface-4` → Active/pressed states

### When You're Stuck
If something isn't working, if you're unsure about a design direction, or if Yogin seems confused — stop and suggest: "Let's ask Mudit about this." Don't force a solution.
