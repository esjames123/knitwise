import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? ''

  const accessKey = process.env.RAVELRY_ACCESS_KEY
  const accessSecret = process.env.RAVELRY_ACCESS_SECRET

  if (!accessKey || !accessSecret) {
    console.error("LOG: Missing Keys in Environment Variables")
    return NextResponse.json({ error: 'Credentials not configured' }, { status: 503 })
  }

  // Create the Base64 string manually to avoid any hidden character issues
  const authString = `${accessKey}:${accessSecret}`
  const credentials = Buffer.from(authString).toString('base64')

  const url = `https://api.ravelry.com/patterns/search.json?query=${encodeURIComponent(q)}&page_size=20&sort=best`

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'User-Agent': 'KnitWiseApp/1.0 (erin@feralscene.com)',
      },
    })

    if (!res.ok) {
      // Log the actual status code to see if it's a 401 (bad pass) or 500 (their end)
      console.error(`LOG: Ravelry API responded with status ${res.status}`)
      return NextResponse.json({ error: `Ravelry status ${res.status}` }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err: any) {
    console.error("LOG: Fetch Crash", err.message)
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 })
  }
}