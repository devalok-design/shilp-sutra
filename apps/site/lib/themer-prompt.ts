/**
 * Single-prompt builder for AI agents. Consumer pastes the output into
 * Claude Code / Cursor / Codex and the agent installs + themes from scratch.
 *
 * Two modes:
 *   - `buildAgentPrompt(state)` — fills in the user's actual archetype + accent so
 *     the agent skips the persona-triage step.
 *   - `AGENT_PROMPT_TEMPLATE` — the generic template (used in README/AGENTS for
 *     copy-paste before the user has been to the Themer).
 */

import { type ThemerState } from './themer-state'

export const AGENT_PROMPT_TEMPLATE = `Set up shilp-sutra theming for this project via the Themer.

My brand: <PASTE HEX or write archetype name: linear | stripe | apple | material | notion | vercel | devalok>

Steps:
1. WebFetch https://shilp-sutra.devalok.in/themer to understand the funnel, then pick the right door based on my brand input above (/themer/brand for a hex, /themer/archetypes for an archetype name, /themer/wizard if I left it blank).
2. Construct the result URL (e.g. https://shilp-sutra.devalok.in/themer/result?archetype=apple&hue=220&chroma=0.15), WebFetch it, and extract the CSS block from the "Paste this CSS" section.
3. Find my project's global stylesheet (app/globals.css, src/index.css, src/styles/globals.css, or whichever imports tailwindcss). Paste the CSS block AFTER the @import "@devalok/shilp-sutra/css"; line. Do not put it inside any @layer.
4. If @devalok/shilp-sutra isn't installed yet, install it first per the recipe at node_modules/@devalok/shilp-sutra/docs/recipes/install-<framework>.md (detect framework from lockfile + config).
5. Verify by opening any page that uses a Button or Card — radius + accent should match the Themer preview. Report any token that didn't take effect.

Do not invent CSS variables. Use exactly what the Themer emits. Don't add tailwind.config.ts. Don't wrap in a theme provider.`

/**
 * Build a prompt with the user's themer state baked into the URL so the agent
 * goes straight to the result fetch step.
 */
export function buildAgentPrompt(state: ThemerState, origin = 'https://shilp-sutra.devalok.in'): string {
  const params = new URLSearchParams()
  if (state.archetype) params.set('archetype', state.archetype)
  if (state.density) params.set('density', state.density)
  if (state.shape) params.set('shape', state.shape)
  if (state.motion) params.set('motion', state.motion)
  if (state.hue != null) params.set('hue', String(Math.round(state.hue)))
  if (state.chroma != null) params.set('chroma', state.chroma.toFixed(3))
  const resultUrl = `${origin}/themer/result?${params.toString()}`

  return `Set up shilp-sutra theming for this project. I've already picked a theme via the Themer.

Theme URL: ${resultUrl}

Steps:
1. WebFetch the Theme URL above. Extract the CSS block from the "Paste this CSS" section.
2. Find my project's global stylesheet (app/globals.css, src/index.css, src/styles/globals.css, or whichever imports tailwindcss). Paste the CSS block AFTER the @import "@devalok/shilp-sutra/css"; line. Do not put it inside any @layer.
3. If @devalok/shilp-sutra isn't installed yet, install it first per the recipe at node_modules/@devalok/shilp-sutra/docs/recipes/install-<framework>.md (detect framework from lockfile + config).
4. Verify by opening any page that uses a Button or Card — radius + accent should match the Themer preview at the URL above. Report any token that didn't take effect.

Do not invent CSS variables. Use exactly what the Themer emits. Don't add tailwind.config.ts. Don't wrap in a theme provider.`
}
