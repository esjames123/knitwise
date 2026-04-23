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

  if (error) {
    console.error('[PATCH collections/patterns] DB update error — code:', error.code, 'msg:', error.message, 'details:', error.details)
    return Response.json({ error: error.message, code: error.code }, { status: 500 })
  }
  if (!data || data.length === 0) {
    console.error('[PATCH collections/patterns] 0 rows updated — pattern_id may not exist or column missing')
    return Response.json({ error: 'Pattern not found or collection_id column missing — run DB migration' }, { status: 404 })
  }

  console.log('[PATCH collections/patterns] Success, rows updated:', data.length)
  return Response.json(data[0])
}
