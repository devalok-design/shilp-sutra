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
    'tools/list has all 6',
    JSON.stringify(names) === JSON.stringify(['find_component', 'get_component', 'get_setup', 'get_tokens', 'search_docs', 'upgrade']),
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
} finally {
  if (child) child.kill()
}

console.log(failures === 0 ? '\nAll smoke checks passed.' : `\n${failures} smoke check(s) FAILED.`)
process.exit(failures === 0 ? 0 : 1)
