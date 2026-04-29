import { createClient } from '@supabase/supabase-js'
import { getUserFromRequest } from '@/lib/supabase-server'

// ─── og:image extraction ──────────────────────────────────────────────────────

function parseOgImage(html: string): string | null {
  const metaRe = /<meta[^>]+>/gi
  let tag: RegExpExecArray | null
  while ((tag = metaRe.exec(html)) !== null) {
    const t = tag[0]
    if (!/property=["']og:image["']/i.test(t)) continue
    const m = /content=["']([^"']+)["']/i.exec(t)
    if (m?.[1]) return m[1]
  }
  return null
}

async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Knitwise/1.0)' },
    })
    clearTimeout(timer)
    if (!res.ok) return null
    const reader = res.body?.getReader()
    if (!reader) return null
    const decoder = new TextDecoder()
    let html = ''
    try {
      while (html.length < 50_000) {
        const { done, value } = await reader.read()
        if (done) break
        html += decoder.decode(value, { stream: true })
        if (/<\/head>/i.test(html)) break
      }
    } finally {
      reader.cancel().catch(() => {})
    }
    return parseOgImage(html)
  } catch {
    return null
  }
}

// ─── Routes ───────────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get('city')?.trim() || null
  const state = searchParams.get('state')?.trim() || null
  const zip = searchParams.get('zip')?.trim() || null

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  let query = supabase
    .from('groups')
    .select('*')
    .eq('is_flagged', false)
    .order('created_at', { ascending: false })

  if (zip) {
    query = query.eq('location_zip', zip)
  } else {
    if (city)  query = query.ilike('location_city', `%${city}%`)
    if (state) query = query.ilike('location_state', `%${state}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('[GET /api/groups]', error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data ?? [])
}

export async function POST(request: Request) {
  const auth = await getUserFromRequest(request)
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await request.json() }
  catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { name, description, what_to_bring, community_outreach,
          location_city, location_state, location_zip, link } = body as Record<string, unknown>

  if (!name || typeof name !== 'string' || !name.trim()) {
    return Response.json({ error: 'name is required' }, { status: 400 })
  }

  const image_url = typeof link === 'string' && link.trim()
    ? await fetchOgImage(link.trim())
    : null

  const str = (v: unknown) => typeof v === 'string' ? v.trim() || null : null

  const { data, error } = await auth.client
    .from('groups')
    .insert({
      user_id:            auth.user.id,
      name:               (name as string).trim(),
      description:        str(description),
      what_to_bring:      str(what_to_bring),
      community_outreach: str(community_outreach),
      location_city:      str(location_city),
      location_state:     str(location_state),
      location_zip:       str(location_zip),
      image_url,
      flag_count: 0,
      is_flagged: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('[POST /api/groups]', error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data, { status: 201 })
}
