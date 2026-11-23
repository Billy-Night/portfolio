import fs from 'fs'; import vm from 'vm'
const html = fs.readFileSync('dist/index.html','utf8')
const src = html.match(/<script type="text\/javascript">([\s\S]*?)<\/script>/)[1]
function run(hostname, stored, afterLoad) {
  const loaded = []
  const store = { cookiesAccepted: stored }
  const mk = () => ({ set src(v){ loaded.push(v) }, async: 0 })
  const ctx = {
    location: { hostname },
    localStorage: { getItem: k => store[k] ?? null, setItem: (k,v) => { store[k]=v } },
    document: { createElement: mk, head: { appendChild(){} }, getElementsByTagName: () => [{ parentNode: { insertBefore(){} } }] },
    console: { log(){} },
  }
  ctx.window = ctx // in a browser, window is the global object
  vm.createContext(ctx); vm.runInContext(src, ctx)
  if (afterLoad) vm.runInContext(afterLoad, ctx)
  return loaded.map(u => u.includes('clarity') ? 'clarity' : 'ga').sort().join('+') || 'nothing'
}
const accept = "localStorage.setItem('cookiesAccepted','true'); updateCookiesAccepted(); loadClarity(); loadGoogleAnalytics()"
const direct = "loadClarity(); loadGoogleAnalytics()"
const cases = [
  ['production, consent given earlier', 'www.billynightingale.com', 'true', null, 'clarity+ga'],
  ['production, no choice yet', 'www.billynightingale.com', undefined, null, 'nothing'],
  ['production, denied earlier', 'www.billynightingale.com', 'false', null, 'nothing'],
  ['production, denied, functions called directly', 'www.billynightingale.com', 'false', direct, 'nothing'],
  ['production, no choice, functions called directly', 'billynightingale.com', undefined, direct, 'nothing'],
  ['production, visitor clicks Accept', 'www.billynightingale.com', undefined, accept, 'clarity+ga'],
  ['production, consent given, Accept clicked again (no double load)', 'www.billynightingale.com', 'true', accept, 'clarity+ga'],
  ['preview domain, consent given', 'astrotrans--billy-nightingale-web-dev.netlify.app', 'true', accept, 'nothing'],
  ['localhost, consent given', 'localhost', 'true', null, 'nothing'],
]
let ok = true
for (const [name, host, stored, after, expect] of cases) {
  const got = run(host, stored, after); const pass = got === expect; ok &&= pass
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}: loaded ${got}${pass ? '' : ' (expected ' + expect + ')'}`)
}
process.exit(ok ? 0 : 1)
