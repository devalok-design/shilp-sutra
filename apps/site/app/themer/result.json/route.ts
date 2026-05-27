import { NextResponse } from 'next/server'

import { generateThemerCss } from '@/lib/themer-css'
import { parseThemerParams } from '@/lib/themer-state'

/**
 * Stable JSON contract for AI agents and tooling. Same inputs as the HTML
 * /themer/result page, returns structured fields so consumers don't have to
 * scrape the page markup.
 *
 * GET /themer/result.json?archetype=apple&hue=220&chroma=0.15
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const state = parseThemerParams(url.searchParams)
  const css = generateThemerCss(state)

  return NextResponse.json(
    {
      archetype: state.archetype ?? null,
      density: state.density ?? null,
      shape: state.shape ?? null,
      motion: state.motion ?? null,
      hue: state.hue ?? null,
      chroma: state.chroma ?? null,
      focusRing: state.focusRing ?? null,
      texture: state.texture ?? null,
      css,
      pasteAfter: '@import "@devalok/shilp-sutra/css";',
      pasteLocation:
        'Global stylesheet (e.g. app/globals.css, src/index.css, src/styles/globals.css)',
      doNotPasteInside: '@layer',
    },
    {
      headers: {
        'cache-control': 'public, max-age=600, s-maxage=3600',
      },
    },
  )
}
