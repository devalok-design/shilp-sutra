/**
 * smoke.mjs — end-to-end smoke test against a running server.
 *
 * Usage:
 *   LOCAL_CORE_DIR=../core node src/index.mjs   # terminal 1 (or rely on auto-spawn below)
 *   node scripts/smoke.mjs                       # terminal 2
 *
 * If no server is running, spawns one in local mode for the duration.
 */

import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const PORT = 3111
const URL = `http://localhost:${PORT}/mcp`

async function rpc(method, params, id) {
  const res = await fetch(URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
    body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
  })
  const ct = res.headers.get('content-type') || ''
  const raw = await res.text()
  if (ct.includes('text/event-stream')) {
    // Parse last SSE data: line
    const data = raw.split('\n').filter((l) => l.startsWith('data: ')).map((l) => l.slice(6))
    return JSON.parse(data[data.length - 1])
  }
  return JSON.parse(raw)
}

async function up() {
  try {
    const r = await fetch(`http://localhost:${PORT}/health`)
    return r.ok
  } catch {
    return false
  }
}

let child = null
if (!(await up())) {
  child = spawn(process.execPath, [join(HERE, '..', 'src', 'index.mjs')], {
    env: { ...process.env, PORT: String(PORT), LOCAL_CORE_DIR: join(HERE, '..', '..', 'core') },
    stdio: 'ignore',
  })
  for (let i = 0; i < 30 && !(await up()); i++) await new Promise((r) => setTimeout(r, 200))
  if (!(await up())) {
    console.error('server failed to start')
    process.exit(1)
  }
}

