import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
const [url, out, viewport = '1440x900', theme = 'light', scroll = '0', full = 'viewport'] =
  process.argv.slice(2)
const [vw, vh] = viewport.split('x').map(Number)
const outPath = resolve(out)
await mkdir(dirname(outPath), { recursive: true })
const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: { width: vw, height: vh },
  deviceScaleFactor: 2,
  colorScheme: theme === 'dark' ? 'dark' : 'light',
})
const page = await ctx.newPage()
await page.addInitScript((t) => {
  try {
    localStorage.setItem('theme', t)
  } catch {}
}, theme)
await page.goto(url, { waitUntil: 'load', timeout: 60000 })
if (theme === 'dark') await page.evaluate(() => document.documentElement.classList.add('dark'))
// Pre-scroll through the page to trigger lazy-mounted (below-fold) sections,
// then settle on the requested scroll position.
if (Number(scroll) > 0 || full === 'full') {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 120))
    }
  })
  await page.waitForTimeout(600)
}
if (Number(scroll) > 0) await page.evaluate((px) => window.scrollTo(0, Number(px)), scroll)
await page.waitForTimeout(Number(process.env.SHOT_WAIT || 6500))
const result = await page.screenshot({ path: outPath, fullPage: full === 'full' })
console.log(`Saved ${outPath} (${(result.length / 1024).toFixed(1)} KB)`)
await browser.close()
