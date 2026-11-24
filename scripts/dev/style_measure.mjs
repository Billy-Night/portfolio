// usage: node style_measure.mjs <dist-dir> <out-dir> <widths, comma separated> [page ...]
// Records the box and the full computed style of every element on built pages, at each window width,
// into one text file per page and width. Run it on two builds and compare them with style_compare.py.
// With no pages given it measures every .html file in the build.
// DETAIL=12,40 also writes every style property of elements 12 and 40, to see what exactly changed.
import { spawn } from 'node:child_process'
import { rmSync, readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const [dist, outDir, widthsArg, ...pagesArg] = process.argv.slice(2)
const widths = widthsArg.split(',').map(Number)
const walk = (d, p = '') => readdirSync(join(d, p)).flatMap((f) => statSync(join(d, p, f)).isDirectory() ? (['_astro', 'assets', 'css'].includes(f) ? [] : walk(d, join(p, f))) : f.endsWith('.html') ? [join(p, f)] : [])
const pages = pagesArg.length ? pagesArg : walk(dist).sort()
const PORT = 4700 + Math.floor(Math.random() * 200), DBG = 9400 + Math.floor(Math.random() * 200)
const here = dirname(fileURLToPath(import.meta.url))
let expr = readFileSync(join(here, 'style_expr.js'), 'utf8')
if (process.env.DETAIL) expr = `window.__detail=[${process.env.DETAIL}];` + expr
mkdirSync(outDir, { recursive: true })
const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--directory', dist], { stdio: 'ignore' })
const profile = join(outDir, `.profile-${Date.now()}`)
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', '--disable-gpu', '--no-first-run', '--hide-scrollbars', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', `--user-data-dir=${profile}`, `--remote-debugging-port=${DBG}`, 'about:blank'], { stdio: 'ignore' })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
async function retry(fn) { for (let i = 0; i < 60; i++) { try { return await fn() } catch { await sleep(250) } } throw new Error('chrome not reachable') }
async function one(page, width) {
  const target = await retry(async () => (await fetch(`http://localhost:${DBG}/json/new?about:blank`, { method: 'PUT' })).json())
  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((r) => ws.addEventListener('open', r))
  let id = 0; const pending = new Map(); let loaded
  const loadP = new Promise((r) => (loaded = r))
  ws.addEventListener('message', (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id) } if (d.method === 'Page.loadEventFired') loaded() })
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })) })
  await send('Page.enable')
  await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false })
  await send('Page.navigate', { url: `http://localhost:${PORT}/${page}` })
  const t0 = Date.now(); await Promise.race([loadP, sleep(15000)]); const t1 = Date.now()
  await sleep(1200)
  const res = await Promise.race([send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }), sleep(60000).then(() => null)])
  if (process.env.TIMING) console.log(page, width, 'load', t1 - t0, 'eval', Date.now() - t1 - 1200)
  const value = res?.result?.result?.value ?? 'TIMEOUT ' + JSON.stringify(res ?? {}).slice(0, 200)
  writeFileSync(join(outDir, `${page.replace(/[\/]/g, '_').replace(/\.html$/, '')}@${width}.txt`), value + '\n')
  ws.close(); await fetch(`http://localhost:${DBG}/json/close/${target.id}`)
  return value.startsWith('TIMEOUT')
}
try {
  const jobs = pages.flatMap((p) => widths.map((w) => [p, w]))
  let next = 0, bad = 0
  await Promise.all(Array.from({ length: 4 }, async () => { while (next < jobs.length) { const [p, w] = jobs[next++]; if (await one(p, w)) { bad++; console.log('TIMEOUT', p, w) } } }))
  console.log(`measured ${jobs.length} page views (${pages.length} pages x ${widths.length} widths), timeouts: ${bad}`)
} finally { chrome.kill(); srv.kill(); await sleep(500); try { rmSync(profile, { recursive: true, force: true }) } catch {} }
process.exit(0)
