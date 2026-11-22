// usage: node cdp_eval.mjs <dist-dir> <expression-file> <page> [page...] — evaluate an async expression on built pages in real time
import { spawn } from 'node:child_process'
import { rmSync, readFileSync } from 'node:fs'
const [dist, exprFile, ...pages] = process.argv.slice(2); const PORT = Number(process.env.PORT || 4593), DBG = Number(process.env.DBG || 9334); const SIZE = process.env.SIZE || '1280,900'
const expr = readFileSync(exprFile, 'utf8')
const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--directory', dist], { stdio: 'ignore' })
const profile = `${dist}/../.cdpprofile-${Date.now()}`
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', '--disable-gpu', '--no-first-run', `--user-data-dir=${profile}`, `--remote-debugging-port=${DBG}`, `--window-size=${SIZE}`, 'about:blank'], { stdio: 'ignore' })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
async function retry(fn) { for (let i = 0; i < 40; i++) { try { return await fn() } catch { await sleep(250) } } throw new Error('chrome not reachable') }
try {
  for (const page of pages) {
    const target = await retry(async () => (await fetch(`http://localhost:${DBG}/json/new?http://localhost:${PORT}/${page}`, { method: 'PUT' })).json())
    const ws = new WebSocket(target.webSocketDebuggerUrl)
    await new Promise((r) => ws.addEventListener('open', r))
    const res = await new Promise((resolve) => {
      setTimeout(() => resolve({ result: { result: { value: 'TIMEOUT' } } }), 45000)
      ws.addEventListener('message', (m) => { const d = JSON.parse(m.data); if (d.id === 1) resolve(d) })
      setTimeout(() => ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: expr, awaitPromise: true, returnByValue: true } })), 2500)
    })
    console.log(page.padEnd(34), res.result?.result?.value ?? JSON.stringify(res).slice(0, 300))
    ws.close(); await fetch(`http://localhost:${DBG}/json/close/${target.id}`)
  }
} finally { chrome.kill(); srv.kill(); await sleep(500); try { rmSync(profile, { recursive: true, force: true }) } catch {} }
