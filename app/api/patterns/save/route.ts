import { getUserFromRequest } from '@/lib/supabase-server'

export async function POST(request: Request) {
  const auth = await getUserFromRequest(request)
  if (!auth) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { pattern_id, pattern_name, designer_name, permalink, photo_url } =
    body as Record<string, unknown>

  if (!pattern_id || !pattern_name || !permalink) {
    return Response.json(
      { error: 'pattern_id, pattern_name, and permalink are required' },
      { status: 400 }
    )
  }

  const { data, error } = await auth.client
    .from('saved_patterns')
    .insert({
      user_id:       auth.user.id,
      pattern_id:    Number(pattern_id),
      pattern_name:  String(pattern_name),
      designer_name: designer_name != null ? String(designer_name) : null,
      permalink:     String(permalink),
      photo_url:     photo_url != null ? String(photo_url) : null,
    })
    .select('id')
    .single()

  if (error) {
    // Unique constraint = already saved; treat as success
    if (error.code === '23505') {
      return Response.json({ success: true, already_saved: true })
    }
    console.error('[POST /api/patterns/save]', error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ success: true, id: data.id }, { status: 201 })
}
