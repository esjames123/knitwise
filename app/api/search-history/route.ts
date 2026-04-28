import { getUserFromRequest } from '@/lib/supabase-server'

export async function GET(request: Request) {
  const auth = await getUserFromRequest(request)
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await auth.client
    .from('search_history')
    .select('query, created_at')
    .eq('user_id', auth.user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('[GET /api/search-history]', error.message)
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

  const { query } = body as Record<string, unknown>
  const trimmed = typeof query === 'string' ? query.trim() : ''
  if (!trimmed) return Response.json({ error: 'query is required' }, { status: 400 })

  // Upsert: update created_at if same (user_id, query) already exists so it sorts to top
  const { error } = await auth.client
    .from('search_history')
    .upsert(
      { user_id: auth.user.id, query: trimmed, created_at: new Date().toISOString() },
      { onConflict: 'user_id,query' }
    )

  if (error) {
    console.error('[POST /api/search-history]', error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ success: true })
}

export async function DELETE(request: Request) {
  const auth = await getUserFromRequest(request)
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await auth.client
    .from('search_history')
    .delete()
    .eq('user_id', auth.user.id)

  if (error) {
    console.error('[DELETE /api/search-history]', error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ success: true })
}
