import { BRAND_PRESETS, DEFAULT_BRAND_ID } from '@/lib/brand-presets'
import { STORAGE_KEY, buildAllBrandsCss } from '@/lib/brand-runtime'

/**
 * Brand init — emits two <head> children:
 *   1. <style id="ss-brand-vars"> with every preset's CSS-var overrides baked in.
 *   2. Inline <script> that reads localStorage and sets <html data-brand="...">
 *      before hydration. Prevents the flash of the default Devalok ramp when
 *      the user has a non-default preset persisted.
 *
 * SAFETY: the inline script and the stylesheet are both built from static
 * constants. No user input flows into either string.
 */

const VALID_IDS = JSON.stringify(BRAND_PRESETS.map((p) => p.id))

// When the brand swaps, the accent CSS vars change value. A var change doesn't
// tween on its own, so colours would flick. This class (added to <html> by
// brand-runtime just before the swap, removed ~340ms later) turns on a short
// colour transition on every element for the duration of the switch only —
// scoped so it never interferes with hover/scroll transitions the rest of the
// time. Honoured against reduced-motion.
const BRAND_TRANSITION_CSS = `
:root.brand-transition *,
:root.brand-transition *::before,
:root.brand-transition *::after {
  transition:
    background-color 320ms cubic-bezier(0.2, 0, 0.38, 0.9),
    border-color 320ms cubic-bezier(0.2, 0, 0.38, 0.9),
    color 320ms cubic-bezier(0.2, 0, 0.38, 0.9),
    fill 320ms cubic-bezier(0.2, 0, 0.38, 0.9),
    stroke 320ms cubic-bezier(0.2, 0, 0.38, 0.9),
    box-shadow 320ms cubic-bezier(0.2, 0, 0.38, 0.9),
    outline-color 320ms cubic-bezier(0.2, 0, 0.38, 0.9) !important;
}
@media (prefers-reduced-motion: reduce) {
  :root.brand-transition *,
  :root.brand-transition *::before,
  :root.brand-transition *::after { transition: none !important; }
}`

const INIT_SCRIPT = `(function(){try{var stored=localStorage.getItem(${JSON.stringify(STORAGE_KEY)});var valid=${VALID_IDS};var id=valid.indexOf(stored)>-1?stored:${JSON.stringify(DEFAULT_BRAND_ID)};document.documentElement.setAttribute('data-brand',id);}catch(e){document.documentElement.setAttribute('data-brand',${JSON.stringify(DEFAULT_BRAND_ID)});}})();`

export function BrandInit() {
  return (
    <>
      <style
        id="ss-brand-vars"
        dangerouslySetInnerHTML={{ __html: buildAllBrandsCss() + BRAND_TRANSITION_CSS }}
      />
      <script dangerouslySetInnerHTML={{ __html: INIT_SCRIPT }} />
    </>
  )
}
