/**
 * Blocking theme initialization script.
 *
 * Inject this into <head> as an inline <script> to prevent
 * flash-of-wrong-theme (FOWT) on page load. Reads localStorage
 * first, falls back to prefers-color-scheme system preference.
 *
 * Usage in Next.js App Router layout.tsx (server component):
 *   import { THEME_INIT_SCRIPT } from '@devalok/shilp-sutra/scripts/theme-init'
 *   // Inject using your framework's safe script injection method
 *
 * Usage in plain HTML:
 *   <script>{THEME_INIT_SCRIPT}</script>
 */
export const THEME_INIT_SCRIPT = [
  '(function(){',
  'try{',
  'var d=document.documentElement,',
  't=localStorage.getItem("theme");',
  'if(t==="dark")d.classList.add("dark");',
  'else if(t!=="light"&&window.matchMedia("(prefers-color-scheme:dark)").matches)',
  'd.classList.add("dark")',
  '}catch(e){}',
  '})()',
].join('')
