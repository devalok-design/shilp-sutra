import { chromium } from 'playwright'

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1100, height: 700 }, deviceScaleFactor: 2 })
const page = await ctx.newPage()

await page.goto('http://localhost:6008/iframe.html?id=ui-core-input--sizes&viewMode=story', { waitUntil: 'networkidle' })
await page.waitForTimeout(400)
const inputs = await page.evaluate(() => {
  const wrappers = [...document.querySelectorAll('#storybook-root *')]
    .filter(el => el.className && typeof el.className === 'string' && /\bh-ds-(xs-plus|sm|md|lg)\b/.test(el.className) && el.tagName === 'DIV')
  return wrappers.map(el => ({
    size: el.className.match(/h-ds-(xs-plus|sm|md|lg)/)?.[1],
    html: el.outerHTML,
  }))
})
console.log('Inputs captured:', inputs.map(i => i.size))

await page.goto('http://localhost:6008/iframe.html?id=ui-core-button--all-sizes&viewMode=story', { waitUntil: 'networkidle' })
await page.waitForTimeout(400)
const buttons = await page.evaluate(() => {
  const btns = [...document.querySelectorAll('#storybook-root button')]
    .filter(el => /\bh-ds-(xs-plus|sm|md|lg)\b/.test(el.className) && !/icon/.test(el.className))
  const out = []
  const seen = new Set()
  for (const el of btns) {
    const sz = el.className.match(/h-ds-(xs-plus|sm|md|lg)/)?.[1]
    if (!sz || seen.has(sz)) continue
    seen.add(sz)
    out.push({ size: sz, html: el.outerHTML })
  }
  return out
})
console.log('Buttons captured:', buttons.map(b => b.size))

await page.evaluate(({ inputs, buttons }) => {
  const root = document.querySelector('#storybook-root')
  while (root.firstChild) root.removeChild(root.firstChild)
  root.style.cssText = 'padding:32px;background:#fff;font:14px/1.4 ui-sans-serif,system-ui'

  const title = document.createElement('h2')
  title.textContent = 'Input vs Button - same h-ds-* size token, side by side'
  title.style.cssText = 'font:600 16px/1.2 ui-sans-serif;margin:0 0 24px;color:#111'
  root.appendChild(title)

  const order = ['xs-plus', 'sm', 'md', 'lg']
  const labels = { 'xs-plus': 'xs (28px)', 'sm': 'sm (32px)', 'md': 'md (40px)', 'lg': 'lg (48px)' }

  const parseHTML = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    return doc.body.firstElementChild
  }

  for (const sz of order) {
    const inp = inputs.find(i => i.size === sz)
    const btn = buttons.find(b => b.size === sz)
    if (!inp || !btn) continue

    const row = document.createElement('div')
    row.style.cssText = 'display:flex;gap:12px;align-items:center;margin-bottom:24px;'

    const sizeLabel = document.createElement('span')
    sizeLabel.textContent = labels[sz]
    sizeLabel.style.cssText = 'width:80px;font:600 12px/1 ui-monospace,monospace;color:#666'

    const inpHost = document.createElement('div')
    inpHost.style.cssText = 'min-width:260px'
    const inpNode = parseHTML(inp.html)
    if (inpNode) inpHost.appendChild(inpNode)

    const btnHost = document.createElement('div')
    const btnNode = parseHTML(btn.html)
    if (btnNode) btnHost.appendChild(btnNode)

    row.appendChild(sizeLabel)
    row.appendChild(inpHost)
    row.appendChild(btnHost)
    root.appendChild(row)
  }
}, { inputs, buttons })

await page.waitForTimeout(400)
await page.screenshot({ path: 'input-vs-button.png', fullPage: true })

const data = await page.evaluate(() => {
  const rows = [...document.querySelectorAll('#storybook-root > div')]
  return rows.map(r => {
    if (!r.children || r.children.length < 3) return null
    const label = r.children[0]?.textContent || ''
    const inp = r.children[1]?.firstElementChild
    const btn = r.children[2]?.firstElementChild
    if (!inp || !btn) return null
    return {
      size: label,
      inputH: inp.getBoundingClientRect().height,
      buttonH: btn.getBoundingClientRect().height,
    }
  }).filter(Boolean)
})
console.log(JSON.stringify(data, null, 2))

await browser.close()
