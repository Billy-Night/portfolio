// usage: npm run build && node scripts/dev/consent_test.mjs      (must end with "0 failed")
// Runs the cookie consent script from the built homepage (src/components/consent/consent.js,
// as Astro wrote it into dist/index.html) in a fake browser, and checks what it loads, what it
// tells Clarity, which cookies it deletes and when the banner shows. No network, no real browser.
import fs from 'node:fs'
import vm from 'node:vm'

const html = fs.readFileSync('dist/index.html', 'utf8')
const scripts = [...html.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)].map((m) => m[1]).filter((s) => s.includes('cookiesAccepted'))
if (scripts.length !== 1) { console.error(`expected one consent script in dist/index.html, found ${scripts.length}`); process.exit(1) }

const LIVE = 'www.billynightingale.com'
const SEEDED = ['_ga', '_ga_LVZ55QWZGE', '_clck', '_clsk', 'cf_clearance', 'other']

/** A fake page. `stored` is the saved choice ('true', 'false' or undefined), `cookies` the cookie names present. */
function page(hostname, stored, cookies = []) {
  const store = stored === undefined ? {} : { cookiesAccepted: stored }
  const jar = new Set(cookies)
  const loadedScripts = []
  let reloads = 0
  const element = () => {
    const listeners = {}
    return { style: {}, focused: false, addEventListener: (type, fn) => { listeners[type] = fn }, click: () => listeners.click?.(), focus() { this.focused = true } }
  }
  const banner = element(), accept = element(), deny = element(), settings = element()
  const ctx = {
    location: { hostname, reload: () => { reloads++ } },
    localStorage: { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = String(v) } },
    document: {
      head: { appendChild: (s) => loadedScripts.push(s.src) },
      createElement: () => ({}),
      querySelector: (sel) => ({ '.cookie-banner': banner, '#cookie-accept': accept, '#cookie-deny': deny })[sel] ?? null,
      querySelectorAll: (sel) => (sel === '[data-cookie-settings]' ? [settings] : []),
      get cookie() { return [...jar].map((n) => `${n}=x`).join('; ') },
      // Only deletions are written by the script: a cookie with a date in 1970
      set cookie(v) { const name = v.split('=')[0]; if (v.includes('1970')) jar.delete(name); else jar.add(name) },
    },
    Date,
  }
  ctx.window = ctx // in a browser, window is the global object
  vm.createContext(ctx)
  vm.runInContext(scripts[0], ctx)
  return {
    accept, deny, settings, banner, jar,
    loaded: () => loadedScripts.map((u) => (u.includes('clarity.ms/tag/wpv1qvf7nc') ? 'clarity' : u.includes('gtag/js?id=G-LVZ55QWZGE') ? 'ga' : `?${u}`)).sort().join('+') || 'nothing',
    signals: () => (ctx.clarity?.q ?? []).map((a) => `${a[0]}:${a[1].analytics_Storage}/${a[1].ad_Storage}`).join(' ') || 'none',
    gtag: () => (ctx.dataLayer ?? []).map((a) => a[0]).join(',') || 'none',
    cookies: () => [...jar].sort().join(','),
    stored: () => store.cookiesAccepted ?? 'nothing',
    shown: () => (banner.style.display === 'block' ? 'shown' : 'hidden'),
    reloads: () => reloads,
  }
}

let failed = 0, passed = 0
function check(name, got, expected) {
  const ok = got === expected
  ok ? passed++ : failed++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}: ${got}${ok ? '' : `   (expected ${expected})`}`)
}

// 1. What loads, by address and saved choice
{
  let p = page(LIVE, 'true')
  check('live, accepted earlier: loads', p.loaded(), 'clarity+ga')
  check('live, accepted earlier: Clarity is told', p.signals(), 'consentv2:granted/denied')
  check('live, accepted earlier: Google Analytics is started', p.gtag(), 'js,config')
  check('live, accepted earlier: banner', p.shown(), 'hidden')
  p = page('billynightingale.com', 'true')
  check('live without www, accepted earlier: loads', p.loaded(), 'clarity+ga')
  p = page(LIVE, undefined)
  check('live, no choice yet: loads', p.loaded(), 'nothing')
  check('live, no choice yet: banner', p.shown(), 'shown')
  p = page(LIVE, 'false')
  check('live, denied earlier: loads', p.loaded(), 'nothing')
  check('live, denied earlier: banner', p.shown(), 'hidden')
  p = page('preview--billy-nightingale-web-dev.netlify.app', 'true')
  check('preview address, accepted: loads', p.loaded(), 'nothing')
  p = page('localhost', 'true')
  check('localhost, accepted: loads', p.loaded(), 'nothing')
}

// 2. Accept
{
  const p = page(LIVE, undefined)
  p.accept.click()
  check('click Accept: saved choice', p.stored(), 'true')
  check('click Accept: loads', p.loaded(), 'clarity+ga')
  check('click Accept: Clarity is told', p.signals(), 'consentv2:granted/denied')
  check('click Accept: banner', p.shown(), 'hidden')
  p.accept.click()
  check('click Accept twice: nothing loads twice', p.loaded(), 'clarity+ga')
  const local = page('localhost', undefined)
  local.accept.click()
  check('click Accept on localhost: saved choice', local.stored(), 'true')
  check('click Accept on localhost: loads', local.loaded(), 'nothing')
}

// 3. Deny on a first visit
{
  const p = page(LIVE, undefined, SEEDED)
  check('no choice yet: analytics cookies found on load are deleted', p.cookies(), 'cf_clearance,other')
  p.deny.click()
  check('click Deny, first visit: saved choice', p.stored(), 'false')
  check('click Deny, first visit: loads', p.loaded(), 'nothing')
  check('click Deny, first visit: no reload', String(p.reloads()), '0')
  check('click Deny, first visit: banner', p.shown(), 'hidden')
}

// 4. Withdrawing consent
{
  const p = page(LIVE, 'true', SEEDED)
  check('accepted: cookies are kept on load', p.cookies(), SEEDED.slice().sort().join(','))
  p.settings.click()
  check('click Cookie settings: banner', p.shown(), 'shown')
  check('click Cookie settings: focus is on Accept', String(p.accept.focused), 'true')
  p.deny.click()
  check('withdraw: saved choice', p.stored(), 'false')
  check('withdraw: Clarity is told', p.signals(), 'consentv2:granted/denied consentv2:denied/denied')
  check('withdraw: analytics cookies deleted, others kept', p.cookies(), 'cf_clearance,other')
  check('withdraw: page reloads once', String(p.reloads()), '1')
  // What Google Analytics does as the page unloads: it writes its session cookie again
  const next = page(LIVE, 'false', ['_ga_LVZ55QWZGE', 'cf_clearance'])
  check('after the reload: the rewritten cookie is deleted', next.cookies(), 'cf_clearance')
  check('after the reload: loads', next.loaded(), 'nothing')
}

// 5. Changing back
{
  const p = page(LIVE, 'false')
  p.settings.click()
  p.accept.click()
  check('accept after having denied: loads', p.loaded(), 'clarity+ga')
  check('accept after having denied: saved choice', p.stored(), 'true')
}

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed ? 1 : 0)
