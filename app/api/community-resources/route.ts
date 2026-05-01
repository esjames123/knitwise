import { createClient } from '@supabase/supabase-js'
import { getUserFromRequest } from '@/lib/supabase-server'

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

const VALID_CATEGORIES = [
  'beginner_knitting','crochet','weaving','spinning','felting','dyeing','other',
] as const

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')?.trim() || null
  const user_id  = searchParams.get('user_id')?.trim()  || null

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  let query = supabase
    .from('community_resources')
    .select('*')
    .eq('is_flagged', false)
    .order('created_at', { ascending: false })

  if (category && VALID_CATEGORIES.includes(category as typeof VALID_CATEGORIES[number])) {
    query = query.eq('category', category)
  }
  if (user_id) {
    query = query.eq('user_id', user_id)
  }

  const { data, error } = await query

  if (error) {
    console.error('[GET /api/community-resources]', error.message)
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

  const { title, link, category, description, creator_name } = body as Record<string, unknown>

  if (!title || typeof title !== 'string' || !title.trim()) {
    return Response.json({ error: 'title is required' }, { status: 400 })
  }
  if (!link || typeof link !== 'string' || !link.trim()) {
    return Response.json({ error: 'link is required' }, { status: 400 })
  }
  if (!category || !VALID_CATEGORIES.includes(category as typeof VALID_CATEGORIES[number])) {
    return Response.json({ error: 'valid category is required' }, { status: 400 })
  }

  const { data: existing } = await auth.client
    .from('community_resources')
    .select('id')
    .eq('user_id', auth.user.id)
    .eq('link', (link as string).trim())
    .maybeSingle()

  if (existing) {
    return Response.json({ error: 'You have already shared this link.' }, { status: 409 })
  }

  const image_url = await fetchOgImage((link as string).trim())
  const str = (v: unknown) => typeof v === 'string' ? v.trim() || null : null

  const { data, error } = await auth.client
    .from('community_resources')
    .insert({
      user_id:      auth.user.id,
      title:        (title as string).trim(),
      link:         (link as string).trim(),
      category,
      description:  str(description),
      creator_name: str(creator_name),
      image_url,
      flag_count: 0,
      is_flagged: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('[POST /api/community-resources]', error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data, { status: 201 })
}