let failures = 0
function check(name, cond, detail = '') {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${cond ? '' : '  ' + detail}`)
  if (!cond) failures++
}

try {
  const init = await rpc('initialize', {
    protocolVersion: '2025-03-26',
    capabilities: {},
    clientInfo: { name: 'smoke', version: '0.0.0' },
  }, 1)
  check('initialize', init.result?.serverInfo?.name === 'shilp-sutra', JSON.stringify(init).slice(0, 200))

  const list = await rpc('tools/list', {}, 2)
  const names = (list.result?.tools ?? []).map((t) => t.name).sort()
  check(
    'tools/list has all 17',
    JSON.stringify(names) === JSON.stringify(['check_slop', 'detect_framework', 'find_component', 'get_component', 'get_preset', 'get_setup', 'get_tokens', 'how_to_use', 'list_presets', 'preflight', 'preview_preset', 'report_issue', 'search_docs', 'submit_entry', 'upgrade', 'validate_snippet', 'verify_setup']),
    names.join(',')
  )

  const call = (name, args, id) => rpc('tools/call', { name, arguments: args }, id)

  const btn = await call('get_component', { name: 'button', sections: ['api'] }, 3)
  const btnText = btn.result?.content?.[0]?.text ?? ''
  check('get_component(button).api has variant enum', btnText.includes('"variant"') && btnText.includes('"soft"'), btnText.slice(0, 200))
  check('banner present', btnText.startsWith('Docs for @devalok/shilp-sutra@'), btnText.slice(0, 80))
  check('response under cap', btnText.length <= 21_000, `len=${btnText.length}`)

  const comp = await call('get_component', { name: 'accordion', sections: ['composition'] }, 4)
  const compText = comp.result?.content?.[0]?.text ?? ''
  check('accordion composition has parts', compText.includes('AccordionItem'), compText.slice(0, 200))

  // #132: a subcomponent's prop must be attributed to that subcomponent, never
  // the root — else an agent writes `<Table numeric>` / `<TableRow href>` (TS2322).
  const tbl = await call('get_component', { name: 'table', sections: ['api'] }, 41)
  const tblApi = JSON.parse((tbl.result?.content?.[0]?.text ?? '').match(/```json\n([\s\S]*?)\n```/)?.[1] ?? '{}')
  check('table root props exclude numeric/href', !('numeric' in (tblApi.props ?? {})) && !('href' in (tblApi.props ?? {})), JSON.stringify(Object.keys(tblApi.props ?? {})))
  check('table.subComponents.TableCell owns numeric', tblApi.subComponents?.TableCell?.props?.numeric?.type?.name === 'boolean', JSON.stringify(tblApi.subComponents?.TableCell))
  check('table.subComponents.TableRowLink owns href (required string)', tblApi.subComponents?.TableRowLink?.props?.href?.required === true && tblApi.subComponents?.TableRowLink?.props?.href?.type?.name === 'string', JSON.stringify(tblApi.subComponents?.TableRowLink))

  const typo = await call('get_component', { name: 'buton' }, 5)
  const typoText = typo.result?.content?.[0]?.text ?? ''
  check('typo self-correction suggests', typoText.includes('find_component'), typoText.slice(0, 200))

  const find = await call('find_component', { query: 'toast' }, 6)
  check('find_component(toast)', (find.result?.content?.[0]?.text ?? '').includes('"toast"'))

  const tok = await call('get_tokens', { category: 'spacing' }, 7)
  check('get_tokens(spacing)', (tok.result?.content?.[0]?.text ?? '').includes('--spacing-ds-'))

  const setup = await call('get_setup', { framework: 'vite' }, 8)
  check('get_setup(vite)', (setup.result?.content?.[0]?.text ?? '').includes('tailwindcss'))

  const up1 = await call('upgrade', { from: '0.39.0', to: '0.44.0' }, 9)
  const upText = up1.result?.content?.[0]?.text ?? ''
  check('upgrade(0.39→0.44) has 0.40.0 breaks', upText.includes('0.40.0'), upText.slice(0, 200))

  const search = await call('search_docs', { query: 'focus ring' }, 10)
  check('search_docs(focus ring)', !(search.result?.content?.[0]?.text ?? '').includes('No sections matched'))

  // ── setup-journey tools ──
  const pre = await call('preflight', { framework: 'vite', imports: ['@devalok/shilp-sutra/ui/data-table', 'ui/button'] }, 12)
  const preText = pre.result?.content?.[0]?.text ?? ''
  check('preflight surfaces data-table peers', preText.includes('@tanstack/react-table') && preText.includes('@tanstack/react-virtual'), preText.slice(0, 200))

  const val = await call('validate_snippet', { code: '<Button variant="default" className="shadow bg-surface-2">x</Button>' }, 13)
  const valText = val.result?.content?.[0]?.text ?? ''
  check('validate_snippet flags dead classes + bad variant', valText.includes('Bare `shadow`') && valText.includes('surface-N') && valText.includes('removed in 0.32.0'), valText.slice(0, 300))

  const det = await call('detect_framework', { packageJson: JSON.stringify({ dependencies: { '@tanstack/react-start': '^1', '@tanstack/react-router': '^1' } }) }, 14)
  check('detect_framework(react-start)→tanstack-start', (det.result?.content?.[0]?.text ?? '').includes('"tanstack-start"'))

  const ver = await call('verify_setup', { globalsCss: '@import "@devalok/shilp-sutra/css";\n@import "tailwindcss";' }, 15)
  check('verify_setup catches CSS import order', (ver.result?.content?.[0]?.text ?? '').includes('CSS import order'))

  const nest = await call('verify_setup', { globalsCss: '@import "tailwindcss";\n@import "@devalok/shilp-sutra/css";\n/* head /* nested */\n */\n:root{--color-accent-9:oklch(0.55 0.198 8)}' }, 16)
  check('verify_setup catches nested CSS comment (dropped override)', (nest.result?.content?.[0]?.text ?? '').includes('nested'))

  // report_issue: without GITHUB_APP_* configured (as in smoke/local), it must
  // fail gracefully — a clear "not enabled" error, never a crash or a write.
  const rep = await call('report_issue', { category: 'bug', title: 'smoke test — should not file', body: 'smoke' }, 16)
  const repText = rep.result?.content?.[0]?.text ?? ''
  check('report_issue not-configured is graceful', rep.result?.isError === true && repText.includes('not enabled'), repText.slice(0, 200))

  // check_slop: flags a deliberately sloppy snippet + surfaces guidance + the Setu line.
  const slopCode = '<div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl shadow-2xl"><span className="text-xs uppercase tracking-widest">About</span><h2 className="bg-clip-text text-transparent">T</h2></div>'
  const slop = await call('check_slop', { code: slopCode }, 17)
  const slopText = slop.result?.content?.[0]?.text ?? ''
  check('check_slop flags gradient-text + purple + eyebrow', slopText.includes('gradient-text') && slopText.includes('purple-blue-gradient') && slopText.includes('eyebrow-kicker'), slopText.slice(0, 200))
  check('check_slop returns guidance + Setu line', slopText.includes('signature-first') && slopText.includes('setu.devalok.dev'), slopText.slice(0, 120))
  const clean = await call('check_slop', { code: '<Button variant="soft" className="bg-surface-2 text-body-sm focus-visible:ring-2">Go</Button>' }, 18)
  check('check_slop passes clean code', (clean.result?.content?.[0]?.text ?? '').includes('"verdict": "clean"'))
  // AST structural pass + agent self-critique block.
  const ast = await call('check_slop', { code: 'function X(){return (<div><Card><Card>x</Card></Card><div><Button variant="solid">A</Button><Button variant="outline">B</Button></div><h1>T</h1><h3>S</h3></div>)}' }, 20)
  const astText = ast.result?.content?.[0]?.text ?? ''
  check('check_slop AST flags nested-cards + button-duo + skipped-heading', astText.includes('nested-cards') && astText.includes('filled-outline-duo') && astText.includes('skipped-heading-level'), astText.slice(0, 200))
  check('check_slop returns self_critique block', astText.includes('self_critique') && astText.includes('AI made that'), astText.slice(0, 120))

  // how_to_use: returns the tool map + the writing-a-component sequence.
  const how = await call('how_to_use', {}, 19)
  const howText = how.result?.content?.[0]?.text ?? ''
  check('how_to_use lists check_slop + sequences', howText.includes('check_slop') && howText.includes('writing_a_component'), howText.slice(0, 120))
  check('how_to_use lists preset tools + using_a_preset', howText.includes('list_presets') && howText.includes('using_a_preset'), howText.slice(0, 120))

  // Preset Library tools: wired + graceful (fetch the live registry; in CI the
  // endpoint may not be deployed yet, so we assert the banner/shape, not network).
  const lp = await call('list_presets', {}, 25)
  const lpText = lp.result?.content?.[0]?.text ?? ''
  check('list_presets responds with Preset Library banner', lpText.includes('Preset Library'), lpText.slice(0, 160))
  const gp = await call('get_preset', { name: 'sidebar-app' }, 26)
  const gpText = gp.result?.content?.[0]?.text ?? ''
  check('get_preset responds (banner + install or not-found)', gpText.includes('Preset Library') && (gpText.includes('shadcn') || gpText.includes('No preset')), gpText.slice(0, 160))
  const pp = await call('preview_preset', { name: 'sidebar-app' }, 27)
  const ppText = pp.result?.content?.[0]?.text ?? ''
  check('preview_preset responds (banner)', ppText.includes('Preset Library'), ppText.slice(0, 160))

  // ── buildathon ────────────────────────────────────────────────────────────
  // Only FAILURE paths are exercised. A submit_entry call that passed every
  // validation would POST a real row into the live response sheet, so no smoke
  // check may ever supply a fully valid entry.
  const buildathonOpen = Date.now() < Date.parse('2026-08-04T23:30:00Z')
  check('how_to_use carries the buildathon block while open', howText.includes('buildathon') === buildathonOpen, howText.slice(0, 120))

  const noConsent = await call('submit_entry', { fullName: 'A', email: 'a@b.co', phone: '1', mode: 'solo', projectTitle: 'P', oneLiner: 'x', repoUrl: 'https://github.com/a/b', videoUrl: 'https://x.co', liveUrl: 'https://x.co', humanConfirmed: false }, 21)
  const noConsentText = noConsent.result?.content?.[0]?.text ?? ''
  check(
    'submit_entry refuses without humanConfirmed',
    buildathonOpen ? noConsent.result?.isError === true && noConsentText.includes('humanConfirmed') : noConsentText.includes('closed'),
    noConsentText.slice(0, 200)
  )

  // humanConfirmed is true here, but the repo host is wrong — validation must
  // reject it BEFORE any network write happens.
  const badRepo = await call('submit_entry', { fullName: 'A', email: 'a@b.co', phone: '1', mode: 'solo', projectTitle: 'P', oneLiner: 'x', repoUrl: 'https://gitlab.com/a/b', videoUrl: 'https://x.co', liveUrl: 'https://x.co', humanConfirmed: true }, 22)
  const badRepoText = badRepo.result?.content?.[0]?.text ?? ''
  check(
    'submit_entry rejects a non-GitHub repo before writing',
    buildathonOpen ? badRepo.result?.isError === true && badRepoText.includes('public GitHub repository') : badRepoText.includes('closed'),
    badRepoText.slice(0, 200)
  )

  const teamGap = await call('submit_entry', { fullName: 'A', email: 'a@b.co', phone: '1', mode: 'team', projectTitle: 'P', oneLiner: 'x', repoUrl: 'https://github.com/a/b', videoUrl: 'https://x.co', liveUrl: 'https://x.co', humanConfirmed: true }, 23)
  const teamGapText = teamGap.result?.content?.[0]?.text ?? ''
  check(
    'submit_entry requires team fields for a team entry',
    buildathonOpen ? teamGap.result?.isError === true && teamGapText.includes('teamName') : teamGapText.includes('closed'),
    teamGapText.slice(0, 200)
  )

  // The advert rides on the shared version banner, so it must show up on an
  // ordinary doc response while the buildathon is open — and vanish after.
  const bannerCheck = await call('find_component', { query: 'button' }, 24)
  const bannerText = bannerCheck.result?.content?.[0]?.text ?? ''
  check('banner carries the buildathon line while open', bannerText.includes('Build with Shilp Sutra') === buildathonOpen, bannerText.slice(0, 200))
} finally {
  if (child) child.kill()
}

console.log(failures === 0 ? '\nAll smoke checks passed.' : `\n${failures} smoke check(s) FAILED.`)
process.exit(failures === 0 ? 0 : 1)
