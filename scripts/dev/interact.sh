#!/bin/bash
# usage: interact.sh <dist-dir> <out-dir> [width] [height]
# Drives every built page in headless Chrome (scroll, click, hover, form input) and records
# the DOM state after each step, to compare behaviour between two builds.
DIST=$(cd "$1" && pwd); OUT=$2; W=${3:-1280}; H=${4:-900}
mkdir -p "$OUT"; OUT=$(cd "$OUT" && pwd)
PORT=4596
python3 -m http.server $PORT --directory "$DIST" >/dev/null 2>&1 & SRV=$!; sleep 1
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
cat > "$DIST/__interact.html" <<'HTML'
<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0">
<iframe id="f" style="border:0;display:block"></iframe><pre id="out"></pre>
<script>
const params = new URLSearchParams(location.search)
const f = document.getElementById('f')
f.style.width = innerWidth + 'px'; f.style.height = innerHeight + 'px'
const rawSleep = (ms) => new Promise((r) => setTimeout(r, ms))
let frameWin = null
const frames = async (n) => { for (let i = 0; i < n; i++) await Promise.race([new Promise((r) => (frameWin || window).requestAnimationFrame(r)), rawSleep(40)]) }
// wait for the page to settle: timers, a few rendered frames (IntersectionObserver, scroll handlers), timers again
const sleep = async (ms) => { await rawSleep(ms); await frames(4); await rawSleep(120); await frames(4) }
const log = []
function dump(d) {
  return [...d.querySelectorAll('body *')].map((e) => {
    if (e.closest('svg') && e.tagName.toLowerCase() !== 'svg') return null  // animated internals
    if (e.tagName === 'SCRIPT' || e.tagName === 'STYLE') return null
    let s = e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + '.' + [...e.classList].filter((c) => !c.startsWith('astro-')).sort().join('.')
    const st = e.getAttribute('style'); if (st && e.tagName.toLowerCase() !== 'svg') s += ' [style=' + st.replace(/\s+/g, ' ') + ']'
    if (e.tagName === 'IMG') s += ' [src=' + e.getAttribute('src') + ']'
    if (e.tagName === 'BUTTON' || e.classList.contains('hero__measure-label')) s += ' [text=' + e.textContent.trim().replace(/\s+/g, ' ').slice(0, 40) + ']'
    return s
  }).filter(Boolean)
}
let prev = null
// record a step only once the page has stopped changing (two identical states in a row)
async function settled(d) {
  let a = dump(d)
  for (let i = 0; i < 15; i++) {
    await rawSleep(150); await frames(3)
    const b = dump(d)
    if (a.length === b.length && a.every((x, j) => x === b[j])) return b
    a = b
  }
  return a
}
async function step(name, d, extra) {
  const cur = await settled(d)
  let lines
  if (prev === null) lines = cur
  else { // record only what changed since the previous step
    lines = []
    const n = Math.max(prev.length, cur.length)
    for (let i = 0; i < n; i++) if (prev[i] !== cur[i]) lines.push(i + ': ' + (prev[i] ?? '(none)') + '  =>  ' + (cur[i] ?? '(none)'))
  }
  log.push('### ' + name + (extra ? '  ' + extra : '') + '\n' + lines.join('\n'))
  prev = cur
}
f.addEventListener('load', async () => {
  const w = f.contentWindow, d = f.contentDocument
  frameWin = w
  const errors = []
  w.addEventListener('error', (e) => errors.push(String(e.message)))
  await sleep(2500)
  await step('load', d)
  const ev = (el, type) => el.dispatchEvent(new w.MouseEvent(type, { bubbles: type !== 'mouseenter' && type !== 'mouseleave', cancelable: true, view: w }))
  const all = (sel) => [...d.querySelectorAll(sel)]
  // scrolling
  const max = d.documentElement.scrollHeight - w.innerHeight
  for (const y of [200, 700, 1500, 2600, 4000, 6000, max, 0]) {
    w.scrollTo({ top: Math.min(y, max), behavior: 'instant' }); await frames(2); w.dispatchEvent(new w.Event('scroll')); await sleep(600)
    await step('scroll ' + (y === max ? 'bottom' : y), d)
  }
  // header
  const ham = d.querySelector('.menu-btn--hamburger')
  if (ham) { ham.click(); await sleep(200); await step('hamburger open', d); ham.click(); await sleep(200); await step('hamburger close', d) }
  const links = all('.nav__list-full .nav__link')
  if (links[2]) { ev(links[2], 'mouseover'); await sleep(100); await step('nav hover', d); ev(links[2], 'mouseout'); await sleep(100); await step('nav hover out', d) }
  // cookie banner
  const deny = d.querySelector('#cookie-deny'), accept = d.querySelector('#cookie-accept')
  if (deny) { deny.click(); await sleep(100); await step('cookie deny', d, 'stored=' + w.localStorage.getItem('cookiesAccepted')) }
  if (accept) { accept.click(); await sleep(100); await step('cookie accept', d, 'stored=' + w.localStorage.getItem('cookiesAccepted')) }
  // landes challenges
  for (const [i, b] of all('.ver-switcher-btn').entries()) { ev(b, 'mouseenter'); await sleep(100); await step('challenge hover ' + i, d) }
  // faq
  for (const [i, c] of all('.vertical-switcher-content').entries()) { if (i > 3) break; ev(c, 'mouseenter'); await sleep(100); await step('faq hover ' + i, d) }
  for (const [i, b] of all('.vertical-switcher-btn').entries()) { if (i > 3) break; b.click(); await sleep(100); await step('faq click ' + i, d) }
  // about process phases
  for (const [i, b] of all('.btn-expand-process').entries()) { b.click(); await sleep(300); await step('phase click ' + i, d) }
  const firstPhase = d.querySelector('.btn-expand-process'); if (firstPhase) { firstPhase.click(); await sleep(300); await step('phase click 0 again', d) }
  // reviews
  const rev = d.querySelector('.review-hover-wrap')
  if (rev) {
    ev(rev, 'mouseenter'); await sleep(200); await step('reviews hover', d)
    rev.click(); await sleep(200); await step('reviews click (pause)', d)
    rev.click(); await sleep(200); await step('reviews click (resume)', d)
    ev(rev, 'mouseleave'); await sleep(200); await step('reviews leave', d)
  }
  // contact form
  const reason = d.querySelector('#reason')
  if (reason) {
    for (const v of ['new-website', 'seo', 'general-question', 'improve-website', 'project-discussion']) {
      reason.value = v; reason.dispatchEvent(new w.Event('change', { bubbles: true })); await sleep(100); await step('reason=' + v, d)
    }
    const form = d.querySelector('#contact-form'); const sent = []
    d.querySelector('#name').value = 'Test'; d.querySelector('#email').value = 't@example.com'; d.querySelector('#message').value = 'Hello'
    w.fetch = async (url, opts) => { sent.push(url + ' ' + opts.body); return { ok: true, json: async () => ({ ok: true }) } }
    form.dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true })); await sleep(300)
    await step('form submit ok', d, 'sent=' + sent.join('|'))
    d.querySelector('#name').value = 'Test'; d.querySelector('#email').value = 't@example.com'; d.querySelector('#message').value = 'Hello'; reason.value = 'seo'
    w.fetch = async () => ({ ok: false, status: 500, json: async () => ({ error: 'boom' }), text: async () => 'boom' })
    form.dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true })); await sleep(300)
    await step('form submit fails', d)
    d.querySelector('[name="web-check"]').value = 'bot'; const before = sent.length
    w.fetch = async (url, opts) => { sent.push('SHOULD-NOT-SEND'); return { ok: true, json: async () => ({}) } }
    form.dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true })); await sleep(300)
    await step('form submit honeypot', d, 'extra requests=' + (sent.length - before))
  }
  document.getElementById('out').textContent = log.join('\n') + '\n### errors: ' + JSON.stringify(errors) + '\n### DONE'
})
f.src = '/' + params.get('page')
</script></body></html>
HTML
for p in $(cd "$DIST" && find . -name '*.html' ! -name '__*' | sed 's|^\./||' | sort); do
  name=$(echo "$p" | sed 's|/|_|g; s|\.html$||')
  "$CHROME" --headless=new --disable-gpu --no-first-run --user-data-dir="$OUT/.profile" --window-size=$W,$H \
    --virtual-time-budget=120000 --dump-dom "http://localhost:$PORT/__interact.html?page=$p" 2>/dev/null \
    | python3 -c "
import sys,re,html
s=sys.stdin.read(); m=re.search(r'<pre id=\"out\">(.*?)</pre>',s,re.S)
print(html.unescape(m.group(1)) if m else 'NO OUTPUT')" > "$OUT/$name.txt"
  rm -rf "$OUT/.profile"
  echo "$p: $(grep -c '^### ' "$OUT/$name.txt") steps, $(wc -l < "$OUT/$name.txt" | tr -d ' ') lines, $(grep -o '### errors: .*' "$OUT/$name.txt" | cut -c1-120) $(grep -q '### DONE' "$OUT/$name.txt" && echo '' || echo 'INCOMPLETE')"
done
kill $SRV 2>/dev/null; rm -f "$DIST/__interact.html"
