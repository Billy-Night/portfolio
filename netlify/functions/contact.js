function validate(data) {
  if (!data.email) return 'Email is required'
  if (!data.message) return 'Message is required'
  if (!data.email.includes('@')) return 'Invalid email'

  // server-side honeypot: match your payload key
  if (String(data.honeypot || '').trim()) return 'Bot detected'
  if (String(data.message || '').length > 5000) return 'Message too long'
  if (String(data.email || '').length > 254) return 'Email too long'

  return null
}

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

// --- Alert when a message could not be delivered ---------------------------
//
// If Make cannot be reached or refuses the message, the visitor's enquiry would
// be lost without anyone knowing. This emails it to the site owner through
// Brevo (brevo.com), an email service that does not depend on Make.
//
// Set in Netlify's environment variables:
//   BREVO_API_KEY     an API key from Brevo
//   ALERT_EMAIL_TO    the address that receives the alert
//   ALERT_EMAIL_FROM  optional: the address the alert is sent from. It must be
//                     a sender verified in Brevo. The default is ALERT_EMAIL_TO.
// Without the first two no alert is sent, and the form behaves as before.
//
// The alert never changes what the visitor sees: if it fails too, the failure
// is written to the function log and the original error is returned.

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email'

/** A reply-to address is only passed on if it looks like one: Brevo refuses the whole email otherwise */
const looksLikeEmail = (value) => /^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/.test(String(value || ''))

/** One line of the email for each field the visitor filled in */
function describeSubmission(data) {
  const fields = [
    ['Name', data.name],
    ['Email', data.email],
    ['Reason', data.reason],
    ['Business', data.business],
    ['Current website', data.url],
    ['SEO objectives', Array.isArray(data.seoFeatures) ? data.seoFeatures.join(', ') : data.seoFeatures],
    ['SEO budget', data.seoBudget],
    ['SEO timeline', data.seoTimeline],
    ['Website budget', data.webBudget],
    ['Website timeline', data.webTimeline],
    ['Form', data.formName],
  ]
  const lines = fields.filter(([, value]) => value).map(([label, value]) => `${label}: ${value}`)
  return `${lines.join('\n')}\n\nMessage:\n${data.message || ''}`
}

/**
 * Email the failed submission to the site owner. Never throws.
 * @param {string} problem what went wrong, in a few words
 * @param {Record<string, any>} data the submission, already validated
 */
async function sendFailureAlert(problem, data) {
  console.error(`Contact form: ${problem}`)

  const apiKey = process.env.BREVO_API_KEY
  const to = process.env.ALERT_EMAIL_TO
  if (!apiKey || !to) {
    console.error('Contact form: no alert sent (BREVO_API_KEY or ALERT_EMAIL_TO is not set)')
    return
  }

  const email = {
    sender: { name: 'Website alert', email: process.env.ALERT_EMAIL_FROM || to },
    to: [{ email: to }],
    subject: `Contact form failed: message from ${String(data.name || data.email)
      .replace(/[\r\n]+/g, ' ')
      .slice(0, 80)}`,
    textContent:
      'A visitor sent the contact form, but it could not be delivered. ' +
      'They were shown the error message and may not try again.\n\n' +
      `What went wrong: ${problem}\n` +
      `When: ${new Date().toISOString()}\n\n` +
      '--- What they sent ---\n' +
      describeSubmission(data),
  }
  // Replying to the alert then writes to the visitor
  if (looksLikeEmail(data.email)) email.replyTo = { email: data.email }

  try {
    const res = await fetch(BREVO_URL, {
      method: 'POST',
      headers: { 'api-key': apiKey, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(email),
      // Stays well inside the function's time limit
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.error(`Contact form: the alert email was refused (${res.status}) ${text.slice(0, 300)}`)
    }
  } catch (err) {
    console.error(`Contact form: the alert email could not be sent (${err})`)
  }
}

const allowedOrigins = new Set([
  'https://billynightingale.com',
  'https://www.billynightingale.com',
  'http://localhost:8888', // netlify dev
])

export default async function contact(request) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  // Browsers send Origin on every POST, so a request without one does not
  // come from the form and is refused too.
  if (!allowedOrigins.has(request.headers.get('origin'))) {
    return new Response('Forbidden', { status: 403 })
  }

  let data
  try {
    data = JSON.parse((await request.text()) || '{}')
  } catch {
    return json(400, { ok: false, error: 'Invalid JSON' })
  }

  const error = validate(data)
  if (error) return json(400, { ok: false, error })

  // From here on the message is a real one, so every failure sends an alert.

  const makeWebhookUrl = process.env.MAKE_FORM_API
  if (!makeWebhookUrl) {
    await sendFailureAlert('the MAKE_FORM_API setting is missing in Netlify', data)
    return new Response('Missing MAKE_FORM_API env var', { status: 500 })
  }

  try {
    const res = await fetch(makeWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      await sendFailureAlert(`Make answered with an error (${res.status}) ${text.slice(0, 200)}`, data)
      return new Response(`Make webhook error: ${res.status} ${text}`, {
        status: 502,
      })
    }

    return json(200, { ok: true })
  } catch (err) {
    await sendFailureAlert(`Make could not be reached (${err})`, data)
    return json(500, { ok: false, error: String(err) })
  }
}

// The form posts to /api/contact. Netlify refuses a visitor who sends more than
// 5 requests in a minute (status 429) before the function runs. A rate limit
// needs a path, and a function with a path is no longer served at
// /.netlify/functions/contact.
export const config = {
  path: '/api/contact',
  rateLimit: {
    windowLimit: 5,
    windowSize: 60,
    aggregateBy: ['ip', 'domain'],
  },
}
