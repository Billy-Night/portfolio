// usage: node cdp_shot.mjs <dist-dir> <page> <css-selector> <out.png> [width,height] — real-time screenshot of a built page scrolled to an element
import { spawn } from 'node:child_process'
import { rmSync, writeFileSync } from 'node:fs'
const [dist, page, selector, out, size = '1280,1000'] = process.argv.slice(2); const PORT = 4592, DBG = 9336
const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--directory', dist], { stdio: 'ignore' })
const profile = `${dist}/../.shotprofile-${Date.now()}`
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', `--user-data-dir=${profile}`, `--remote-debugging-port=${DBG}`, `--window-size=${size}`, 'about:blank'], { stdio: 'ignore' })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
async function retry(fn) { for (let i = 0; i < 40; i++) { try { return await fn() } catch { await sleep(250) } } throw new Error('chrome not reachable') }
try {
  const target = await retry(async () => (await fetch(`http://localhost:${DBG}/json/new?http://localhost:${PORT}/${page}`, { method: 'PUT' })).json())
  const ws = new WebSocket(target.webSocketDebuggerUrl); await new Promise((r) => ws.addEventListener('open', r))
  let id = 0; const pending = {}
  ws.addEventListener('message', (m) => { const d = JSON.parse(m.data); if (pending[d.id]) pending[d.id](d) })
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending[i] = r; ws.send(JSON.stringify({ id: i, method, params })) })
  await sleep(2500)
  const expr = `(async () => { const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); const el = document.querySelector(${JSON.stringify(selector)});
    scrollTo({ top: el.getBoundingClientRect().top + scrollY - 100, behavior: 'instant' }); await sleep(2500);
    document.querySelectorAll('.sections--hidden').forEach((e) => e.classList.remove('sections--hidden')); await sleep(2500); return 'ok' })()`
  await send('Runtime.evaluate', { expression: expr, awaitPromise: true })
  const shot = await send('Page.captureScreenshot', { format: 'png' })
  writeFileSync(out, Buffer.from(shot.result.data, 'base64')); console.log('saved', out)
} finally { chrome.kill(); srv.kill(); await sleep(500); try { rmSync(profile, { recursive: true, force: true }) } catch {} }
