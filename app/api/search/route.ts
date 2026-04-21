import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? ''

  const accessKey = process.env.RAVELRY_ACCESS_KEY
  const accessSecret = process.env.RAVELRY_ACCESS_SECRET

  if (!accessKey || !accessSecret) {
    return Response.json(
      { error: 'Ravelry API credentials are not configured.' },
      { status: 503 }
    )
  }

  const url = new URL('https://api.ravelry.com/patterns/search.json')
  url.searchParams.set('query', q)
  url.searchParams.set('page_size', '20')
  url.searchParams.set('sort', 'best')

  const credentials = Buffer.from(`${accessKey}:${accessSecret}`).toString('base64')

  let res: Response
  try {
    res = await fetch(url.toString(), {
      headers: {
        Authorization: `Basic ${credentials}`,
        Accept: 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
      cache: 'no-store',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[search] fetch failed:', message)
    return Response.json({ error: 'Network error', detail: message }, { status: 500 })
  }

  if (!res.ok) {
    let body = ''
    try { body = await res.text() } catch { /* ignore */ }
    console.error(`[search] status=${res.status} statusText="${res.statusText}" body="${body.slice(0, 500)}"`)
    return Response.json(
      { error: `Ravelry returned ${res.status}`, detail: body.slice(0, 500) },
      { status: res.status }
    )
  }

  let data: unknown
  try {
    data = await res.json()
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[search] JSON parse failed:', message)
    return Response.json({ error: 'Invalid JSON from Ravelry', detail: message }, { status: 502 })
  }

  return Response.json(data)
}
