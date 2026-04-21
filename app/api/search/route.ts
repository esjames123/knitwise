import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? ''

  const accessKey = process.env.RAVELRY_ACCESS_KEY
  const accessSecret = process.env.RAVELRY_ACCESS_SECRET

  // 1. Check if keys exist
  if (!accessKey || !accessSecret) {
    console.error("MISSING KEYS: Check Vercel Environment Variables")
    return NextResponse.json({ error: 'Credentials not configured' }, { status: 503 })
  }

  const url = `https://api.ravelry.com/patterns/search.json?query=${encodeURIComponent(q)}&page_size=20&sort=best`

  // 2. Safer Base64 Encoding
  const credentials = Buffer.from(`${accessKey}:${accessSecret}`).toString('base64')

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Accept': 'application/json',
        'User-Agent': 'KnitWiseApp/1.0 (erin@feralscene.com)',
      },
      cache: 'no-store' // Prevents old broken responses from sticking around
    })

    if (!res.ok) {
      const errorData = await res.text()
      // THIS LOGS TO YOUR VERCEL DASHBOARD:
      console.error(`Ravelry API Error Status: ${res.status} | Body: ${errorData}`)
      
      return NextResponse.json(
        { error: `Ravelry error ${res.status}`, detail: errorData },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)

  } catch (err: any) {
    console.error("SERVER CRASH:", err.message)
    return NextResponse.json({ error: "Server crashed", message: err.message }, { status: 500 })
  }
}
