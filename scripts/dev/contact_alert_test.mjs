// Tests the contact form backend (netlify/functions/contact.js) without the
// network: Make and Brevo are replaced by fakes. Checks what the visitor is
// answered and whether the failure alert is sent, in twelve situations.
//
//   node scripts/dev/contact_alert_test.mjs      (must end with "0 failed")

const { default: contact } = await import(new URL('../../netlify/functions/contact.js', import.meta.url).href)

const good = { formName: 'contact-en', honeypot: '', name: 'Test Visitor', email: 'visitor@example.org', reason: 'seo', message: 'Hello,\nI need help.', business: 'Cafe', url: null, seoFeatures: ['audit', 'local'], seoBudget: '250-400', seoTimeline: null, webBudget: null, webTimeline: null }
const req = (body, origin = 'https://www.billynightingale.com') => new Request('https://www.billynightingale.com/api/contact', { method: 'POST', headers: { origin, 'Content-Type': 'application/json' }, body: typeof body === 'string' ? body : JSON.stringify(body) })
let pass = 0
let fail = 0
const ok = (name, cond) => {
  cond ? pass++ : fail++
  console.log(cond ? '  ok  ' : '  FAIL', name)
}

/** Runs the function once. `make` and `brevo` say how each fake answers: { status, body } or 'throw'. */
const run = async (label, { env, make, brevo = { status: 201, body: '{"messageId":"<1@test>"}' }, body = good, origin }) => {
  for (const k of ['MAKE_FORM_API', 'BREVO_API_KEY', 'ALERT_EMAIL_TO', 'ALERT_EMAIL_FROM']) delete process.env[k]
  Object.assign(process.env, env)
  const calls = []
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init })
    const answer = String(url).includes('brevo') ? brevo : make
    if (answer === 'throw') throw new TypeError('fetch failed')
    return new Response(answer.body ?? '{}', { status: answer.status })
  }
  const errors = []
  const realError = console.error
  console.error = (...a) => errors.push(a.join(' '))
  const res = await contact(req(body, origin))
  console.error = realError
  console.log(label)
  const alerts = calls.filter((c) => c.url.includes('brevo')).map((c) => ({ ...c, email: JSON.parse(c.init.body) }))
  return { res, text: await res.text(), alerts, makeCalls: calls.filter((c) => !c.url.includes('brevo')), errors }
}
const full = { MAKE_FORM_API: 'https://make.test/hook', BREVO_API_KEY: 'xkeysib-test', ALERT_EMAIL_TO: 'owner@example.com' }

let r = await run('1. Make works', { env: full, make: { status: 200 } })
ok('visitor gets 200', r.res.status === 200)
ok('no alert sent', r.alerts.length === 0)
ok('nothing logged', r.errors.length === 0)

r = await run('2. Make answers 500', { env: full, make: { status: 500, body: 'Scenario off' } })
ok('visitor still gets 502', r.res.status === 502 && r.text.includes('Make webhook error: 500 Scenario off'))
ok('one alert sent', r.alerts.length === 1)
const a = r.alerts[0]
const e = a.email
ok('to Brevo with the key', a.url === 'https://api.brevo.com/v3/smtp/email' && a.init.method === 'POST' && a.init.headers['api-key'] === 'xkeysib-test' && a.init.headers['Content-Type'] === 'application/json')
ok('to the owner, from the owner by default', e.to.length === 1 && e.to[0].email === 'owner@example.com' && e.sender.email === 'owner@example.com')
ok('reply goes to the visitor', e.replyTo.email === 'visitor@example.org')
ok('subject names the visitor', e.subject === 'Contact form failed: message from Test Visitor')
ok('body has the fields and the message', ['Name: Test Visitor', 'Email: visitor@example.org', 'Reason: seo', 'Business: Cafe', 'SEO objectives: audit, local', 'SEO budget: 250-400', 'Message:\nHello,\nI need help.', 'Make answered with an error (500) Scenario off'].every((t) => e.textContent.includes(t)) && !e.textContent.includes('null') && !e.textContent.includes('Website budget'))
ok('nothing is logged about the alert', !r.errors.some((x) => x.includes('alert email')))
console.log(`\n----- the email as sent -----\nFrom: ${e.sender.name} <${e.sender.email}>\nTo: ${e.to[0].email}\nReply-To: ${e.replyTo.email}\nSubject: ${e.subject}\n\n${e.textContent}\n-----------------------------\n`)

r = await run('3. Make unreachable, a separate sender address', { env: { ...full, ALERT_EMAIL_FROM: 'alerts@example.com' }, make: 'throw' })
ok('visitor gets 500', r.res.status === 500)
ok('alert sent from the configured sender', r.alerts.length === 1 && r.alerts[0].email.sender.email === 'alerts@example.com' && r.alerts[0].email.to[0].email === 'owner@example.com')

r = await run('4. Make fails and Brevo refuses', { env: full, make: { status: 500 }, brevo: { status: 400, body: '{"code":"invalid_parameter","message":"sender not valid"}' } })
ok('visitor still gets 502', r.res.status === 502)
ok('refusal is logged with its reason', r.errors.some((x) => x.includes('alert email was refused (400)') && x.includes('sender not valid')))

r = await run('5. Make fails and Brevo unreachable', { env: full, make: { status: 500 }, brevo: 'throw' })
ok('visitor still gets 502, no crash', r.res.status === 502)
ok('logged', r.errors.some((x) => x.includes('could not be sent')))

r = await run('6. Make fails, alert not configured', { env: { MAKE_FORM_API: 'https://make.test/hook' }, make: { status: 500 } })
ok('visitor gets 502', r.res.status === 502)
ok('no request to Brevo', r.alerts.length === 0)
ok('logged why', r.errors.some((x) => x.includes('no alert sent')))

r = await run('7. MAKE_FORM_API missing', { env: { ...full, MAKE_FORM_API: '' }, make: { status: 200 } })
ok('visitor gets 500', r.res.status === 500)
ok('alert sent', r.alerts.length === 1)
ok('Make not called', r.makeCalls.length === 0)

r = await run('8. Odd email address and a name with a line break', { env: full, make: { status: 500 }, body: { ...good, email: 'a@b, evil@x.org', name: 'Eve\r\nBcc: evil@x.org' } })
ok('alert sent without a reply-to', r.alerts.length === 1 && !('replyTo' in r.alerts[0].email))
ok('only the owner receives it, subject on one line', r.alerts[0].email.to.length === 1 && !/[\r\n]/.test(r.alerts[0].email.subject) && !('bcc' in r.alerts[0].email))

for (const [label, o, status] of [
  ['9. Bot (honeypot filled)', { body: { ...good, honeypot: 'x' } }, 400],
  ['10. No message', { body: { ...good, message: '' } }, 400],
  ['11. Invalid JSON', { body: '{oops' }, 400],
  ['12. Wrong origin', { origin: 'https://evil.example' }, 403],
]) {
  r = await run(label, { env: full, make: { status: 500 }, ...o })
  ok(`refused with ${status}, no alert, Make not called`, r.res.status === status && r.alerts.length === 0 && r.makeCalls.length === 0)
}

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
