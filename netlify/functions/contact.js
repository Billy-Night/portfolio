import { Buffer } from 'node:buffer'

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const makeWebhookUrl = process.env.MAKE_FORM_API // your Make webhook URL

  try {
    // event.body is base64 when using multipart/form-data
    const isBase64 = event.isBase64Encoded

    const res = await fetch(makeWebhookUrl, {
      method: 'POST',
      headers: {
        // Forward the same content-type so Make can parse it
        'Content-Type':
          event.headers['content-type'] ||
          event.headers['Content-Type'] ||
          'application/octet-stream',
      },
      body: isBase64 ? Buffer.from(event.body, 'base64') : event.body,
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
      body: JSON.stringify({ ok: false, error: String(err) }),
    }
  }
}
