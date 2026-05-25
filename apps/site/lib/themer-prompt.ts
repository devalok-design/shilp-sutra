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
1. Map my brand input to query params:
   - archetype name → archetype=<name>
   - hex like #d946a6 → resolve to OKLCH hue (0-360) and pick a chroma in 0.10-0.20, then hue=<n>&chroma=<n>
   - blank → archetype=devalok&hue=340&chroma=0.19
2. Fetch the JSON contract:
     GET https://shilp-sutra.devalok.in/themer/result.json?<params>
   Response shape:
     { archetype, density, shape, motion, hue, chroma, css, pasteAfter, pasteLocation, doNotPasteInside }
3. Find my project's global stylesheet (app/globals.css, src/index.css, src/styles/globals.css, or whichever imports tailwindcss). Paste the response \`css\` field AFTER the line in \`pasteAfter\`. Do not put it inside any \`@layer\`.
4. If @devalok/shilp-sutra isn't installed yet, install it first per the recipe at node_modules/@devalok/shilp-sutra/docs/recipes/install-<framework>.md (detect framework from lockfile + config).
5. Verify by opening any page that uses a Button or Card — radius + accent should match the Themer preview at https://shilp-sutra.devalok.in/themer/result?<params>. Report any token that didn't take effect.

Do not invent CSS variables. Use exactly what the JSON \`css\` field contains. Don't add tailwind.config.ts. Don't wrap in a theme provider.`

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
  const qs = params.toString()
  const jsonUrl = `${origin}/themer/result.json?${qs}`
  const previewUrl = `${origin}/themer/result?${qs}`

  return `Set up shilp-sutra theming for this project. I've already picked a theme via the Themer.

Theme JSON:    ${jsonUrl}
Theme preview: ${previewUrl}

Steps:
1. Fetch the Theme JSON URL. Response shape:
     { archetype, density, shape, motion, hue, chroma, css, pasteAfter, pasteLocation, doNotPasteInside }
2. Find my project's global stylesheet (app/globals.css, src/index.css, src/styles/globals.css, or whichever imports tailwindcss). Paste the response \`css\` field AFTER the line in \`pasteAfter\`. Do not put it inside any \`@layer\`.
3. If @devalok/shilp-sutra isn't installed yet, install it first per the recipe at node_modules/@devalok/shilp-sutra/docs/recipes/install-<framework>.md (detect framework from lockfile + config).
4. Verify by opening any page that uses a Button or Card — radius + accent should match the Theme preview URL above. Report any token that didn't take effect.

Do not invent CSS variables. Use exactly what the JSON \`css\` field contains. Don't add tailwind.config.ts. Don't wrap in a theme provider.`
}
