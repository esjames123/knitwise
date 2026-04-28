import { getUserFromRequest } from '@/lib/supabase-server'

export async function GET(request: Request) {
  const auth = await getUserFromRequest(request)
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await auth.client
    .from('resources')
    .select('id, title, url, resource_type, description, source, collection_id, status, started_at, completed_at, notes, saved_at, updated_at')
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

  if (!title || typeof title !== 'string' || !title.trim()) {
    return Response.json({ error: 'title is required' }, { status: 400 })
  }
  if (!url || typeof url !== 'string' || !url.trim()) {
    return Response.json({ error: 'url is required' }, { status: 400 })
  }

  const VALID_TYPES = ['weaving', 'spinning', 'dyeing', 'knitting', 'crochet', 'other']
  const type = typeof resource_type === 'string' && VALID_TYPES.includes(resource_type)
    ? resource_type
    : 'other'

  const { data, error } = await auth.client
    .from('resources')
    .insert({
      user_id:       auth.user.id,
      title:         title.trim(),
      url:           url.trim(),
      resource_type: type,
      description:   typeof description === 'string' ? description.trim() || null : null,
      source:        typeof source === 'string'      ? source.trim()      || null : null,
      status:        'not_started',
      saved_at:      new Date().toISOString(),
      updated_at:    new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('[POST /api/resources]', error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data, { status: 201 })
}
