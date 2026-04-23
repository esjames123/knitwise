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

  // Debug: verify the pattern row before updating
  const { data: existing, error: selectErr } = await auth.client
    .from('saved_patterns')
    .select('id, user_id, collection_id')
    .eq('id', pattern_id)
    .maybeSingle()

  console.log('[PATCH collections/patterns] pre-update SELECT — found:', !!existing,
    '| row user_id:', existing?.user_id ?? 'n/a',
    '| auth user_id:', auth.user.id,
    '| match:', existing?.user_id === auth.user.id,
    '| selectErr:', selectErr?.message ?? 'none')

  if (!existing) {
    return Response.json({
      error: `Pattern ${pattern_id} not found in saved_patterns (user ${auth.user.id}) — select returned nothing`,
      selectErr: selectErr?.message,
    }, { status: 404 })
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
    console.error('[PATCH collections/patterns] 0 rows updated despite row existing — user_id mismatch or RLS block')
    return Response.json({
      error: 'Update matched 0 rows — RLS may be blocking (pattern user_id vs auth user_id mismatch)',
      patternUserId: existing.user_id,
      authUserId: auth.user.id,
    }, { status: 403 })
  }

  console.log('[PATCH collections/patterns] Success, collection_id now:', data[0].collection_id)
  return Response.json(data[0])
}
