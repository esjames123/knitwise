import { getUserFromRequest } from '@/lib/supabase-server'

// Assign a saved pattern to this collection
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getUserFromRequest(request)
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id: collectionId } = await params

  let body: unknown
  try { body = await request.json() }
  catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { pattern_id } = body as Record<string, unknown>
  if (!pattern_id || typeof pattern_id !== 'string') {
    return Response.json({ error: 'pattern_id is required' }, { status: 400 })
  }

  // Verify the collection belongs to this user
  const { data: collection } = await auth.client
    .from('collections')
    .select('id')
    .eq('id', collectionId)
    .eq('user_id', auth.user.id)
    .single()

  if (!collection) return Response.json({ error: 'Collection not found' }, { status: 404 })

  const { data, error } = await auth.client
    .from('saved_patterns')
    .update({ collection_id: collectionId })
    .eq('id', pattern_id)
    .eq('user_id', auth.user.id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  if (!data) return Response.json({ error: 'Pattern not found' }, { status: 404 })
  return Response.json(data)
}
