import { getUserFromRequest } from '@/lib/supabase-server'

// Assign one or more saved patterns to this collection
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getUserFromRequest(request)
  if (!auth) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id: collectionId } = await params

  let body: unknown
  try { body = await request.json() }
  catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  // Accept either a single pattern_id or an array pattern_ids
  const { pattern_id, pattern_ids } = body as Record<string, unknown>
  const ids: string[] = Array.isArray(pattern_ids)
    ? pattern_ids.filter((x): x is string => typeof x === 'string')
    : typeof pattern_id === 'string' ? [pattern_id] : []

  if (ids.length === 0) {
    return Response.json({ error: 'pattern_id or pattern_ids is required' }, { status: 400 })
  }

  // Verify the collection belongs to this user
  const { data: collection, error: collErr } = await auth.client
    .from('collections')
    .select('id')
    .eq('id', collectionId)
    .eq('user_id', auth.user.id)
    .single()

  if (collErr || !collection) {
    return Response.json({ error: 'Collection not found' }, { status: 404 })
  }

  const { data, error } = await auth.client
    .from('saved_patterns')
    .update({ collection_id: collectionId })
    .in('id', ids)
    .eq('user_id', auth.user.id)
    .select()

  if (error) {
    console.error('[PATCH collections/patterns] DB error:', error.code, error.message)
    return Response.json({ error: error.message, code: error.code }, { status: 500 })
  }
  if (!data || data.length === 0) {
    return Response.json({ error: 'Patterns not found' }, { status: 404 })
  }

  return Response.json(ids.length === 1 ? data[0] : data)
}
