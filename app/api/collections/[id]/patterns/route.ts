import { getUserFromRequest } from '@/lib/supabase-server'

// Assign a saved pattern to this collection
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getUserFromRequest(request)
  if (!auth) {
    console.error('[PATCH collections/patterns] Unauthorized')
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id: collectionId } = await params
  console.log('[PATCH collections/patterns] collectionId:', collectionId, 'user:', auth.user.id)

  let body: unknown
  try { body = await request.json() }
  catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { pattern_id } = body as Record<string, unknown>
  if (!pattern_id || typeof pattern_id !== 'string') {
    return Response.json({ error: 'pattern_id is required' }, { status: 400 })
  }
  console.log('[PATCH collections/patterns] pattern_id:', pattern_id)

  // Verify the collection belongs to this user
  const { data: collection, error: collErr } = await auth.client
    .from('collections')
    .select('id')
    .eq('id', collectionId)
    .eq('user_id', auth.user.id)
    .single()

  if (collErr || !collection) {
    console.error('[PATCH collections/patterns] Collection not found:', collErr?.message)
    return Response.json({ error: 'Collection not found' }, { status: 404 })
  }

  const { data, error } = await auth.client
    .from('saved_patterns')
    .update({ collection_id: collectionId })
    .eq('id', pattern_id)
    .eq('user_id', auth.user.id)
    .select()
    .single()

  if (error) {
    console.error('[PATCH collections/patterns] DB update error:', error.code, error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }
  if (!data) {
    console.error('[PATCH collections/patterns] Pattern not found after update')
    return Response.json({ error: 'Pattern not found' }, { status: 404 })
  }

  console.log('[PATCH collections/patterns] Success, collection_id now:', data.collection_id)
  return Response.json(data)
}
