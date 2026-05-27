#!/usr/bin/env node
/**
 * Playwright helper for visual debugging of the site.
 *
 * Usage:
 *   node scripts/screenshot.mjs <url> [options]
 *
 * Options:
 *   --out=<path>           Output PNG path (default: screenshots/<slug>.png)
 *   --viewport=<wxh>       Viewport size (default: 1440x900). Examples: 375x812, 768x1024
 *   --selector=<css>       Screenshot just the matching element instead of viewport
 *   --theme=light|dark     Toggle .dark on <html> before shot
 *   --shape=sharp|slightly-rounded|rounded   Toggle data-shape on <html>
 *   --brand=<id>           Apply a brand-preset (writes localStorage 'brand')
 *   --scroll=<px>          Scroll vertically before shot
 *   --full                 Capture full scrollable page, not viewport
 *   --wait=<ms>            Extra wait after load (animations)
 *
 * Examples:
 *   pnpm shot https://shilp-sutra.devalok.in/ --full
 *   pnpm shot http://localhost:3000/ --viewport=375x812 --out=screenshots/hero-mobile.png
 *   pnpm shot http://localhost:3000/ --selector="#canvas" --theme=dark
 *
 * Common viewports:
 *   1440x900   — desktop
 *   1280x720   — small laptop
 *   1024x768   — tablet landscape
 *   768x1024   — tablet portrait (iPad)
 *   375x812    — iPhone 13 portrait
 */

import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { dirname, resolve, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SITE_ROOT = resolve(__dirname, '..')

function parseArgs() {
  const argv = process.argv.slice(2)
  const url = argv.find((a) => !a.startsWith('--'))
  if (!url) {
    console.error('Usage: pnpm shot <url> [options]. See top of screenshot.mjs.')
    process.exit(1)
  }
  const opts = Object.fromEntries(
    argv
      .filter((a) => a.startsWith('--'))
      .map((a) => {
        const [k, v] = a.replace(/^--/, '').split('=')
        return [k, v ?? true]
      }),
  )
  return { url, opts }
}

function slugFromUrl(url) {
  try {
    const u = new URL(url)
    const path = u.pathname.replace(/\/+$/, '').replace(/^\//, '').replace(/\//g, '-') || 'home'
    return `${u.hostname}-${path}`
  } catch {
    return basename(url) || 'shot'
  }
}

async function main() {
  const { url, opts } = parseArgs()
  const [vw, vh] = (opts.viewport || '1440x900').split('x').map(Number)
  const outPath = resolve(
    SITE_ROOT,
    opts.out ||
      `screenshots/${slugFromUrl(url)}${opts.theme ? '-' + opts.theme : ''}${opts.selector ? '-elem' : ''}.png`,
  )
  await mkdir(dirname(outPath), { recursive: true })

  const browser = await chromium.launch()
  const ctx = await browser.newContext({
    viewport: { width: vw, height: vh },
    deviceScaleFactor: 2, // crisp screenshots
    colorScheme: opts.theme === 'dark' ? 'dark' : 'light',
  })
  const page = await ctx.newPage()

  // Pre-seed localStorage so brand presets land before first paint.
  if (opts.brand) {
    await page.addInitScript((brand) => {
      try {
        localStorage.setItem('brand', String(brand))
      } catch {}
    }, opts.brand)
  }

  await page.goto(url, { waitUntil: 'networkidle' })

  if (opts.theme === 'dark') {
    await page.evaluate(() => document.documentElement.classList.add('dark'))
  }
  if (opts.shape) {
    await page.evaluate(
      (s) => document.documentElement.setAttribute('data-shape', String(s)),
      opts.shape,
    )
  }
  if (opts.scroll) {
    await page.evaluate((px) => window.scrollTo(0, Number(px)), opts.scroll)
  }
  if (opts.wait) {
    await page.waitForTimeout(Number(opts.wait))
  } else {
    // Default small wait so AuroraBloom + framer transitions settle.
    await page.waitForTimeout(400)
  }

  let result
  if (opts.selector) {
    const el = await page.$(String(opts.selector))
    if (!el) {
      console.error(`No element matched selector: ${opts.selector}`)
      process.exit(2)
    }
    result = await el.screenshot({ path: outPath })
  } else {
    result = await page.screenshot({
      path: outPath,
      fullPage: Boolean(opts.full),
    })
  }

  console.log(`Saved ${outPath} (${(result.length / 1024).toFixed(1)} KB)`)
  await browser.close()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
