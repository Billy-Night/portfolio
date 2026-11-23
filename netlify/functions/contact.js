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

  const makeWebhookUrl = process.env.MAKE_FORM_API
  if (!makeWebhookUrl) {
    return new Response('Missing MAKE_FORM_API env var', { status: 500 })
  }

  let data
  try {
    data = JSON.parse((await request.text()) || '{}')
  } catch {
    return json(400, { ok: false, error: 'Invalid JSON' })
  }

  const error = validate(data)
  if (error) return json(400, { ok: false, error })

  try {
    const res = await fetch(makeWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return new Response(`Make webhook error: ${res.status} ${text}`, {
        status: 502,
      })
    }

    return json(200, { ok: true })
  } catch (err) {
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
