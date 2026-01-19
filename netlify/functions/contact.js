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

export async function handler(event) {
  //   console.log(event)
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const allowedOrigins = new Set([
    'https://billynightingale.com',
    'https://www.billynightingale.com',
    'http://localhost:8888', // netlify dev
  ])

  const origin = event.headers.origin || event.headers.Origin
  if (origin && !allowedOrigins.has(origin)) {
    return { statusCode: 403, body: 'Forbidden' }
  }

  const makeWebhookUrl = process.env.MAKE_FORM_API
  if (!makeWebhookUrl) {
    return { statusCode: 500, body: 'Missing MAKE_FORM_API env var' }
  }

  let data
  try {
    data = JSON.parse(event.body || '{}')
  } catch {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Invalid JSON' }),
    }
  }

  const error = validate(data)
  if (error) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error }),
    }
  }

  try {
    const res = await fetch(makeWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return {
        statusCode: 502,
        body: `Make webhook error: ${res.status} ${text}`,
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true }),
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: String(err) }),
    }
  }
}
