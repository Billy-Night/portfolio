// usage: node rtprobe.mjs <dist-dir> — real-time check of the frame-driven animations (orbit, review ring, timeline)
import { spawn } from 'node:child_process'
import { rmSync } from 'node:fs'
const dist = process.argv[2]; const PORT = 4594, DBG = 9335; const BASE = process.argv[3] || `http://localhost:${PORT}`
const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--directory', dist], { stdio: 'ignore' })
const profile = `${dist}/../.rtprofile-${Date.now()}`
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', '--disable-gpu', '--no-first-run', `--user-data-dir=${profile}`, `--remote-debugging-port=${DBG}`, '--window-size=1280,900', 'about:blank'], { stdio: 'ignore' })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
async function retry(fn) { for (let i = 0; i < 40; i++) { try { return await fn() } catch { await sleep(250) } } throw new Error('chrome not reachable') }
const probe = `(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); const q = (s) => document.querySelector(s); const r = {}
  await sleep(1500)
  const snap = () => ({ o1: q('#orbitDot1')?.getAttribute('cx'), d1: q('#orbit-path-draw-1')?.style.strokeDashoffset, o2: q('#orbitDot2')?.getAttribute('cx'),
    ring: q('.review-icon-loading-circle-drawPath')?.style.strokeDashoffset, line: q('.timeline__line')?.style.strokeDashoffset, dot: q('.timeline__dot')?.getAttribute('cx'),
    review: [...document.querySelectorAll('.cont__review-content')].findIndex((e) => e.classList.contains('review-is-active')) })
  const a = snap(); await sleep(1200); const b = snap()
  r.orbit1_dot_moves = a.o1 != null && a.o1 !== b.o1
  r.orbit1_line_draws = !!a.d1 && a.d1 !== b.d1
  r.orbit2_dot_moves = a.o2 != null && a.o2 !== b.o2
  r.review_ring_draws = a.ring === undefined ? 'n/a' : (!!a.ring && a.ring !== b.ring)
  const tl = q('.timeline__body'); const top = tl.getBoundingClientRect().top + scrollY
  scrollTo({ top: Math.max(0, top - 300), behavior: 'instant' }); await sleep(700); const c = snap()
  scrollTo({ top: top + 600, behavior: 'instant' }); await sleep(700); const e = snap()
  r.timeline_line_draws_on_scroll = c.line !== e.line
  r.timeline_dot_moves_on_scroll = c.dot !== e.dot
  r.timeline_steps_revealed = document.querySelectorAll('.timeline__step-heading.timeline__step-heading--reveal').length
  r.header_small_after_scroll = q('.header').classList.contains('small-nav')
  if (a.review >= 0) { scrollTo({ top: 0, behavior: 'instant' }); await sleep(4200); r.review_auto_advances = snap().review !== a.review } else r.review_auto_advances = 'n/a'
  r.title_measure_label = q('.type-measure__label')?.textContent
  return JSON.stringify(r)
})()`
try {
  for (const page of (process.argv[3] ? ['', 'about', 'fr/', 'fr/a-propos'] : ['index.html', 'about.html', 'fr/index.html', 'fr/a-propos.html'])) {
    const target = await retry(async () => (await fetch(`http://localhost:${DBG}/json/new?${BASE}/${page}`, { method: 'PUT' })).json())
    const ws = new WebSocket(target.webSocketDebuggerUrl)
    await new Promise((r) => ws.addEventListener('open', r))
    const res = await new Promise((resolve) => {
      ws.addEventListener('message', (m) => { const d = JSON.parse(m.data); if (d.id === 1) resolve(d) })
      setTimeout(() => ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: probe, awaitPromise: true, returnByValue: true } })), 2500)
    })
    console.log(page.padEnd(18), res.result?.result?.value ?? JSON.stringify(res).slice(0, 300))
    ws.close(); await fetch(`http://localhost:${DBG}/json/close/${target.id}`)
  }
} finally { chrome.kill(); srv.kill(); await sleep(500); try { rmSync(profile, { recursive: true, force: true }) } catch {} }
