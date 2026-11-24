# usage: python3 scripts/dev/rule_order.py old.css new.css out.js   (run from the project root, after a build)
#        node scripts/dev/cdp_eval.mjs dist out.js index.html services.html ...
# For checking a stylesheet whose rules were moved. style_measure.mjs cannot see hover states or classes that
# scripts add later (the open menu), so this checks rule order instead.
# Builds a page expression that finds every pair of rules whose winner depends on their order
# (same specificity, a shared property, and at least one element both can match, counting hover/focus states)
# and reports the pairs whose order differs between the two stylesheets.
import sys, json, pathlib
old, new, out = sys.argv[1:4]
js = r"""
(() => {
  const OLD = __OLD__, NEW = __NEW__
  const DYN = /:(hover|focus-visible|focus-within|focus|active|visited|link|checked|disabled)\b/g
  const STATE = new RegExp('\\.(' + __STATE__.join('|') + ')(?![\\w-])', 'g')
  const PE = /::?(before|after|placeholder|marker|selection|first-line|first-letter)\b/
  const els = [...document.querySelectorAll('*')]
  const id = new Map(els.map((e, i) => [e, i]))
  const split = (s) => { const out = []; let d = 0, cur = ''; for (const ch of s) { if (ch === '(') d++; if (ch === ')') d--; if (ch === ',' && d === 0) { out.push(cur.trim()); cur = '' } else cur += ch } out.push(cur.trim()); return out }
  const spec = (sel) => {
    let s = sel.replace(/\[[^\]]*\]/g, '[a]').replace(/:(not|is|where|has)\(/g, ' (')
    const a = (s.match(/#[\w-]+/g) || []).length
    const c2 = (s.match(/::[\w-]+/g) || []).length
    s = s.replace(/::[\w-]+/g, '')
    const b = (s.match(/\.[\w-]+/g) || []).length + (s.match(/\[a\]/g) || []).length + (s.match(/:[\w-]+(\([^)]*\))?/g) || []).length
    s = s.replace(/#[\w-]+|\.[\w-]+|\[a\]|:[\w-]+(\([^)]*\))?/g, ' ')
    const c = (s.match(/[a-zA-Z][\w-]*/g) || []).length + c2
    return a + ',' + b + ',' + c
  }
  const read = (text) => {
    const sheet = new CSSStyleSheet(); sheet.replaceSync(text)
    const rules = []; const seen = {}
    const walk = (list, media) => { for (const r of list) {
      if (r instanceof CSSStyleRule) {
        let key = media + ' § ' + r.cssText; seen[key] = (seen[key] || 0) + 1; key += ' #' + seen[key]
        rules.push({ key, media, sel: r.selectorText, rule: r })
      } else if (r instanceof CSSMediaRule) walk(r.cssRules, media + '@' + r.conditionText)
    } }
    walk(sheet.cssRules, '')
    return rules
  }
  const oldRules = read(OLD), newRules = read(NEW)
  const pos = new Map(newRules.map((r, i) => [r.key, i]))
  const missing = oldRules.filter((r) => !pos.has(r.key)).length
  for (const r of oldRules) {
    r.props = new Set([...r.rule.style].filter((p) => !p.startsWith('--')))
    r.parts = split(r.sel).map((s) => {
      const pe = (s.match(PE) || [''])[0].replace(/^:+/, '')
      let q = s.replace(PE, '').replace(DYN, '').replace(STATE, '').replace(/(^|[\s>+~])(?=$|[\s>+~])/g, '$1*').trim()
      if (!q || /[>+~]$/.test(q)) q += '*'
      let m = []
      try { m = [...document.querySelectorAll(q)].map((e) => id.get(e)) } catch { m = [] }
      return { spec: spec(s), pe, els: new Set(m) }
    }).filter((p) => p.els.size)
  }
  const live = oldRules.filter((r) => r.parts.length)
  const bad = []
  for (let i = 0; i < live.length; i++) for (let j = i + 1; j < live.length; j++) {
    const A = live[i], B = live[j]
    if (pos.get(A.key) < pos.get(B.key)) continue              // order kept: nothing to check
    let shared = null
    for (const p of A.props) if (B.props.has(p)) { shared = p; break }
    if (!shared) continue
    let hit = false
    for (const x of A.parts) { for (const y of B.parts) {
      if (x.spec !== y.spec || x.pe !== y.pe) continue
      const [s, l] = x.els.size < y.els.size ? [x.els, y.els] : [y.els, x.els]
      for (const e of s) if (l.has(e)) { hit = true; break }
      if (hit) break
    } if (hit) break }
    if (hit) bad.push(`${A.media} ${A.sel}  <->  ${B.media} ${B.sel}  [${shared}]`)
  }
  return `rules old=${oldRules.length} new=${newRules.length} missing=${missing} order-conflicts=${bad.length}` + (bad.length ? '\n      ' + bad.join('\n      ') : '')
})()
"""
import re, glob
css_classes = set(re.findall(r'\.(-?[_a-zA-Z][\w-]*)', re.sub(r'\{[^{}]*\}', '{}', re.sub(r'/\*.*?\*/', '', pathlib.Path(old).read_text(), flags=re.S))))
html = ' '.join(' '.join(re.findall(r'class="([^"]*)"', pathlib.Path(f).read_text())) for f in glob.glob('dist/**/*.html', recursive=True))
html_classes = set(html.split())
state = sorted(c for c in css_classes if c not in html_classes)
print('classes only scripts add:', len(state), state)
js = js.replace('__STATE__', json.dumps(state))
js = js.replace('__OLD__', json.dumps(pathlib.Path(old).read_text())).replace('__NEW__', json.dumps(pathlib.Path(new).read_text()))
pathlib.Path(out).write_text(js)
