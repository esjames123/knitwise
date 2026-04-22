import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? 'sweater'

  const timestamp = new Date().toISOString()
  console.log(`[test-ravelry] ${timestamp} — query="${q}"`)

  const accessKey    = process.env.RAVELRY_ACCESS_KEY
  const accessSecret = process.env.RAVELRY_ACCESS_SECRET

  if (!accessKey || !accessSecret) {
    console.error(`[test-ravelry] missing credentials — RAVELRY_ACCESS_KEY=${accessKey ? 'set' : 'MISSING'}, RAVELRY_ACCESS_SECRET=${accessSecret ? 'set' : 'MISSING'}`)
    return Response.json({ error: 'Credentials not configured', timestamp }, { status: 503 })
  }

  console.log(`[test-ravelry] credentials present — key starts with: ${accessKey.slice(0, 8)}...`)

  const url = new URL('https://api.ravelry.com/patterns/search.json')
  url.searchParams.set('query', q)
  url.searchParams.set('page_size', '5')
  url.searchParams.set('sort', 'best')

  const credentials = Buffer.from(`${accessKey}:${accessSecret}`).toString('base64')

  console.log(`[test-ravelry] fetching: ${url.toString()}`)

  let res: Response
  try {
    res = await fetch(url.toString(), {
      headers: {
        Authorization: `Basic ${credentials}`,
        Accept:        'application/json',
      },
      cache: 'no-store',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[test-ravelry] fetch threw: ${message}`)
    return Response.json({ error: 'Network error', detail: message, timestamp }, { status: 500 })
  }

  const bodyText = await res.text()
  console.log(`[test-ravelry] status=${res.status} statusText="${res.statusText}"`)
  console.log(`[test-ravelry] body (first 200 chars): ${bodyText.slice(0, 200)}`)

  if (!res.ok) {
    return Response.json({
      timestamp,
      status:     res.status,
      statusText: res.statusText,
      body:       bodyText.slice(0, 500),
    }, { status: res.status })
  }

  let data: unknown
  try {
    data = JSON.parse(bodyText)
  } catch {
    console.error(`[test-ravelry] JSON parse failed, raw body: ${bodyText.slice(0, 200)}`)
    return Response.json({ error: 'Invalid JSON from Ravelry', body: bodyText.slice(0, 500), timestamp }, { status: 502 })
  }

  return Response.json({ timestamp, status: res.status, data })
}
