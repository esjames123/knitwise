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
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Knitwise/1.0; +https://knitwise.app)' },
    })
    clearTimeout(timer)
    if (!res.ok) return null

    // Stream only the first 50 KB — og:image is always in <head>
    const reader = res.body?.getReader()
    if (!reader) return null
    const decoder = new TextDecoder()
    let html = ''
    try {
      while (html.length < 50_000) {
        const { done, value } = await reader.read()
        if (done) break
        html += decoder.decode(value, { stream: true })
        // Stop once we've passed </head> to avoid reading the whole page
        if (/<\/head>/i.test(html)) break
      }
    } finally {
      reader.cancel().catch(() => {})
    }

    const imageUrl = parseOgImage(html)
    console.log('[fetchOgImage]', url, '→', imageUrl ?? 'none')
    return imageUrl
  } catch (err) {
    console.log('[fetchOgImage] failed for', url, '—', (err as Error).message)
    return null
  }
}

// ─── Routes ───────────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const auth = await getUserFromRequest(request)
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await auth.client
    .from('resources')
    .select('id, title, url, resource_type, description, source, collection_id, status, started_at, completed_at, notes, saved_at, updated_at, image_url')
    .eq('user_id', auth.user.id)
    .order('saved_at', { ascending: false })

  if (error) {
    console.error('[GET /api/resources]', error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data)
}

export async function POST(request: Request) {
  const auth = await getUserFromRequest(request)
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await request.json() }
  catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { title, url, resource_type, description, source } = body as Record<string, unknown>

  console.log('[POST /api/resources] body:', JSON.stringify({ title, url, resource_type, description, source }))

  if (!title || typeof title !== 'string' || !title.trim()) {
    return Response.json({ error: 'title is required' }, { status: 400 })
  }
  if (!url || typeof url !== 'string' || !url.trim()) {
    return Response.json({ error: 'url is required' }, { status: 400 })
  }

  const trimmedUrl = (url as string).trim()

  // Check for duplicate URL for this user
  const { data: existing } = await auth.client
    .from('resources')
    .select('id')
    .eq('user_id', auth.user.id)
    .eq('url', trimmedUrl)
    .maybeSingle()
  if (existing) {
    console.log('[POST /api/resources] duplicate url for user', auth.user.id)
    return Response.json({ error: 'This URL is already in your library.', id: existing.id }, { status: 409 })
  }

  const VALID_TYPES = ['weaving', 'spinning', 'dyeing', 'knitting', 'crochet', 'other']
  const type = typeof resource_type === 'string' && VALID_TYPES.includes(resource_type)
    ? resource_type
    : 'other'

  const meta = auth.user.user_metadata as Record<string, unknown> | null
  const creator_name: string =
    (typeof meta?.full_name === 'string' && meta.full_name.trim()) ? meta.full_name.trim()
    : (typeof meta?.name === 'string' && meta.name.trim()) ? meta.name.trim()
    : auth.user.email?.split('@')[0] ?? 'Unknown'

  console.log('[POST /api/resources] user:', auth.user.id, '| creator_name:', creator_name)

  // Fetch og:image — non-blocking: if it fails, image_url stays null
  const image_url = await fetchOgImage(trimmedUrl)

  const payload = {
    user_id:       auth.user.id,
    creator_name,
    title:         title.trim(),
    url:           trimmedUrl,
    resource_type: type,
    description:   typeof description === 'string' ? description.trim() || null : null,
    source:        typeof source === 'string'      ? source.trim()      || null : null,
    image_url,
    status:        'not_started',
    saved_at:      new Date().toISOString(),
    updated_at:    new Date().toISOString(),
  }

  console.log('[POST /api/resources] inserting with image_url:', image_url)

  const { data, error } = await auth.client
    .from('resources')
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error('[POST /api/resources] insert error:', error.code, error.message, error.details)
    if (error.message.includes('creator_name') || error.message.includes('image_url')) {
      return Response.json(
        { error: 'Database migration required: run the resources migration in Supabase.' },
        { status: 500 }
      )
    }
    return Response.json({ error: error.message }, { status: 500 })
  }

  console.log('[POST /api/resources] success, id:', data?.id, 'image_url:', data?.image_url)
  return Response.json(data, { status: 201 })
}
