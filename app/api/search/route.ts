import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? ''

  const accessKey = process.env.RAVELRY_ACCESS_KEY
  const accessSecret = process.env.RAVELRY_ACCESS_SECRET

  if (!accessKey || !accessSecret) {
    return NextResponse.json({ error: 'Credentials not configured' }, { status: 503 })
  }

  // Universal Base64 encoding (Works on Edge and Node.js)
  const credentials = btoa(`${accessKey}:${accessSecret}`)

  const url = `https://api.ravelry.com/patterns/search.json?query=${encodeURIComponent(q)}&page_size=20&sort=best`

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Accept': 'application/json',
        'User-Agent': 'KnitWiseApp/1.0 (erin@feralscene.com)',
      },
    })

    if (!res.ok) {
      const errorText = await res.text()
      return NextResponse.json({ error: `Ravelry error ${res.status}`, detail: errorText }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: "Fetch failed", message: err.message }, { status: 500 })
  }
}
