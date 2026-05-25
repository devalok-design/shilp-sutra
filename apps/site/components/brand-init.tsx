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

const INIT_SCRIPT = `(function(){try{var stored=localStorage.getItem(${JSON.stringify(STORAGE_KEY)});var valid=${VALID_IDS};var id=valid.indexOf(stored)>-1?stored:${JSON.stringify(DEFAULT_BRAND_ID)};document.documentElement.setAttribute('data-brand',id);}catch(e){document.documentElement.setAttribute('data-brand',${JSON.stringify(DEFAULT_BRAND_ID)});}})();`

export function BrandInit() {
  return (
    <>
      <style
        id="ss-brand-vars"
        dangerouslySetInnerHTML={{ __html: buildAllBrandsCss() }}
      />
      <script dangerouslySetInnerHTML={{ __html: INIT_SCRIPT }} />
    </>
  )
}
