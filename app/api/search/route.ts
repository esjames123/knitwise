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

  const res = await fetch(url.toString(), {
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Accept': 'application/json',
      // This is the critical line Ravelry needs:
      'User-Agent': 'KnitWiseApp/1.0 (erin@feralscene.com)',
    },
  })

  if (!res.ok) {
    return Response.json(
      { error: `Ravelry returned ${res.status}` },
      { status: res.status }
    )
  }

  const data = await res.json()
  return Response.json(data)
}
