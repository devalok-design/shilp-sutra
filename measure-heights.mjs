import { chromium } from 'playwright'

const BASE = 'http://localhost:6008/iframe.html'

const stories = [
  { id: 'ui-core-button--small',  label: 'Button sm', selector: 'button' },
  { id: 'ui-core-button--medium', label: 'Button md', selector: 'button' },
  { id: 'ui-core-button--large',  label: 'Button lg', selector: 'button' },
  { id: 'ui-core-input--default', label: 'Input md',  selector: '[data-testid], div:has(> input), input' },
  { id: 'ui-core-input--sizes',   label: 'Input all sizes (story)', selector: 'input' },
  { id: 'ui-core-button--all-sizes', label: 'Button all sizes (story)', selector: 'button' },
]

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } })
const page = await ctx.newPage()

for (const s of stories) {
  await page.goto(`${BASE}?id=${s.id}&viewMode=story`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  const root = page.locator('#storybook-root')
  await root.waitFor({ state: 'visible' })

  // Pull all top-level buttons and input wrappers
  const elements = await page.evaluate(() => {
    const root = document.querySelector('#storybook-root')
    if (!root) return []
    const out = []
    // Buttons (direct or nested)
    root.querySelectorAll('button').forEach(el => {
      const r = el.getBoundingClientRect()
      const cs = getComputedStyle(el)
      out.push({
        tag: 'button',
        cls: el.className.split(' ').filter(c => /h-ds-|h-\[|^h-\d/.test(c)).join(' ') || el.className.slice(0,60),
        h: r.height,
        w: r.width,
        borderTop: cs.borderTopWidth,
        borderBot: cs.borderBottomWidth,
        padTop: cs.paddingTop,
        padBot: cs.paddingBottom,
        boxSizing: cs.boxSizing,
        outerH: el.offsetHeight,
      })
    })
    // Input wrappers (the div with the border + h-ds-* class)
    root.querySelectorAll('input').forEach(el => {
      const wrap = el.closest('div')
      const target = wrap?.className.match(/h-ds-/) ? wrap : el
      const r = target.getBoundingClientRect()
      const cs = getComputedStyle(target)
      out.push({
        tag: 'input-wrapper',
        cls: target.className.split(' ').filter(c => /h-ds-|h-\[|^h-\d/.test(c)).join(' ') || target.className.slice(0,60),
        h: r.height,
        w: r.width,
        borderTop: cs.borderTopWidth,
        borderBot: cs.borderBottomWidth,
        padTop: cs.paddingTop,
        padBot: cs.paddingBottom,
        boxSizing: cs.boxSizing,
        outerH: target.offsetHeight,
      })
    })
    return out
  })

  console.log(`\n=== ${s.label} (${s.id}) ===`)
  elements.forEach(e => console.log(`  ${e.tag.padEnd(15)} h=${e.h}px outerH=${e.outerH}px borderT/B=${e.borderTop}/${e.borderBot} padT/B=${e.padTop}/${e.padBot} box=${e.boxSizing}  [${e.cls.slice(0,80)}]`))
}

await browser.close()
