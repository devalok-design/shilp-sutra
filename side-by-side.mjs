import { chromium } from 'playwright'

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1000, height: 400 }, deviceScaleFactor: 2 })
const page = await ctx.newPage()

await page.goto('http://localhost:6008/iframe.html?id=ui-core-button--all-sizes&viewMode=story', { waitUntil: 'networkidle' })
await page.waitForTimeout(500)

const sizes = ['xs','sm','md','lg']
await page.evaluate((sizes) => {
  const root = document.querySelector('#storybook-root')
  while (root.firstChild) root.removeChild(root.firstChild)
  root.style.padding = '24px'
  root.style.background = '#fff'

  const make = (tag, cls, text) => {
    const el = document.createElement(tag)
    if (cls) el.className = cls
    if (text) el.textContent = text
    return el
  }

  for (const sz of sizes) {
    const hCls = `h-ds-${sz === 'xs' ? 'xs-plus' : sz}`
    const row = make('div')
    row.style.cssText = 'display:flex;gap:8px;align-items:center;margin-bottom:24px;'

    const label = make('span', null, sz)
    label.style.cssText = 'width:24px;font:600 12px/1 ui-sans-serif'

    const inputWrap = make('span', `relative inline-flex items-center bg-surface-raised-hover border border-surface-border-strong rounded-control ${hCls} px-3 text-sm`, 'placeholder')
    inputWrap.style.minWidth = '200px'

    const btn = make('button', `relative inline-flex items-center justify-center bg-accent-9 text-accent-fg rounded-control px-4 ${hCls}`, 'Submit')

    row.appendChild(label)
    row.appendChild(inputWrap)
    row.appendChild(btn)
    root.appendChild(row)
  }
}, sizes)

await page.waitForTimeout(300)
await page.screenshot({ path: 'height-side-by-side.png', fullPage: true })
console.log('wrote height-side-by-side.png')

const data = await page.evaluate(() => {
  const rows = [...document.querySelectorAll('#storybook-root > div')]
  return rows.map(row => {
    const label = row.children[0]?.textContent
    const input = row.children[1]
    const btn = row.children[2]
    return {
      size: label,
      inputH: input.getBoundingClientRect().height,
      btnH: btn.getBoundingClientRect().height,
      delta: btn.getBoundingClientRect().height - input.getBoundingClientRect().height,
    }
  })
})
console.log(JSON.stringify(data, null, 2))

await browser.close()
