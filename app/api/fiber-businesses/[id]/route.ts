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

const VALID_TYPES = ['farm', 'mill', 'yarn_shop', 'dyer', 'other'] as const

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

  for (const f of ['what_they_offer', 'programs_description', 'animal_breeds',
                    'services_offered', 'about',
                    'location_city', 'location_state', 'location_zip']) {
    if (f in fields) updates[f] = str(fields[f])
  }
  if ('name' in fields) {
    const n = str(fields.name)
    if (!n) return Response.json({ error: 'name cannot be empty' }, { status: 400 })
    updates.name = n
  }
  if ('business_type' in fields) {
    if (!VALID_TYPES.includes(fields.business_type as typeof VALID_TYPES[number])) {
      return Response.json({ error: 'invalid business_type' }, { status: 400 })
    }
    updates.business_type = fields.business_type
  }
  if ('fiber_arts_programs' in fields) {
    updates.fiber_arts_programs = typeof fields.fiber_arts_programs === 'boolean'
      ? fields.fiber_arts_programs : false
  }
  if ('link' in fields && typeof fields.link === 'string' && fields.link.trim()) {
    updates.image_url = await fetchOgImage(fields.link.trim())
  }

  const { data, error } = await auth.client
    .from('fiber_businesses')
    .update(updates)
    .eq('id', id)
    .eq('user_id', auth.user.id)
    .select()

  if (error) {
    console.error('[PUT /api/fiber-businesses/id]', error.message)
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
    .from('fiber_businesses')
    .delete({ count: 'exact' })
    .eq('id', id)
    .eq('user_id', auth.user.id)

  if (error) {
    console.error('[DELETE /api/fiber-businesses/id]', error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }
  if (count === 0) {
    return Response.json({ error: 'Not found or not authorized' }, { status: 404 })
  }

  return Response.json({ success: true })
}
