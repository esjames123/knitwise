import type { NextRequest } from 'next/server'
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getUserFromRequest(request)
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  let body: unknown
  try { body = await request.json() }
  catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const fields = body as Record<string, unknown>
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  const str = (v: unknown) => typeof v === 'string' ? v.trim() || null : null

  if ('title' in fields) {
    const t = str(fields.title)
    if (!t) return Response.json({ error: 'title cannot be empty' }, { status: 400 })
    updates.title = t
  }
  if ('link' in fields) {
    const l = str(fields.link)
    if (!l) return Response.json({ error: 'link cannot be empty' }, { status: 400 })
    updates.link = l
    updates.image_url = await fetchOgImage(l)
  }
  if ('category' in fields) {
    if (!VALID_CATEGORIES.includes(fields.category as typeof VALID_CATEGORIES[number])) {
      return Response.json({ error: 'invalid category' }, { status: 400 })
    }
    updates.category = fields.category
  }
  for (const f of ['description', 'creator_name']) {
    if (f in fields) updates[f] = str(fields[f])
  }

  const { data, error } = await auth.client
    .from('community_resources')
    .update(updates)
    .eq('id', id)
    .eq('user_id', auth.user.id)
    .select()

  if (error) {
    console.error('[PUT /api/community-resources/id]', error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }
  if (!data || data.length === 0) {
    return Response.json({ error: 'Not found or not authorized' }, { status: 404 })
  }

  return Response.json(data[0])
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getUserFromRequest(request)
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const { error, count } = await auth.client
    .from('community_resources')
    .delete({ count: 'exact' })
    .eq('id', id)
    .eq('user_id', auth.user.id)

  if (error) {
    console.error('[DELETE /api/community-resources/id]', error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }
  if (count === 0) {
    return Response.json({ error: 'Not found or not authorized' }, { status: 404 })
  }

  return Response.json({ success: true })
}
